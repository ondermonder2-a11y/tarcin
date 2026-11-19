/**
 * Site içeriği veritabanı.
 *
 * Depolama: tek JSON belge dosyası (v1). Neden dosya?
 *  - Projede harici DB servisi yok (docker-compose sadece node-server çalıştırıyor) ve
 *    Lovable Cloud/Supabase şema klasörleri bu repoda yönetiliyor; yeni migration ekleyemeyiz.
 *  - node:sqlite / better-sqlite3 bu derleme hattında (Vite + Nitro bundle) riskli:
 *    `node:sqlite` deneysel ve bundle dışı bırakılması garantili değil,
 *    `better-sqlite3` native dereme ister (node:22-alpine üretim imajında toolchain yok).
 *  - Dosya, Docker'daki kalıcı /data birimine yazılır, atomik rename ile bozulmaz.
 *
 * Erişim tek yönlüdür: API route'ları bu modülü çağırır, tarayıcı DB dosyasını asla görmez.
 * Not: yazmalar süreç içinde kuyruklanır; tek konteynerlik bu kurulum için yeterlidir.
 */
import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import process from "node:process";

import {
  createDefaultContent,
  siteContentSchema,
  validateSiteContent,
  type ContentChanges,
  type SiteContent,
} from "@/lib/content/schema";

export const CONTENT_DB_VERSION = 1;

export interface ContentSnapshot {
  version: number;
  revision: number;
  updatedAt: string;
  updatedBy: string;
  content: SiteContent;
}

export class ContentDbUnavailableError extends Error {
  constructor(message = "Site içerik veritabanı kullanılamıyor.") {
    super(message);
    this.name = "ContentDbUnavailableError";
  }
}

function getDbPath(): string {
  const configured = process.env["SITE_CONTENT_DB_FILE"]?.trim();
  return resolve(configured || ".private/site-content.json");
}

function isProduction(): boolean {
  return process.env["NODE_ENV"] === "production";
}

function createInitialSnapshot(): ContentSnapshot {
  return {
    version: CONTENT_DB_VERSION,
    revision: 1,
    updatedAt: new Date(0).toISOString(),
    updatedBy: "seed",
    content: createDefaultContent(),
  };
}

function normalizeContent(value: unknown): SiteContent | null {
  const parsed = siteContentSchema.safeParse(value);
  if (parsed.success) return parsed.data;

  // Kısmen bozuk/eksik belge: varsayılanlarla birleştirip bir kez daha dene.
  const defaults = createDefaultContent();
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const merged: SiteContent = {
    fixMenu: { ...defaults.fixMenu, ...(candidate["fixMenu"] as object | undefined) },
    brochure: { ...defaults.brochure, ...(candidate["brochure"] as object | undefined) },
    heroSlides: Array.isArray(candidate["heroSlides"])
      ? (candidate["heroSlides"] as SiteContent["heroSlides"])
      : defaults.heroSlides,
    categories: Array.isArray(candidate["categories"])
      ? (candidate["categories"] as SiteContent["categories"])
      : defaults.categories,
    testimonials: Array.isArray(candidate["testimonials"])
      ? (candidate["testimonials"] as SiteContent["testimonials"])
      : defaults.testimonials,
    profile: { ...defaults.profile, ...(candidate["profile"] as object | undefined) },
  };
  return validateSiteContent(merged);
}

function parseSnapshot(raw: string): ContentSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const envelope = parsed as Record<string, unknown>;
    if (envelope["version"] !== CONTENT_DB_VERSION) return null;
    const content = normalizeContent(envelope["content"]);
    if (!content) return null;
    const revision = Number(envelope["revision"]);
    const updatedAt = typeof envelope["updatedAt"] === "string" ? envelope["updatedAt"] : "";
    const updatedBy = typeof envelope["updatedBy"] === "string" ? envelope["updatedBy"] : "system";
    return {
      version: CONTENT_DB_VERSION,
      revision: Number.isInteger(revision) && revision >= 0 ? revision : 1,
      updatedAt: updatedAt || new Date(0).toISOString(),
      updatedBy: updatedBy.slice(0, 64),
      content,
    };
  } catch {
    return null;
  }
}

async function quarantineCorruptFile(path: string): Promise<void> {
  const target = `${path}.${Date.now().toString(36)}.${randomBytes(4).toString("hex")}.corrupt`;
  try {
    await rename(path, target);
    console.error(`[content-db] bozuk belge karantinaya alındı: ${target}`);
  } catch {
    // Okunamayan dosya zaten kullanılamıyor; seed yazımı devam etsin.
  }
}

async function writeSnapshot(snapshot: ContentSnapshot): Promise<void> {
  const path = getDbPath();
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(temporary, JSON.stringify(snapshot, null, 2), { encoding: "utf8" });
  await rename(temporary, path);
}

let state: ContentSnapshot | null = null;
let loading: Promise<ContentSnapshot> | null = null;
let queue: Promise<unknown> = Promise.resolve();

async function loadSnapshot(): Promise<ContentSnapshot> {
  const path = getDbPath();

  try {
    const raw = await readFile(path, "utf8");
    const parsed = parseSnapshot(raw);
    if (parsed) {
      state = parsed;
      return parsed;
    }
    if (isProduction()) {
      // Üretimde sessiz sıfırlama içerik kaybına yol açmasın; mevcut dosyayı ayır.
      await quarantineCorruptFile(path);
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT") {
      if (isProduction()) throw new ContentDbUnavailableError();
      console.error("[content-db] belge okunamadı, varsayılanlar kullanılacak", {
        errorType: error instanceof Error ? error.name : "UnknownError",
      });
    }
  }

  const seeded = createInitialSnapshot();
  try {
    await writeSnapshot(seeded);
    state = seeded;
  } catch {
    if (isProduction()) throw new ContentDbUnavailableError();
    // Geliştirmede /data ya da .private yazılamıyorsa en azından site çalışmaya devam etsin.
    state = seeded;
  }
  return seeded;
}

async function ensureSnapshot(): Promise<ContentSnapshot> {
  if (state) return state;
  if (!loading) {
    loading = loadSnapshot().finally(() => {
      loading = null;
    });
  }
  return loading;
}

/** Yazmaları sıraya alan sarmalayıcı: eşzamanlı kayıtlar belgeyi bozamam. */
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function getContentSnapshot(): Promise<ContentSnapshot> {
  return serialize(() => ensureSnapshot());
}

export async function getSiteContent(): Promise<SiteContent> {
  const snapshot = await getContentSnapshot();
  return snapshot.content;
}

export interface ContentUpdateResult {
  snapshot: ContentSnapshot;
  conflict: boolean;
}

/**
 * Bölüm bölüm güncelleme. `baseRevision` verilirse eşzamanlı yazma çakışması tespit edilir
 * ve hiçbir şey yazılmaz (admin paneli en güncel veriyi yeniden çeker).
 */
export async function updateSiteContent(
  changes: ContentChanges,
  actor: string,
  baseRevision?: number,
): Promise<ContentUpdateResult> {
  return serialize(async () => {
    const current = await ensureSnapshot();

    if (baseRevision !== undefined && baseRevision !== current.revision) {
      return { snapshot: current, conflict: true };
    }

    const merged = normalizeContent({ ...current.content, ...changes });
    if (!merged) throw new Error("İçerik doğrulaması başarısız");

    const next: ContentSnapshot = {
      version: CONTENT_DB_VERSION,
      revision: current.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.slice(0, 64) || "admin",
      content: merged,
    };
    await writeSnapshot(next);
    state = next;
    return { snapshot: next, conflict: false };
  });
}

export async function resetSiteContent(actor: string): Promise<ContentSnapshot> {
  return serialize(async () => {
    const current = await ensureSnapshot();
    const next: ContentSnapshot = {
      version: CONTENT_DB_VERSION,
      revision: current.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor.slice(0, 64) || "admin",
      content: createDefaultContent(),
    };
    await writeSnapshot(next);
    state = next;
    return next;
  });
}

/** Test/araç desteği: önbelleği sıfırlar ve aktif dosya yolunu döndürür. */
export function __resetContentDbCacheForTests(pathForTests?: string): void {
  state = null;
  loading = null;
  queue = Promise.resolve();
  if (pathForTests && isAbsolute(pathForTests)) {
    process.env["SITE_CONTENT_DB_FILE"] = pathForTests;
  }
}

export function getContentDbPathForTests(): string {
  return getDbPath();
}
