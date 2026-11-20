"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Experience, Project, SiteData } from "@/content/types";

/* ---------- Form state ----------
   Lists are edited as raw text (one per line / comma-separated) and converted on save,
   so typing commas and new lines feels natural. */

type ExpForm = {
  id: string;
  company: string;
  role: string;
  period: string;
  summary: string;
  points: string;
  stack: string;
  current: boolean;
};
type ProjForm = {
  id: string;
  name: string;
  kind: string;
  year: string;
  blurb: string;
  stack: string;
  live: string;
  code: string;
  snippet: string;
  hue: number;
  award: string;
};

const uid = () => Math.random().toString(36).slice(2, 10);
const splitComma = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
const splitLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const toExpForm = (e: Experience): ExpForm => ({
  id: uid(),
  company: e.company,
  role: e.role,
  period: e.period,
  summary: e.summary,
  points: e.points.join("\n"),
  stack: e.stack.join(", "),
  current: !!e.current,
});
const fromExpForm = (f: ExpForm): Experience => ({
  company: f.company,
  role: f.role,
  period: f.period,
  summary: f.summary,
  points: splitLines(f.points),
  stack: splitComma(f.stack),
  ...(f.current ? { current: true } : {}),
});
const toProjForm = (p: Project): ProjForm => ({
  id: uid(),
  name: p.name,
  kind: p.kind,
  year: p.year,
  blurb: p.blurb,
  stack: p.stack.join(", "),
  live: p.live ?? "",
  code: p.code ?? "",
  snippet: p.snippet,
  hue: p.hue,
  award: p.award ?? "",
});
const fromProjForm = (f: ProjForm): Project => ({
  name: f.name,
  kind: f.kind,
  year: f.year,
  blurb: f.blurb,
  stack: splitComma(f.stack),
  snippet: f.snippet,
  hue: f.hue,
  ...(f.live.trim() ? { live: f.live.trim() } : {}),
  ...(f.code.trim() ? { code: f.code.trim() } : {}),
  ...(f.award.trim() ? { award: f.award.trim() } : {}),
});

const blankExp = (): ExpForm => ({
  id: uid(),
  company: "",
  role: "",
  period: "",
  summary: "",
  points: "",
  stack: "",
  current: false,
});
const blankProj = (): ProjForm => ({
  id: uid(),
  name: "",
  kind: "",
  year: String(new Date().getFullYear()),
  blurb: "",
  stack: "",
  live: "",
  code: "",
  snippet: "",
  hue: Math.floor(Math.random() * 360),
  award: "",
});

function move<T>(arr: T[], i: number, dir: -1 | 1) {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

type Tab = "experience" | "projects" | "resume";
type Toast = { kind: "ok" | "err"; text: string; link?: string | null } | null;

/* ---------- Small field components ---------- */

function Field({
  label,
  hint,
  children,
  wide,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`adm-field${wide ? " adm-field--wide" : ""}`}>
      <span>
        {label}
        {hint ? <em>{hint}</em> : null}
      </span>
      {children}
    </label>
  );
}

function ItemBar({
  title,
  sub,
  index,
  count,
  onMove,
  onRemove,
}: {
  title: string;
  sub: string;
  index: number;
  count: number;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <summary className="adm-item__bar">
      <span className="adm-item__idx">{String(index + 1).padStart(2, "0")}</span>
      <span className="adm-item__title">
        {title || <i>Untitled</i>}
        <small>{sub}</small>
      </span>
      <span className="adm-item__actions" onClick={(e) => e.preventDefault()}>
        <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Move up">
          ↑
        </button>
        <button type="button" onClick={() => onMove(1)} disabled={index === count - 1} aria-label="Move down">
          ↓
        </button>
        <button
          type="button"
          className="adm-danger"
          onClick={() => {
            if (confirm(`Remove "${title || "this item"}"?`)) onRemove();
          }}
          aria-label="Remove"
        >
          Remove
        </button>
      </span>
    </summary>
  );
}

/* ---------- App ---------- */

export default function AdminApp() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("experience");
  const [exp, setExp] = useState<ExpForm[]>([]);
  const [proj, setProj] = useState<ProjForm[]>([]);
  const [sha, setSha] = useState<string | null>(null);
  const [mode, setMode] = useState<"github" | "local" | null>(null);
  const [baseline, setBaseline] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const snapshot = useMemo(
    () => JSON.stringify({ experience: exp.map(fromExpForm), projects: proj.map(fromProjForm) }),
    [exp, proj]
  );
  const dirty = baseline !== "" && snapshot !== baseline;

  const apply = useCallback((data: SiteData, newSha: string) => {
    const e = data.experience.map(toExpForm);
    const p = data.projects.map(toProjForm);
    setExp(e);
    setProj(p);
    setSha(newSha);
    setBaseline(JSON.stringify({ experience: e.map(fromExpForm), projects: p.map(fromProjForm) }));
  }, []);

  const load = useCallback(async () => {
    setLoadError(null);
    const res = await fetch("/api/admin/content", { cache: "no-store" }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as
      | { data: SiteData; sha: string; mode: "github" | "local"; error?: string }
      | null;
    if (res?.status === 401) return router.refresh();
    if (!res?.ok || !json?.data) return setLoadError(json?.error ?? "Couldn't load content.");
    setMode(json.mode);
    apply(json.data, json.sha);
  }, [apply, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.kind === "ok" ? 9000 : 12000);
    return () => clearTimeout(t);
  }, [toast]);

  const liveNote = mode === "github" ? "Live in about a minute, once Vercel redeploys." : "Written to content/data.json.";

  const save = async () => {
    if (!sha) return;
    setSaving(true);
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sha, data: JSON.parse(snapshot) }),
    }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as
      | { sha: string; data: SiteData; commitUrl: string | null; error?: string }
      | null;
    setSaving(false);
    if (res?.status === 401) return router.refresh();
    if (!res?.ok || !json?.sha) {
      setToast({ kind: "err", text: json?.error ?? "Save failed." });
      return;
    }
    apply(json.data, json.sha);
    setToast({ kind: "ok", text: `Saved. ${liveNote}`, link: json.commitUrl });
  };

  const discard = () => {
    if (!confirm("Discard all unsaved changes?")) return;
    const data = JSON.parse(baseline) as SiteData;
    setExp(data.experience.map(toExpForm));
    setProj(data.projects.map(toProjForm));
  };

  const logout = async () => {
    if (dirty && !confirm("You have unsaved changes. Sign out anyway?")) return;
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.refresh();
  };

  const updExp = (id: string, patch: Partial<ExpForm>) =>
    setExp((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const updProj = (id: string, patch: Partial<ProjForm>) =>
    setProj((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  return (
    <main className="adm">
      <header className="adm-head">
        <div className="adm-head__left">
          <span className="nav__mark" aria-hidden="true">
            SC
          </span>
          <h1>Admin</h1>
          {mode ? (
            <span className="adm-badge">
              <span className="pulse" aria-hidden="true" />
              {mode === "github" ? "Saves to GitHub" : "Local files (dev)"}
            </span>
          ) : null}
        </div>
        <div className="adm-head__right">
          <a className="link" href="/" target="_blank" rel="noopener noreferrer">
            View site ↗
          </a>
          <button className="btn" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <nav className="adm-tabs" role="tablist">
        {(
          [
            ["experience", `Experience · ${exp.length}`],
            ["projects", `Projects · ${proj.length}`],
            ["resume", "Résumé"],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className={tab === key ? "is-active" : ""} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </nav>

      {loadError ? (
        <div className="adm-card adm-error-box">
          <p>{loadError}</p>
          <button className="btn" onClick={load}>
            Retry
          </button>
        </div>
      ) : !sha ? (
        <p className="adm-muted adm-pad">Loading content…</p>
      ) : (
        <>
          {tab === "experience" ? (
            <section className="adm-list">
              <p className="adm-muted">Newest first. The order here is the order on the site.</p>
              {exp.map((e, i) => (
                <details key={e.id} className="adm-item" open={!e.company}>
                  <ItemBar
                    title={e.company}
                    sub={`${e.role}${e.period ? ` · ${e.period}` : ""}${e.current ? " · current" : ""}`}
                    index={i}
                    count={exp.length}
                    onMove={(d) => setExp((l) => move(l, i, d))}
                    onRemove={() => setExp((l) => l.filter((x) => x.id !== e.id))}
                  />
                  <div className="adm-grid">
                    <Field label="Company">
                      <input value={e.company} onChange={(ev) => updExp(e.id, { company: ev.target.value })} />
                    </Field>
                    <Field label="Role">
                      <input value={e.role} onChange={(ev) => updExp(e.id, { role: ev.target.value })} />
                    </Field>
                    <Field label="Period" hint="e.g. Apr 2025 — Aug 2026">
                      <input value={e.period} onChange={(ev) => updExp(e.id, { period: ev.target.value })} />
                    </Field>
                    <label className="adm-check">
                      <input type="checkbox" checked={e.current} onChange={(ev) => updExp(e.id, { current: ev.target.checked })} />
                      Current role (shows the green “Now” badge)
                    </label>
                    <Field label="One-line summary" wide>
                      <input value={e.summary} onChange={(ev) => updExp(e.id, { summary: ev.target.value })} />
                    </Field>
                    <Field label="Bullet points" hint="one per line" wide>
                      <textarea rows={5} value={e.points} onChange={(ev) => updExp(e.id, { points: ev.target.value })} />
                    </Field>
                    <Field label="Stack" hint="comma-separated" wide>
                      <input value={e.stack} onChange={(ev) => updExp(e.id, { stack: ev.target.value })} />
                    </Field>
                  </div>
                </details>
              ))}
              <button className="adm-add" onClick={() => setExp((l) => [blankExp(), ...l])}>
                + Add role at the top
              </button>
            </section>
          ) : null}

          {tab === "projects" ? (
            <section className="adm-list">
              <p className="adm-muted">The order here is the order on the site.</p>
              {proj.map((p, i) => (
                <details key={p.id} className="adm-item" open={!p.name}>
                  <ItemBar
                    title={p.name}
                    sub={`${p.kind}${p.year ? ` · ${p.year}` : ""}`}
                    index={i}
                    count={proj.length}
                    onMove={(d) => setProj((l) => move(l, i, d))}
                    onRemove={() => setProj((l) => l.filter((x) => x.id !== p.id))}
                  />
                  <div className="adm-grid">
                    <Field label="Name">
                      <input value={p.name} onChange={(ev) => updProj(p.id, { name: ev.target.value })} />
                    </Field>
                    <Field label="Type" hint="e.g. Chrome extension">
                      <input value={p.kind} onChange={(ev) => updProj(p.id, { kind: ev.target.value })} />
                    </Field>
                    <Field label="Year">
                      <input value={p.year} onChange={(ev) => updProj(p.id, { year: ev.target.value })} />
                    </Field>
                    <Field label="Award" hint="optional">
                      <input value={p.award} onChange={(ev) => updProj(p.id, { award: ev.target.value })} />
                    </Field>
                    <Field label="Description" wide>
                      <textarea rows={3} value={p.blurb} onChange={(ev) => updProj(p.id, { blurb: ev.target.value })} />
                    </Field>
                    <Field label="Stack" hint="comma-separated" wide>
                      <input value={p.stack} onChange={(ev) => updProj(p.id, { stack: ev.target.value })} />
                    </Field>
                    <Field label="Live URL">
                      <input type="url" placeholder="https://" value={p.live} onChange={(ev) => updProj(p.id, { live: ev.target.value })} />
                    </Field>
                    <Field label="Code URL">
                      <input type="url" placeholder="https://github.com/…" value={p.code} onChange={(ev) => updProj(p.id, { code: ev.target.value })} />
                    </Field>
                    <Field label="Preview line" hint="shown in the hover card">
                      <input value={p.snippet} onChange={(ev) => updProj(p.id, { snippet: ev.target.value })} />
                    </Field>
                    <Field label="Preview colour">
                      <div className="adm-hue">
                        <input
                          type="range"
                          min={0}
                          max={360}
                          value={p.hue}
                          onChange={(ev) => updProj(p.id, { hue: Number(ev.target.value) })}
                        />
                        <span className="adm-swatch" style={{ "--h": p.hue } as React.CSSProperties} />
                      </div>
                    </Field>
                  </div>
                </details>
              ))}
              <button className="adm-add" onClick={() => setProj((l) => [...l, blankProj()])}>
                + Add project
              </button>
            </section>
          ) : null}

          {tab === "resume" ? <ResumePanel mode={mode} onToast={setToast} onUnauthorized={() => router.refresh()} /> : null}
        </>
      )}

      {tab !== "resume" && sha ? (
        <div className={`adm-savebar${dirty ? " is-dirty" : ""}`}>
          <span>{dirty ? "Unsaved changes" : "All changes saved"}</span>
          <div>
            <button className="btn" onClick={discard} disabled={!dirty || saving}>
              Discard
            </button>
            <button className="btn btn--fill" onClick={save} disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save & publish"}
            </button>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className={`adm-toast adm-toast--${toast.kind}`} role="status">
          {toast.text}
          {toast.link ? (
            <a href={toast.link} target="_blank" rel="noopener noreferrer" className="link">
              View commit ↗
            </a>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}

/* ---------- Résumé ---------- */

function ResumePanel({
  mode,
  onToast,
  onUnauthorized,
}: {
  mode: "github" | "local" | null;
  onToast: (t: Toast) => void;
  onUnauthorized: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const upload = async () => {
    if (!file) return;
    setBusy(true);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/admin/resume", { method: "POST", body: form }).catch(() => null);
    const json = (await res?.json().catch(() => null)) as { commitUrl?: string | null; error?: string } | null;
    setBusy(false);
    if (res?.status === 401) return onUnauthorized();
    if (!res?.ok) return onToast({ kind: "err", text: json?.error ?? "Upload failed." });
    setFile(null);
    onToast({
      kind: "ok",
      text: mode === "github" ? "Résumé uploaded. Live in about a minute, once Vercel redeploys." : "Résumé saved to public/.",
      link: json?.commitUrl,
    });
  };

  return (
    <section className="adm-card adm-resume">
      <h2>Résumé</h2>
      <p className="adm-muted">
        Replaces <code>Shreyash_Chandra_CV.pdf</code>, the file behind every Résumé link on the site. PDF only, under 4 MB.
      </p>
      <a className="link" href="/Shreyash_Chandra_CV.pdf" target="_blank" rel="noopener noreferrer">
        Open the current résumé ↗
      </a>
      <label className={`adm-drop${file ? " has-file" : ""}`}>
        <input type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <span>{file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : "Choose a PDF…"}</span>
      </label>
      <button className="btn btn--fill" onClick={upload} disabled={!file || busy}>
        {busy ? "Uploading…" : "Upload & publish"}
      </button>
    </section>
  );
}
