import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock, User, Eye, EyeOff, LogIn, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import logoImg from "@/assets/logo.jpg";
import { useAdminAuth } from "@/lib/app-data";

interface AdminLoginProps {
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function AdminLogin({
  onSuccess,
  title = "Yönetici Girişi",
  subtitle = "Lütfen devam etmek için giriş yapınız.",
}: AdminLoginProps) {
  const { login } = useAdminAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError("Lütfen kullanıcı adı veya e-posta giriniz.");
      return;
    }
    if (!password) {
      setError("Lütfen şifrenizi giriniz.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier, password);
      if (!res.success) {
        setError(res.error || "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.");
      } else {
        if (onSuccess) onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-9 shadow-2xl backdrop-blur-md">
          {/* Logo & Heading */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <img
                src={logoImg}
                alt="Tarçın Ev Yemekleri"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/30 shadow-lg"
              />
              <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              TARÇIN Ev Yemekleri
            </h1>
            <p className="mt-1 text-sm font-bold text-primary">{title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-semibold text-destructive animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Kullanıcı Adı veya E-posta
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Kullanıcı Adını yazınız"
                  autoComplete="username"
                  required
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">
                Şifre
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-input bg-background pl-10 pr-10 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label="Şifreyi göster/gizle"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-extrabold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              <span>{isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}</span>
            </button>
          </form>

          {/* Credentials are verified on the server; only an HttpOnly session cookie is kept. */}
          <div className="mt-5 rounded-xl border border-primary/15 bg-muted/60 p-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Yönetici hesabı sunucu tarafında doğrulanır. İlk kurulumda sunucunun ADMIN_USERNAME ve ADMIN_PASSWORD değerleri yapılandırılmalıdır.
          </div>

          {/* Back Link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Ana Sayfaya Dön</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
