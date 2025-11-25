// asset/main.js
import "./styles/styles.css";

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
   BUILD CONTRIBUTION GRAPH
   ============================================================ */

function buildContributionGraph(cells) {
  const container = document.createElement("div");
  container.className = "gh-contrib-graph";

  const weeks = {};

  cells.forEach((cell) => {
    const ix = cell.getAttribute("data-ix");
    if (!weeks[ix]) weeks[ix] = [];
    weeks[ix].push(cell);
  });

  const sorted = Object.keys(weeks).sort((a, b) => Number(a) - Number(b));

  sorted.forEach((week) => {
    const col = document.createElement("div");
    col.className = "gh-contrib-week";

    weeks[week].forEach((cellData) => {
      const div = document.createElement("div");
      div.className = "gh-contrib-cell";

      const level = cellData.getAttribute("data-level");
      const count = cellData.getAttribute("data-count");
      const date = cellData.getAttribute("data-date");

      const colors = {
        0: "#161b22",
        1: "#0e4429",
        2: "#006d32",
        3: "#26a641",
        4: "#39d353",
      };

      div.style.background = colors[level] || "#161b22";
      div.title = `${count} contributions on ${date}`;

      col.appendChild(div);
    });

    container.appendChild(col);
  });

  return container;
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
  const contribTitle = document.createElement("div");
  contribTitle.className = "gh-highlights-title";
  contribTitle.textContent = "Contribution Activity";
  contribTitle.style.marginTop = "0.75rem";

  const graph = buildContributionGraph(rects);

  container.appendChild(contribTitle);
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

function init() {
  setupNavigation();
  setupThemeToggle();
  initGithubCard();
}

init();
