import { describe, expect, it } from "vitest";
import { contactSchema, smtpSettingsInputSchema } from "./form-schemas";
import { escapeHtml } from "./server/mailer";

const validContact = {
  company: "Örnek Ltd.",
  name: "Ayşe Yılmaz",
  phone: "0 (535) 418 74 32",
  email: "ayse@example.com",
  subject: "Kurumsal yemek teklifi",
  size: "30-100 kişi",
  district: "Muratpaşa",
  message: "Ekibimiz için günlük yemek hizmeti hakkında bilgi rica ederiz.",
};

describe("contactSchema", () => {
  it("valid form girdisini kabul eder", () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true);
  });

  it("boş veya geçersiz iletişim alanlarını reddeder", () => {
    expect(contactSchema.safeParse({ ...validContact, email: "yanlis" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, name: "" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...validContact, phone: "12" }).success).toBe(false);
  });

  it("e-posta başlığında satır sonu enjeksiyonunu reddeder", () => {
    expect(contactSchema.safeParse({ ...validContact, subject: "Teklif\r\nBcc: attacker@example.com" }).success).toBe(false);
  });
});

describe("smtpSettingsInputSchema", () => {
  const validSettings = {
    host: "smtp.example.com",
    port: 587,
    secure: false,
    user: "mailer@example.com",
    password: "",
    mailFrom: "mailer@example.com",
    mailTo: "office@example.com",
  };

  it("SMTP parola alanı boş bırakıldığında mevcut parolayı koruyacak güncellemeye izin verir", () => {
    expect(smtpSettingsInputSchema.safeParse(validSettings).success).toBe(true);
  });

  it("geçersiz port ve e-posta adreslerini reddeder", () => {
    expect(smtpSettingsInputSchema.safeParse({ ...validSettings, port: 70000 }).success).toBe(false);
    expect(smtpSettingsInputSchema.safeParse({ ...validSettings, mailTo: "yanlis" }).success).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("HTML etiketlerini, attribute işaretlerini ve metakarakterleri kaçırır", () => {
    expect(escapeHtml(`<img src=x onerror='alert(1)'> & \"x\"`)).toBe(
      "&lt;img src=x onerror=&#39;alert(1)&gt; &amp; &quot;x&quot;",
    );
  });
});
