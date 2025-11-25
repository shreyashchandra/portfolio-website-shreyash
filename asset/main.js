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

/* ---------- GITHUB PROFILE CARD ---------- */

async function fetchGithubProfile(username) {
  const ts = Date.now();
  const res = await fetch(`https://api.github.com/users/${username}?ts=${ts}`, {
    headers: {
      Accept: "application/vnd.github+json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub profile error: ${res.status}`);
  }
  return res.json();
}
async function fetchGithubRepos(username) {
  const ts = Date.now();
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&ts=${ts}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error(`GitHub repos error: ${res.status}`);
  }
  return res.json();
}

function buildGithubCard(container, profile, repos) {
  container.innerHTML = "";

  const totalStars = repos.reduce(
    (sum, repo) => sum + (repo.stargazers_count || 0),
    0
  );

  const topStarred = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 2);

  const recent = [...repos].sort(
    (a, b) => new Date(b.pushed_at) - new Date(a.pushed_at)
  )[0];

  // Header: avatar + name
  const header = document.createElement("div");
  header.className = "gh-header";

  const avatar = document.createElement("img");
  avatar.className = "gh-avatar";
  avatar.src = profile.avatar_url;
  avatar.alt = `${profile.login} avatar`;
  header.appendChild(avatar);

  const identity = document.createElement("div");
  identity.className = "gh-identity";

  const name = document.createElement("div");
  name.className = "gh-name";
  name.textContent = profile.name || profile.login;

  const usernameEl = document.createElement("div");
  usernameEl.className = "gh-username";
  usernameEl.textContent = `@${profile.login}`;

  identity.appendChild(name);
  identity.appendChild(usernameEl);
  header.appendChild(identity);
  container.appendChild(header);

  // Bio
  if (profile.bio) {
    const bio = document.createElement("p");
    bio.className = "gh-bio";
    bio.textContent = profile.bio;
    container.appendChild(bio);
  }

  // Stats row
  const stats = document.createElement("div");
  stats.className = "gh-stats";

  function createStat(label, value) {
    const wrap = document.createElement("div");
    wrap.className = "gh-stat";

    const v = document.createElement("div");
    v.className = "gh-stat-value";
    v.textContent = String(value);

    const l = document.createElement("div");
    l.className = "gh-stat-label";
    l.textContent = label;

    wrap.appendChild(v);
    wrap.appendChild(l);
    return wrap;
  }

  stats.appendChild(createStat("Followers", profile.followers ?? "–"));
  stats.appendChild(createStat("Repos", profile.public_repos ?? "–"));
  stats.appendChild(createStat("Total Stars", totalStars));
  container.appendChild(stats);

  // Highlights
  const highlights = document.createElement("div");
  highlights.className = "gh-highlights";

  const highlightsTitle = document.createElement("div");
  highlightsTitle.className = "gh-highlights-title";
  highlightsTitle.textContent = "Highlighted Repos";
  highlights.appendChild(highlightsTitle);

  const list = document.createElement("div");
  list.className = "gh-highlight-list";

  // Top starred repos
  topStarred.forEach((repo) => {
    const item = document.createElement("a");
    item.className = "gh-highlight-item";
    item.href = repo.html_url;
    item.target = "_blank";
    item.rel = "noopener noreferrer";

    const title = document.createElement("div");
    title.className = "gh-highlight-name";
    title.textContent = repo.name;

    const meta = document.createElement("div");
    meta.className = "gh-highlight-meta";
    meta.textContent = `${repo.stargazers_count || 0} ★ · ${
      repo.language || "Unknown"
    }`;

    item.appendChild(title);
    item.appendChild(meta);
    list.appendChild(item);
  });

  // Most recently pushed repo
  if (recent) {
    const item = document.createElement("a");
    item.className = "gh-highlight-item gh-highlight-item--secondary";
    item.href = recent.html_url;
    item.target = "_blank";
    item.rel = "noopener noreferrer";

    const title = document.createElement("div");
    title.className = "gh-highlight-name";
    title.textContent = recent.name;

    const meta = document.createElement("div");
    meta.className = "gh-highlight-meta";
    meta.textContent = `Recently pushed · ${recent.language || "Unknown"}`;

    item.appendChild(title);
    item.appendChild(meta);
    list.appendChild(item);
  }

  highlights.appendChild(list);
  container.appendChild(highlights);
}

async function initGithubCard() {
  const container = document.getElementById("github-card");
  if (!container) return;

  container.innerHTML = '<div class="gh-loading">Loading GitHub profile…</div>';

  const username = "shreyashchandra";

  try {
    const [profile, repos] = await Promise.all([
      fetchGithubProfile(username),
      fetchGithubRepos(username),
    ]);
    buildGithubCard(container, profile, repos);
  } catch (err) {
    console.error(err);
    container.innerHTML =
      '<div class="gh-error">Failed to load GitHub data. Please try again later.</div>';
  }
}

/* ---------- INIT ---------- */

function init() {
  setupNavigation();
  setupThemeToggle();
  initGithubCard();
}

init();
