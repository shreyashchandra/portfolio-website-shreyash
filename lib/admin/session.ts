// Owner-only admin auth: one password (env var) → signed, httpOnly session cookie.
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "sc_admin";
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

/** Admin is disabled unless both secrets are configured. */
export function adminConfigured() {
  const pw = process.env.ADMIN_PASSWORD ?? "";
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  return pw.length >= 12 && secret.length >= 32;
}

function hmac(value: string) {
  return createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  // Hash first so lengths always match and timing doesn't leak length.
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string) {
  if (!adminConfigured()) return false;
  return safeEqual(input, process.env.ADMIN_PASSWORD!);
}

export function createSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${exp}.${hmac(String(exp))}`;
}

export function verifySessionToken(token: string | undefined) {
  if (!token || !adminConfigured()) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now() / 1000 || !sig) return false;
  return safeEqual(sig, hmac(expStr));
}

export async function isAdmin() {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}

/** Blocks cross-site form posts: mutating requests must come from this site. */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Shared guard for admin API routes. Returns an error Response, or null if the request may proceed. */
export async function guard(req: Request) {
  if (!adminConfigured()) return Response.json({ error: "Admin is not configured." }, { status: 503 });
  if (req.method !== "GET" && !sameOrigin(req)) {
    return Response.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }
  if (!(await isAdmin())) return Response.json({ error: "Not signed in." }, { status: 401 });
  return null;
}
