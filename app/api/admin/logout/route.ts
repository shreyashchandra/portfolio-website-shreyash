import { cookies } from "next/headers";
import { SESSION_COOKIE, sameOrigin } from "@/lib/admin/session";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return Response.json({ error: "Cross-origin request blocked." }, { status: 403 });
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
