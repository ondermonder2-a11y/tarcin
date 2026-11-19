import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChefHat, Leaf, FlaskConical, Truck, Users, Check, Flame, AlertTriangle,
  Package, Building2, PartyPopper, Snowflake, ShieldCheck, HeartPulse, Scale,
  Quote, Phone, Mail, MapPin, MessageCircle, Menu, X, ArrowRight, ArrowUp,
  Instagram, ExternalLink,
  Home, Utensils,
  ChevronLeft, ChevronRight, FileText, Sparkles, Eye, Download,
  Soup, Beef, CookingPot, Salad, Wheat, CakeSlice, Settings,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import logoImg from "@/assets/logo.jpg";
import { useAppData, type HeroSlide } from "@/lib/app-data";
import { contactSchema } from "@/lib/form-schemas";
import {
  HOME_DESCRIPTION,
  HOME_KEYWORDS,
  HOME_TITLE,
  HOME_URL,
  LOCAL_BUSINESS_SCHEMA,
  SOCIAL_IMAGE_URL,
} from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: HOME_TITLE },
      { name: "description", content: HOME_DESCRIPTION },
      { name: "keywords", content: HOME_KEYWORDS },
      { property: "og:title", content: HOME_TITLE },
      { property: "og:description", content: HOME_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "TARÇIN Ev Yemekleri" },
      { property: "og:locale", content: "tr_TR" },
      { property: "og:url", content: HOME_URL },
      { property: "og:image", content: SOCIAL_IMAGE_URL },
      { property: "og:image:alt", content: "TARÇIN Ev Yemekleri logosu" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: HOME_TITLE },
      { name: "twitter:description", content: HOME_DESCRIPTION },
      { name: "twitter:image", content: SOCIAL_IMAGE_URL },
    ],
    links: [{ rel: "canonical", href: HOME_URL }],
  }),
  component: Index,
});

const NAV = [
  ["Hizmetlerimiz", "#hizmetler"],
  ["Haftalık Menü", "#menu"],
  ["Lezzet Kataloğu", "#lezzet-katalogu"],
  ["Hijyen & Kalite", "#hijyen"],
  ["Referanslar", "#referanslar"],
  ["İletişim", "#iletisim"],
] as const;

const WHATSAPP = "https://wa.me/905354187432?text=" + encodeURIComponent("Merhaba, kurumsal yemek hizmetiniz hakkında bilgi almak istiyorum.");

const MOBILE_NAV_ITEMS = [
  { id: "top", label: "Ana Sayfa", href: "#top", icon: Home },
  { id: "menu", label: "Menü", href: "#menu", icon: Utensils },
  { id: "contact", label: "İletişim", href: "tel:+905354187432", icon: Phone },
] as const;

const MOBILE_HEADER_NAV = [["Haftalık Menü", "#menu"]] as const;

const ONLINE_ORDER_LINKS = [
  { label: "Yemeksepeti", href: "https://www.yemeksepeti.com/" },
  { label: "Trendyol Yemek", href: "https://www.trendyol.com/yemek" },
  { label: "GetirYemek", href: "https://getir.com/yemek/" },
  { label: "Migros Yemek", href: "https://www.migros.com.tr/yemek" },
] as const;

function Index() {
  const { heroSlides } = useAppData();

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
      />
      <Navbar />
      <main id="top" className="homepage-main">
        <Hero slides={heroSlides} />
        <WhyUs />
        <WeeklyMenu />
        <Services />
        <Hygiene />
        <References />
        <LeadForm />
      </main>
      <Footer />
      <a
        href={WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp ile hızlı iletişim"
        className="mobile-whatsapp-contact fixed right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-primary-foreground shadow-[var(--shadow-warm)] transition-transform hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
      </a>
      <ScrollToTopButton />
      <MobileBottomNavigation />
    </div>
  );
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > 300);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Sayfanın en üstüne çık"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`scroll-to-top fixed right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-primary/20 bg-card text-primary shadow-[var(--shadow-warm)] transition-all duration-300 hover:-translate-y-1 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

function MobileBottomNavigation() {
  const [activeSection, setActiveSection] = useState("top");

  useEffect(() => {
    const sections = MOBILE_NAV_ITEMS
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-25% 0px -55%", threshold: [0.1, 0.25, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobil site navigasyonu">
      <div className="mobile-bottom-nav__inner">
        {MOBILE_NAV_ITEMS.map(({ id, label, href, icon: Icon }) => (
          <a
            key={id}
            href={href}
            aria-current={activeSection === id ? "page" : undefined}
            className={`mobile-bottom-nav__item ${activeSection === id ? "is-active" : ""}`}
            onClick={() => setActiveSection(id)}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
            <span>{label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

function Logo({ light = false }: { light?: boolean }) {
  return (
    <a href="#" className="flex items-center gap-3 group">
      <img
        src={logoImg}
        alt="TARÇIN Ev Yemekleri Logo"
        width={44}
        height={44}
        className="h-11 w-11 rounded-full object-cover shadow-sm ring-2 ring-primary/40 transition-transform group-hover:scale-105"
      />
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold tracking-wide ${light ? "text-espresso-foreground" : "text-foreground"}`}>TARÇIN</span>
        <span className={`block text-xs font-medium ${light ? "text-espresso-foreground/70" : "text-muted-foreground"}`}>Ev Yemekleri</span>
      </span>
    </a>
  );
}

function CtaButton({ href, children, variant = "primary" }: { href: string; children: React.ReactNode; variant?: "primary" | "outline" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all";
  const v = variant === "primary"
    ? "bg-primary text-primary-foreground shadow-[var(--shadow-warm)] hover:-translate-y-0.5 hover:bg-primary/90"
    : "border border-input bg-card text-foreground hover:border-primary hover:text-primary";
  return <a href={href} className={`${base} ${v}`}>{children}</a>;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV.map(([l, h]) => (
            <a key={h} href={h} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{l}</a>
          ))}
        </nav>
        <div className="hidden lg:flex items-center gap-3">
          <CtaButton href="tel:05354187432">0 (535) 418 74 32</CtaButton>
        </div>
        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menüyü aç/kapat">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-border px-5 pb-5 pt-2 lg:hidden">
          {MOBILE_HEADER_NAV.map(([l, h]) => (
            <a key={h} href={h} onClick={() => setOpen(false)} className="rounded-lg px-2 py-2.5 font-medium hover:bg-muted">{l}</a>
          ))}
          <a
            href="tel:05354187432"
            className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            <Phone className="h-4 w-4 text-primary" />
            0 (535) 418 74 32
          </a>
          <a
            href="tel:05072423242"
            className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            <Phone className="h-4 w-4 text-primary" />
            0 (507) 242 32 42
          </a>
          <a href="tel:05354187432" onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-primary px-4 py-3 text-center font-semibold text-primary-foreground">
            0 (535) 418 74 32
          </a>
        </nav>
      )}
    </header>
  );
}

function HeroImageSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prev = () => {
    setCurrent((c) => (c === 0 ? slides.length - 1 : c - 1));
  };

  const next = useCallback(() => {
    setCurrent((c) => (c === slides.length - 1 ? 0 : c + 1));
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      next();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchStartX.current = touch.clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touch = e.changedTouches[0];
    if (!touch) {
      touchStartX.current = null;
      return;
    }
    const diff = touchStartX.current - touch.clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) next();
      else prev();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="group relative aspect-square w-full overflow-hidden rounded-2xl select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <div key={slide.id} className="h-full w-full shrink-0">
            <img
              src={slide.src}
              alt={slide.alt}
              width={1024}
              height={1024}
              className="h-full w-full object-cover"
              loading={idx === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Prev / Next Buttons */}
      <button
        type="button"
        onClick={prev}
        aria-label="Önceki görsel"
        className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md opacity-80 transition hover:bg-black/70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Sonraki görsel"
        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md opacity-80 transition hover:bg-black/70 hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Slide Indicators / Dots */}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2.5 py-1 backdrop-blur-md">
        {slides.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrent(idx)}
            aria-label={`Görsel ${idx + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === idx
                ? "w-6 bg-primary"
                : "w-2 bg-white/70 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function Hero({ slides }: { slides: HeroSlide[] }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-accent/60 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:gap-12 sm:px-5 sm:py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-olive/10 px-4 py-1.5 text-xs font-semibold text-olive">
            <Leaf className="h-3.5 w-3.5" /> Kurumsal Tabldot & Catering
          </span>
          <h1 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-tight sm:mt-6 sm:text-5xl lg:text-[3.4rem]">
            Ofisinize <span className="text-brand-orange">Anne Eli Değmiş</span> Gibi Sıcak ve Sağlıklı Ev Yemekleri
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Plazalar, fabrikalar ve kurumsal şirketler için günlük taze hazırlanan, mutfakta özenle üretilen ve tam zamanında teslim edilen kurumsal tabldot çözümleri.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <CtaButton href="#iletisim">Kurumsal Teklif Al <ArrowRight className="h-4 w-4" /></CtaButton>
            <CtaButton href="#menu" variant="outline">Haftalık Menüyü İncele</CtaButton>
          </div>
          <a href="#lezzet-katalogu" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary underline decoration-primary/30 underline-offset-4 transition hover:text-brand-orange">
            Günlük Pişen Zengin Yemek Çeşitlerini Gör <ArrowRight className="h-4 w-4" />
          </a>
          <div className="mt-7 sm:mt-10" aria-label="Anlaşmalı yemek kartları">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Tüm yemek kartlarıyla anlaşmalıyız</p>
            <ul className="payment-card-grid" aria-label="Sodexo, Setcard, Multinet, MetropolCard, Pluxee ve Ticket Restaurant">
              <li className="payment-logo payment-logo--sodexo" aria-label="Sodexo">sodexo</li>
              <li className="payment-logo payment-logo--setcard" aria-label="Setcard">SETCARD</li>
              <li className="payment-logo payment-logo--multinet" aria-label="Multinet">multinet</li>
              <li className="payment-logo payment-logo--metropol" aria-label="MetropolCard">Metropol<span>Card</span></li>
              <li className="payment-logo payment-logo--pluxee" aria-label="Pluxee">pluxee</li>
              <li className="payment-logo payment-logo--ticket" aria-label="Ticket Restaurant"><span>ticket</span><small>Restaurant</small></li>
            </ul>
          </div>
        </div>
        <div className="relative">
          <div className="hero-logo-badge" role="img" aria-label="Tarçın Ev Yemekleri, animasyonlu logo rozeti">
            <span className="hero-logo-glow" />
            <span className="hero-logo-ring" />
            <span className="hero-logo-steam" aria-hidden="true"><i /><i /><i /></span>
            <img src={logoImg} alt="" />
          </div>
          <div className="overflow-hidden rounded-3xl border border-border bg-card p-3 shadow-[var(--shadow-warm)]">
            <HeroImageSlider slides={slides} />
          </div>
          <div className="absolute -bottom-6 left-4 flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-[var(--shadow-warm)] sm:-left-6">
            <Flame className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm font-bold">İş Yerlerine 4 Çeşit Tabldot</p>
              <p className="text-xs text-muted-foreground">Yoğurt, Cacık &amp; Salata İkramımızdır</p>
            </div>
          </div>
          <div className="absolute -top-4 right-4 rounded-2xl bg-espresso px-5 py-3 text-espresso-foreground shadow-[var(--shadow-warm)]">
            <p className="text-xl font-extrabold sm:text-2xl">4 Çeşit Tabldot</p>
            <p className="text-xs opacity-75">İş yerlerine toplu servis</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, desc, light = false }: { eyebrow: string; title: string; desc?: string; light?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-primary">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl ${light ? "text-espresso-foreground" : ""}`}>{title}</h2>
      {desc && <p className={`mt-4 text-lg ${light ? "text-espresso-foreground/70" : "text-muted-foreground"}`}>{desc}</p>}
    </div>
  );
}

function QualityHighlightsBanner() {
  return (
    <div className="mx-auto mb-14 max-w-4xl overflow-hidden rounded-2xl border border-[#1b4d2e]/30 bg-[#fbf9f4] dark:bg-card p-4 sm:rounded-full sm:px-8 sm:py-3.5 shadow-sm">
      <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:justify-between text-[#1b4d2e] dark:text-[#52a468]">
        {/* 1. 4 Çeşit Tabldot Servisi */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
            <path d="M12 3a1.5 1.5 0 0 1 1.415 1.001A8.003 8.003 0 0 1 20 11.8v1.2H4v-1.2a8.003 8.003 0 0 1 6.585-6.799A1.5 1.5 0 0 1 12 3z" />
            <rect x="2" y="15" width="20" height="2.5" rx="1" />
          </svg>
          <span className="text-3xl sm:text-4xl font-black tracking-tight leading-none">4</span>
          <div className="text-[11px] sm:text-xs font-black uppercase leading-tight tracking-wider">
            <span>ÇEŞİT TABLDOT</span>
            <span className="block">SERVİSİ</span>
          </div>
        </div>

        {/* Dotted Divider 1 */}
        <div className="hidden sm:block h-8 border-r-2 border-dotted border-[#1b4d2e]/30" />

        {/* 2. Günlük Taze Pişirim */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
            <path d="M12 2l3.09 2.05L19 4v6.09c0 5.05-3.41 9.76-7 10.91-3.59-1.15-7-5.86-7-10.91V4l3.91.05L12 2zm-1.2 13.3l6.2-6.2-1.4-1.4-4.8 4.79-2.2-2.2-1.4 1.41 3.6 3.6z" />
          </svg>
          <div className="text-[11px] sm:text-xs font-black uppercase leading-tight tracking-wider">
            <span>GÜNLÜK</span>
            <span className="block">TAZE PİŞİRİM</span>
          </div>
        </div>

        {/* Dotted Divider 2 */}
        <div className="hidden sm:block h-8 border-r-2 border-dotted border-[#1b4d2e]/30" />

        {/* 3. Kaliteli Malzeme */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
          </svg>
          <div className="text-[11px] sm:text-xs font-black uppercase leading-tight tracking-wider">
            <span>KALİTELİ</span>
            <span className="block">MALZEME</span>
          </div>
        </div>

        {/* Dotted Divider 3 */}
        <div className="hidden sm:block h-8 border-r-2 border-dotted border-[#1b4d2e]/30" />

        {/* 4. Zamanında Teslimat */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative shrink-0">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 sm:h-8 sm:w-8">
              <path d="M18 10h-2V6c0-.55-.45-1-1-1H3c-1.1 0-2 .9-2 2v9c0 .55.45 1 1 1h1c0 1.66 1.34 3 3 3s3-1.34 3-3h4c0 1.66 1.34 3 3 3s3-1.34 3-3h2c.55 0 1-.45 1-1v-4l-3-3zm-12 8c-.83 0-1.5-.67-1.5-1.5S5.17 15 6 15s1.5.67 1.5 1.5S6.83 18 6 18zm12 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-1-8h2.2l1.8 2.4V14h-4v-4z" />
            </svg>
            <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1b4d2e] dark:bg-[#52a468] text-white dark:text-black">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-2.5 w-2.5">
                <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z" />
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
              </svg>
            </div>
          </div>
          <div className="text-[11px] sm:text-xs font-black uppercase leading-tight tracking-wider">
            <span>ZAMANINDA</span>
            <span className="block">TESLİMAT</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function WhyUs() {
  const items = [
    { icon: Leaf, t: "Günlük Taze Malzeme", d: "Taze malzemelerle özenle hazırlanan, her gün pişen ev yemekleri." },
    { icon: FlaskConical, t: "Özenli Üretim Kontrolü", d: "Malzeme kabulünden hazırlık ve paketlemeye kadar her aşamada titiz mutfak kontrolü." },
    { icon: Truck, t: "Tam Zamanında Teslimat", d: "Özel termobox araçlarımızla öğle molanıza taze ve sıcak ulaştırma." },
    { icon: Users, t: "Esnek Kurumsal Çözümler", d: "10 kişiden 500+ kişiye ölçeklenebilir; diyet ve vejetaryen alternatifler." },
  ];
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <QualityHighlightsBanner />
      <SectionHead eyebrow="Neden Tarçın?" title="Ekibinizin sağlığı ve memnuniyeti için her gün özenle" />
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: I, t, d }) => (
          <div key={t} className="group rounded-2xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-warm)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><I className="h-6 w-6" /></span>
            <h3 className="mt-5 text-lg font-bold">{t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const FIX_MENU = {
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
} as const;

type Day = keyof typeof FIX_MENU;

const MENU_CATEGORIES = [
  {
    title: "Çorbalar",
    icon: Soup,
    iconBgClass: "bg-sky-100",
    iconColorClass: "text-sky-600",
    items: [
      "Kremalı Tavuk Çorbası", "Mercimek Çorbası", "Ezogelin Çorbası",
      "Yayla Çorbası", "Tarhana Çorbası", "Tutmaç Çorbası",
      "Tek Şehriye Çorbası", "Yüssük Çorbası",
    ],
  },
  {
    title: "Etli & Tavuklu Ana Yemekler",
    icon: Beef,
    iconBgClass: "bg-red-100",
    iconColorClass: "text-red-600",
    items: [
      "Hasan Paşa Köftesi", "Tavuklu Sultan Kebabı", "Taş Kebabı",
      "Çökertme Kebabı", "İzmir Köfte", "Dana Güveç",
      "Fırında Köfte", "Püreli Rosto Köfte", "Arnavut Ciğeri",
      "Fırın Kalçalı But", "Piliç Topkapı", "Fırın Baget",
      "Tavuk Sote", "Tavuk Haşlama", "Tavuk Güveç",
      "Sebzeli Köfte", "Terbiyeli Köfte", "Ekşili Köfte",
    ],
  },
  {
    title: "Geleneksel Ev & Sebze Yemekleri",
    icon: CookingPot,
    iconBgClass: "bg-violet-100",
    iconColorClass: "text-violet-700",
    items: [
      "Etli Kuru Fasulye", "Etli Nohut", "Lahana Dolması",
      "Yaprak Sarması", "Patlıcan Musakka", "Taze Fasulye",
      "Zeytinyağlı Barbunya", "Yeşil Mercimek Yemeği", "Bamya Yemeği",
    ],
  },
  {
    title: "Diyet Menü (Özel)",
    icon: Salad,
    iconBgClass: "bg-green-100",
    iconColorClass: "text-green-600",
    badge: "Sağlıklı & Fit",
    badgeClass: "menu-category-badge-fit",
    items: [
      "Brokoli Sote (Diyet yapanlar için özel hafif ve taze alternatif)",
    ],
  },
  {
    title: "Pilav & Yan Lezzetler",
    icon: Wheat,
    iconBgClass: "bg-rose-100",
    iconColorClass: "text-rose-600",
    items: [
      "Tereyağlı Pirinç Pilavı", "Meyhane Bulgur Pilavı", "Yoğurtlu Makarna",
      "Peynirli Makarna", "Patates Püresi", "Tava Yoğurdu",
      "Cacık", "Yoğurtlu Semizotu",
    ],
  },
  {
    title: "Tatlılar & İkramlar",
    icon: CakeSlice,
    iconBgClass: "bg-amber-100",
    iconColorClass: "text-amber-600",
    badge: "Haftada 1 Gün Revani İkramı!",
    badgeClass: "menu-category-badge-treat",
    items: [
      "Fırın Sütlaç", "Haşhaşlı Revani",
    ],
  },
];

function WeeklyMenu() {
  const { fixMenu, brochure, categories } = useAppData();
  const days = Object.keys(fixMenu) as Day[];
  const [day, setDay] = useState<Day>("Pazartesi");
  const [selectedBrochure, setSelectedBrochure] = useState<string | null>(null);
  const m = fixMenu[day] || fixMenu["Pazartesi"] || {
    soup: "Kremalı Tavuk Çorbası",
    main: "Fırında Köfte",
    side: "Pirinç Pilavı",
    extra: "Yoğurt, Cacık veya Salata",
    desc: "Taptaze günlük menü",
  };

  const courses = [
    { title: "Çorba", value: m.soup, icon: "🥣" },
    { title: "Ana Yemek", value: m.main, icon: "🥘" },
    { title: "Pilav / Makarna", value: m.side, icon: "🍚" },
    { title: "İkram", value: m.extra, icon: "🥗", isGift: true },
  ];

  return (
    <section id="menu" className="w-full min-w-0 overflow-x-clip bg-secondary/60 py-12 sm:py-20">
      <div className="mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-5">
          <SectionHead
          eyebrow="Haftalık Menü"
          title="Haftalık Menü Çeşitlerimiz"
          desc="Her gün taze pişen sıcak ev yemekleri; yoğurt, cacık veya salata ikramımızla ofisinize teslim edilir."
        />
        <aside
          role="note"
          aria-label="Çarşamba menüsü duyurusu"
          className="sticky top-[4.5rem] z-30 mx-auto mt-6 flex w-fit max-w-full items-center gap-2.5 rounded-full border border-primary/20 bg-background/95 px-4 py-2.5 text-center shadow-[var(--shadow-warm)] backdrop-blur sm:gap-3 sm:px-6"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-sm leading-snug">
            <span className="font-extrabold text-primary">Her Çarşamba</span>
            <span className="px-1.5 text-muted-foreground">·</span>
            <span className="font-bold">Arnavut Ciğeri Sabit</span>
          </p>
        </aside>

        {/* Fix Menu & Brochure Preview Container */}
        <div className="mt-8 grid w-full min-w-0 items-start gap-6 lg:mt-12 lg:grid-cols-12 lg:gap-8">
          {/* Daily Interactive Menu */}
          <div className="w-full min-w-0 lg:col-span-7">
            {/* Day Selector Tabs */}
            <div role="tablist" className="flex max-w-full min-w-0 gap-2 overflow-x-auto rounded-2xl bg-card p-2 shadow-sm">
              {days.map((d) => (
                <button
                  key={d}
                  role="tab"
                  aria-selected={d === day}
                  onClick={() => setDay(d)}
                  className={`min-w-[76px] flex-1 rounded-xl px-2 py-3 text-center text-xs font-bold transition-all sm:min-w-[90px] sm:px-3 sm:text-sm ${
                    d === day
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Selected Day Content */}
            <div
              key={day}
              className="mt-4 min-w-0 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-warm)] sm:mt-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Günün Tabldot Menüsü</span>
                  <h3 className="break-words text-xl font-extrabold sm:text-2xl">{day} Menüsü</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-olive/15 px-3 py-1 text-xs font-bold text-olive">
                  ✓ 4 Çeşit Tabldot
                </span>
              </div>

              <div className="mt-6 grid gap-3.5 sm:grid-cols-2">
                {courses.map((c, i) => (
                  <div
                    key={c.title}
                    className={`flex min-w-0 items-center gap-3 rounded-xl p-3 transition-all sm:gap-4 sm:p-4 ${
                      c.isGift
                        ? "border border-olive/30 bg-olive/10"
                        : "bg-muted/70"
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-card text-lg shadow-sm">
                      {c.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {i + 1}. {c.title}
                        </p>
                        {c.isGift && (
                          <span className="rounded bg-olive px-1.5 py-0.5 text-[10px] font-bold text-white">
                            İKRAM
                          </span>
                        )}
                      </div>
                      <p className="break-words text-sm font-bold sm:text-base">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>

              {/* Special Features Banner */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-foreground">Haftada 1 Gün TATLI REVANİ İkramımızdır!</p>
                      <p className="break-words text-xs text-muted-foreground">Yoğurt, cacık veya salata her menümüzde standart ikramdır.</p>
                    </div>
                  </div>
                  <a
                    href="#iletisim"
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition"
                  >
                    Teklif İste <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Badges footer */}
              <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg bg-muted px-3 py-1.5 font-medium">
                  🛵 <strong>5 Kişi Üzeri</strong> İş Yerlerine Sıcak Servis
                </span>
                <span className="rounded-lg bg-muted px-3 py-1.5 font-medium">
                  💳 <strong>Tüm Yemek Kartları</strong> Geçerlidir
                </span>
                <span className="rounded-lg bg-muted px-3 py-1.5 font-medium">
                  🥦 Diyet Tercihi İçin: <strong>Brokoli Sote</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Fix Menu Brochure Card */}
          <div className="weekly-menu-brochure w-full min-w-0 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-warm)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="break-words text-xl font-bold">{brochure.title}</h3>
                </div>
                <span className="rounded-md bg-espresso px-2.5 py-1 text-xs font-bold text-espresso-foreground">
                  {brochure.badge}
                </span>
              </div>

              {/* Clickable Image Preview */}
              <div
                onClick={() => setSelectedBrochure(brochure.image)}
                className="group relative mt-5 cursor-pointer overflow-hidden rounded-xl border border-border bg-muted aspect-[3/4] shadow-inner"
              >
                <img
                  src={brochure.image}
                  alt={brochure.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 text-white gap-2">
                  <Eye className="h-8 w-8" />
                  <span className="text-sm font-bold">Büyük Boy İncele</span>
                </div>
              </div>

              {/* Download / View Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBrochure(brochure.image)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-sm"
                >
                  <Eye className="h-4 w-4" /> Broşürü Büyüt
                </button>
                <a
                  href={brochure.image}
                  download="tarcin-ev-yemekleri-fix-menu.jpeg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary transition"
                  title="Görseli İndir"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Catalog & Categories */}
        <section id="lezzet-katalogu" className="mt-14 scroll-mt-24 sm:mt-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Lezzet Kataloğu</span>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">Günlük Pişen Zengin Yemek Çeşitlerimiz</h3>
            <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
              Her gün taze malzemelerle hazırlanan zengin çorba, etli ana yemek, tencere yemekleri ve hafif tatlılarımız.
            </p>
          </div>

          <div className="menu-catalog-grid mt-10">
            {categories.map((cat) => (
              <div
                key={cat.id || cat.title}
                className="menu-catalog-card"
              >
                <div className="menu-catalog-card-header">
                  <div className="menu-catalog-title-group">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-lg shadow-2xs">
                      {cat.icon || "🍲"}
                    </span>
                    <h4 className="min-w-0 text-base font-extrabold leading-snug">{cat.title}</h4>
                  </div>
                  {cat.badge && (
                    <span className="menu-category-badge menu-category-badge-fit">
                      {cat.badge}
                    </span>
                  )}
                </div>
                <ul className="menu-catalog-dish-list">
                  {cat.items.map((item) => (
                    <li key={item} className="menu-catalog-dish">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Lightbox Modal */}
        {selectedBrochure && (
          <div
            onClick={() => setSelectedBrochure(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedBrochure(null)}
                aria-label="Kapat"
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedBrochure}
                alt={brochure.title}
                className="max-h-[85vh] w-auto object-contain mx-auto"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Services() {
  const items = [
    { icon: Package, t: "Taşıma Yemek", s: "Sefer Tası / Termobox", d: "Merkez mutfağımızda hazırlanan yemekler, ısı yalıtımlı kaplarla ofislerinize sıcacık ulaşır.", f: ["Günlük sıcak teslimat", "Porsiyon kontrollü servis", "Esnek sipariş adedi"] },
    { icon: Building2, t: "Yerinde Üretim", s: "Mutfak Yönetimi", d: "Şirketinizin kendi tesisinde, uzman aşçı ve personelimizle yerinde yemek üretimi ve yönetimi.", f: ["Profesyonel mutfak ekibi", "Tedarik ve stok yönetimi", "Fabrika ve kampüslere uygun"] },
    { icon: PartyPopper, t: "Etkinlik & Toplantı Catering", s: "Kurumsal İkram", d: "Lansman, kutlama ve toplantılarınıza özel, şık sunumlu ikram menüleri.", f: ["Kokteyl ve açık büfe", "Kahve molası paketleri", "Kişiye özel menü tasarımı"] },
  ];
  return (
    <section id="hizmetler" className="mx-auto max-w-7xl px-5 py-20">
      <SectionHead eyebrow="Hizmetlerimiz" title="İhtiyacınıza uygun hizmet modeli" desc="Küçük ofislerden binlerce çalışanlı fabrikalara kadar her ölçeğe çözüm." />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {items.map(({ icon: I, t, s, d, f }) => (
          <div key={t} className="group flex flex-col rounded-2xl border border-border bg-card p-8 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-warm)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-espresso text-espresso-foreground transition-colors group-hover:bg-primary"><I className="h-7 w-7" /></span>
            <p className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">{s}</p>
            <h3 className="mt-1 text-xl font-bold">{t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
            <ul className="mt-5 flex-1 space-y-2 text-sm">
              {f.map((x) => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-olive" />{x}</li>)}
            </ul>
            <a href="#iletisim" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Teklif alın <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
          </div>
        ))}
      </div>
    </section>
  );
}

function Hygiene() {
  const items = [
    { icon: Snowflake, t: "Soğuk Zincir Uyumu", d: "Hammaddeden teslimata kadar sıcaklık kayıt altında; soğuk zincir hiçbir aşamada kırılmaz." },
    { icon: ShieldCheck, t: "Paslanmaz Çelik Endüstriyel Mutfak", d: "Bölümlendirilmiş, profesyonel ekipmanlı ve düzenli dezenfekte edilen üretim alanı." },
    { icon: HeartPulse, t: "Düzenli Personel Sağlık Taramaları", d: "Tüm ekibimiz periyodik sağlık kontrolünden ve hijyen eğitimlerinden geçer." },
    { icon: Scale, t: "Diyetisyen Onaylı Makro Planlama", d: "Protein, karbonhidrat ve yağ dengesi gözetilerek hazırlanan aylık menüler." },
  ];
  return (
    <section id="hijyen" className="bg-espresso py-20 text-espresso-foreground">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Hijyen & Kalite</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Mutfağımıza güvenin, çünkü her adımı denetliyoruz</h2>
          <p className="mt-5 text-lg leading-relaxed text-espresso-foreground/70">Malzeme seçiminden hazırlık ve paketlemeye kadar mutfak ekibimiz her aşamaya özen gösterir; taze üretim ve hijyen odaklı yaklaşımımızla yemekleri size ulaştırırız.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Günlük Taze Üretim", "Hijyenik Hazırlık", "Dengeli Menü Planı", "Zamanında Teslimat"].map((b) => (
              <span key={b} className="rounded-xl border border-espresso-foreground/20 px-4 py-2 text-sm font-semibold">{b}</span>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl bg-espresso-foreground/5 p-6 ring-1 ring-espresso-foreground/10 transition-colors hover:bg-espresso-foreground/10">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-olive text-olive-foreground"><I className="h-5 w-5" /></span>
              <h3 className="mt-4 font-bold">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-espresso-foreground/70">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function References() {
  const { testimonials } = useAppData();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!carouselApi) return;

    const updateScrollButtons = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    updateScrollButtons();
    carouselApi.on("select", updateScrollButtons);
    carouselApi.on("reInit", updateScrollButtons);

    return () => {
      carouselApi.off("select", updateScrollButtons);
      carouselApi.off("reInit", updateScrollButtons);
    };
  }, [carouselApi]);

  return (
    <section id="referanslar" className="mx-auto max-w-7xl px-5 py-20">
      <SectionHead eyebrow="Müşterilerimizden" title="Öğle molalarına lezzet katan yorumlar" />
      {testimonials.length > 0 && (
        <div className="mt-12">
          <Carousel
            setApi={setCarouselApi}
            opts={{ align: "start", containScroll: "trimSnaps", slidesToScroll: "auto" }}
            aria-label="Müşteri yorumları"
          >
            <CarouselContent className="-ml-6">
              {testimonials.map((x) => (
                <CarouselItem key={x.id} className="pl-6 md:basis-1/2 lg:basis-1/3">
                  <figure className="flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-7 transition-shadow hover:shadow-[var(--shadow-warm)]">
                    <div>
                      <div className="flex items-center justify-between">
                        <Quote className="h-8 w-8 text-primary/40" />
                        <div
                          className="flex items-center text-sm text-amber-500"
                          aria-label={`${x.rating || 5} yıldız`}
                        >
                          {Array.from({ length: x.rating || 5 }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                      <blockquote className="mt-4 leading-relaxed italic text-foreground/90">
                        "{x.comment}"
                      </blockquote>
                    </div>
                    <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-primary">
                        {x.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold">{x.name}</span>
                        <span className="truncate text-sm text-muted-foreground">
                          {x.role}
                          {x.company ? ` • ${x.company}` : ""}
                        </span>
                      </span>
                    </figcaption>
                  </figure>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {(canScrollPrev || canScrollNext) && (
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => carouselApi?.scrollPrev()}
                disabled={!canScrollPrev}
                aria-label="Önceki yorumlar"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => carouselApi?.scrollNext()}
                disabled={!canScrollNext}
                aria-label="Sonraki yorumlar"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function F({ id, label, errors, children }: { id: string; label: string; errors: Record<string, string>; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold">{label}{children}{errors[id] && <span className="mt-1 block text-xs font-medium text-destructive">{errors[id]}</span>}</label>
  );
}

function LeadForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitError(null);
    const result = contactSchema.safeParse(Object.fromEntries(new FormData(form).entries()));
    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { nextErrors[String(issue.path[0])] = issue.message; });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      const body = await response.json().catch(() => null) as {
        error?: string;
        message?: string;
        fieldErrors?: Record<string, string>;
      } | null;
      if (!response.ok) {
        setErrors(body?.fieldErrors ?? {});
        setSubmitError(body?.error || "Talep gönderilemedi. Lütfen tekrar deneyin.");
        return;
      }
      setSent(true);
      form.reset();
    } catch {
      setSubmitError("Sunucuya ulaşılamadı. Lütfen bağlantınızı kontrol edip tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = "mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30";
  return (
    <section id="iletisim" className="bg-secondary/60 py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Ücretsiz Tadım</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Ekibinizin damak tadına güveniyoruz.</h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">İlk tadım menümüzü şirketinizde ücretsiz deneyin! Formu doldurun, kurumsal temsilcimiz 24 saat içinde sizi arayarak tadım gününüzü planlasın.</p>
          <ul className="mt-8 space-y-3">
            {["Taahhüt yok, tamamen ücretsiz tadım", "Şirketinize özel fiyat teklifi", "Menüyü ekibinizle birlikte belirleyin"].map((x) => (
              <li key={x} className="flex items-center gap-3 font-medium"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-olive text-olive-foreground"><Check className="h-3.5 w-3.5" /></span>{x}</li>
            ))}
          </ul>
          <div className="mt-8 rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Doğrudan İletişim &amp; Bilgi</p>
            <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold">
              <a href="tel:05354187432" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" /> 0 (535) 418 74 32
              </a>
              <a href="tel:05072423242" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4 text-primary" /> 0 (507) 242 32 42
              </a>
            </div>
            <a
              href="https://maps.app.goo.gl/8fm79CaLQizovJxNA"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
            >
              <MapPin className="h-5 w-5 shrink-0" />
              <span>Konumumuzu görün — Yol tarifi alın</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </a>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-md bg-olive/15 px-2.5 py-1 font-semibold text-olive">
                ✓ Yemek Kartları Geçerlidir
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                ✓ İş Yerlerine Tabldot Yemek Servisi
              </span>
            </div>
          </div>
        </div>
        <div className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-warm)] sm:p-9">
          {sent ? (
            <div className="py-10 text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-olive text-olive-foreground"><Check className="h-8 w-8" /></span>
              <h3 className="mt-5 text-2xl font-bold">Talebiniz iletildi!</h3>
              <p className="mt-2 text-muted-foreground">E-posta ile gönderildi. Teşekkür ederiz; kurumsal temsilcimiz en kısa sürede sizinle iletişime geçecek.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <F errors={errors} id="company" label="Firma Adı"><input name="company" maxLength={120} className={field} placeholder="Örn: Atlas Holding" autoComplete="organization" /></F>
                <F errors={errors} id="name" label="Yetkili Adı Soyadı"><input name="name" maxLength={100} className={field} placeholder="Adınız Soyadınız" autoComplete="name" /></F>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <F errors={errors} id="email" label="E-posta Adresi"><input name="email" type="email" maxLength={254} className={field} placeholder="ornek@firma.com" autoComplete="email" /></F>
                <F errors={errors} id="phone" label="Telefon Numarası"><input name="phone" type="tel" maxLength={24} className={field} placeholder="0 (5xx) xxx xx xx" autoComplete="tel" /></F>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <F errors={errors} id="size" label="Günlük Kişi Sayısı">
                  <select name="size" defaultValue="" className={field}>
                    <option value="" disabled>Seçiniz</option>
                    <option>10-30 kişi</option><option>30-100 kişi</option><option>100+ kişi</option>
                  </select>
                </F>
                <F errors={errors} id="district" label="Bulunduğu İlçe / Bölge"><input name="district" maxLength={100} className={field} placeholder="Örn: Muratpaşa / Kepez / Konyaaltı" /></F>
              </div>
              <F errors={errors} id="subject" label="Konu"><input name="subject" maxLength={150} className={field} placeholder="Örn: Kurumsal yemek teklifi" /></F>
              <F errors={errors} id="message" label="Mesaj"><textarea name="message" rows={4} maxLength={5000} className={field} placeholder="İhtiyacınızı ve varsa eklemek istediğiniz bilgileri yazın." /></F>
              {submitError && <p role="alert" className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">{submitError}</p>}
              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-primary px-6 py-4 font-semibold text-primary-foreground shadow-[var(--shadow-warm)] transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Gönderiliyor..." : "Teklif İste"}</button>
              <p className="text-center text-xs text-muted-foreground">Bilgileriniz KVKK kapsamında korunur ve yalnızca teklif amacıyla kullanılır.</p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { profile } = useAppData();
  return (
    <footer className="bg-espresso text-espresso-foreground">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-4">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-espresso-foreground/70">
            Çalışanlara evdeki sofranın sıcaklığını, kurumsal hizmet disipliniyle her gün taze olarak ulaştırıyoruz.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-white/10 px-2.5 py-1 font-medium text-espresso-foreground/90">
              ✓ Yemek Kartları Geçerlidir
            </span>
            <span className="rounded-md bg-white/10 px-2.5 py-1 font-medium text-espresso-foreground/90">
              ✓ İş Yerlerine Tabldot Servisi
            </span>
          </div>
          <a
            href="https://www.instagram.com/tarcinevyemekleri_/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-espresso-foreground transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            Instagram'da bizi takip edin
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        <div>
          <h4 className="font-bold">Hızlı Bağlantılar</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-espresso-foreground/70">
            {NAV.map(([l, h]) => (
              <li key={h}>
                <a href={h} className="transition-colors hover:text-primary">{l}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold">İletişim</h4>
          <ul className="mt-4 space-y-3.5 text-sm text-espresso-foreground/70">
            <li className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-primary" />
              <span>{profile.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-5 w-5 shrink-0 text-primary" />
              <div className="flex flex-col gap-1">
                <a href={`tel:${profile.phone.replace(/\s+/g, "")}`} className="hover:text-primary transition-colors">
                  {profile.phone}
                </a>
                {profile.phone2 && (
                  <a href={`tel:${profile.phone2.replace(/\s+/g, "")}`} className="hover:text-primary transition-colors">
                    {profile.phone2}
                  </a>
                )}
              </div>
            </li>
            <li className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-primary" />
              <a href={`mailto:${profile.email}`} className="hover:text-primary transition-colors">
                {profile.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold">Online Sipariş</h4>
          <p className="mt-4 text-sm leading-relaxed text-espresso-foreground/70">
            Dilediğiniz platformdan sipariş verebilirsiniz.
          </p>
          <div className="mt-4 grid gap-2">
            {ONLINE_ORDER_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm font-semibold text-espresso-foreground/90 transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <span>{label}</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-espresso-foreground/10 py-6 text-center text-sm text-espresso-foreground/60">
        <span>© {new Date().getFullYear()} {profile.businessName}. Tüm hakları saklıdır.</span>
      </div>
    </footer>
  );
}
