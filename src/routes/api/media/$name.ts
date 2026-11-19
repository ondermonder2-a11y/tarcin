import { createFileRoute } from "@tanstack/react-router";

import { readMediaFile } from "@/lib/server/media-store";

/**
 * Sunucuya yüklenmiş görselleri içerik türüyle birlikte döner.
 * Dosya adı içerik işaretinden türetildiği için yanıt güvenle uzun süre önbelleğe alınabilir.
 */
export const Route = createFileRoute("/api/media/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const file = await readMediaFile(String(params["name"] ?? ""));
        if (!file) {
          return new Response("Not found", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
          });
        }

        return new Response(new Uint8Array(file.data), {
          headers: {
            "Content-Type": file.contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
            // Harici sayfaların görseli kullanmasını engellemek için sıcak bağlantı kısıtı.
            "X-Content-Type-Options": "nosniff",
          },
        });
      },
    },
  },
});
