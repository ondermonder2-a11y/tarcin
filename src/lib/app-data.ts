import { useState, useEffect } from "react";
import hero1 from "@/assets/hero-tabldot.jpg";
import hero2 from "@/assets/hero-tabldot1.jpeg";
import hero3 from "@/assets/hero-tabldot2.jpeg";

export type Day = "Pazartesi" | "Salı" | "Çarşamba" | "Perşembe" | "Cuma" | "Cumartesi";

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
  badge?: string;
  items: string[];
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
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
    items: [
      "Brokoli Sote (Diyet yapan çalışanlar için hafif ve taze alternatif)",
    ],
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
    items: [
      "Fırın Sütlaç",
      "Haşhaşlı Revani",
    ],
  },
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "Elif Yıldırım",
    role: "İnsan Kaynakları Yöneticisi",
    company: "Antalya Teknokent",
    comment: "Tarçın Ev Yemekleri ile çalıştığımızdan beri ofiste öğle molaları herkesin favorisi oldu. Yemekler her gün sıcak ve tam saatinde geliyor.",
    rating: 5,
  },
  {
    id: "2",
    name: "Murat Kaya",
    role: "İdari İşler Yöneticisi",
    company: "Organize Sanayi Bölgesi",
    comment: "120 kişilik ekibimiz için her gün tabldot alıyoruz. Anne eli değmiş lezzeti, hijyen standartları ve personel memnuniyeti beklentimizin çok üzerinde.",
    rating: 5,
  },
  {
    id: "3",
    name: "Selin Demir",
    role: "Ofis Yöneticisi",
    company: "Muratpaşa Plaza",
    comment: "Diyet brokoli sote ve vejetaryen seçenekleri sayesinde tüm ekibimize uygun menü bulabiliyoruz. Haftalık revani ikramları ise çalışanlarımızın motivasyonunu artırıyor.",
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

export const INITIAL_FIX_BROCHURE: FixBrochure = {
  title: "İş Yerlerine Fix Menü",
  badge: "FİX",
  image: "/is_yerlerine_fix.jpeg",
};

export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-1",
    src: hero1,
    alt: "Mercimek çorbası, karnıyarık, şehriyeli pilav ve zeytinyağlı fasulyeden oluşan kurumsal tabldot kutusu",
  },
  {
    id: "hero-2",
    src: hero2,
    alt: "Özenle hazırlanmış günlük kurumsal tabldot ev yemeği menüsü",
  },
  {
    id: "hero-3",
    src: hero3,
    alt: "Hijyenik ve taze kurumsal catering ve tabldot servisi",
  },
];

const STORAGE_KEYS = {
  FIX_MENU: "tarcin_fix_menu_v1",
  FIX_BROCHURE: "tarcin_fix_brochure_v1",
  HERO_SLIDES: "tarcin_hero_slides_v1",
  CATEGORIES: "tarcin_categories_v1",
  TESTIMONIALS: "tarcin_testimonials_v1",
  PROFILE: "tarcin_profile_v1",
  AUTH: "tarcin_admin_auth_v1",
  PASSWORD: "tarcin_admin_pass_v1",
};

export function getStoredFixMenu(): Record<Day, DayMenu> {
  if (typeof window === "undefined") return INITIAL_FIX_MENU;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FIX_MENU);
    return data ? JSON.parse(data) : INITIAL_FIX_MENU;
  } catch {
    return INITIAL_FIX_MENU;
  }
}

export function saveStoredFixMenu(menu: Record<Day, DayMenu>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.FIX_MENU, JSON.stringify(menu));
  window.dispatchEvent(new Event("tarcin_data_updated"));
}

export function getStoredFixBrochure(): FixBrochure {
  if (typeof window === "undefined") return INITIAL_FIX_BROCHURE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.FIX_BROCHURE);
    return data
      ? { ...INITIAL_FIX_BROCHURE, ...(JSON.parse(data) as Partial<FixBrochure>) }
      : INITIAL_FIX_BROCHURE;
  } catch {
    return INITIAL_FIX_BROCHURE;
  }
}

export function saveStoredFixBrochure(brochure: FixBrochure) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.FIX_BROCHURE, JSON.stringify(brochure));
  window.dispatchEvent(new Event("tarcin_data_updated"));
}

export function getStoredHeroSlides(): HeroSlide[] {
  if (typeof window === "undefined") return INITIAL_HERO_SLIDES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.HERO_SLIDES);
    return data ? JSON.parse(data) : INITIAL_HERO_SLIDES;
  } catch {
    return INITIAL_HERO_SLIDES;
  }
}

export function saveStoredHeroSlides(slides: HeroSlide[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.HERO_SLIDES, JSON.stringify(slides));
  window.dispatchEvent(new Event("tarcin_data_updated"));
}

export function getStoredCategories(): MenuCategory[] {
  if (typeof window === "undefined") return INITIAL_CATEGORIES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : INITIAL_CATEGORIES;
  } catch {
    return INITIAL_CATEGORIES;
  }
}

export function saveStoredCategories(categories: MenuCategory[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  window.dispatchEvent(new Event("tarcin_data_updated"));
}

export function getStoredTestimonials(): Testimonial[] {
  if (typeof window === "undefined") return INITIAL_TESTIMONIALS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
    return data ? JSON.parse(data) : INITIAL_TESTIMONIALS;
  } catch {
    return INITIAL_TESTIMONIALS;
  }
}

export function saveStoredTestimonials(testimonials: Testimonial[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(testimonials));
  window.dispatchEvent(new Event("tarcin_data_updated"));
}

export function getStoredProfile(): AdminProfile {
  if (typeof window === "undefined") return INITIAL_PROFILE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : INITIAL_PROFILE;
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveStoredProfile(profile: AdminProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  window.dispatchEvent(new Event("tarcin_data_updated"));
}

export function resetAllToDefaults() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.FIX_MENU);
  localStorage.removeItem(STORAGE_KEYS.FIX_BROCHURE);
  localStorage.removeItem(STORAGE_KEYS.HERO_SLIDES);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.TESTIMONIALS);
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.PASSWORD);
  window.dispatchEvent(new Event("tarcin_data_updated"));
}

type AdminActionResult = { success: boolean; error?: string };
type AuthResponseBody = { error?: unknown; authenticated?: unknown; message?: unknown };

async function readAuthResponse(response: Response): Promise<AuthResponseBody> {
  try {
    const body: unknown = await response.json();
    return body && typeof body === "object" ? body as AuthResponseBody : {};
  } catch {
    return {};
  }
}

function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("tarcin_admin_auth_updated"));
  }
}

export async function loginAdmin(identifier: string, passwordAttempt: string): Promise<AdminActionResult> {
  if (typeof window === "undefined") return { success: false, error: "Tarayıcı ortamı bulunamadı." };
  try {
    const response = await fetch("/api/admin/session", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: identifier.trim(), password: passwordAttempt }),
    });
    const body = await readAuthResponse(response);
    if (!response.ok) {
      return { success: false, error: typeof body.error === "string" ? body.error : "Giriş başarısız. Bilgilerinizi kontrol edin." };
    }
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.PASSWORD);
    notifyAuthChanged();
    return { success: true };
  } catch {
    return { success: false, error: "Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin." };
  }
}

export async function logoutAdmin(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // The server remains authoritative; a failed request must not be treated as a completed logout.
  }
  localStorage.removeItem(STORAGE_KEYS.AUTH);
  localStorage.removeItem(STORAGE_KEYS.PASSWORD);
  notifyAuthChanged();
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.PASSWORD);

    const refreshSession = async () => {
      try {
        const response = await fetch("/api/admin/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        if (active) setIsAuthenticated(response.ok);
      } catch {
        if (active) setIsAuthenticated(false);
      } finally {
        if (active) setIsAuthLoaded(true);
      }
    };

    const handleUpdate = () => { void refreshSession(); };
    void refreshSession();
    window.addEventListener("tarcin_admin_auth_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      active = false;
      window.removeEventListener("tarcin_admin_auth_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    isAuthenticated,
    isAuthLoaded,
    login: loginAdmin,
    logout: logoutAdmin,
    changePassword: async (currentPassword: string, newPassword: string): Promise<AdminActionResult> => {
      if (newPassword.length < 12) {
        return { success: false, error: "Yeni parola en az 12 karakter olmalıdır." };
      }
      try {
        const response = await fetch("/api/admin/session", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const body = await readAuthResponse(response);
        if (!response.ok) {
          return { success: false, error: typeof body.error === "string" ? body.error : "Parola güncellenemedi." };
        }
        notifyAuthChanged();
        return { success: true };
      } catch {
        return { success: false, error: "Sunucuya ulaşılamadı. Lütfen tekrar deneyin." };
      }
    },
  };
}

export function useAppData() {
  const [fixMenu, setFixMenu] = useState<Record<Day, DayMenu>>(INITIAL_FIX_MENU);
  const [brochure, setBrochure] = useState<FixBrochure>(INITIAL_FIX_BROCHURE);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(INITIAL_HERO_SLIDES);
  const [categories, setCategories] = useState<MenuCategory[]>(INITIAL_CATEGORIES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [profile, setProfile] = useState<AdminProfile>(INITIAL_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  const reloadData = () => {
    setFixMenu(getStoredFixMenu());
    setBrochure(getStoredFixBrochure());
    setHeroSlides(getStoredHeroSlides());
    setCategories(getStoredCategories());
    setTestimonials(getStoredTestimonials());
    setProfile(getStoredProfile());
    setIsLoaded(true);
  };

  useEffect(() => {
    reloadData();
    const handleUpdate = () => reloadData();
    window.addEventListener("tarcin_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("tarcin_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return {
    isLoaded,
    fixMenu,
    brochure,
    heroSlides,
    categories,
    testimonials,
    profile,
    updateFixMenu: saveStoredFixMenu,
    updateBrochure: saveStoredFixBrochure,
    updateHeroSlides: saveStoredHeroSlides,
    updateCategories: saveStoredCategories,
    updateTestimonials: saveStoredTestimonials,
    updateProfile: saveStoredProfile,
    resetToDefaults: resetAllToDefaults,
  };
}
