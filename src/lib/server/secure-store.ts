import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  pbkdf2,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import type { SmtpSettings } from "@/lib/form-schemas";

const pbkdf2Async = promisify(pbkdf2);
const STORE_VERSION = 1;
const PASSWORD_ITERATIONS = 310_000;
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
const SESSION_COOKIE = "tarcin_admin_session";

interface PasswordHash {
  salt: string;
  hash: string;
}

interface SecureStore {
  version: typeof STORE_VERSION;
  sessionVersion: number;
  smtpSettings?: SmtpSettings;
  adminPasswordHash?: PasswordHash;
}

interface EncryptedEnvelope {
  version: typeof STORE_VERSION;
  iv: string;
  tag: string;
  ciphertext: string;
}

interface SessionClaims {
  sub: string;
  exp: number;
  ver: number;
}

export class SecureStoreConfigurationError extends Error {
  constructor() {
    super("Secure server settings are not configured.");
    this.name = "SecureStoreConfigurationError";
  }
}

function getStorePath(): string {
  return resolve(process.env["SMTP_SETTINGS_FILE"] || ".private/smtp-settings.enc");
}

function getEncryptionKey(): Buffer {
  const value = process.env["SMTP_SETTINGS_ENCRYPTION_KEY"]?.trim();
  if (!value) throw new SecureStoreConfigurationError();

  const key = /^[\da-f]{64}$/i.test(value)
    ? Buffer.from(value, "hex")
    : Buffer.from(value, "base64");
  if (key.length !== 32) throw new SecureStoreConfigurationError();
  return key;
}

function getSessionSecret(): string {
  const value = process.env["ADMIN_SESSION_SECRET"];
  if (!value || value.length < 32) throw new SecureStoreConfigurationError();
  return value;
}

function emptyStore(): SecureStore {
  return { version: STORE_VERSION, sessionVersion: 0 };
}

async function storeExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readStore(): Promise<SecureStore> {
  const path = getStorePath();
  if (!(await storeExists(path))) return emptyStore();

  try {
    const envelope = JSON.parse(await readFile(path, "utf8")) as EncryptedEnvelope;
    if (envelope.version !== STORE_VERSION) throw new Error("Unsupported secure-store version");

    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(envelope.iv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
    const cleartext = Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64")),
      decipher.final(),
    ]).toString("utf8");
    const parsed = JSON.parse(cleartext) as SecureStore;
    if (parsed.version !== STORE_VERSION || !Number.isInteger(parsed.sessionVersion)) {
      throw new Error("Invalid secure-store payload");
    }
    return parsed;
  } catch {
    throw new SecureStoreConfigurationError();
  }
}

async function writeStore(store: SecureStore): Promise<void> {
  const path = getStorePath();
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(store), "utf8"),
    cipher.final(),
  ]);
  const envelope: EncryptedEnvelope = {
    version: STORE_VERSION,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };

  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const temporaryPath = `${path}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(envelope), { encoding: "utf8", mode: 0o600 });
  await rename(temporaryPath, path);
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getAdminUsername(): string {
  const username = process.env["ADMIN_USERNAME"]?.trim();
  if (!username || username.length > 254) throw new SecureStoreConfigurationError();
  return username;
}

function makeCookie(token: string, production: boolean): string {
  const secure = production ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function createAdminSessionCookie(token: string): string {
  return makeCookie(token, process.env["NODE_ENV"] === "production");
}

export function clearAdminSessionCookie(): string {
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/api/admin; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

function getCookie(request: Request, name: string): string | undefined {
  const cookies = request.headers.get("cookie")?.split(";") ?? [];
  const match = cookies.map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return match?.slice(name.length + 1);
}

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  const expectedUsername = getAdminUsername();
  const usernameValid = constantTimeEqual(username.trim().toLowerCase(), expectedUsername.toLowerCase());
  const store = await readStore();
  let passwordValid = false;

  if (store.adminPasswordHash) {
    const salt = Buffer.from(store.adminPasswordHash.salt, "base64");
    const expectedHash = Buffer.from(store.adminPasswordHash.hash, "base64");
    const actualHash = (await pbkdf2Async(password, salt, PASSWORD_ITERATIONS, 32, "sha256")) as Buffer;
    passwordValid = expectedHash.length === actualHash.length && timingSafeEqual(expectedHash, actualHash);
  } else {
    const expectedPassword = process.env["ADMIN_PASSWORD"];
    if (!expectedPassword || expectedPassword.length < 12) throw new SecureStoreConfigurationError();
    passwordValid = constantTimeEqual(password, expectedPassword);
  }

  return usernameValid && passwordValid;
}

export async function createAdminSessionToken(username: string): Promise<string> {
  const secret = getSessionSecret();
  const store = await readStore();
  const claims: SessionClaims = {
    sub: getAdminUsername(),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
    ver: store.sessionVersion,
  };
  if (username.trim().toLowerCase() !== claims.sub.toLowerCase()) {
    throw new SecureStoreConfigurationError();
  }

  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export async function isAdminRequest(request: Request): Promise<boolean> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return false;

  try {
    const [payload, providedSignature, extra] = token.split(".");
    if (!payload || !providedSignature || extra !== undefined) return false;
    const expectedSignature = createHmac("sha256", getSessionSecret()).update(payload).digest();
    const signature = Buffer.from(providedSignature, "base64url");
    if (signature.length !== expectedSignature.length || !timingSafeEqual(signature, expectedSignature)) return false;

    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionClaims;
    if (!claims.sub || claims.exp <= Math.floor(Date.now() / 1000) || !Number.isInteger(claims.ver)) return false;
    if (claims.sub.toLowerCase() !== getAdminUsername().toLowerCase()) return false;
    const store = await readStore();
    return claims.ver === store.sessionVersion;
  } catch {
    return false;
  }
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<string | null> {
  if (!(await authenticateAdmin(getAdminUsername(), currentPassword))) return null;

  const salt = randomBytes(16);
  const hash = (await pbkdf2Async(newPassword, salt, PASSWORD_ITERATIONS, 32, "sha256")) as Buffer;
  const store = await readStore();
  const nextStore: SecureStore = {
    ...store,
    adminPasswordHash: {
      salt: salt.toString("base64"),
      hash: hash.toString("base64"),
    },
    sessionVersion: store.sessionVersion + 1,
  };
  await writeStore(nextStore);
  return createAdminSessionToken(getAdminUsername());
}

export interface SmtpSettingsDraft {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  mailFrom: string;
  mailTo: string;
  hasPassword: boolean;
  configured: boolean;
}

function parseEnvBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value.trim() === "") return fallback;
  return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
}

function getEnvironmentSmtpSettings(): SmtpSettings | null {
  const port = Number(process.env["SMTP_PORT"] || 587);
  const candidate = {
    host: process.env["SMTP_HOST"]?.trim() ?? "",
    port,
    secure: parseEnvBoolean(process.env["SMTP_SECURE"] ?? process.env["SMTP_TLS"], port === 465),
    user: process.env["SMTP_USER"]?.trim() ?? "",
    password: process.env["SMTP_PASS"] ?? "",
    mailFrom: process.env["MAIL_FROM"]?.trim() ?? "",
    mailTo: process.env["MAIL_TO"]?.trim() ?? "",
  };
  return candidate.host && candidate.user && candidate.password && candidate.mailFrom && candidate.mailTo
    ? candidate
    : null;
}

export async function getSmtpSettings(): Promise<SmtpSettings | null> {
  const store = await readStore();
  return store.smtpSettings ?? getEnvironmentSmtpSettings();
}

export async function getSmtpSettingsDraft(): Promise<SmtpSettingsDraft> {
  const store = await readStore();
  const saved = store.smtpSettings;
  const environment = saved ? null : getEnvironmentSmtpSettings();
  const host = saved?.host ?? environment?.host ?? process.env["SMTP_HOST"]?.trim() ?? "";
  const port = saved?.port ?? environment?.port ?? Number(process.env["SMTP_PORT"] || 587);
  const secure = saved?.secure ?? environment?.secure ?? parseEnvBoolean(process.env["SMTP_SECURE"] ?? process.env["SMTP_TLS"], Number(process.env["SMTP_PORT"] || 587) === 465);
  const user = saved?.user ?? environment?.user ?? process.env["SMTP_USER"]?.trim() ?? "";
  const password = saved?.password ?? environment?.password ?? process.env["SMTP_PASS"] ?? "";
  const mailFrom = saved?.mailFrom ?? environment?.mailFrom ?? process.env["MAIL_FROM"]?.trim() ?? "";
  const mailTo = saved?.mailTo ?? environment?.mailTo ?? process.env["MAIL_TO"]?.trim() ?? "";

  return {
    host,
    port: Number.isInteger(port) && port >= 1 && port <= 65535 ? port : 587,
    secure,
    user,
    mailFrom,
    mailTo,
    hasPassword: Boolean(password),
    configured: Boolean(host && user && password && mailFrom && mailTo),
  };
}

export async function saveSmtpSettings(settings: SmtpSettings): Promise<void> {
  const store = await readStore();
  await writeStore({ ...store, smtpSettings: settings });
}
