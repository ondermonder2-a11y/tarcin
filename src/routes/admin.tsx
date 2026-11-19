import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChefHat,
  Save,
  Plus,
  Trash2,
  Edit3,
  Check,
  Star,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  LogOut,
  Calendar,
  MessageSquare,
  Utensils,
  Shield,
  KeyRound,
  CheckCircle2,
  Image as ImageIcon,
  AlertTriangle,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { AdminLogin } from "@/components/AdminLogin";
import { uploadSiteImage } from "@/lib/content/upload";
import {
  useAdminAuth,
  useAppData,
  Day,
  DayMenu,
  MenuCategory,
  Testimonial,
  AdminProfile,
  FixBrochure,
  INITIAL_FIX_BROCHURE,
  HeroSlide,
  INITIAL_HERO_SLIDES,
} from "@/lib/app-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Yönetim Paneli | TARÇIN Ev Yemekleri" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type TabType = "tabldot" | "broşür" | "hero" | "cesitler" | "yorumlar" | "profil" | "smtp";

function AdminPage() {
  const { isAuthenticated, isAuthLoaded, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<TabType>("tabldot");
  const {
    isLoaded,
    isSaving,
    error: dataError,
    fixMenu,
    brochure,
    heroSlides,
    categories,
    testimonials,
    profile,
    updateFixMenu,
    updateBrochure,
    updateHeroSlides,
    updateCategories,
    updateTestimonials,
    updateProfile,
    resetToDefaults,
  } = useAppData();

  const [notification, setNotification] = useState<{ text: string; error: boolean } | null>(null);

  const showNotice = (text: string, isError = false) => {
    setNotification({ text, error: isError });
    setTimeout(() => setNotification(null), 4500);
  };

  // Kayıt sunucudaki veritabanına yazıldıktan sonra bildirir; hata kırmızı gösterilir.
  const saveNotice = (result: { success: boolean; error?: string }, successText: string) => {
    showNotice(
      result.success ? successText : result.error || "Kaydedilemedi. Lütfen tekrar deneyin.",
      !result.success,
    );
  };

  if (!isAuthLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm font-bold text-muted-foreground">Oturum kontrol ediliyor...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin
        title="Yönetici Girişi"
        subtitle="Menü ve site içeriklerini düzenlemek için giriş yapın."
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-primary font-bold">
          <ChefHat className="h-6 w-6 animate-spin" />
          Yönetim Paneli Yükleniyor...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-auto min-h-16 max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img
                src={logoImg}
                alt="Tarçın Logo"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/40 transition group-hover:scale-105"
              />
              <div>
                <span className="block font-black text-base tracking-wide leading-tight text-foreground">
                  TARÇIN
                </span>
                <span className="block text-[11px] font-semibold text-primary">Yönetim Paneli</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isSaving && (
              <span className="hidden items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 text-[11px] font-bold text-primary sm:inline-flex">
                <Save className="h-3.5 w-3.5 animate-pulse" />
                Kaydediliyor…
              </span>
            )}
            <Link
              to="/"
              aria-label="Ana siteyi aç"
              className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Siteyi Gör</span>
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab("profil")}
              className="flex items-center gap-2 rounded-xl bg-accent/60 px-3 py-1.5 text-xs font-bold text-accent-foreground transition hover:bg-accent"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-extrabold text-xs">
                {profile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <span className="hidden sm:inline">{profile.fullName}</span>
            </button>
            <button
              type="button"
              onClick={() => void logout()}
              aria-label="Yönetici oturumunu kapat"
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Notice Toast */}
      {notification && (
        <div
          className={`fixed top-20 right-5 z-50 flex max-w-md items-start gap-2 rounded-xl px-5 py-3 text-sm font-bold shadow-2xl animate-in slide-in-from-top-3 ${
            notification.error
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary text-primary-foreground"
          }`}
        >
          {notification.error ? (
            <AlertTriangle className="h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 flex-1">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("tabldot")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "tabldot"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Günün Tabldot Menüsü</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("cesitler")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "cesitler"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Utensils className="h-4 w-4" />
            <span>Yemek Çeşitlerimiz</span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold">
              {categories.reduce((acc, c) => acc + c.items.length, 0)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("broşür")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "broşür"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Fix Menü Broşürü</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "hero"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Hero Slider</span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold">
              {heroSlides.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("yorumlar")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "yorumlar"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Müşteri Yorumları</span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold">
              {testimonials.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("smtp")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "smtp"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>E-posta / SMTP</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profil")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
              activeTab === "profil"
                ? "bg-primary text-primary-foreground shadow"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profil &amp; İletişim Ayarları</span>
          </button>
        </div>

        {dataError && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs font-bold text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              İçerik veritabanına erişilemiyor: {dataError} — Sayfa yenilenip tekrar deneyin;
              gerekirse sunucudaki SITE_CONTENT_DB_FILE ve /data birimi kontrol edilmeli.
            </span>
          </div>
        )}

        {/* Tab 1: Tabldot Menü Yönetimi */}
        {activeTab === "tabldot" && (
          <TabldotManager
            fixMenu={fixMenu}
            onSave={async (updated) => {
              saveNotice(
                await updateFixMenu(updated),
                "Günün tabldot menüsü veritabanına kaydedildi!",
              );
            }}
          />
        )}

        {activeTab === "broşür" && (
          <BrochureManager
            brochure={brochure}
            onSave={async (updated) => {
              saveNotice(
                await updateBrochure(updated),
                "Fix Menü broşürü veritabanına kaydedildi!",
              );
            }}
          />
        )}

        {activeTab === "hero" && (
          <HeroSliderManager
            slides={heroSlides}
            onSave={async (updated) => {
              saveNotice(
                await updateHeroSlides(updated),
                "Hero slider görselleri veritabanına kaydedildi!",
              );
            }}
          />
        )}

        {/* Tab 2: Yemek Çeşitleri Yönetimi */}
        {activeTab === "cesitler" && (
          <CategoriesManager
            categories={categories}
            onSave={async (updated) => {
              saveNotice(
                await updateCategories(updated),
                "Yemek çeşitleri veritabanına kaydedildi!",
              );
            }}
          />
        )}

        {/* Tab 3: Müşteri Yorumları Yönetimi */}
        {activeTab === "yorumlar" && (
          <TestimonialsManager
            testimonials={testimonials}
            onSave={async (updated) => {
              saveNotice(
                await updateTestimonials(updated),
                "Müşteri yorumları veritabanına kaydedildi!",
              );
            }}
          />
        )}

        {activeTab === "smtp" && <SmtpSettingsManager />}

        {/* Tab 4: Profil Sayfası */}
        {activeTab === "profil" && (
          <ProfileManager
            profile={profile}
            onSave={async (updated) => {
              saveNotice(
                await updateProfile(updated),
                "Profil ve işletme bilgileri veritabanına kaydedildi!",
              );
            }}
            onResetDefaults={async () => {
              if (
                window.confirm(
                  "Tüm site içeriği (menü, katalog, yorumlar, profil) veritabanında varsayılanlara sıfırlanacak. Emin misiniz?",
                )
              ) {
                saveNotice(
                  await resetToDefaults(),
                  "Tüm veriler veritabanında varsayılanlara sıfırlandı!",
                );
              }
            }}
          />
        )}
      </div>

      {/* Admin Footer */}
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        TARÇIN Ev Yemekleri &copy; {new Date().getFullYear()} &bull; Yönetim Portalı
      </footer>
    </div>
  );
}

/* =========================================================================
   1. GÜNÜN TABLDOT MENÜSÜ YÖNETİMİ
   ========================================================================= */
function TabldotManager({
  fixMenu,
  onSave,
}: {
  fixMenu: Record<Day, DayMenu>;
  onSave: (updated: Record<Day, DayMenu>) => void;
}) {
  const days: Day[] = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
  const [selectedDay, setSelectedDay] = useState<Day>("Pazartesi");
  const [menuState, setMenuState] = useState<Record<Day, DayMenu>>(fixMenu);

  const current = menuState[selectedDay];

  const handleChange = (field: keyof DayMenu, value: string) => {
    setMenuState((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [field]: value,
      },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(menuState);
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Günün Tabldot Menüsü Düzenle</h2>
          <p className="text-xs text-muted-foreground">
            Haftalık Fix Tabldot Menüsündeki günleri seçerek 4 çeşit yemeği ve açıklamayı
            düzenleyin.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90 transition"
        >
          <Save className="h-4 w-4" />
          Tüm Günleri Kaydet
        </button>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl bg-card p-2 border border-border shadow-sm">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setSelectedDay(d)}
            className={`flex-1 min-w-[100px] rounded-xl px-4 py-2.5 text-center text-sm font-bold transition ${
              selectedDay === d
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Edit Form & Live Preview Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Form */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-extrabold text-base text-foreground">
              {selectedDay} Günü Menü Detayları
            </span>
            <span className="rounded-full bg-olive/15 px-2.5 py-0.5 text-xs font-bold text-olive">
              4 Çeşit Tabldot
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              1. Çorba
            </label>
            <input
              type="text"
              value={current.soup}
              onChange={(e) => handleChange("soup", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              placeholder="Örn: Kremalı Tavuk Çorbası"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              2. Ana Yemek
            </label>
            <input
              type="text"
              value={current.main}
              onChange={(e) => handleChange("main", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              placeholder="Örn: Fırında Köfte"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              3. Pilav / Makarna / Yardımcı
            </label>
            <input
              type="text"
              value={current.side}
              onChange={(e) => handleChange("side", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              placeholder="Örn: Pirinç Pilavı"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              4. İkram (Standart İkram)
            </label>
            <input
              type="text"
              value={current.extra}
              onChange={(e) => handleChange("extra", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              placeholder="Örn: Yoğurt, Cacık veya Salata"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Menü Açıklaması / Not
            </label>
            <textarea
              rows={3}
              value={current.desc}
              onChange={(e) => handleChange("desc", e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
              placeholder="Menüye dair lezzet açıklaması..."
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-primary py-3 font-bold text-sm text-primary-foreground shadow hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {selectedDay} Menüsünü Kaydet
          </button>
        </form>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-extrabold text-sm text-primary">Sitedeki Canlı Görünüm</span>
            <span className="text-xs text-muted-foreground">Önizleme</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-muted/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black">{selectedDay} Menüsü</span>
              <span className="rounded-md bg-olive/15 px-2 py-0.5 text-xs font-bold text-olive">
                ✓ 4 Çeşit Tabldot
              </span>
            </div>

            <div className="space-y-2 text-sm font-bold">
              <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-2xs">
                <span className="text-base">🥣</span>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold">
                    1. Çorba
                  </span>
                  <span>{current.soup || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-2xs">
                <span className="text-base">🥘</span>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold">
                    2. Ana Yemek
                  </span>
                  <span>{current.main || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-card p-3 shadow-2xs">
                <span className="text-base">🍚</span>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold">
                    3. Pilav / Makarna
                  </span>
                  <span>{current.side || "—"}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-olive/10 border border-olive/20 p-3 shadow-2xs text-olive-foreground">
                <span className="text-base">🥗</span>
                <div>
                  <span className="block text-[10px] text-olive uppercase font-bold">4. İkram</span>
                  <span className="font-extrabold">{current.extra || "—"}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">{current.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BrochureManager({
  brochure,
  onSave,
}: {
  brochure: FixBrochure;
  onSave: (updated: FixBrochure) => void;
}) {
  const [form, setForm] = useState<FixBrochure>(brochure);
  const [uploadState, setUploadState] = useState<{ busy: boolean; error: string | null }>({
    busy: false,
    error: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadState({ busy: true, error: null });
    void uploadSiteImage(file)
      .then((result) => {
        if (!result.ok) {
          setUploadState({ busy: false, error: result.error });
          return;
        }
        // Sunucudaki dosya adresi veritabanına yazılır; tarayıcıda base64 tutulmaz.
        setForm((previous) => ({ ...previous, image: result.url }));
        setUploadState({ busy: false, error: null });
      })
      .catch(() => setUploadState({ busy: false, error: "Görsel yüklenemedi." }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, title: form.title.trim(), badge: form.badge.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid min-w-0 gap-6 lg:grid-cols-2">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="border-b border-border pb-3">
          <h2 className="text-xl font-extrabold tracking-tight">İş Yerlerine Fix Menü Broşürü</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sitedeki broşür kartının başlığını, rozetini ve görselini düzenleyin. Görsel en fazla 2
            MB olabilir.
          </p>
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            Broşür Başlığı
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((previous) => ({ ...previous, title: e.target.value }))}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">Rozet Yazısı</label>
          <input
            type="text"
            value={form.badge}
            onChange={(e) => setForm((previous) => ({ ...previous, badge: e.target.value }))}
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold text-muted-foreground">
            Yeni Broşür Görseli
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="block w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-primary"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            JPG, PNG veya WebP • en fazla 4 MB • görsel sunucuya kaydedilir
          </p>
          {uploadState.busy && (
            <p className="mt-1 text-[11px] font-bold text-primary">Görsel sunucuya yükleniyor…</p>
          )}
          {uploadState.error && (
            <p className="mt-1 text-[11px] font-bold text-destructive">{uploadState.error}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={uploadState.busy}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90"
          >
            <Save className="h-4 w-4" /> Broşürü Kaydet
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(INITIAL_FIX_BROCHURE);
              onSave(INITIAL_FIX_BROCHURE);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" /> Varsayılana Dön
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <p className="mb-3 text-sm font-extrabold text-primary">Canlı Önizleme</p>
        <div className="mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-warm)]">
          <div className="flex items-center justify-between gap-3">
            <h3 className="min-w-0 break-words text-lg font-bold">
              {form.title || "Broşür Başlığı"}
            </h3>
            <span className="shrink-0 rounded-md bg-espresso px-2.5 py-1 text-xs font-bold text-espresso-foreground">
              {form.badge || "FİX"}
            </span>
          </div>
          <div className="mt-4 aspect-[3/4] overflow-hidden rounded-xl border border-border bg-muted">
            <img src={form.image} alt={form.title} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </form>
  );
}

/* =========================================================================
   2. YEMEK ÇEŞİTLERİMİZ YÖNETİMİ
   ========================================================================= */
function HeroSliderManager({
  slides,
  onSave,
}: {
  slides: HeroSlide[];
  onSave: (updated: HeroSlide[]) => void;
}) {
  const [list, setList] = useState<HeroSlide[]>(slides);
  const [uploading, setUploading] = useState(false);

  const applyUploaded = (file: File, onUrl: (url: string) => void) => {
    setUploading(true);
    void uploadSiteImage(file)
      .then((result) => {
        if (!result.ok) {
          window.alert(result.error);
          return;
        }
        onUrl(result.url);
      })
      .finally(() => setUploading(false));
  };

  const updateImage = (index: number, file: File | undefined) => {
    if (!file) return;
    applyUploaded(file, (src) => {
      setList((previous) =>
        previous.map((slide, slideIndex) => (slideIndex === index ? { ...slide, src } : slide)),
      );
    });
  };

  const addImage = (file: File | undefined) => {
    if (!file) return;
    applyUploaded(file, (src) => {
      setList((previous) => [
        ...previous,
        {
          id: `hero-${Date.now()}`,
          src,
          alt: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
        },
      ]);
    });
  };

  const updateAlt = (index: number, alt: string) => {
    setList((previous) =>
      previous.map((slide, slideIndex) => (slideIndex === index ? { ...slide, alt } : slide)),
    );
  };

  const removeSlide = (index: number) => {
    if (list.length === 1) {
      window.alert("Sliderda en az bir görsel bulunmalıdır.");
      return;
    }
    setList((previous) => previous.filter((_, slideIndex) => slideIndex !== index));
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    setList((previous) => {
      const next = [...previous];
      const current = next[index];
      const target = next[targetIndex];
      if (!current || !target) return next;
      next[index] = target;
      next[targetIndex] = current;
      return next;
    });
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Hero Slider Görselleri</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ana sayfanın üst slider görsellerini ekleyin, alt metinlerini düzenleyin ve sıralarını
            değiştirin.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Yeni Görsel Ekle
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              addImage(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {list.map((slide, index) => (
          <article
            key={slide.id}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img src={slide.src} alt={slide.alt} className="h-full w-full object-cover" />
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  Görsel {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveSlide(index, -1)}
                    disabled={index === 0}
                    className="rounded-lg border border-input px-2 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Yukarı
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSlide(index, 1)}
                    disabled={index === list.length - 1}
                    className="rounded-lg border border-input px-2 py-1 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Aşağı
                  </button>
                </div>
              </div>
              <label className="block text-xs font-bold text-muted-foreground">
                Alternatif metin
                <input
                  type="text"
                  value={slide.alt}
                  onChange={(event) => updateAlt(index, event.target.value)}
                  className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-medium"
                  placeholder="Görseli açıklayan kısa metin"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold hover:border-primary hover:text-primary">
                  Görseli Değiştir
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      updateImage(index, event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="inline-flex items-center gap-1 rounded-xl border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Sil
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onSave(list)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow hover:bg-primary/90"
        >
          <Save className="h-4 w-4" /> Değişiklikleri Kaydet
        </button>
        <button
          type="button"
          onClick={() => {
            setList(INITIAL_HERO_SLIDES);
            onSave(INITIAL_HERO_SLIDES);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" /> Varsayılanlara Dön
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        JPG, PNG veya WebP • her görsel en fazla 4 MB • yüklenen görseller sunucuda saklanır.
        {uploading ? " Görsel yükleniyor…" : ""}
      </p>
    </div>
  );
}

function CategoriesManager({
  categories,
  onSave,
}: {
  categories: MenuCategory[];
  onSave: (updated: MenuCategory[]) => void;
}) {
  const [list, setList] = useState<MenuCategory[]>(categories);
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || "");
  const [newDishName, setNewDishName] = useState("");
  const [editingDishIndex, setEditingDishIndex] = useState<number | null>(null);
  const [editingDishName, setEditingDishName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("🍲");

  const currentCat = list.find((c) => c.id === selectedCatId) || list[0];

  const handleAddDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName.trim() || !currentCat) return;

    const updated = list.map((c) => {
      if (c.id === currentCat.id) {
        return {
          ...c,
          items: [...c.items, newDishName.trim()],
        };
      }
      return c;
    });

    setList(updated);
    onSave(updated);
    setNewDishName("");
  };

  const startEditDish = (index: number, dish: string) => {
    setEditingDishIndex(index);
    setEditingDishName(dish);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCat || editingDishIndex === null || !editingDishName.trim()) return;
    const updated = list.map((category) =>
      category.id === currentCat.id
        ? {
            ...category,
            items: category.items.map((dish, index) =>
              index === editingDishIndex ? editingDishName.trim() : dish,
            ),
          }
        : category,
    );
    setList(updated);
    onSave(updated);
    setEditingDishIndex(null);
    setEditingDishName("");
  };

  const handleDeleteDish = (indexToRemove: number) => {
    if (!currentCat) return;
    const updated = list.map((c) => {
      if (c.id === currentCat.id) {
        return {
          ...c,
          items: c.items.filter((_, idx) => idx !== indexToRemove),
        };
      }
      return c;
    });
    setList(updated);
    onSave(updated);
    if (editingDishIndex === indexToRemove) {
      setEditingDishIndex(null);
      setEditingDishName("");
    } else if (editingDishIndex !== null && indexToRemove < editingDishIndex) {
      setEditingDishIndex(editingDishIndex - 1);
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryTitle.trim()) return;

    const newCat: MenuCategory = {
      id: "cat_" + Date.now(),
      title: newCategoryTitle.trim(),
      icon: newCategoryIcon.trim() || "🍲",
      items: [],
    };

    const updated = [...list, newCat];
    setList(updated);
    onSave(updated);
    setSelectedCatId(newCat.id);
    setNewCategoryTitle("");
    setIsAddingCategory(false);
  };

  const handleDeleteCategory = (catId: string) => {
    if (list.length <= 1) {
      alert("En az bir kategori kalmalıdır.");
      return;
    }
    if (confirm("Bu kategoriyi ve içindeki tüm yemekleri silmek istediğinize emin misiniz?")) {
      const updated = list.filter((c) => c.id !== catId);
      setList(updated);
      onSave(updated);
      setSelectedCatId(updated[0]?.id || "");
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Yemek Çeşitlerimiz Yönetimi</h2>
          <p className="text-xs text-muted-foreground">
            Kategorilere yeni yemek ekleyin, silin veya yeni kategoriler oluşturun.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingCategory(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Yeni Kategori Ekle
        </button>
      </div>

      {/* New Category Modal/Box */}
      {isAddingCategory && (
        <form
          onSubmit={handleAddCategory}
          className="rounded-2xl border border-primary/30 bg-card p-5 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="font-bold text-sm">Yeni Menü Kategorisi Ekle</span>
            <button
              type="button"
              onClick={() => setIsAddingCategory(false)}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              İptal
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Simge (Emoji)
              </label>
              <input
                type="text"
                value={newCategoryIcon}
                onChange={(e) => setNewCategoryIcon(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-center font-bold"
                placeholder="🍲"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Kategori Başlığı
              </label>
              <input
                type="text"
                value={newCategoryTitle}
                onChange={(e) => setNewCategoryTitle(e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold"
                placeholder="Örn: Balık ve Deniz Ürünleri"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground"
          >
            Kategoriyi Oluştur
          </button>
        </form>
      )}

      {/* Categories Horizontal Tabs */}
      <div className="flex gap-2 overflow-x-auto rounded-2xl bg-card p-2 border border-border shadow-sm">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setSelectedCatId(c.id);
              setEditingDishIndex(null);
              setEditingDishName("");
            }}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              currentCat?.id === c.id
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.title}</span>
            <span className="rounded-full bg-black/10 dark:bg-white/10 px-1.5 py-0.5 text-[10px]">
              {c.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Selected Category Content */}
      {currentCat && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentCat.icon}</span>
              <div>
                <h3 className="text-xl font-extrabold">{currentCat.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Toplam {currentCat.items.length} çeşit yemek kayıtlı
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDeleteCategory(currentCat.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Kategoriyi Sil
            </button>
          </div>

          {/* Add New Dish Input */}
          <form onSubmit={handleAddDish} className="flex gap-2">
            <input
              type="text"
              value={newDishName}
              onChange={(e) => setNewDishName(e.target.value)}
              placeholder={`${currentCat.title} kategorisine yeni yemek adı yazın...`}
              className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <Plus className="h-4 w-4" />
              Yemek Ekle
            </button>
          </form>

          {/* Dishes List */}
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {currentCat.items.map((dish, idx) => (
              <div
                key={idx}
                className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-semibold transition hover:bg-card hover:border-primary/40 hover:shadow-2xs"
              >
                {editingDishIndex === idx ? (
                  <form
                    onSubmit={handleSaveDish}
                    className="flex min-w-0 flex-1 items-center gap-2"
                  >
                    <input
                      type="text"
                      value={editingDishName}
                      onChange={(e) => setEditingDishName(e.target.value)}
                      aria-label="Yemek adını düzenle"
                      className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
                      required
                      autoFocus
                    />
                    <button
                      type="submit"
                      aria-label="Yemeği kaydet"
                      title="Kaydet"
                      className="shrink-0 text-primary transition hover:scale-110"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingDishIndex(null);
                        setEditingDishName("");
                      }}
                      aria-label="Düzenlemeyi iptal et"
                      title="İptal"
                      className="shrink-0 text-xs text-muted-foreground transition hover:text-foreground"
                    >
                      İptal
                    </button>
                  </form>
                ) : (
                  <>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                      <span className="truncate">{dish}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEditDish(idx, dish)}
                        aria-label={`${dish} yemeğini düzenle`}
                        title="Düzenle"
                        className="text-muted-foreground transition hover:text-primary"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDish(idx)}
                        aria-label={`${dish} yemeğini sil`}
                        title="Sil"
                        className="text-muted-foreground transition hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {currentCat.items.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground italic">
              Bu kategoride henüz yemek bulunmuyor. Yukarıdaki alandan ilk yemeği ekleyebilirsiniz.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   3. MÜŞTERİ YORUMLARI YÖNETİMİ
   ========================================================================= */
function TestimonialsManager({
  testimonials,
  onSave,
}: {
  testimonials: Testimonial[];
  onSave: (updated: Testimonial[]) => void;
}) {
  const [list, setList] = useState<Testimonial[]>(testimonials);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setName(t.name);
    setRole(t.role);
    setCompany(t.company || "");
    setComment(t.comment);
    setRating(t.rating || 5);
    setIsAdding(false);
  };

  const startAdd = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setCompany("");
    setComment("");
    setRating(5);
    setIsAdding(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    let updated: Testimonial[];

    if (editingId) {
      updated = list.map((t) =>
        t.id === editingId ? { ...t, name, role, company, comment, rating } : t,
      );
    } else {
      const newReview: Testimonial = {
        id: "t_" + Date.now(),
        name: name.trim(),
        role: role.trim() || "Kurumsal Müşteri",
        company: company.trim() || "Şirket",
        comment: comment.trim(),
        rating,
      };
      updated = [newReview, ...list];
    }

    setList(updated);
    onSave(updated);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu müşteri yorumunu silmek istediğinize emin misiniz?")) {
      const updated = list.filter((t) => t.id !== id);
      setList(updated);
      onSave(updated);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            Öğle Molalarına Lezzet Katan Yorumlar
          </h2>
          <p className="text-xs text-muted-foreground">
            Web sitesinde yer alan kurumsal referans ve müşteri değerlendirmelerini yönetin.
          </p>
        </div>

        <button
          type="button"
          onClick={startAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition"
        >
          <Plus className="h-4 w-4" />
          Yeni Yorum Ekle
        </button>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <form
          onSubmit={handleSave}
          className="rounded-2xl border border-primary/30 bg-card p-6 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-extrabold text-sm text-foreground">
              {editingId ? "Yorumu Düzenle" : "Yeni Müşteri Yorumu Ekle"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Vazgeç
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Müşteri Adı Soyadı
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Ayşe Yılmaz"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Görevi / Pozisyonu
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Örn: İnsan Kaynakları Müdürü"
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Firma / Kurum Adı
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Örn: Maslak Teknoloji A.Ş."
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Puan</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-xl transition ${
                    star <= rating ? "text-amber-500 scale-110" : "text-muted-foreground/40"
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs font-bold ml-2 text-muted-foreground">
                {rating} / 5 Yıldız
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">
              Yorum Metni
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Yemekler, servis ve lezzet hakkındaki samimi değerlendirme..."
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <Save className="h-4 w-4" />
              {editingId ? "Değişiklikleri Kaydet" : "Yorumu Yayınla"}
            </button>
          </div>
        </form>
      )}

      {/* Testimonials List Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <div
            key={t.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating || 5 }).map((_, i) => (
                    <span key={i} className="text-sm">
                      ★
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    className="text-muted-foreground hover:text-primary transition p-1"
                    title="Düzenle"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    className="text-muted-foreground hover:text-destructive transition p-1"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-foreground/90 italic">
                "{t.comment}"
              </p>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-extrabold text-xs text-primary">
                {t.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t.role} {t.company ? `• ${t.company}` : ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================================
   4. PROFİL SAYFASI & İŞLETME AYARLARI
   ========================================================================= */
function ProfileManager({
  profile,
  onSave,
  onResetDefaults,
}: {
  profile: AdminProfile;
  onSave: (updated: AdminProfile) => void;
  onResetDefaults: () => void;
}) {
  const [form, setForm] = useState<AdminProfile>(profile);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passNotice, setPassNotice] = useState<string | null>(null);
  const { changePassword } = useAdminAuth();

  const handleChange = (field: keyof AdminProfile, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 12) {
      setPassNotice("Yeni parola en az 12 karakter olmalıdır.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassNotice("Yeni parolalar birbiriyle eşleşmiyor.");
      return;
    }
    const result = await changePassword(currentPass, newPass);
    if (!result.success) {
      setPassNotice(result.error || "Parola güncellenemedi.");
      return;
    }
    setPassNotice("Parolanız başarıyla güncellendi.");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  return (
    <div className="mt-6 space-y-8">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">
          Yönetici Profili &amp; İşletme Bilgileri
        </h2>
        <p className="text-xs text-muted-foreground">
          Hesap bilgilerinizi, şifrenizi ve sitede görünen işletme adres/iletişim bilgilerini
          buradan güncelleyin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Profile Card & Info */}
        <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20 text-3xl font-black text-primary">
            {form.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <h3 className="mt-4 text-lg font-extrabold">{form.fullName}</h3>
          <p className="text-xs font-semibold text-primary">{form.roleTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{form.businessName}</p>

          <div className="mt-6 border-t border-border pt-4 text-left space-y-3 text-xs">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              <span className="truncate">{form.email}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary shrink-0" />
              <span>{form.phone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span className="leading-tight">{form.address}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Varsayılan Verileri Sıfırla
            </button>
          </div>
        </div>

        {/* Profile Edit Forms */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Information Form */}
          <form
            onSubmit={handleProfileSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-extrabold text-sm">İletişim &amp; İşletme Bilgileri</span>
              <span className="text-xs text-muted-foreground">Sitede yayınlanır</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Göreviniz / Unvan
                </label>
                <input
                  type="text"
                  value={form.roleTitle}
                  onChange={(e) => handleChange("roleTitle", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  E-Posta Adresi
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  İşletme Adı
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  1. Telefon (WhatsApp)
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  2. Telefon
                </label>
                <input
                  type="text"
                  value={form.phone2}
                  onChange={(e) => handleChange("phone2", e.target.value)}
                  className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                İşletme Adresi
              </label>
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <Save className="h-4 w-4" />
              Bilgileri Güncelle
            </button>
          </form>

          {/* Password Change Form */}
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="font-extrabold text-sm flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" />
                Güvenlik &amp; Şifre Değiştir
              </span>
            </div>

            {passNotice && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs font-bold text-primary">
                {passNotice}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="En az 12 karakter"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="Tekrar yazın"
                  className="w-full rounded-xl border border-input bg-background px-4 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-5 py-2.5 text-xs font-bold hover:border-primary hover:text-primary transition"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Şifreyi Değiştir
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

interface SmtpAdminForm {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  password: string;
  mailFrom: string;
  mailTo: string;
  hasPassword: boolean;
  configured: boolean;
}

const EMPTY_SMTP_FORM: SmtpAdminForm = {
  host: "",
  port: "587",
  secure: false,
  user: "",
  password: "",
  mailFrom: "",
  mailTo: "",
  hasPassword: false,
  configured: false,
};

function SmtpSettingsManager() {
  const [form, setForm] = useState<SmtpAdminForm>(EMPTY_SMTP_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch("/api/admin/smtp", {
          credentials: "same-origin",
          cache: "no-store",
        });
        const body = (await response.json().catch(() => null)) as {
          settings?: Partial<SmtpAdminForm>;
          error?: string;
        } | null;
        if (!active) return;
        if (body?.settings) {
          setForm({
            ...EMPTY_SMTP_FORM,
            ...body.settings,
            port: String(body.settings.port ?? 587),
            password: "",
            hasPassword: Boolean(body.settings.hasPassword),
            configured: Boolean(body.settings.configured),
          });
        } else if (!response.ok) {
          setNotice({ text: body?.error || "SMTP ayarları yüklenemedi.", error: true });
        }
      } catch {
        if (active)
          setNotice({ text: "Sunucuya ulaşılamadı. SMTP panelini yeniden yükleyin.", error: true });
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const updateField = <K extends keyof SmtpAdminForm>(key: K, value: SmtpAdminForm[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setFieldErrors((previous) => ({ ...previous, [key]: "" }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);
    setFieldErrors({});
    try {
      const response = await fetch("/api/admin/smtp", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: form.host,
          port: Number(form.port),
          secure: form.secure,
          user: form.user,
          password: form.password,
          mailFrom: form.mailFrom,
          mailTo: form.mailTo,
        }),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
        fieldErrors?: Record<string, string>;
        settings?: Partial<SmtpAdminForm>;
      } | null;
      if (!response.ok) {
        setFieldErrors(body?.fieldErrors ?? {});
        setNotice({ text: body?.error || "SMTP ayarları kaydedilemedi.", error: true });
        return;
      }
      setForm((previous) => ({
        ...previous,
        ...body?.settings,
        port: String(body?.settings?.port ?? previous.port),
        password: "",
        hasPassword: true,
        configured: true,
      }));
      setNotice({ text: body?.message || "SMTP ayarları kaydedildi.", error: false });
    } catch {
      setNotice({ text: "Sunucuya ulaşılamadı. Ayarlar kaydedilemedi.", error: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setNotice(null);
    try {
      const response = await fetch("/api/admin/smtp", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const body = (await response.json().catch(() => null)) as {
        error?: string;
        message?: string;
      } | null;
      setNotice({
        text: response.ok
          ? body?.message || "Test e-postası gönderildi."
          : body?.error || "Test e-postası gönderilemedi.",
        error: !response.ok,
      });
    } catch {
      setNotice({ text: "Sunucuya ulaşılamadı. Test e-postası gönderilemedi.", error: true });
    } finally {
      setIsTesting(false);
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";

  return (
    <section className="mt-6 space-y-6">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight">SMTP E-posta Ayarları</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          İletişim formu postaları ve bağlantı testi bu SMTP hesabını kullanır. Parola
          kaydedildikten sonra tekrar görüntülenemez.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${notice.error ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/20 bg-primary/10 text-primary"}`}
        >
          {notice.text}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
      >
        {isLoading && <p className="text-sm text-muted-foreground">SMTP ayarları yükleniyor...</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-muted-foreground">
            SMTP sunucusu
            <input
              value={form.host}
              onChange={(event) => updateField("host", event.target.value)}
              className={inputClass}
              placeholder="smtp.ornek.com"
              maxLength={253}
              autoComplete="off"
              required
            />
            {fieldErrors["host"] && (
              <span className="mt-1 block text-xs text-destructive">{fieldErrors["host"]}</span>
            )}
          </label>
          <label className="block text-xs font-bold text-muted-foreground">
            Port
            <input
              type="number"
              min={1}
              max={65535}
              step={1}
              value={form.port}
              onChange={(event) => updateField("port", event.target.value)}
              className={inputClass}
              placeholder="587"
              required
            />
            {fieldErrors["port"] && (
              <span className="mt-1 block text-xs text-destructive">{fieldErrors["port"]}</span>
            )}
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm">
          <input
            type="checkbox"
            checked={form.secure}
            onChange={(event) => updateField("secure", event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-primary"
          />
          <span>
            <strong>SSL/TLS bağlantısı</strong>
            <span className="mt-1 block text-xs text-muted-foreground">
              Genellikle 465 portunda açık; 587 portunda kapalı seçilir ve STARTTLS zorunlu tutulur.
            </span>
          </span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-muted-foreground">
            SMTP kullanıcı adı
            <input
              value={form.user}
              onChange={(event) => updateField("user", event.target.value)}
              className={inputClass}
              maxLength={254}
              autoComplete="username"
              required
            />
            {fieldErrors["user"] && (
              <span className="mt-1 block text-xs text-destructive">{fieldErrors["user"]}</span>
            )}
          </label>
          <label className="block text-xs font-bold text-muted-foreground">
            SMTP parolası
            <input
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className={inputClass}
              autoComplete="new-password"
              maxLength={1024}
              placeholder={
                form.hasPassword
                  ? "Kayıtlı parola korunuyor; değiştirmek için yeni parola girin"
                  : "İlk kurulumda zorunludur"
              }
            />
            <span className="mt-1 block text-[11px] font-normal text-muted-foreground">
              {form.hasPassword
                ? "Parola sunucuda şifreli saklanır; boş bırakırsanız mevcut parola korunur."
                : "Parola boşluk dahil aynen saklanır, istemciye geri verilmez."}
            </span>
            {fieldErrors["password"] && (
              <span className="mt-1 block text-xs text-destructive">{fieldErrors["password"]}</span>
            )}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-xs font-bold text-muted-foreground">
            Gönderen e-posta (MAIL_FROM)
            <input
              type="email"
              value={form.mailFrom}
              onChange={(event) => updateField("mailFrom", event.target.value)}
              className={inputClass}
              maxLength={254}
              autoComplete="email"
              required
            />
            {fieldErrors["mailFrom"] && (
              <span className="mt-1 block text-xs text-destructive">{fieldErrors["mailFrom"]}</span>
            )}
          </label>
          <label className="block text-xs font-bold text-muted-foreground">
            Alıcı e-posta (MAIL_TO)
            <input
              type="email"
              value={form.mailTo}
              onChange={(event) => updateField("mailTo", event.target.value)}
              className={inputClass}
              maxLength={254}
              autoComplete="email"
              required
            />
            {fieldErrors["mailTo"] && (
              <span className="mt-1 block text-xs text-destructive">{fieldErrors["mailTo"]}</span>
            )}
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Kaydediliyor..." : "SMTP Ayarlarını Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => void handleTest()}
            disabled={isTesting || isSaving || !form.configured}
            className="inline-flex items-center gap-2 rounded-xl border border-input bg-card px-5 py-3 text-sm font-bold transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Mail className="h-4 w-4" />
            {isTesting ? "Test gönderiliyor..." : "Test E-postası Gönder"}
          </button>
          {!form.configured && (
            <span className="text-xs text-muted-foreground">Test için önce ayarları kaydedin.</span>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-xs leading-relaxed text-muted-foreground">
        Güvenlik: SMTP parolası sunucuda AES-256-GCM ile şifrelenir. Sunucu kurulumu için şifreleme
        anahtarı gerekir; anahtarı ve kalıcı <code>/data</code> birimini birlikte güvenli
        yedekleyin. Doğrudan SMTP gönderimi mevcut Cloudflare Worker hedefinde çalışmaz; uygulama
        Node.js sunucusunda çalıştırılmalıdır.
      </div>
    </section>
  );
}
