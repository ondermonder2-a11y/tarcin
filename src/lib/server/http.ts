/** API route'ları için ortak HTTP yardımcıları (JSON gövde, aynı kaynak kontrolü). */

export function jsonResponse(body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers = new Headers(extraHeaders);
  headers.set("Content-Type", "application/json; charset=utf-8");
  if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status, headers });
}

/**
 * Mutasyonlarda istek kaynağını doğrular. Origin/Cookie tabanlı CSRF'yi admin oturum
 * çerezinin SameSite=Strict davranışı ile birlikte ikinci katman olarak tamamlar.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const originUrl = new URL(origin);
    const requestHost = request.headers.get("host") ?? new URL(request.url).host;
    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && fetchSite !== "same-origin") return false;
    return (
      originUrl.host.toLowerCase() === requestHost.toLowerCase() &&
      (fetchSite === "same-origin" || originUrl.protocol === new URL(request.url).protocol)
    );
  } catch {
    return false;
  }
}

export async function parseJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await request.json();
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export function fieldErrorsFromIssues(
  issues: readonly { path: readonly (string | number | symbol)[]; message: string }[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map((segment) => String(segment)).join(".") || "content";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}

export function tooLarge(request: Request, limitBytes: number): boolean {
  const length = Number(request.headers.get("content-length") ?? "0");
  return Number.isFinite(length) && length > limitBytes;
}
