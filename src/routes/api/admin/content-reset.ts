import { createFileRoute } from "@tanstack/react-router";

import { ContentDbUnavailableError, resetSiteContent } from "@/lib/server/content-db";
import { jsonResponse, parseJsonObject, sameOrigin, tooLarge } from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/secure-store";

/**
 * Tüm site içeriğini fabrika varsayılanlarına döndürür.
 * Yalnızca SMTP ayarları ve yönetici parolası bu işlemden etkilenmez.
 */
export const Route = createFileRoute("/api/admin/content-reset")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!sameOrigin(request))
          return jsonResponse({ error: "İstek kaynağı doğrulanamadı." }, 403);
        if (!(await isAdminRequest(request))) {
          return jsonResponse({ error: "Oturum sona erdi. Yeniden giriş yapın." }, 401);
        }
        if (tooLarge(request, 8_192)) return jsonResponse({ error: "İstek çok büyük." }, 413);

        const body = await parseJsonObject(request);
        if (body?.["confirm"] !== true) {
          return jsonResponse({ error: "Sıfırlama işlemi onaylanmadı." }, 422);
        }

        try {
          const snapshot = await resetSiteContent("admin");
          return jsonResponse({
            message: "Tüm site içeriği varsayılan verilere sıfırlandı.",
            revision: snapshot.revision,
            updatedAt: snapshot.updatedAt,
            content: snapshot.content,
          });
        } catch (error) {
          if (error instanceof ContentDbUnavailableError) {
            return jsonResponse({ error: "İçerik veritabanı şu anda kullanılamıyor." }, 503);
          }
          console.error("[content-admin] sıfırlama başarısız", {
            errorType: error instanceof Error ? error.name : "UnknownError",
          });
          return jsonResponse({ error: "Sıfırlama yapılamadı. Lütfen tekrar deneyin." }, 503);
        }
      },
    },
  },
});
