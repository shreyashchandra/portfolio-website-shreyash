"use client";

import { useEffect, useMemo, useState } from "react";
import { profile } from "@/content/site";
import SectionHead from "./SectionHead";

type Day = { date: string; level: number; count: number };
type Repo = {
  name: string;
  html_url: string;
  language: string | null;
  pushed_at: string;
  stargazers_count: number;
  fork: boolean;
  description: string | null;
};
type Stats = { repos: number; followers: number; stars: number };

const CONTRIB_PROXY = "https://github-contrib-proxy.shreyash-chandra123.workers.dev/api/contrib";

/** Parses GitHub's contribution-calendar HTML. Counts live in <tool-tip for="cell-id"> text. */
function parseCalendar(html: string): Day[] {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const counts = new Map<string, number>();
  doc.querySelectorAll("tool-tip[for]").forEach((tip) => {
    const m = tip.textContent?.match(/^(\d[\d,]*) contribution/);
    counts.set(tip.getAttribute("for") ?? "", m ? parseInt(m[1].replace(/,/g, ""), 10) : 0);
  });
  const days: Day[] = [];
  doc.querySelectorAll("td[data-date][data-level]").forEach((td) => {
    days.push({
      date: td.getAttribute("data-date")!,
      level: Number(td.getAttribute("data-level")) || 0,
      count: counts.get(td.id) ?? 0,
    });
  });
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return "just now";
}

export default function GitHubActivity() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [repos, setRepos] = useState<Repo[] | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const user = profile.githubUser;
    const gh = { headers: { Accept: "application/vnd.github+json" } };

    fetch(`${CONTRIB_PROXY}?user=${user}`)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then((html) => setDays(parseCalendar(html)))
      .catch(() => setFailed(true));

    Promise.all([
      fetch(`https://api.github.com/users/${user}`, gh).then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, gh).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status)
      ),
    ])
      .then(([u, list]: [{ public_repos: number; followers: number }, Repo[]]) => {
        const own = list.filter((r) => !r.fork && r.name !== user);
        setStats({
          repos: u.public_repos,
          followers: u.followers,
          stars: own.reduce((s, r) => s + r.stargazers_count, 0),
        });
        setRepos(own.slice(0, 4));
      })
      .catch(() => setFailed(true));
  }, []);

  const { weeks, total, months } = useMemo(() => {
    if (!days?.length) return { weeks: [] as (Day | null)[][], total: 0, months: [] as { label: string; col: number }[] };
    const first = new Date(days[0].date + "T12:00:00");
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay()); // back to Sunday
    const weeks: (Day | null)[][] = [];
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    for (const d of days) {
      const dt = new Date(d.date + "T12:00:00");
      const col = Math.floor((dt.getTime() - start.getTime()) / (7 * 86400000));
      if (!weeks[col]) weeks[col] = Array(7).fill(null);
      weeks[col][dt.getDay()] = d;
      if (dt.getMonth() !== lastMonth && dt.getDate() <= 7) {
        months.push({ label: dt.toLocaleString("en-US", { month: "short" }), col });
        lastMonth = dt.getMonth();
      }
    }
    return { weeks, total: days.reduce((s, d) => s + d.count, 0), months };
  }, [days]);

  const showTip = (e: React.MouseEvent<HTMLElement> | React.FocusEvent<HTMLElement>, d: Day) => {
    const r = e.currentTarget.getBoundingClientRect();
    const date = new Date(d.date + "T12:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    setTip({
      x: r.left + r.width / 2,
      y: r.top,
      text: `${d.count === 0 ? "No" : d.count} contribution${d.count === 1 ? "" : "s"} · ${date}`,
    });
  };

  return (
    <section id="github" className="section">
      <SectionHead
        index="05"
        title="Commit log"
        aside={
          <a href={profile.github} target="_blank" rel="noopener noreferrer" className="link">
            @{profile.githubUser} ↗
          </a>
        }
      />

      <div className="gh" data-reveal>
        <dl className="gh__stats">
          <div>
            <dt>Contributions, last year</dt>
            <dd>{days ? total.toLocaleString() : "—"}</dd>
          </div>
          <div>
            <dt>Public repos</dt>
            <dd>{stats?.repos ?? "—"}</dd>
          </div>
          <div>
            <dt>Stars</dt>
            <dd>{stats?.stars ?? "—"}</dd>
          </div>
          <div>
            <dt>Followers</dt>
            <dd>{stats?.followers ?? "—"}</dd>
          </div>
        </dl>

        <div className="gh__graph-wrap">
          {weeks.length ? (
            <div className="gh__graph" style={{ "--weeks": weeks.length } as React.CSSProperties}>
              <div className="gh__months" aria-hidden="true">
                {months.map((m) => (
                  <span key={`${m.label}-${m.col}`} style={{ gridColumn: m.col + 1 }}>
                    {m.label}
                  </span>
                ))}
              </div>
              <div className="gh__cells" role="img" aria-label={`${total} contributions in the last year`}>
                {weeks.map((week, wi) =>
                  week.map((d, di) =>
                    d ? (
                      <span
                        key={d.date}
                        className="gh__cell"
                        data-level={d.level}
                        style={{ gridColumn: wi + 1, gridRow: di + 1, "--d": wi } as React.CSSProperties}
                        onMouseEnter={(e) => showTip(e, d)}
                        onMouseLeave={() => setTip(null)}
                      />
                    ) : null
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="gh__placeholder">
              {failed ? (
                <>
                  Couldn&apos;t reach GitHub right now.{" "}
                  <a href={profile.github} className="link" target="_blank" rel="noopener noreferrer">
                    View the profile ↗
                  </a>
                </>
              ) : (
                "Fetching commits…"
              )}
            </div>
          )}
          <div className="gh__legend" aria-hidden="true">
            Less
            {[0, 1, 2, 3, 4].map((l) => (
              <span key={l} className="gh__cell" data-level={l} />
            ))}
            More
          </div>
        </div>

        <div className="gh__repos">
          <span className="gh__repos-title">Recently pushed</span>
          <ul>
            {(repos ?? []).map((r) => (
              <li key={r.name}>
                <a href={r.html_url} target="_blank" rel="noopener noreferrer">
                  <span className="gh__repo-name">{r.name}</span>
                  <span className="gh__repo-meta">
                    {r.language ?? "—"} · {timeAgo(r.pushed_at)}
                  </span>
                </a>
              </li>
            ))}
            {!repos && !failed ? <li className="gh__repo-skel">Loading…</li> : null}
          </ul>
        </div>
      </div>

      {tip ? (
        <div className="gh__tip" style={{ left: tip.x, top: tip.y }} role="status">
          {tip.text}
        </div>
      ) : null}
    </section>
  );
}
