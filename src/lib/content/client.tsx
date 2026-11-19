/**
 * Tarayıcı tarafı içerik deposu (provider bileşeni).
 *
 * Akış: Admin paneli -> /api/admin/content (PUT) -> sunucu doğrulama -> içerik veritabanı.
 * Ana sayfa ve diğer bileşenler -> /api/content (GET) -> aynı veritabanı.
 *
 * Depo, ilk karede titreşimi önlemek için localStorage'daki son sunucu kopyasını okur
 * (salt-okunur önbellek), ardından her zaman sunucudan güncel sürümü çeker.
 * Gerçek kaynak her zaman sunucudaki veritabanıdır; önbellek yalnızca hızlandırıcıdır.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import {
  ContentContext,
  CONTENT_CACHE_KEY,
  type ContentContextValue,
  type ContentResult,
  type StoredSnapshot,
} from "@/lib/content/context";
import { createDefaultContent, type SiteContent } from "@/lib/content/schema";
import {
  clearLegacyKeys,
  hasPendingLegacyData,
  markLegacyImportDone,
  readLegacySections,
} from "@/lib/content/legacy-import";
import type { ContentSectionKey } from "@/lib/content/schema";

const DEFAULT_SNAPSHOT: StoredSnapshot = {
  revision: 0,
  updatedAt: null,
  content: createDefaultContent(),
};

function mergeContent(incoming: Partial<SiteContent> | undefined): SiteContent {
  const base = createDefaultContent();
  if (!incoming || typeof incoming !== "object") return base;
  return {
    fixMenu: { ...base.fixMenu, ...incoming.fixMenu },
    brochure: { ...base.brochure, ...incoming.brochure },
    heroSlides:
      Array.isArray(incoming.heroSlides) && incoming.heroSlides.length > 0
        ? incoming.heroSlides
        : base.heroSlides,
    categories:
      Array.isArray(incoming.categories) && incoming.categories.length > 0
        ? incoming.categories
        : base.categories,
    testimonials:
      Array.isArray(incoming.testimonials) && incoming.testimonials.length > 0
        ? incoming.testimonials
        : base.testimonials,
    profile: { ...base.profile, ...incoming.profile },
  };
}

function readCache(): StoredSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONTENT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSnapshot>;
    const revision = Number(parsed?.revision);
    if (!Number.isInteger(revision) || revision < 1) return null;
    return {
      revision,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : null,
      content: mergeContent(parsed.content),
    };
  } catch {
    return null;
  }
}

function writeCache(snapshot: StoredSnapshot): void {
  if (typeof window === "undefined" || snapshot.revision < 1) return;
  try {
    window.localStorage.setItem(
      CONTENT_CACHE_KEY,
      JSON.stringify({
        revision: snapshot.revision,
        updatedAt: snapshot.updatedAt,
        content: snapshot.content,
      }),
    );
  } catch {
    // Depolama dolu veya kısıtlı: önbellek opsiyonel, site çalışmaya devam eder.
  }
}

async function errorFromResponse(response: Response, fallback: string): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    return typeof body.error === "string" && body.error ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<StoredSnapshot>(() => readCache() ?? DEFAULT_SNAPSHOT);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const revisionRef = useRef(snapshot.revision);
  // Kayıtları sıraya alır: aynı anda basılan "Kaydet" butonları sürümü yarıştırmaz.
  const queueRef = useRef<Promise<unknown>>(Promise.resolve());
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const applySnapshot = useCallback((next: StoredSnapshot) => {
    if (!mountedRef.current) return;
    revisionRef.current = next.revision;
    setSnapshot(next);
    writeCache(next);
  }, []);

  const runQueued = useCallback(<T,>(task: () => Promise<T>): Promise<T> => {
    const run = queueRef.current.then(task, task);
    queueRef.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }, []);

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      if (typeof window === "undefined") return;
      // Sunucu sürümü biliniyorsa tekrar çekme; sayfa değişimi zaten güncel sürümü getirir.
      if (!options?.force && revisionRef.current >= 1) return;

      setIsRefreshing(true);
      try {
        const response = await fetch("/api/content", {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
          cache: "no-cache",
        });
        if (!response.ok) {
          setError(await errorFromResponse(response, "İçerik sunucudan yüklenemedi."));
          // Okuma başarısız olsa da arayüz kilitlenmesin: önbellek/varsayılan görünür, uyarı gösterilir.
          setIsLoaded(true);
          return;
        }
        const body = (await response.json()) as Partial<StoredSnapshot>;
        const revision = Number(body.revision);
        if (!Number.isInteger(revision) || revision < 1) {
          setError("Sunucu geçerli bir içerik sürümü döndürmedi.");
          setIsLoaded(true);
          return;
        }
        applySnapshot({
          revision,
          updatedAt: typeof body.updatedAt === "string" ? body.updatedAt : null,
          content: mergeContent(body.content),
        });
        setError(null);
        setIsLoaded(true);
      } catch {
        setError("Sunucuya ulaşılamadı. Bağlantınızı kontrol edin.");
        setIsLoaded(true);
      } finally {
        if (mountedRef.current) setIsRefreshing(false);
      }
    },
    [applySnapshot],
  );

  // Başka bir sekmede yapılan kayıt bu sekmeye de yansısın.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== null && event.key !== CONTENT_CACHE_KEY) return;
      const cached = readCache();
      if (cached && cached.revision !== revisionRef.current) applySnapshot(cached);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [applySnapshot]);

  const saveSection = useCallback<ContentContextValue["saveSection"]>(
    (section, value) =>
      runQueued(async (): Promise<ContentResult> => {
        if (typeof window === "undefined") {
          return { ok: false, error: "Tarayıcı ortamı bulunamadı." };
        }

        setIsSaving(true);
        try {
          const response = await fetch("/api/admin/content", {
            method: "PUT",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              changes: { [section]: value },
              baseRevision: revisionRef.current >= 1 ? revisionRef.current : undefined,
            }),
          });

          const body = (await response.json().catch(() => null)) as
            (Partial<StoredSnapshot> & { error?: string; conflict?: boolean }) | null;

          if (response.status === 401) {
            return {
              ok: false,
              error: body?.error ?? "Oturum sona erdi. Yeniden giriş yapın.",
            };
          }

          if (response.status === 409) {
            // Sunucu en güncel belgeyi döndürdü: yerel görünümü onunla değiştir.
            if (body?.content) {
              applySnapshot({
                revision: Number(body.revision) || 0,
                updatedAt: typeof body.updatedAt === "string" ? body.updatedAt : null,
                content: mergeContent(body.content),
              });
            }
            return {
              ok: false,
              conflict: true,
              error: body?.error ?? "Bu içerik güncellendi. Değişiklikler tekrar uygulanamadı.",
            };
          }

          if (!response.ok) {
            return {
              ok: false,
              error: body?.error ?? "İçerik kaydedilemedi. Lütfen tekrar deneyin.",
            };
          }

          applySnapshot({
            revision: Number(body?.revision) || revisionRef.current + 1,
            updatedAt:
              typeof body?.updatedAt === "string" ? body.updatedAt : new Date().toISOString(),
            content: mergeContent(body?.content),
          });
          setIsLoaded(true);
          setError(null);
          return { ok: true };
        } catch {
          return {
            ok: false,
            error: "Sunucuya ulaşılamadı. Kaydedilemedi, tekrar deneyin.",
          };
        } finally {
          if (mountedRef.current) setIsSaving(false);
        }
      }),
    [applySnapshot, runQueued],
  );

  /**
   * Yükleme sırası: (1) sunucudan güncel sürümü al, (2) veritabanı hiç düzenlenmemişse
   * (sürüm 1) bu tarayıcıda kalmış eski düzenlemeleri bir kez sunucuya taşı,
   * (3) eski anahtarları temizle. Böylece yöneticinin eski menü değişiklikleri kaybolmaz.
   */
  const migrateLegacyContent = useCallback(async () => {
    if (typeof window === "undefined") return;

    await refresh();

    if (!hasPendingLegacyData()) {
      clearLegacyKeys();
      return;
    }

    if (revisionRef.current === 1) {
      const changes = readLegacySections();
      const sections = Object.entries(changes) as [ContentSectionKey, unknown][];
      for (const [section, value] of sections) {
        const result = await saveSection(section, value);
        if (!result.ok) {
          console.warn("[content-legacy] bölüm taşınamadı", section, result.error);
        }
      }
      if (sections.length > 0) {
        console.info(`[content-legacy] ${sections.length} bölüm veritabanına taşındı.`);
      }
    }

    markLegacyImportDone();
    clearLegacyKeys();
  }, [refresh, saveSection]);

  const migratedRef = useRef(false);
  useEffect(() => {
    if (migratedRef.current) return;
    migratedRef.current = true;
    void migrateLegacyContent();
  }, [migrateLegacyContent]);

  const resetContent = useCallback<ContentContextValue["resetContent"]>(
    () =>
      runQueued(async (): Promise<ContentResult> => {
        if (typeof window === "undefined") {
          return { ok: false, error: "Tarayıcı ortamı bulunamadı." };
        }

        setIsSaving(true);
        try {
          const response = await fetch("/api/admin/content-reset", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ confirm: true }),
          });
          const body = (await response.json().catch(() => null)) as
            (Partial<StoredSnapshot> & { error?: string }) | null;

          if (!response.ok) {
            return {
              ok: false,
              error: body?.error ?? "Sıfırlama yapılamadı. Lütfen tekrar deneyin.",
            };
          }

          applySnapshot({
            revision: Number(body?.revision) || 0,
            updatedAt:
              typeof body?.updatedAt === "string" ? body.updatedAt : new Date().toISOString(),
            content: mergeContent(body?.content),
          });
          setError(null);
          return { ok: true };
        } catch {
          return { ok: false, error: "Sunucuya ulaşılamadı. Sıfırlama tamamlanamadı." };
        } finally {
          if (mountedRef.current) setIsSaving(false);
        }
      }),
    [applySnapshot, runQueued],
  );

  const value = useMemo<ContentContextValue>(
    () => ({
      ...snapshot,
      isLoaded,
      isRefreshing,
      isSaving,
      error,
      saveSection,
      resetContent,
      refresh,
    }),
    [snapshot, isLoaded, isRefreshing, isSaving, error, saveSection, resetContent, refresh],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
