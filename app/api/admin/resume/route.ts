import { guard } from "@/lib/admin/session";
import { storeMode, writeResume } from "@/lib/admin/store";

export const dynamic = "force-dynamic";

// Vercel caps request bodies at ~4.5 MB; keep a margin.
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  if (!storeMode()) return Response.json({ error: "Saving is not configured." }, { status: 503 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "Choose a PDF to upload." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "PDF must be under 4 MB." }, { status: 413 });

  const bytes = Buffer.from(await file.arrayBuffer());
  // Check the actual file signature, not just the name or MIME type.
  if (bytes.subarray(0, 5).toString("latin1") !== "%PDF-") {
    return Response.json({ error: "That file isn't a PDF." }, { status: 400 });
  }

  try {
    const saved = await writeResume(bytes);
    return Response.json({ ok: true, ...saved, size: bytes.length });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Upload failed. Check the server logs." }, { status: 502 });
  }
}
