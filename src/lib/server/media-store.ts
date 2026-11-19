/**
 * Yüklenen görsellerin sunucu tarafı deposu.
 *
 * Broşür ve hero slider görselleri artık tarayıcıda base64'e çevrilip localStorage'a
 * yazılmıyor; sunucuda <MEDIA_DIR> altına dosya olarak iniyor, veritabanı yalnızca
 * adresini (/api/media/<ad>) saklıyor. Böylece:
 *  - içerik belgesi küçük ve okunabilir kalır,
 *  - 2 MB'lık bir görsel localStorage kotasını patlatamaz,
 *  - yüklenen görsel tüm ziyaretçilere ve tüm tarayıcılara açılır.
 *
 * Dosya adı içerik işaretinden (sha256) türetilir: aynı görsel tekrar yüklenirse tek
 * kopya durur, ad değişmediği için uzun süreli (immutable) önbellek güvenlidir.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

export const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

export type MediaType = "image/jpeg" | "image/png" | "image/webp";

const EXTENSIONS: Record<MediaType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class MediaRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaRejectedError";
  }
}

function getMediaDir(): string {
  return resolve(process.env["SITE_MEDIA_DIR"] || ".private/media");
}

/** MIME beyanına değil baytlara bakar; JPEG/PNG/WebP dışındaki her şeyi reddeder. */
export function detectMediaType(bytes: Uint8Array): MediaType | null {
  const startsWith = (signature: number[], offset = 0): boolean =>
    signature.every((byte, index) => bytes[offset + index] === byte);

  if (startsWith([0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (
    bytes.length >= 12 &&
    startsWith([0x52, 0x49, 0x46, 0x46]) &&
    startsWith([0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }
  return null;
}

export interface StoredMedia {
  name: string;
  url: string;
  contentType: MediaType;
  bytes: number;
  reused: boolean;
}

function mediaUrl(name: string): string {
  return `/api/media/${name}`;
}

export async function saveMediaFile(input: {
  data: Uint8Array;
  claimedType?: string | null;
}): Promise<StoredMedia> {
  const { data } = input;

  if (data.byteLength === 0) throw new MediaRejectedError("Yüklenen dosya boş.");
  if (data.byteLength > MAX_MEDIA_BYTES) {
    throw new MediaRejectedError("Görsel en fazla 4 MB olabilir.");
  }

  const contentType = detectMediaType(data);
  if (!contentType) {
    throw new MediaRejectedError("Yalnızca JPG, PNG veya WebP görseller yüklenebilir.");
  }
  if (
    input.claimedType &&
    input.claimedType.startsWith("image/") &&
    input.claimedType !== contentType
  ) {
    // Beyan ile gerçek farklı: gerçek türü esas al, dosyayı ona göre adlandır.
  }

  const digest = createHash("sha256").update(data).digest("hex").slice(0, 32);
  const name = `${digest}.${EXTENSIONS[contentType]}`;
  const path = resolve(getMediaDir(), name);

  let reused = true;
  try {
    const existing = await stat(path);
    if (!existing.isFile()) throw new Error("not a file");
  } catch {
    reused = false;
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data, { flag: "wx" }).catch(async (error: unknown) => {
      // Eşzamanlı aynı içerik yarışı: dosya zaten varsa sorun yok.
      if ((error as NodeJS.ErrnoException)?.code !== "EEXIST") throw error;
    });
  }

  return { name, url: mediaUrl(name), contentType, bytes: data.byteLength, reused };
}

export interface MediaFile {
  data: Buffer;
  contentType: MediaType;
}

const SAFE_NAME = /^[\w.-]+\.(jpg|png|webp)$/;

function typeFromExtension(name: string): MediaType | null {
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg")) return "image/jpeg";
  return null;
}

/** Path traversal ve beklenmedik uzantıya izin vermeden dosya okur. */
export async function readMediaFile(requestedName: string): Promise<MediaFile | null> {
  const name = requestedName.split("/").pop() ?? "";
  if (!SAFE_NAME.test(name)) return null;

  const contentType = typeFromExtension(name);
  if (!contentType) return null;

  try {
    const data = await readFile(resolve(getMediaDir(), name));
    if (data.byteLength > MAX_MEDIA_BYTES * 4) return null;
    return { data, contentType };
  } catch {
    return null;
  }
}

export function getMediaDirForTests(): string {
  return getMediaDir();
}
