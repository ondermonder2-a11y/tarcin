import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  User, Phone, Mail, MapPin, Building2, ArrowLeft, ExternalLink,
  Save, RotateCcw, KeyRound, CheckCircle2, Shield,
} from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { AdminLogin } from "@/components/AdminLogin";
import { useAdminAuth, useAppData, AdminProfile } from "@/lib/app-data";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Yönetici Profili | TARÇIN Ev Yemekleri" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { isAuthenticated, isAuthLoaded, changePassword } = useAdminAuth();
  const { isLoaded, profile, updateProfile, resetToDefaults } = useAppData();
  const [form, setForm] = useState<AdminProfile>(profile);
  const [notice, setNotice] = useState<string | null>(null);

  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passNotice, setPassNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded) setForm(profile);
  }, [isLoaded, profile]);

  const showToast = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleChange = (field: keyof AdminProfile, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    showToast("Profil ve işletme bilgileri başarıyla güncellendi!");
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass.length < 12) {
      setPassNotice("Yeni parola en az 12 karakter olmalıdır.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassNotice("Yeni parolalar birbiriyle uyuşmuyor.");
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
        subtitle="Profil ve işletme bilgilerini düzenlemek için giriş yapın."
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm font-bold text-muted-foreground">Profil yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-auto min-h-16 max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2.5">
              <img
                src={logoImg}
                alt="Tarçın Logo"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/40"
              />
              <span className="font-extrabold text-sm tracking-wide">Yönetici Profili</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              aria-label="Yönetim paneline dön"
              className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-card px-3.5 py-2 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Yönetim Paneli</span>
            </Link>
            <Link
              to="/"
              aria-label="Ana siteyi aç"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 transition"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Siteye Git</span>
            </Link>
          </div>
        </div>
      </header>

      {notice && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-2xl animate-in slide-in-from-top-3">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notice}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 flex-1 space-y-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Yönetici Profil &amp; İşletme Sayfası</h1>
          <p className="text-xs text-muted-foreground">
            Tarçın Ev Yemekleri yönetici hesabı ve web sitesinde yayınlanan iletişim detayları.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Summary Card */}
          <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-6 shadow-sm text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20 text-3xl font-black text-primary">
              {form.fullName.split(" ").map((n) => n[0]).join("")}
            </div>
            <h2 className="mt-4 text-xl font-extrabold">{form.fullName}</h2>
            <p className="text-xs font-bold text-primary">{form.roleTitle}</p>
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
                onClick={() => {
                  if (confirm("Tüm site ve menü verilerini orijinal ayarlara sıfırlamak istiyor musunuz?")) {
                    resetToDefaults();
                    showToast("Tüm veriler varsayılanlara sıfırlandı!");
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 px-3.5 py-2 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Varsayılanları Sıfırla
              </button>
            </div>
          </div>

          {/* Right Edit Forms */}
          <div className="lg:col-span-8 space-y-6">
          <form
            onSubmit={handleProfileSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <span className="font-extrabold text-sm">Profil &amp; İletişim Bilgileri</span>
              <span className="text-xs text-muted-foreground">Canlı sitede güncellenir</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Ad Soyad</label>
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Unvan / Rol</label>
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
                  <label className="block text-xs font-bold text-muted-foreground mb-1">E-Posta</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">İşletme Adı</label>
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
                  <label className="block text-xs font-bold text-muted-foreground mb-1">1. Telefon (WhatsApp)</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">2. Telefon</label>
                  <input
                    type="text"
                    value={form.phone2}
                    onChange={(e) => handleChange("phone2", e.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">İşletme Adresi</label>
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
                Profili Kaydet
              </button>
            </form>

            {/* Password Change */}
          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
              <span className="font-extrabold text-sm flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-primary" />
                  Şifre Değiştir
                </span>
              </div>

              {passNotice && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-2.5 text-xs font-bold text-primary">
                  {passNotice}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Mevcut Şifre</label>
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
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Yeni Şifre</label>
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
                  <label className="block text-xs font-bold text-muted-foreground mb-1">Yeni Şifre (Tekrar)</label>
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
                Şifreyi Güncelle
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
