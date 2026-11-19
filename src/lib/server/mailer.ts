import nodemailer from "nodemailer";
import { contactSchema, smtpSettingsInputSchema, type ContactFormData, type SmtpSettings } from "@/lib/form-schemas";

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}

function createTransport(settings: SmtpSettings) {
  const parsed = smtpSettingsInputSchema.safeParse(settings);
  if (!parsed.success || !settings.password) throw new Error("SMTP settings are not valid");

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: { user: settings.user, pass: settings.password },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
    requireTLS: !settings.secure,
    tls: { minVersion: "TLSv1.2" },
  });
}

export async function sendContactEmail(input: ContactFormData, settings: SmtpSettings): Promise<void> {
  const data = contactSchema.parse(input);
  const transport = createTransport(settings);
  const safe = {
    company: escapeHtml(data.company),
    name: escapeHtml(data.name),
    phone: escapeHtml(data.phone),
    email: escapeHtml(data.email),
    subject: escapeHtml(data.subject),
    size: escapeHtml(data.size),
    district: escapeHtml(data.district),
    message: escapeHtml(data.message).replace(/\r?\n/g, "<br>"),
  };
  const text = [
    "Yeni web sitesi teklif talebi",
    "",
    `Firma: ${data.company}`,
    `Yetkili: ${data.name}`,
    `E-posta: ${data.email}`,
    `Telefon: ${data.phone}`,
    `Konu: ${data.subject}`,
    `Günlük kişi sayısı: ${data.size}`,
    `İlçe / bölge: ${data.district}`,
    "",
    "Mesaj:",
    data.message,
  ].join("\n");

  await transport.sendMail({
    from: { name: "Tarçın Ev Yemekleri Web Formu", address: settings.mailFrom },
    to: settings.mailTo,
    replyTo: { name: data.name, address: data.email },
    subject: `[Tarçın Web] ${data.subject}`,
    text,
    html: `<!doctype html><html lang="tr"><body style="margin:0;background:#f7f3ed;padding:24px;font-family:Arial,sans-serif;color:#2f251f"><main style="max-width:680px;margin:auto;background:#fff;border:1px solid #eadfd4;border-radius:14px;padding:28px"><h1 style="font-size:22px;margin:0 0 20px;color:#9b4d25">Yeni teklif talebi</h1><table style="width:100%;border-collapse:collapse"><tbody><tr><th align="left" style="padding:8px;border-bottom:1px solid #eee">Firma</th><td style="padding:8px;border-bottom:1px solid #eee">${safe.company}</td></tr><tr><th align="left" style="padding:8px;border-bottom:1px solid #eee">Yetkili</th><td style="padding:8px;border-bottom:1px solid #eee">${safe.name}</td></tr><tr><th align="left" style="padding:8px;border-bottom:1px solid #eee">E-posta</th><td style="padding:8px;border-bottom:1px solid #eee">${safe.email}</td></tr><tr><th align="left" style="padding:8px;border-bottom:1px solid #eee">Telefon</th><td style="padding:8px;border-bottom:1px solid #eee">${safe.phone}</td></tr><tr><th align="left" style="padding:8px;border-bottom:1px solid #eee">Konu</th><td style="padding:8px;border-bottom:1px solid #eee">${safe.subject}</td></tr><tr><th align="left" style="padding:8px;border-bottom:1px solid #eee">Günlük kişi sayısı</th><td style="padding:8px;border-bottom:1px solid #eee">${safe.size}</td></tr><tr><th align="left" style="padding:8px;border-bottom:1px solid #eee">İlçe / bölge</th><td style="padding:8px;border-bottom:1px solid #eee">${safe.district}</td></tr></tbody></table><h2 style="font-size:16px;margin:24px 0 8px">Mesaj</h2><p style="margin:0;line-height:1.65;overflow-wrap:anywhere">${safe.message}</p><p style="margin-top:24px;color:#786d64;font-size:12px">Yanıtlamak için e-postayı yanıtlayabilir veya Reply-To adresini kullanabilirsiniz.</p></main></body></html>`,
  });
}

export async function sendSmtpTestEmail(settings: SmtpSettings): Promise<void> {
  const transport = createTransport(settings);
  await transport.sendMail({
    from: { name: "Tarçın Ev Yemekleri SMTP Testi", address: settings.mailFrom },
    to: settings.mailTo,
    subject: "Tarçın SMTP bağlantı testi",
    text: "Bu ileti, yönetim panelinden başlatılan SMTP test e-postasıdır. SMTP ayarlarınız çalışıyor.",
    html: "<!doctype html><html lang=\"tr\"><body style=\"font-family:Arial,sans-serif;color:#2f251f\"><h1>SMTP ayarları çalışıyor</h1><p>Bu ileti, yönetim panelinden başlatılan test e-postasıdır.</p></body></html>",
  });
}
