import { createFileRoute } from "@tanstack/react-router";
import { contactSchema } from "@/lib/form-schemas";
import { sendContactEmail } from "@/lib/server/mailer";
import { getSmtpSettings } from "@/lib/server/secure-store";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const requestsByAddress = new Map<string, { count: number; resetAt: number }>();

function json(body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status, headers });
}

function getClientKey(request: Request): string {
  const address = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  return address.slice(0, 100);
}

function checkRateLimit(request: Request): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const key = getClientKey(request);
  const current = requestsByAddress.get(key);
  if (!current || current.resetAt <= now) {
    requestsByAddress.set(key, { count: 1, resetAt: now + WINDOW_MS });
    if (requestsByAddress.size > 5000) {
      for (const [entryKey, entry] of requestsByAddress) {
        if (entry.resetAt <= now) requestsByAddress.delete(entryKey);
      }
    }
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  return { allowed: current.count <= MAX_REQUESTS, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export const Route = createFileRoute("/api/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (Number(request.headers.get("content-length") ?? 0) > 20_000) {
          return json({ error: "Form verisi çok büyük. Lütfen daha kısa bir mesaj girin." }, 413);
        }
        const limit = checkRateLimit(request);
        if (!limit.allowed) {
          return json({ error: "Çok sık gönderim yapıldı. Lütfen daha sonra tekrar deneyin." }, 429, {
            "Retry-After": String(limit.retryAfter),
          });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ error: "Form verileri okunamadı. Lütfen alanları kontrol edip tekrar deneyin." }, 400);
        }

        const parsed = contactSchema.safeParse(body);
        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of parsed.error.issues) {
            const field = String(issue.path[0] ?? "form");
            if (!fieldErrors[field]) fieldErrors[field] = issue.message;
          }
          return json({ error: "Lütfen işaretli alanları kontrol edin.", fieldErrors }, 422);
        }

        let settings;
        try {
          settings = await getSmtpSettings();
        } catch {
          console.error("[contact-mail] secure SMTP settings unavailable");
          return json({ error: "E-posta gönderimi şu anda kullanılamıyor. Lütfen telefonla iletişime geçin." }, 503);
        }

        if (!settings) {
          return json({ error: "E-posta gönderim servisi henüz yapılandırılmamış. Lütfen telefonla iletişime geçin." }, 503);
        }

        try {
          await sendContactEmail(parsed.data, settings);
          return json({ message: "Talebiniz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz." });
        } catch (error) {
          const errorType = error instanceof Error ? error.name : "UnknownError";
          console.error("[contact-mail] SMTP delivery failed", { errorType });
          return json({ error: "E-posta gönderilemedi. Lütfen bilgilerinizi kontrol edip tekrar deneyin veya telefonla bize ulaşın." }, 502);
        }
      },
    },
  },
});
