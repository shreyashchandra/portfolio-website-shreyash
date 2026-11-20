import { guard } from "@/lib/admin/session";
import { ConflictError, readSiteData, storeMode, writeSiteData } from "@/lib/admin/store";
import { validateSiteData } from "@/lib/admin/validate";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const mode = storeMode();
  if (!mode) return Response.json({ error: "Saving is not configured (GITHUB_TOKEN / GITHUB_REPO)." }, { status: 503 });
  try {
    const { data, sha } = await readSiteData();
    return Response.json({ data, sha, mode });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Couldn't load content." }, { status: 502 });
  }
}

export async function PUT(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const body = (await req.json().catch(() => null)) as { data?: unknown; sha?: unknown } | null;
  if (!body || typeof body.sha !== "string") return Response.json({ error: "Missing data or version." }, { status: 400 });

  const result = validateSiteData(body.data);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  try {
    const saved = await writeSiteData(result.data, body.sha);
    return Response.json({ ok: true, ...saved, data: result.data });
  } catch (err) {
    if (err instanceof ConflictError) return Response.json({ error: err.message }, { status: 409 });
    console.error(err);
    return Response.json({ error: "Save failed. Check the server logs." }, { status: 502 });
  }
}
