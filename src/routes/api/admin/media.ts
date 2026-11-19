import { createFileRoute } from "@tanstack/react-router";

import { MAX_MEDIA_BYTES, MediaRejectedError, saveMediaFile } from "@/lib/server/media-store";
import { jsonResponse, sameOrigin, tooLarge } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/secure-store";

/**
 * Broşür ve hero slider görsellerini sunucuya kaydeder; veritabanına yalnızca
 * dönen adres (/api/media/<ad>) yazılır.
 */
export const Route = createFileRoute("/api/admin/media")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!sameOrigin(request))
          return jsonResponse({ error: "İstek kaynağı doğrulanamadı." }, 403);
        if (!(await isAdminRequest(request))) {
          return jsonResponse({ error: "Oturum sona erdi. Yeniden giriş yapın." }, 401);
        }
        // Form alanı başlıkları için küçük tampon, dosya içeriği ayrıca sınırlanır.
        if (tooLarge(request, MAX_MEDIA_BYTES + 65_536)) {
          return jsonResponse({ error: "Görsel çok büyük (en fazla 4 MB)." }, 413);
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return jsonResponse({ error: "Dosya okunamadı. form-data olarak yükleyin." }, 400);
        }

        const file = form.get("file");
        if (!(file instanceof Blob)) {
          return jsonResponse({ error: "Yüklenecek dosya bulunamadı." }, 400);
        }
        if (file.size > MAX_MEDIA_BYTES) {
          return jsonResponse({ error: "Görsel en fazla 4 MB olabilir." }, 413);
        }

        try {
          const stored = await saveMediaFile({
            data: new Uint8Array(await file.arrayBuffer()),
            claimedType: typeof file.type === "string" ? file.type : null,
          });

          return jsonResponse({
            message: "Görsel sunucuya kaydedildi.",
            url: stored.url,
            name: stored.name,
            contentType: stored.contentType,
            bytes: stored.bytes,
            reused: stored.reused,
          });
        } catch (error) {
          if (error instanceof MediaRejectedError) {
            return jsonResponse({ error: error.message }, 422);
          }
          console.error("[media-admin] kayıt başarısız", {
            errorType: error instanceof Error ? error.name : "UnknownError",
          });
          return jsonResponse({ error: "Görsel kaydedilemedi. /data birimini kontrol edin." }, 503);
        }
      },
    },
  },
});
