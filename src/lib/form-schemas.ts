import { z } from "zod";

const cleanSingleLine = (value: string) =>
  !/[\r\n\u0000-\u001f\u007f]/.test(value);

const cleanMultiline = (value: string) =>
  !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value);

export const contactSchema = z.object({
  company: z.string().trim().min(2, "Firma adını giriniz.").max(120, "Firma adı en fazla 120 karakter olabilir.").refine(cleanSingleLine, "Tek satır firma adı giriniz."),
  name: z.string().trim().min(3, "Ad soyad giriniz.").max(100, "Ad soyad en fazla 100 karakter olabilir.").refine(cleanSingleLine, "Tek satır ad soyad giriniz."),
  phone: z.string().trim().min(8, "Telefon numarası giriniz.").max(24, "Telefon numarası çok uzun.").regex(/^[0-9+()\s.-]+$/, "Geçerli bir telefon numarası giriniz.").refine((value) => value.replace(/\D/g, "").length >= 10, "Telefon numarası en az 10 rakam içermelidir."),
  email: z.string().trim().email("Geçerli bir e-posta adresi giriniz.").max(254, "E-posta adresi çok uzun.").refine(cleanSingleLine, "Geçerli bir e-posta adresi giriniz."),
  subject: z.string().trim().min(3, "Konu en az 3 karakter olmalıdır.").max(150, "Konu en fazla 150 karakter olabilir.").refine(cleanSingleLine, "Konu tek satır olmalıdır."),
  size: z.enum(["10-30 kişi", "30-100 kişi", "100+ kişi"], { errorMap: () => ({ message: "Kişi sayısı seçiniz." }) }),
  district: z.string().trim().min(2, "İlçe / bölge giriniz.").max(100, "İlçe / bölge en fazla 100 karakter olabilir.").refine(cleanSingleLine, "Tek satır ilçe / bölge giriniz."),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalıdır.").max(5000, "Mesaj en fazla 5000 karakter olabilir.").refine(cleanMultiline, "Mesaj geçersiz kontrol karakterleri içeriyor."),
}).strict();

export type ContactFormData = z.infer<typeof contactSchema>;

export const smtpSettingsInputSchema = z.object({
  host: z.string().trim().min(1, "SMTP sunucu adresini giriniz.").max(253, "SMTP sunucu adresi çok uzun.").refine((value) => !/[\s\r\n<>]/.test(value), "Geçerli bir SMTP sunucu adresi giriniz."),
  port: z.number().int("Port tam sayı olmalıdır.").min(1, "Port 1 ile 65535 arasında olmalıdır.").max(65535, "Port 1 ile 65535 arasında olmalıdır."),
  secure: z.boolean(),
  user: z.string().trim().min(1, "SMTP kullanıcı adını giriniz.").max(254, "SMTP kullanıcı adı çok uzun.").refine(cleanSingleLine, "Geçerli bir SMTP kullanıcı adı giriniz."),
  password: z.string().max(1024, "SMTP parolası çok uzun.").refine(cleanSingleLine, "SMTP parolası geçersiz karakter içeriyor.").optional().default(""),
  mailFrom: z.string().trim().email("Gönderen e-posta adresi geçerli değil.").max(254, "Gönderen e-posta adresi çok uzun.").refine(cleanSingleLine, "Geçerli bir gönderen e-posta adresi giriniz."),
  mailTo: z.string().trim().email("Alıcı e-posta adresi geçerli değil.").max(254, "Alıcı e-posta adresi çok uzun.").refine(cleanSingleLine, "Geçerli bir alıcı e-posta adresi giriniz."),
}).strict();

export type SmtpSettingsInput = z.infer<typeof smtpSettingsInputSchema>;
export type SmtpSettings = Omit<SmtpSettingsInput, "password"> & { password: string };
