// asset/main.js
import "./styles/styles.css";
import { getProjects, getExperience, esc } from "./data.js";

const controls = document.querySelectorAll(".control");
const themeBtn = document.querySelector(".theme-btn");

function setupNavigation() {
  controls.forEach((control) => {
    control.addEventListener("click", (event) => {
      event.preventDefault();

      const id = control.dataset.id;
      if (id) {
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }

      const current = document.querySelector(".control.active-btn");
      if (current) current.classList.remove("active-btn");
      control.classList.add("active-btn");
    });
  });
}

function setupThemeToggle() {
  if (!themeBtn) return;
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
  });
}

/* ============================================================
   GITHUB PROFILE CARD
   ============================================================ */

async function fetchGithubProfile(username) {
  const ts = Date.now();
  const res = await fetch(`https://api.github.com/users/${username}?ts=${ts}`, {
    headers: { Accept: "application/vnd.github+json" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`GitHub profile error: ${res.status}`);
  return res.json();
}

async function fetchGithubRepos(username) {
  const ts = Date.now();
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&ts=${ts}`,
    {
      headers: { Accept: "application/vnd.github+json" },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`GitHub repos error: ${res.status}`);
  return res.json();
}

async function fetchGithubContributions(username) {
  const ts = Date.now();
  const url = `https://github-contrib-proxy.shreyash-chandra123.workers.dev/api/contrib?user=${username}&t=${ts}`;

  const res = await fetch(url, { cache: "no-store" });
  const html = await res.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  return doc.querySelectorAll("td[data-date][data-level]");
}

/* ============================================================
   TOOLTIP HELPER
   ============================================================ */

function positionTooltip(target, tooltip) {
  const rect = target.getBoundingClientRect();
  const tipW = tooltip.offsetWidth;
  const tipH = tooltip.offsetHeight;

  let left = rect.left + rect.width / 2 - tipW / 2;
  let top = rect.top - tipH - 8;

  if (top < 8) top = rect.bottom + 8;
  if (left < 4) left = 4;
  if (left + tipW > window.innerWidth - 4) left = window.innerWidth - tipW - 4;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

/* ============================================================
   BUILD CONTRIBUTION GRAPH (v2 — interactive)
   ============================================================ */

function buildContributionGraph(cells) {
  const CELL = 13;
  const GAP = 3;
  const WEEK_W = CELL + GAP; // 16px per week column

  const cellsArray = Array.from(cells);

  /* total contributions */
  const total = cellsArray.reduce(
    (sum, c) => sum + (parseInt(c.getAttribute("data-count")) || 0),
    0
  );

  /* group by week index */
  const weeks = {};
  cellsArray.forEach((c) => {
    const ix = c.getAttribute("data-ix");
    if (ix == null) return;
    if (!weeks[ix]) weeks[ix] = [];
    weeks[ix].push(c);
  });

  const sorted = Object.keys(weeks).sort((a, b) => Number(a) - Number(b));
  if (sorted.length === 0) return document.createElement("div");

  const firstIx = Number(sorted[0]);

  /* month markers */
  const MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const seenMonths = new Set();
  const monthMarkers = [];

  sorted.forEach((wk) => {
    const colOffset = Number(wk) - firstIx;
    weeks[wk].forEach((c) => {
      const dateStr = c.getAttribute("data-date");
      if (!dateStr) return;
      const d = new Date(dateStr + "T12:00:00");
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seenMonths.has(key)) {
        seenMonths.add(key);
        monthMarkers.push({ label: MONTHS[d.getMonth()], colOffset });
      }
    });
  });

  /* ---- build DOM ---- */
  const wrapper = document.createElement("div");
  wrapper.className = "gh-contrib-wrapper";

  /* stats line */
  const statsLine = document.createElement("div");
  statsLine.className = "gh-contrib-stats";
  statsLine.textContent = `${total.toLocaleString()} contributions in the last year`;
  wrapper.appendChild(statsLine);

  /* body: day-labels + scrollable */
  const body = document.createElement("div");
  body.className = "gh-contrib-body";

  /* day labels */
  const dayLabelEl = document.createElement("div");
  dayLabelEl.className = "gh-contrib-day-labels";
  ["", "Mon", "", "Wed", "", "Fri", ""].forEach((lbl) => {
    const s = document.createElement("span");
    s.textContent = lbl;
    dayLabelEl.appendChild(s);
  });
  body.appendChild(dayLabelEl);

  /* scrollable area */
  const scrollable = document.createElement("div");
  scrollable.className = "gh-contrib-scrollable";

  /* month labels (absolute positioned over graph) */
  const monthRow = document.createElement("div");
  monthRow.className = "gh-contrib-months";
  monthMarkers.forEach(({ label, colOffset }) => {
    const s = document.createElement("span");
    s.className = "gh-contrib-month";
    s.textContent = label;
    s.style.left = `${colOffset * WEEK_W}px`;
    monthRow.appendChild(s);
  });
  scrollable.appendChild(monthRow);

  /* graph grid */
  const graph = document.createElement("div");
  graph.className = "gh-contrib-graph";

  /* shared tooltip (one per page) */
  let tooltip = document.getElementById("gh-contrib-tip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.id = "gh-contrib-tip";
    tooltip.className = "gh-contrib-tooltip";
    document.body.appendChild(tooltip);
  }

  const COLORS = {
    0: "var(--gh-l0)",
    1: "var(--gh-l1)",
    2: "var(--gh-l2)",
    3: "var(--gh-l3)",
    4: "var(--gh-l4)",
  };

  sorted.forEach((wk, weekIdx) => {
    const col = document.createElement("div");
    col.className = "gh-contrib-week";
    col.style.animationDelay = `${weekIdx * 8}ms`;

    weeks[wk].forEach((cellData) => {
      const div = document.createElement("div");
      div.className = "gh-contrib-cell";

      const level = cellData.getAttribute("data-level") || "0";
      const count = parseInt(cellData.getAttribute("data-count")) || 0;
      const dateStr = cellData.getAttribute("data-date") || "";

      div.style.background = COLORS[level] || COLORS[0];

      const dateLabel = dateStr
        ? new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "";
      const countLabel =
        count === 0
          ? "No contributions"
          : `${count} contribution${count !== 1 ? "s" : ""}`;

      div.addEventListener("mouseenter", () => {
        tooltip.innerHTML = `<strong>${countLabel}</strong>${
          dateLabel ? `<br><span>${dateLabel}</span>` : ""
        }`;
        tooltip.style.display = "block";
        positionTooltip(div, tooltip);
        tooltip.classList.add("visible");
      });

      div.addEventListener("mouseleave", () => {
        tooltip.classList.remove("visible");
        tooltip.style.display = "none";
      });

      col.appendChild(div);
    });

    graph.appendChild(col);
  });

  scrollable.appendChild(graph);
  body.appendChild(scrollable);
  wrapper.appendChild(body);

  /* legend */
  const legend = document.createElement("div");
  legend.className = "gh-contrib-legend";
  legend.innerHTML = `
    <span>Less</span>
    ${[0, 1, 2, 3, 4]
      .map((l) => `<div class="gh-legend-cell" style="background:var(--gh-l${l})"></div>`)
      .join("")}
    <span>More</span>
  `;
  wrapper.appendChild(legend);

  return wrapper;
}

/* ============================================================
   BUILD THE ENTIRE GITHUB CARD
   ============================================================ */

function buildGithubCard(container, profile, repos, rects) {
  container.innerHTML = "";

  const totalStars = repos.reduce(
    (sum, r) => sum + (r.stargazers_count || 0),
    0
  );
  const topStarred = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 3);

  /* HEADER */
  const header = document.createElement("div");
  header.className = "gh-header";

  const avatar = document.createElement("img");
  avatar.className = "gh-avatar";
  avatar.src = profile.avatar_url;

  const identity = document.createElement("div");
  identity.className = "gh-identity";

  const name = document.createElement("div");
  name.className = "gh-name";
  name.textContent = profile.name || profile.login;

  const uname = document.createElement("div");
  uname.className = "gh-username";
  uname.textContent = `@${profile.login}`;

  identity.appendChild(name);
  identity.appendChild(uname);

  header.appendChild(avatar);
  header.appendChild(identity);

  container.appendChild(header);

  if (profile.bio) {
    const bio = document.createElement("p");
    bio.className = "gh-bio";
    bio.textContent = profile.bio;
    container.appendChild(bio);
  }

  /* STATS */
  const stats = document.createElement("div");
  stats.className = "gh-stats";

  function stat(label, value) {
    const wrap = document.createElement("div");
    wrap.className = "gh-stat";

    wrap.innerHTML = `
      <div class="gh-stat-value">${value}</div>
      <div class="gh-stat-label">${label}</div>
    `;

    return wrap;
  }

  stats.appendChild(stat("Followers", profile.followers));
  stats.appendChild(stat("Repos", profile.public_repos));
  stats.appendChild(stat("Stars", totalStars));

  container.appendChild(stats);

  /* CONTRIBUTION GRAPH */
  const graph = buildContributionGraph(rects);
  container.appendChild(graph);

  /* HIGHLIGHTED REPOS */
  const highlights = document.createElement("div");
  highlights.className = "gh-highlights";

  const title = document.createElement("div");
  title.className = "gh-highlights-title";
  title.textContent = "Highlighted Repos";

  highlights.appendChild(title);

  const list = document.createElement("div");
  list.className = "gh-highlight-list";

  topStarred.forEach((repo) => {
    const item = document.createElement("a");
    item.className = "gh-highlight-item";
    item.href = repo.html_url;
    item.target = "_blank";

    item.innerHTML = `
      <div class="gh-highlight-name">${repo.name}</div>
      <div class="gh-highlight-meta">${repo.stargazers_count} ★ · ${
      repo.language || "Unknown"
    }</div>
    `;

    list.appendChild(item);
  });

  highlights.appendChild(list);
  container.appendChild(highlights);
}

/* ============================================================
   INIT CARD
   ============================================================ */

async function initGithubCard() {
  const container = document.getElementById("github-card");
  if (!container) return;

  container.innerHTML = '<div class="gh-loading">Loading GitHub…</div>';

  const username = "shreyashchandra";

  try {
    const [profile, repos, rects] = await Promise.all([
      fetchGithubProfile(username),
      fetchGithubRepos(username),
      fetchGithubContributions(username),
    ]);

    buildGithubCard(container, profile, repos, rects);
  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<div class="gh-error">Failed to load GitHub data.</div>';
  }
}

/* ============================================================
   PROGRESS BAR ANIMATION (scroll into view)
   ============================================================ */

function initProgressBars() {
  const aboutStats = document.querySelector(".about-stats");
  if (!aboutStats) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          aboutStats.classList.add("in-view");
          observer.disconnect();
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(aboutStats);
}

/* ============================================================
   RENDER PROJECTS (from localStorage / defaults)
   ============================================================ */

function renderProjects() {
  const container = document.querySelector('.portfolios');
  if (!container) return;

  const projects = getProjects();

  container.innerHTML = projects.map((p) => `
    <article class="project-card">
      <div class="project-title-row">
        <h3 class="project-name">${esc(p.name)}</h3>
        <span class="project-badge">${esc(p.badge)}</span>
      </div>
      <p class="project-stack">${esc(p.stack)}</p>
      <p class="project-desc">${esc(p.desc)}</p>
      <div class="project-links">
        ${p.github ? `<a href="${esc(p.github)}" class="project-link" target="_blank" rel="noopener noreferrer"><i class="fab fa-github"></i><span>Code</span></a>` : ''}
        ${p.live   ? `<a href="${esc(p.live)}"   class="project-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-external-link-alt"></i><span>Live</span></a>` : ''}
      </div>
    </article>
  `).join('');
}

/* ============================================================
   RENDER EXPERIENCE (from localStorage / defaults)
   ============================================================ */

function renderExperience() {
  const container = document.querySelector('.timeline');
  if (!container) return;

  const experience = getExperience();

  container.innerHTML = experience.map((item) => `
    <div class="timeline-item">
      <div class="tl-icon">
        <i class="fas fa-${esc(item.icon || 'briefcase')}"></i>
      </div>
      <p class="tl-duration">${esc(item.duration)}</p>
      <h5>${esc(item.role)} – <span>${esc(item.company)}</span></h5>
      ${item.points && item.points.length > 0
        ? `<ul>${item.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>`
        : item.desc ? `<p>${esc(item.desc)}</p>` : ''}
    </div>
  `).join('');
}

function init() {
  setupNavigation();
  setupThemeToggle();
  initGithubCard();
  initProgressBars();
  renderProjects();
  renderExperience();
}

init();
