import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  adminConfigured,
  checkPassword,
  createSessionToken,
  sameOrigin,
} from "@/lib/admin/session";

export async function POST(req: Request) {
  if (!adminConfigured()) return Response.json({ error: "Admin is not configured." }, { status: 503 });
  if (!sameOrigin(req)) return Response.json({ error: "Cross-origin request blocked." }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!checkPassword(password)) {
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 1200));
    return Response.json({ error: "Wrong password." }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  return Response.json({ ok: true });
}
