/** Admin panelinin görselleri sunucuya (/api/admin/media) göndermesi için küçük yardımcı. */

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type UploadResult =
  { ok: true; url: string; reused: boolean } | { ok: false; error: string };

function localValidation(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return "Yalnızca JPG, PNG veya WebP görseller yükleyebilirsiniz.";
  }
  if (file.size === 0) return "Seçilen dosya boş.";
  if (file.size > MAX_UPLOAD_BYTES) return "Görsel en fazla 4 MB olabilir.";
  return null;
}

export async function uploadSiteImage(file: File): Promise<UploadResult> {
  if (typeof window === "undefined") return { ok: false, error: "Tarayıcı ortamı bulunamadı." };

  const invalid = localValidation(file);
  if (invalid) return { ok: false, error: invalid };

  const body = new FormData();
  body.append("file", file, file.name);

  try {
    const response = await fetch("/api/admin/media", {
      method: "POST",
      credentials: "same-origin",
      body,
    });
    const payload = (await response.json().catch(() => null)) as {
      url?: unknown;
      error?: unknown;
      reused?: unknown;
    } | null;

    if (!response.ok) {
      const message = typeof payload?.error === "string" ? payload.error : "Görsel yüklenemedi.";
      return { ok: false, error: message };
    }
    if (typeof payload?.url !== "string" || !payload.url.startsWith("/")) {
      return { ok: false, error: "Sunucu geçerli bir görsel adresi döndürmedi." };
    }
    return { ok: true, url: payload.url, reused: payload["reused"] === true };
  } catch {
    return { ok: false, error: "Sunucuya ulaşılamadı. Görsel yüklenemedi." };
  }
}
