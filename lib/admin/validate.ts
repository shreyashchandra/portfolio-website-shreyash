// Validates admin edits before they are committed. Returns clean data or a readable error.
import type { Experience, Project, SiteData } from "@/content/types";

type Result = { ok: true; data: SiteData } | { ok: false; error: string };

class Invalid extends Error {}

function str(v: unknown, field: string, { max = 600, required = true } = {}): string {
  if (v === undefined || v === null) v = "";
  if (typeof v !== "string") throw new Invalid(`${field} must be text.`);
  const s = v.trim();
  if (required && !s) throw new Invalid(`${field} is required.`);
  if (s.length > max) throw new Invalid(`${field} is too long (max ${max} characters).`);
  return s;
}

function optUrl(v: unknown, field: string): string | undefined {
  const s = str(v, field, { max: 300, required: false });
  if (!s) return undefined;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    throw new Invalid(`${field} must be a full URL starting with https://`);
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Invalid(`${field} must be an http(s) URL.`);
  return s;
}

function list(v: unknown, field: string, { maxItems = 12, maxLen = 400 } = {}): string[] {
  if (!Array.isArray(v)) throw new Invalid(`${field} must be a list.`);
  const items = v.map((x, i) => str(x, `${field} #${i + 1}`, { max: maxLen, required: false })).filter(Boolean);
  if (items.length > maxItems) throw new Invalid(`${field} can have at most ${maxItems} items.`);
  return items;
}

function experience(v: unknown, i: number): Experience {
  if (!v || typeof v !== "object") throw new Invalid(`Experience #${i + 1} is malformed.`);
  const e = v as Record<string, unknown>;
  const label = `Experience #${i + 1}`;
  const out: Experience = {
    company: str(e.company, `${label} company`, { max: 80 }),
    role: str(e.role, `${label} role`, { max: 80 }),
    period: str(e.period, `${label} period`, { max: 40 }),
    summary: str(e.summary, `${label} summary`, { max: 200 }),
    points: list(e.points, `${label} bullet points`, { maxItems: 10, maxLen: 400 }),
    stack: list(e.stack, `${label} stack`, { maxItems: 12, maxLen: 40 }),
  };
  if (e.current === true) out.current = true;
  return out;
}

function project(v: unknown, i: number): Project {
  if (!v || typeof v !== "object") throw new Invalid(`Project #${i + 1} is malformed.`);
  const p = v as Record<string, unknown>;
  const label = `Project #${i + 1}`;
  const hue = Number(p.hue);
  if (!Number.isInteger(hue) || hue < 0 || hue > 360) throw new Invalid(`${label} colour must be 0–360.`);
  const out: Project = {
    name: str(p.name, `${label} name`, { max: 40 }),
    kind: str(p.kind, `${label} type`, { max: 60 }),
    year: str(p.year, `${label} year`, { max: 10 }),
    blurb: str(p.blurb, `${label} description`, { max: 400 }),
    stack: list(p.stack, `${label} stack`, { maxItems: 8, maxLen: 40 }),
    snippet: str(p.snippet, `${label} preview line`, { max: 60 }),
    hue,
  };
  const live = optUrl(p.live, `${label} live URL`);
  const code = optUrl(p.code, `${label} code URL`);
  const award = str(p.award, `${label} award`, { max: 60, required: false });
  if (live) out.live = live;
  if (code) out.code = code;
  if (award) out.award = award;
  if (!out.live && !out.code) throw new Invalid(`${label} needs a live URL or a code URL.`);
  return out;
}

export function validateSiteData(input: unknown): Result {
  try {
    if (!input || typeof input !== "object") throw new Invalid("Body must be an object.");
    const body = input as Record<string, unknown>;
    if (!Array.isArray(body.experience) || !Array.isArray(body.projects)) {
      throw new Invalid("Both experience and projects are required.");
    }
    if (body.experience.length > 20) throw new Invalid("At most 20 experience entries.");
    if (body.projects.length > 30) throw new Invalid("At most 30 projects.");
    return {
      ok: true,
      data: { experience: body.experience.map(experience), projects: body.projects.map(project) },
    };
  } catch (err) {
    if (err instanceof Invalid) return { ok: false, error: err.message };
    throw err;
  }
}
