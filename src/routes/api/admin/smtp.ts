import { createFileRoute } from "@tanstack/react-router";
import { smtpSettingsInputSchema, type SmtpSettings } from "@/lib/form-schemas";
import { sendSmtpTestEmail } from "@/lib/server/mailer";
import {
  getSmtpSettings,
  getSmtpSettingsDraft,
  isAdminRequest,
  saveSmtpSettings,
  SecureStoreConfigurationError,
} from "@/lib/server/secure-store";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Pragma": "no-cache",
    },
  });
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get("host") ?? new URL(request.url).host;
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && fetchSite !== "same-origin") return false;
    return originUrl.host.toLowerCase() === requestHost.toLowerCase()
      && (fetchSite === "same-origin" || originUrl.protocol === new URL(request.url).protocol);
  } catch {
    return false;
  }
}

async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/api/admin/smtp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        if (!(await isAdminRequest(request))) return json({ error: "Oturum sona erdi. Yeniden giriş yapın." }, 401);
        try {
          return json({ settings: await getSmtpSettingsDraft() });
        } catch {
          console.error("[smtp-admin] secure settings unavailable");
          return json({ error: "Güvenli ayar deposu sunucuda yapılandırılmamış." }, 503);
        }
      },
      PUT: async ({ request }) => {
        if (!sameOrigin(request)) return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
        if (!(await isAdminRequest(request))) return json({ error: "Oturum sona erdi. Yeniden giriş yapın." }, 401);
        if (Number(request.headers.get("content-length") ?? 0) > 16_384) return json({ error: "İstek çok büyük." }, 413);
        const parsed = smtpSettingsInputSchema.safeParse(await parseJson(request));
        if (!parsed.success) {
          const fieldErrors: Record<string, string> = {};
          for (const issue of parsed.error.issues) {
            const field = String(issue.path[0] ?? "form");
            if (!fieldErrors[field]) fieldErrors[field] = issue.message;
          }
          return json({ error: "SMTP alanlarını kontrol ediniz.", fieldErrors }, 422);
        }

        try {
          const existing = await getSmtpSettings();
          const password = parsed.data.password || existing?.password || "";
          if (!password) {
            return json({ error: "İlk kayıtta SMTP parolası zorunludur.", fieldErrors: { password: "SMTP parolasını giriniz." } }, 422);
          }
          const settings: SmtpSettings = { ...parsed.data, password };
          await saveSmtpSettings(settings);
          return json({
            message: "SMTP ayarları güvenli olarak kaydedildi.",
            settings: {
              host: settings.host,
              port: settings.port,
              secure: settings.secure,
              user: settings.user,
              mailFrom: settings.mailFrom,
              mailTo: settings.mailTo,
              hasPassword: true,
              configured: true,
            },
          });
        } catch (error) {
          if (error instanceof SecureStoreConfigurationError) {
            return json({ error: "Güvenli ayar deposu yapılandırılamadı. Sunucu şifreleme anahtarını ve kalıcı /data birimini kontrol edin." }, 503);
          }
          console.error("[smtp-admin] settings save failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
          return json({ error: "SMTP ayarları kaydedilemedi. Lütfen daha sonra tekrar deneyin." }, 503);
        }
      },
      POST: async ({ request }) => {
        if (!sameOrigin(request)) return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
        if (!(await isAdminRequest(request))) return json({ error: "Oturum sona erdi. Yeniden giriş yapın." }, 401);

        try {
          const settings = await getSmtpSettings();
          if (!settings) return json({ error: "Önce geçerli SMTP ayarlarını kaydedin." }, 422);
          await sendSmtpTestEmail(settings);
          return json({ message: `Test e-postası ${settings.mailTo} adresine gönderildi.` });
        } catch (error) {
          if (error instanceof SecureStoreConfigurationError) {
            return json({ error: "Güvenli ayar deposu sunucuda yapılandırılmamış." }, 503);
          }
          const errorType = error instanceof Error ? error.name : "UnknownError";
          console.error("[smtp-admin] test email failed", { errorType });
          return json({ error: "Test e-postası gönderilemedi. SMTP sunucu adresi, port, TLS ve kimlik bilgilerini kontrol edin." }, 502);
        }
      },
    },
  },
});
