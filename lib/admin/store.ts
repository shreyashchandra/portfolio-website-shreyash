// Where admin edits are saved.
//  - Production: committed to the GitHub repo via the Contents API → Vercel redeploys automatically.
//  - Local dev (no GITHUB_TOKEN): written straight to the files on disk.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteData } from "@/content/types";

export const DATA_PATH = "content/data.json";
export const RESUME_PATH = "public/Shreyash_Chandra_CV.pdf";

export class ConflictError extends Error {}

export type StoreMode = "github" | "local";

export function storeMode(): StoreMode | null {
  if (process.env.GITHUB_TOKEN && process.env.GITHUB_REPO) return "github";
  if (process.env.NODE_ENV === "development") return "local";
  return null;
}

/* ---------- GitHub ---------- */

const branch = () => process.env.GITHUB_BRANCH || "main";

async function gh(pathname: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${pathname}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  return res;
}

async function ghGetSha(pathname: string): Promise<string | null> {
  const res = await gh(`${pathname}?ref=${encodeURIComponent(branch())}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const json = (await res.json()) as { sha: string };
  return json.sha;
}

async function ghPut(pathname: string, contentBase64: string, message: string, sha: string | null) {
  const res = await gh(pathname, {
    method: "PUT",
    body: JSON.stringify({ message, content: contentBase64, branch: branch(), ...(sha ? { sha } : {}) }),
  });
  if (res.status === 409 || res.status === 422) {
    throw new ConflictError("The file changed on GitHub since you loaded it. Reload and try again.");
  }
  if (!res.ok) throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
  const json = (await res.json()) as { content: { sha: string }; commit: { html_url: string } };
  return { sha: json.content.sha, commitUrl: json.commit.html_url };
}

/* ---------- Local ---------- */

// Local mode only runs in `next dev`; keep the bundler from tracing the whole project for it.
const abs = (p: string) => path.join(/*turbopackIgnore: true*/ process.cwd(), p);
const digest = (s: string | Buffer) => createHash("sha1").update(s).digest("hex");

/* ---------- Public API ---------- */

export async function readSiteData(): Promise<{ data: SiteData; sha: string }> {
  const mode = storeMode();
  if (mode === "github") {
    const res = await gh(`${DATA_PATH}?ref=${encodeURIComponent(branch())}`);
    if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
    const json = (await res.json()) as { content: string; sha: string };
    const text = Buffer.from(json.content, "base64").toString("utf8");
    return { data: JSON.parse(text) as SiteData, sha: json.sha };
  }
  if (mode === "local") {
    const text = await readFile(abs(DATA_PATH), "utf8");
    return { data: JSON.parse(text) as SiteData, sha: digest(text) };
  }
  throw new Error("No content store configured.");
}

export async function writeSiteData(data: SiteData, expectedSha: string) {
  const text = JSON.stringify(data, null, 2) + "\n";
  const mode = storeMode();
  if (mode === "github") {
    return ghPut(DATA_PATH, Buffer.from(text).toString("base64"), "content: update experience & projects via admin", expectedSha);
  }
  if (mode === "local") {
    const current = await readFile(abs(DATA_PATH), "utf8");
    if (digest(current) !== expectedSha) {
      throw new ConflictError("The file changed on disk since you loaded it. Reload and try again.");
    }
    await writeFile(abs(DATA_PATH), text);
    return { sha: digest(text), commitUrl: null };
  }
  throw new Error("No content store configured.");
}

export async function writeResume(pdf: Buffer) {
  const mode = storeMode();
  if (mode === "github") {
    const sha = await ghGetSha(RESUME_PATH);
    return ghPut(RESUME_PATH, pdf.toString("base64"), "content: update résumé via admin", sha);
  }
  if (mode === "local") {
    await writeFile(abs(RESUME_PATH), pdf);
    return { sha: digest(pdf), commitUrl: null };
  }
  throw new Error("No content store configured.");
}
