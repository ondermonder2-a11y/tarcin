/**
 * Tek seferlik içe aktarma (migration).
 *
 * Sürüm 1'de admin paneli tüm düzenlemeleri tarayıcının localStorage'ına yazıyordu;
 * yani veriler yalnızca o bilgisayarda görünürdü. Artık kaynak sunucudaki veritabanı.
 * Bu modül, yöneticinin tarayıcısında kalmış eski düzenlemeleri — veritabanı henüz
 * hiç düzenlenmemişse (revision 1) — sunucuya bir kez taşır.
 *
 * Yalnızca metin bölümleri taşınır (tabldot menüsü, katalog, yorumlar, profil).
 * Slider ve broşür görselleri taşınmaz: eski kayıt Vite'ın hash'li geçici görsel
 * adreslerini veya 2 MB'lık base64 dizilerini içerdiğinden veritabanına yazılmaları
 * kırık görsel üretebilirdi. Bu iki bölüm sunucuda varsayılan görsellerle başlar.
 */
import {
  brochureSchema,
  categoriesSchema,
  fixMenuSchema,
  heroSlidesSchema,
  profileSchema,
  siteContentSchema,
  testimonialsSchema,
  type ContentSectionKey,
} from "@/lib/content/schema";

const LEGACY_KEYS = {
  fixMenu: "tarcin_fix_menu_v1",
  brochure: "tarcin_fix_brochure_v1",
  heroSlides: "tarcin_hero_slides_v1",
  categories: "tarcin_categories_v1",
  testimonials: "tarcin_testimonials_v1",
  profile: "tarcin_profile_v1",
  auth: "tarcin_admin_auth_v1",
  password: "tarcin_admin_pass_v1",
} as const;

const MIGRATION_FLAG = "tarcin_content_migrated_v1";

const TEXT_ONLY_SECTIONS = ["fixMenu", "categories", "testimonials", "profile"] as const;

const SCHEMAS = {
  fixMenu: fixMenuSchema,
  categories: categoriesSchema,
  testimonials: testimonialsSchema,
  profile: profileSchema,
  brochure: brochureSchema,
  heroSlides: heroSlidesSchema,
} as const;

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function hasPendingLegacyData(): boolean {
  const store = storage();
  if (!store || store.getItem(MIGRATION_FLAG) === "done") return false;
  return TEXT_ONLY_SECTIONS.some((section) => store.getItem(LEGACY_KEYS[section]) !== null);
}

/** Eski anahtarlarda, sunucu şemasına uyan gerçekten taşınabilir veri var mı? */
export function readLegacySections(): Partial<Record<ContentSectionKey, unknown>> {
  const store = storage();
  if (!store) return {};

  const changes: Partial<Record<ContentSectionKey, unknown>> = {};
  for (const section of TEXT_ONLY_SECTIONS) {
    const raw = store.getItem(LEGACY_KEYS[section]);
    if (raw === null) continue;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (SCHEMAS[section].safeParse(parsed).success) changes[section] = parsed;
    } catch {
      // Bozuk eski kayıt: yok say.
    }
  }
  return changes;
}

export function markLegacyImportDone(): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(MIGRATION_FLAG, "done");
  } catch {
    // Yoksay.
  }
}

/**
 * Tüm eski anahtarları siler. İçe aktarma yapılmış ya da yapılmamış olsun,
 * sürüm 2 veritabanı kaynak olduğundan bu anahtarların hiçbir işlevi kalmadı.
 */
export function clearLegacyKeys(): void {
  const store = storage();
  if (!store) return;
  try {
    for (const key of Object.values(LEGACY_KEYS)) store.removeItem(key);
  } catch {
    // Yoksay.
  }
}

/** Taşınan verinin tam site şemasıyla da uyuştuğunu hızlıca doğrular. */
export function looksLikeFullSiteContent(value: unknown): boolean {
  return siteContentSchema.safeParse(value).success;
}
