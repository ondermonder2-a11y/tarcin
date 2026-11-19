import { createFileRoute } from "@tanstack/react-router";

import { getContentSnapshot } from "@/lib/server/content-db";
import { jsonResponse } from "@/lib/server/http";

/**
 * Herkese açık okuma uç noktası: ana sayfa ve diğer bileşenler içeriği buradan alır.
 * Yazma burada mümkün değildir; düzenleme /api/admin/content üzerinden yapılır.
 */
export const Route = createFileRoute("/api/content")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const snapshot = await getContentSnapshot();
          return jsonResponse(
            {
              revision: snapshot.revision,
              updatedAt: snapshot.updatedAt,
              content: snapshot.content,
            },
            200,
            // Tek süreçlik kurulumda kısa süreli önbellek; admin kaydı zaten yanıtta döner.
            { "Cache-Control": "public, max-age=15, stale-while-revalidate=300" },
          );
        } catch (error) {
          console.error("[content-api] okuma başarısız", {
            errorType: error instanceof Error ? error.name : "UnknownError",
          });
          return jsonResponse({ error: "İçerik şu anda yüklenemiyor." }, 503);
        }
      },
    },
  },
});
