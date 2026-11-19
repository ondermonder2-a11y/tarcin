import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { contentChangesSchema, type ContentSectionKey } from "@/lib/content/schema";
import {
  ContentDbUnavailableError,
  getContentSnapshot,
  updateSiteContent,
} from "@/lib/server/content-db";
import {
  fieldErrorsFromIssues,
  jsonResponse,
  parseJsonObject,
  sameOrigin,
  tooLarge,
} from "@/lib/server/http";
import { isAdminRequest } from "@/lib/server/secure-store";

const MAX_BODY_BYTES = 512_000;

const updateRequestSchema = z
  .object({
    changes: contentChangesSchema,
    baseRevision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER).optional(),
  })
  .strict();

function unauthorized(): Response {
  return jsonResponse({ error: "Oturum sona erdi. Yeniden giriş yapın." }, 401);
}

function validationError(
  issues: readonly { path: readonly (string | number | symbol)[]; message: string }[],
  message: string,
): Response {
  return jsonResponse({ error: message, fieldErrors: fieldErrorsFromIssues(issues) }, 422);
}

function firstSection(changes: Record<string, unknown>): ContentSectionKey | undefined {
  const [key] = Object.keys(changes);
  return key as ContentSectionKey | undefined;
}

export const Route = createFileRoute("/api/admin/content")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAdminRequest(request))) return unauthorized();
        try {
          const snapshot = await getContentSnapshot();
          return jsonResponse({
            revision: snapshot.revision,
            updatedAt: snapshot.updatedAt,
            updatedBy: snapshot.updatedBy,
            content: snapshot.content,
          });
        } catch {
          return jsonResponse({ error: "İçerik veritabanı okunamadı." }, 503);
        }
      },

      /**
       * Bölüm bazlı güncelleme:
       * PUT { "changes": { "fixMenu": {...} }, "baseRevision": 12 }
       * Doğrulanmamış hiçbir alan yazılmaz; baseRevision uyuşmazsa 409 döner.
       */
      PUT: async ({ request }) => {
        if (!sameOrigin(request))
          return jsonResponse({ error: "İstek kaynağı doğrulanamadı." }, 403);
        if (!(await isAdminRequest(request))) return unauthorized();
        if (tooLarge(request, MAX_BODY_BYTES))
          return jsonResponse({ error: "İstek çok büyük." }, 413);

        const body = await parseJsonObject(request);
        if (!body) return jsonResponse({ error: "Geçersiz istek gövdesi." }, 400);

        const parsed = updateRequestSchema.safeParse(body);
        if (!parsed.success) {
          return validationError(parsed.error.issues, "Güncelleme biçimi geçersiz.");
        }

        const section = firstSection(parsed.data.changes);
        if (!section || Object.keys(parsed.data.changes).length !== 1) {
          return jsonResponse({ error: "Tek seferde tek bir içerik bölümü gönderin." }, 422);
        }

        try {
          const result = await updateSiteContent(
            parsed.data.changes,
            "admin",
            parsed.data.baseRevision,
          );

          if (result.conflict) {
            return jsonResponse(
              {
                error:
                  "Bu veriler başkası tarafından güncellendi. En güncel içerik yüklendi, tekrar kaydedin.",
                conflict: true,
                revision: result.snapshot.revision,
                content: result.snapshot.content,
              },
              409,
            );
          }

          return jsonResponse({
            message: "İçerik veritabanına kaydedildi.",
            section,
            revision: result.snapshot.revision,
            updatedAt: result.snapshot.updatedAt,
            content: result.snapshot.content,
          });
        } catch (error) {
          if (error instanceof z.ZodError) {
            return validationError(error.issues, "İçerik alanlarını kontrol ediniz.");
          }
          if (error instanceof ContentDbUnavailableError) {
            return jsonResponse(
              {
                error:
                  "İçerik veritabanı yazmaya hazır değil. /data birimini ve SITE_CONTENT_DB_FILE ayarını kontrol edin.",
              },
              503,
            );
          }
          console.error("[content-admin] kayıt başarısız", {
            errorType: error instanceof Error ? error.name : "UnknownError",
          });
          return jsonResponse({ error: "İçerik kaydedilemedi. Lütfen tekrar deneyin." }, 503);
        }
      },
    },
  },
});
