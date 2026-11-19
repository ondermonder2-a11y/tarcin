/**
 * Site içeriğinin tek doğruluk kaynağı: tipler, varsayılan veriler ve doğrulama şemaları.
 * Hem sunucu (veritabanı yazma/okuma) hem tarayıcı (admin + ana sayfa) bu modülü kullanır.
 * Asset importu içermez; böylece sunucu tarafında da güvenle import edilebilir.
 */
import { z } from "zod";

export const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"] as const;

export type Day = (typeof DAYS)[number];

export interface DayMenu {
  soup: string;
  main: string;
  side: string;
  extra: string;
  desc: string;
}

export interface MenuCategory {
  id: string;
  title: string;
  icon: string;
  badge?: string | undefined;
  items: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string | undefined;
  comment: string;
  rating: number;
}

export interface AdminProfile {
  fullName: string;
  email: string;
  phone: string;
  phone2: string;
  address: string;
  roleTitle: string;
  businessName: string;
}

export interface FixBrochure {
  title: string;
  badge: string;
  image: string;
}

export interface HeroSlide {
  id: string;
  src: string;
  alt: string;
}

export interface SiteContent {
  fixMenu: Record<Day, DayMenu>;
  brochure: FixBrochure;
  heroSlides: HeroSlide[];
  categories: MenuCategory[];
  testimonials: Testimonial[];
  profile: AdminProfile;
}

export const CONTENT_SECTIONS = [
  "fixMenu",
  "brochure",
  "heroSlides",
  "categories",
  "testimonials",
  "profile",
] as const satisfies readonly (keyof SiteContent)[];

export type ContentSectionKey = (typeof CONTENT_SECTIONS)[number];

export const MAX_IMAGE_URL_LENGTH = 2048;

/**
 * Kontrol karakterleri ve HTML açı/kapı işaretlerini reddeder.
 * Regex yerine kod noktası taraması kullanılır (no-control-regex kuralı ve okunabilirlik).
 */
function hasForbiddenCharacter(
  value: string,
  options: { angleBrackets: boolean; quotes?: boolean; whitespace?: boolean },
): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
    if (options.angleBrackets && (code === 60 || code === 62)) return true;
    if (options.quotes && (code === 34 || code === 39)) return true;
    if (options.whitespace && (code === 32 || code === 9)) return true;
  }
  return false;
}

/** Kontrol karakteri ve HTML enjeksiyonu içermeyen serbest metin. */
const text = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .refine(
      (value) => !hasForbiddenCharacter(value, { angleBrackets: true }),
      "Metin geçersiz karakterler içeriyor.",
    );

/** Sadece site içi yol veya http(s) adresi kabul eden görsel alanı. */
const imageUrl = () =>
  z
    .string()
    .trim()
    .min(1, "Görsel adresi zorunludur.")
    .max(MAX_IMAGE_URL_LENGTH, "Görsel adresi çok uzun.")
    .refine(
      (value) => value.startsWith("/") || /^https?:\/\/\S+$/i.test(value),
      "Görsel adresi / ile başlamalı veya http(s) bağlantısı olmalıdır.",
    )
    .refine(
      (value) =>
        !hasForbiddenCharacter(value, {
          angleBrackets: true,
          quotes: true,
          whitespace: true,
        }),
      "Görsel adresi geçersiz karakterler içeriyor.",
    );

const id = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} kimliği zorunludur.`)
    .max(64, `${label} kimliği çok uzun.`)
    .regex(
      /^[\w.-]+$/i,
      `${label} kimliği yalnızca harf, rakam, nokta, tire ve alt çizgi içerebilir.`,
    );

const identifier = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} kimliği zorunludur.`)
    .max(64, `${label} kimliği çok uzun.`)
    .regex(
      /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/i,
      `${label} kimliği harf/rakam ve tire-alt çizgi olmalıdır.`,
    );

export const dayMenuSchema = z
  .object({
    soup: text(160, "Çorba adı en fazla 160 karakter olabilir."),
    main: text(160, "Ana yemek adı en fazla 160 karakter olabilir."),
    side: text(160, "Yan yemek adı en fazla 160 karakter olabilir."),
    extra: text(200, "Ek ikram en fazla 200 karakter olabilir."),
    desc: text(600, "Açıklama en fazla 600 karakter olabilir."),
  })
  .strict();

export const fixMenuSchema = z
  .object({
    Pazartesi: dayMenuSchema,
    Salı: dayMenuSchema,
    Çarşamba: dayMenuSchema,
    Perşembe: dayMenuSchema,
    Cuma: dayMenuSchema,
    Cumartesi: dayMenuSchema,
  })
  .strict();

export const heroSlideSchema = z
  .object({
    id: id("Slider"),
    src: imageUrl(),
    alt: text(300, "Alternatif metin en fazla 300 karakter olabilir."),
  })
  .strict();

export const heroSlidesSchema = z
  .array(heroSlideSchema)
  .min(1, "En az bir slider görseli gereklidir.")
  .max(12, "En fazla 12 slider görseli olabilir.")
  .superRefine((slides, ctx) => {
    const seen = new Set<string>();
    for (const slide of slides) {
      if (seen.has(slide.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["id"],
          message: "Slider görsel kimlikleri benzersiz olmalıdır.",
        });
        break;
      }
      seen.add(slide.id);
    }
  });

export const menuCategorySchema = z
  .object({
    id: identifier("Kategori"),
    title: text(120, "Kategori başlığı en fazla 120 karakter olabilir."),
    icon: text(16, "Simge en fazla 16 karakter olabilir."),
    badge: text(120, "Rozet en fazla 120 karakter olabilir.").optional(),
    items: z
      .array(text(200, "Yemek adı en fazla 200 karakter olabilir."))
      .max(300, "Kategori en fazla 300 yemek içerebilir."),
  })
  .strict();

export const categoriesSchema = z
  .array(menuCategorySchema)
  .min(1, "En az bir kategori gereklidir.")
  .max(40, "En fazla 40 kategori olabilir.")
  .superRefine((categories, ctx) => {
    const seen = new Set<string>();
    for (const category of categories) {
      if (seen.has(category.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["id"],
          message: "Kategori kimlikleri benzersiz olmalıdır.",
        });
        break;
      }
      seen.add(category.id);
    }
  });

export const testimonialSchema = z
  .object({
    id: id("Yorum"),
    name: text(120, "İsim en fazla 120 karakter olabilir."),
    role: text(120, "Unvan en fazla 120 karakter olabilir."),
    company: text(120, "Firma adı en fazla 120 karakter olabilir.").optional(),
    comment: text(1000, "Yorum en fazla 1000 karakter olabilir."),
    rating: z
      .number()
      .int("Puan tam sayı olmalıdır.")
      .min(1, "Puan en az 1 olmalıdır.")
      .max(5, "Puan en fazla 5 olabilir."),
  })
  .strict();

export const testimonialsSchema = z
  .array(testimonialSchema)
  .min(1, "En az bir müşteri yorumu gereklidir.")
  .max(60, "En fazla 60 müşteri yorumu olabilir.");

export const profileSchema = z
  .object({
    fullName: text(120, "Ad soyad en fazla 120 karakter olabilir."),
    email: z
      .string()
      .trim()
      .max(254, "E-posta adresi çok uzun.")
      .refine(
        (value) => value === "" || /^[^\s<>@"']+@[^\s<>@"'.]+\.[^\s<>@"']+$/.test(value),
        "Geçerli bir e-posta adresi giriniz.",
      ),
    phone: text(40, "Telefon numarası en fazla 40 karakter olabilir."),
    phone2: text(40, "Telefon numarası en fazla 40 karakter olabilir."),
    address: text(300, "Adres en fazla 300 karakter olabilir."),
    roleTitle: text(120, "Unvan en fazla 120 karakter olabilir."),
    businessName: text(160, "İşletme adı en fazla 160 karakter olabilir."),
  })
  .strict();

export const brochureSchema = z
  .object({
    title: text(160, "Broşür başlığı en fazla 160 karakter olabilir."),
    badge: text(40, "Rozet en fazla 40 karakter olabilir."),
    image: imageUrl(),
  })
  .strict();

export const siteContentSchema = z
  .object({
    fixMenu: fixMenuSchema,
    brochure: brochureSchema,
    heroSlides: heroSlidesSchema,
    categories: categoriesSchema,
    testimonials: testimonialsSchema,
    profile: profileSchema,
  })
  .strict();

/** Admin panelinin gönderdiği kısmi güncelleme gövdesi (gönderilmeyen alan korunur). */
export const contentChangesSchema = z
  .object({
    fixMenu: fixMenuSchema,
    brochure: brochureSchema,
    heroSlides: heroSlidesSchema,
    categories: categoriesSchema,
    testimonials: testimonialsSchema,
    profile: profileSchema,
  })
  .partial()
  .strict();

export type ContentChanges = z.infer<typeof contentChangesSchema>;

export function validateSiteContent(value: unknown): SiteContent | null {
  const parsed = siteContentSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export const INITIAL_FIX_MENU: Record<Day, DayMenu> = {
  Pazartesi: {
    soup: "Kremalı Tavuk Çorbası",
    main: "Fırında Köfte",
    side: "Pirinç Pilavı",
    extra: "Yoğurt, Cacık veya Salata",
    desc: "Taptaze kremalı tavuk çorbası, leziz fırında anne köftesi ve tereyağlı tane pirinç pilavı.",
  },
  Salı: {
    soup: "Mercimek Çorbası",
    main: "Etli Kuru Fasulye",
    side: "Pirinç Pilavı",
    extra: "Yoğurt, Cacık veya Salata",
    desc: "Ağır ateşte pişmiş geleneksel etli kuru fasulye ve tereyağlı pirinç pilavı.",
  },
  Çarşamba: {
    soup: "Tarhana Çorbası",
    main: "Taze Fasulye",
    side: "Bulgur Pilavı",
    extra: "Yoğurt, Cacık veya Salata",
    desc: "Ev yapımı şifalı köy tarhana çorbası, zeytinyağlı taze fasulye ve domatesli bulgur pilavı.",
  },
  Perşembe: {
    soup: "Ezogelin Çorbası",
    main: "Tavuk Sote",
    side: "Peynirli Makarna",
    extra: "Yoğurt, Cacık veya Salata",
    desc: "Nefis sebzeli tavuk sote, lezzetli peynirli makarna ve sıcacık ezogelin çorbası.",
  },
  Cuma: {
    soup: "Tutmaç Çorbası",
    main: "Etli Nohut",
    side: "Bulgur Pilavı",
    extra: "Yoğurt, Cacık veya Salata",
    desc: "Geleneksel tutmaç çorbası, lokum kıvamında etli nohut ve dane dane bulgur pilavı.",
  },
  Cumartesi: {
    soup: "Ezogelin Çorbası",
    main: "Taş Kebabı",
    side: "Pirinç Pilavı",
    extra: "Yoğurt, Cacık veya Salata",
    desc: "Özenle marine edilmiş nefis taş kebabı, tereyağlı pirinç pilavı ve ezogelin çorbası.",
  },
};

export const INITIAL_CATEGORIES: MenuCategory[] = [
  {
    id: "corbalar",
    title: "Çorbalar",
    icon: "🥣",
    items: [
      "Kremalı Tavuk Çorbası",
      "Mercimek Çorbası",
      "Ezogelin Çorbası",
      "Yayla Çorbası",
      "Tarhana Çorbası",
      "Tutmaç Çorbası",
      "Tek Şehriye Çorbası",
      "Yüssük Çorbası",
    ],
  },
  {
    id: "etli-tavuklu",
    title: "Etli & Tavuklu Ana Yemekler",
    icon: "🥩",
    items: [
      "Hasan Paşa Köftesi",
      "Tavuklu Sultan Kebabı",
      "Taş Kebabı",
      "Çökertme Kebabı",
      "İzmir Köfte",
      "Dana Güveç",
      "Fırında Köfte",
      "Püreli Rosto Köfte",
      "Arnavut Ciğeri",
      "Fırın Kalçalı But",
      "Piliç Topkapı",
      "Fırın Baget",
      "Tavuk Sote",
      "Tavuk Haşlama",
      "Tavuk Güveç",
      "Sebzeli Köfte",
      "Terbiyeli Köfte",
      "Ekşili Köfte",
    ],
  },
  {
    id: "geleneksel-ev",
    title: "Geleneksel Ev & Sebze Yemekleri",
    icon: "🥘",
    items: [
      "Etli Kuru Fasulye",
      "Etli Nohut",
      "Lahana Dolması",
      "Yaprak Sarması",
      "Patlıcan Musakka",
      "Taze Fasulye",
      "Zeytinyağlı Barbunya",
      "Yeşil Mercimek Yemeği",
      "Bamya Yemeği",
    ],
  },
  {
    id: "diyet-ozel",
    title: "Diyet Menü (Özel)",
    icon: "🥦",
    badge: "Sağlıklı & Fit",
    items: ["Brokoli Sote (Diyet yapan çalışanlar için hafif ve taze alternatif)"],
  },
  {
    id: "pilav-yan",
    title: "Pilav & Yan Lezzetler",
    icon: "🍚",
    items: [
      "Tereyağlı Pirinç Pilavı",
      "Meyhane Bulgur Pilavı",
      "Yoğurtlu Makarna",
      "Peynirli Makarna",
      "Patates Püresi",
      "Tava Yoğurdu",
      "Cacık",
      "Yoğurtlu Semizotu",
    ],
  },
  {
    id: "tatlilar",
    title: "Tatlılar & İkramlar",
    icon: "🍮",
    badge: "Haftada 1 Gün Revani İkramı!",
    items: ["Fırın Sütlaç", "Haşhaşlı Revani"],
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Elif Yıldırım",
    role: "İnsan Kaynakları Yöneticisi",
    company: "Antalya Teknokent",
    comment:
      "Tarçın Ev Yemekleri ile çalıştığımızdan beri ofiste öğle molaları herkesin favorisi oldu. Yemekler her gün sıcak ve tam saatinde geliyor.",
    rating: 5,
  },
  {
    id: "2",
    name: "Murat Kaya",
    role: "İdari İşler Yöneticisi",
    company: "Organize Sanayi Bölgesi",
    comment:
      "120 kişilik ekibimiz için her gün tabldot alıyoruz. Anne eli değmiş lezzeti, hijyen standartları ve personel memnuniyeti beklentimizin çok üzerinde.",
    rating: 5,
  },
  {
    id: "3",
    name: "Selin Demir",
    role: "Ofis Yöneticisi",
    company: "Muratpaşa Plaza",
    comment:
      "Diyet brokoli sote ve vejetaryen seçenekleri sayesinde tüm ekibimize uygun menü bulabiliyoruz. Haftalık revani ikramları ise çalışanlarımızın motivasyonunu artırıyor.",
    rating: 5,
  },
];

export const INITIAL_PROFILE: AdminProfile = {
  fullName: "Soner Ünal",
  email: "Sonerunal32@hotmail.com",
  phone: "0535 418 74 32",
  phone2: "0507 242 32 42",
  address: "Gebizli Mah. Aşık Veysel Cad. 4/A, Muratpaşa / Antalya",
  roleTitle: "İşletme Sahibi / Yönetici",
  businessName: "Tarçın Ev Yemekleri & Catering",
};

/** Broşür görseli zaten public/ altında duruyor (mevcut davranışla aynı). */
export const INITIAL_FIX_BROCHURE: FixBrochure = {
  title: "İş Yerlerine Fix Menü",
  badge: "FİX",
  image: "/is_yerlerine_fix.jpeg",
};

/**
 * Hero slider görselleri public/content/ altında kopyalıdır; veritabanı yalnızca yol
 * stringini saklar. Böylece sunucu ve tarayıcı aynı adresi görür.
 */
export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-1",
    src: "/content/hero-tabldot.jpg",
    alt: "Mercimek çorbası, karnıyarık, şehriyeli pilav ve zeytinyağlı fasulyeden oluşan kurumsal tabldot kutusu",
  },
  {
    id: "hero-2",
    src: "/content/hero-tabldot1.jpeg",
    alt: "Özenle hazırlanmış günlük kurumsal tabldot ev yemeği menüsü",
  },
  {
    id: "hero-3",
    src: "/content/hero-tabldot2.jpeg",
    alt: "Hijyenik ve taze kurumsal catering ve tabldot servisi",
  },
];

export function createDefaultContent(): SiteContent {
  return {
    fixMenu: INITIAL_FIX_MENU,
    brochure: INITIAL_FIX_BROCHURE,
    heroSlides: INITIAL_HERO_SLIDES,
    categories: INITIAL_CATEGORIES,
    testimonials: INITIAL_TESTIMONIALS,
    profile: INITIAL_PROFILE,
  };
}
