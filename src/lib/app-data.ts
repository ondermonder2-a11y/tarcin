/**
 * Site verisine erişim arayüzü.
 *
 * ARTIK localStorage kullanılmaz. Veri akışı:
 *   Admin paneli -> /api/admin/content (PUT) -> src/lib/server/content-db (veritabanı)
 *   Ana sayfa    -> /api/content (GET)       -> aynı veritabanı
 *
 * Bu modül, bileşenlerin kullandığı eski isimleri (useAppData, useAdminAuth, INITIAL_*)
 * koruyarak API tabanlı deposuna bağlar.
 */
import { useCallback, useEffect, useState } from "react";

import { SiteContentProvider } from "@/lib/content/client";
import { useSiteContent, type ContentResult } from "@/lib/content/context";

import {
  brochureSchema,
  categoriesSchema,
  createDefaultContent,
  fixMenuSchema,
  heroSlidesSchema,
  profileSchema,
  testimonialsSchema,
  DAYS,
  INITIAL_CATEGORIES,
  INITIAL_FIX_BROCHURE,
  INITIAL_FIX_MENU,
  INITIAL_HERO_SLIDES,
  INITIAL_PROFILE,
  INITIAL_TESTIMONIALS,
  type AdminProfile,
  type ContentSectionKey,
  type Day,
  type DayMenu,
  type FixBrochure,
  type HeroSlide,
  type MenuCategory,
  type SiteContent,
  type Testimonial,
} from "@/lib/content/schema";

export {
  DAYS,
  INITIAL_CATEGORIES,
  INITIAL_FIX_BROCHURE,
  INITIAL_FIX_MENU,
  INITIAL_HERO_SLIDES,
  INITIAL_PROFILE,
  INITIAL_TESTIMONIALS,
  createDefaultContent,
};

export type {
  AdminProfile,
  ContentSectionKey,
  Day,
  DayMenu,
  FixBrochure,
  HeroSlide,
  MenuCategory,
  SiteContent,
  Testimonial,
};

export type { ContentResult } from "@/lib/content/context";
export { SiteContentProvider, useSiteContent };

type AdminActionResult = { success: boolean; error?: string };
type AuthResponseBody = { error?: unknown; authenticated?: unknown; message?: unknown };

async function readAuthResponse(response: Response): Promise<AuthResponseBody> {
  try {
    const body: unknown = await response.json();
    return body && typeof body === "object" ? (body as AuthResponseBody) : {};
  } catch {
    return {};
  }
}

function toAdminAction(result: ContentResult): AdminActionResult {
  return result.ok
    ? { success: true }
    : { success: false, error: result.error ?? "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
}

/**
 * Bölümü sunucuya yazmadan önce yerel şema ile doğrular: gereksiz ağ turu ve
 * yarım yazma riski yerine anında alan bazlı uyarı döner.
 */
const SECTION_SCHEMAS: Record<
  ContentSectionKey,
  { safeParse: (value: unknown) => { success: boolean } }
> = {
  fixMenu: fixMenuSchema,
  brochure: brochureSchema,
  heroSlides: heroSlidesSchema,
  categories: categoriesSchema,
  testimonials: testimonialsSchema,
  profile: profileSchema,
};

function validateLocal(section: ContentSectionKey, value: unknown): AdminActionResult | null {
  const schema = SECTION_SCHEMAS[section];
  if (!schema?.safeParse) return null;
  return schema.safeParse(value).success
    ? null
    : { success: false, error: "Kaydedilecek içerik eksik veya geçersiz alanlar içeriyor." };
}

export async function loginAdmin(
  identifier: string,
  passwordAttempt: string,
): Promise<AdminActionResult> {
  if (typeof window === "undefined")
    return { success: false, error: "Tarayıcı ortamı bulunamadı." };
  try {
    const response = await fetch("/api/admin/session", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: identifier.trim(), password: passwordAttempt }),
    });
    const body = await readAuthResponse(response);
    if (!response.ok) {
      return {
        success: false,
        error:
          typeof body.error === "string"
            ? body.error
            : "Giriş başarısız. Bilgilerinizi kontrol edin.",
      };
    }
    notifyAuthChanged();
    return { success: true };
  } catch {
    return {
      success: false,
      error: "Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin.",
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // The server remains authoritative; a failed request must not be treated as a completed logout.
  }
  notifyAuthChanged();
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tarcin_admin_auth_updated"));
  }
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const refreshSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (active) setIsAuthenticated(response.ok);
      } catch {
        if (active) setIsAuthenticated(false);
      } finally {
        if (active) setIsAuthLoaded(true);
      }
    };

    const handleUpdate = () => {
      void refreshSession();
    };

    void refreshSession();
    window.addEventListener("tarcin_admin_auth_updated", handleUpdate);
    return () => {
      active = false;
      window.removeEventListener("tarcin_admin_auth_updated", handleUpdate);
    };
  }, []);

  return {
    isAuthenticated,
    isAuthLoaded,
    login: loginAdmin,
    logout: logoutAdmin,
    changePassword: async (
      currentPassword: string,
      newPassword: string,
    ): Promise<AdminActionResult> => {
      if (newPassword.length < 12) {
        return { success: false, error: "Yeni parola en az 12 karakter olmalıdır." };
      }
      try {
        const response = await fetch("/api/admin/session", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const body = await readAuthResponse(response);
        if (!response.ok) {
          return {
            success: false,
            error: typeof body.error === "string" ? body.error : "Parola güncellenemedi.",
          };
        }
        notifyAuthChanged();
        return { success: true };
      } catch {
        return { success: false, error: "Sunucuya ulaşılamadı. Lütfen tekrar deneyin." };
      }
    },
  };
}

/**
 * Site içeriğini API + veritabanından okuyan uyumluluk kancası.
 * update* fonksiyonları artık sunucuya yazar ve sonucu bekleyene Promise döndürür.
 */
export function useAppData() {
  const {
    content,
    revision,
    updatedAt,
    isLoaded,
    isSaving,
    error,
    saveSection,
    resetContent,
    refresh,
  } = useSiteContent();

  const save = useCallback(
    async (section: ContentSectionKey, value: unknown): Promise<AdminActionResult> => {
      const invalid = validateLocal(section, value);
      if (invalid) return invalid;
      return toAdminAction(await saveSection(section, value));
    },
    [saveSection],
  );

  return {
    isLoaded,
    isSaving,
    error,
    revision,
    updatedAt,
    fixMenu: content.fixMenu,
    brochure: content.brochure,
    heroSlides: content.heroSlides,
    categories: content.categories,
    testimonials: content.testimonials,
    profile: content.profile,
    updateFixMenu: (value: Record<Day, DayMenu>) => save("fixMenu", value),
    updateBrochure: (value: FixBrochure) => save("brochure", value),
    updateHeroSlides: (value: HeroSlide[]) => save("heroSlides", value),
    updateCategories: (value: MenuCategory[]) => save("categories", value),
    updateTestimonials: (value: Testimonial[]) => save("testimonials", value),
    updateProfile: (value: AdminProfile) => save("profile", value),
    resetToDefaults: async (): Promise<AdminActionResult> => toAdminAction(await resetContent()),
    reload: () => refresh({ force: true }),
  };
}
