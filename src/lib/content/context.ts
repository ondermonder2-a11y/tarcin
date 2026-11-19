/**
 * İçerik deposunun React context sözleşmesi.
 * Bileşen (provider) ile hook'u ayrı dosyalarda tutmak Fast Refresh'i korur.
 */
import { createContext, useContext } from "react";

import type { SiteContent } from "@/lib/content/schema";

export const CONTENT_CACHE_KEY = "tarcin_content_cache_v1";

export interface ContentResult {
  ok: boolean;
  error?: string;
  /** Sunucu, gönderilen sürümden daha yeni bir belge buldu (başka sekme/oturum). */
  conflict?: boolean;
}

export interface StoredSnapshot {
  revision: number;
  updatedAt: string | null;
  content: SiteContent;
}

export interface ContentContextValue extends StoredSnapshot {
  /** Sunucudan en az bir doğrulanmış sürüm alındıysa true. */
  isLoaded: boolean;
  isRefreshing: boolean;
  isSaving: boolean;
  error: string | null;
  saveSection: (section: keyof SiteContent, value: unknown) => Promise<ContentResult>;
  resetContent: () => Promise<ContentResult>;
  refresh: (options?: { force?: boolean }) => Promise<void>;
}

export const ContentContext = createContext<ContentContextValue | null>(null);

/** Site içeriğini API + veritabanından okuyan paylaşılan kancadır. */
export function useSiteContent(): ContentContextValue {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useSiteContent, SiteContentProvider içinde kullanılmalıdır.");
  }
  return context;
}
