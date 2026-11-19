import { createFileRoute } from "@tanstack/react-router";
import {
  authenticateAdmin,
  changeAdminPassword,
  clearAdminSessionCookie,
  createAdminSessionCookie,
  createAdminSessionToken,
  isAdminRequest,
  SecureStoreConfigurationError,
} from "@/lib/server/secure-store";

function json(body: unknown, status = 200, cookie?: string): Response {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Pragma": "no-cache",
  });
  if (cookie) headers.set("Set-Cookie", cookie);
  return new Response(JSON.stringify(body), { status, headers });
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

async function parseJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? value as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

function isCredentialString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 10;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function loginAttemptKey(request: Request): string {
  return (request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown").slice(0, 100);
}

function allowLoginAttempt(request: Request): boolean {
  const now = Date.now();
  const key = loginAttemptKey(request);
  const entry = loginAttempts.get(key);
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { count: 1, resetAt: now + LOGIN_WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_LOGIN_ATTEMPTS;
}

export const Route = createFileRoute("/api/admin/session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          return await isAdminRequest(request)
            ? json({ authenticated: true })
            : json({ authenticated: false }, 401);
        } catch {
          return json({ authenticated: false }, 401);
        }
      },
      POST: async ({ request }) => {
        if (!sameOrigin(request)) return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
        if (Number(request.headers.get("content-length") ?? 0) > 8192) return json({ error: "İstek çok büyük." }, 413);
        if (!allowLoginAttempt(request)) return json({ error: "Çok fazla giriş denemesi yapıldı. 15 dakika sonra tekrar deneyin." }, 429);
        const body = await parseJson(request);
        if (!body || !isCredentialString(body["username"], 254) || !isCredentialString(body["password"], 1024)) {
          return json({ error: "Kullanıcı adı ve parola zorunludur." }, 400);
        }

        try {
          if (!(await authenticateAdmin(body["username"], body["password"]))) {
            return json({ error: "Kullanıcı adı veya parola hatalı." }, 401);
          }
          loginAttempts.delete(loginAttemptKey(request));
          const token = await createAdminSessionToken(body["username"]);
          return json({ authenticated: true }, 200, createAdminSessionCookie(token));
        } catch (error) {
          if (error instanceof SecureStoreConfigurationError) {
            return json({ error: "Yönetici hesabı sunucuda yapılandırılmamış. Sunucu yöneticinizle iletişime geçin." }, 503);
          }
          console.error("[admin-auth] login failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
          return json({ error: "Giriş işlemi tamamlanamadı. Lütfen daha sonra tekrar deneyin." }, 503);
        }
      },
      PUT: async ({ request }) => {
        if (!sameOrigin(request)) return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
        if (!(await isAdminRequest(request))) return json({ error: "Oturum sona erdi. Yeniden giriş yapın." }, 401);
        if (Number(request.headers.get("content-length") ?? 0) > 8192) return json({ error: "İstek çok büyük." }, 413);
        const body = await parseJson(request);
        if (!body || !isCredentialString(body["currentPassword"], 1024) || !isCredentialString(body["newPassword"], 1024)) {
          return json({ error: "Parola alanlarını eksiksiz doldurunuz." }, 400);
        }
        if (body["newPassword"].length < 12) {
          return json({ error: "Yeni parola en az 12 karakter olmalıdır." }, 422);
        }

        try {
          const token = await changeAdminPassword(body["currentPassword"], body["newPassword"]);
          if (!token) return json({ error: "Mevcut parola hatalı." }, 401);
          return json({ message: "Yönetici parolası güncellendi." }, 200, createAdminSessionCookie(token));
        } catch (error) {
          if (error instanceof SecureStoreConfigurationError) {
            return json({ error: "Güvenli ayar deposu sunucuda yapılandırılmamış." }, 503);
          }
          console.error("[admin-auth] password update failed", { errorType: error instanceof Error ? error.name : "UnknownError" });
          return json({ error: "Parola güncellenemedi. Lütfen daha sonra tekrar deneyin." }, 503);
        }
      },
      DELETE: async ({ request }) => {
        if (!sameOrigin(request)) return json({ error: "İstek kaynağı doğrulanamadı." }, 403);
        return json({ authenticated: false }, 200, clearAdminSessionCookie());
      },
    },
  },
});
