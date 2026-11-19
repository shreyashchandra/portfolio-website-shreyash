// admin/admin.js
import { getProjects, saveProjects, getExperience, saveExperience, esc } from '../asset/data.js';

/* ── Config ─────────────────────────────────────────────────── */
const ADMIN_PASSWORD  = 'shreyash';      // ← change this
const SESSION_KEY     = 'sc_admin_v1';

/* ── Auth ───────────────────────────────────────────────────── */
const isAuthed = () => sessionStorage.getItem(SESSION_KEY) === '1';
const login    = (p) => { if (p === ADMIN_PASSWORD) { sessionStorage.setItem(SESSION_KEY, '1'); return true; } return false; };
const logout   = () => { sessionStorage.removeItem(SESSION_KEY); render(); };

/* ── State ──────────────────────────────────────────────────── */
let tab       = 'projects';   // 'projects' | 'experience'
let drawerMode = null;        // 'add' | 'edit'
let editId    = null;

/* ── Tiny uid ───────────────────────────────────────────────── */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ── Toast ──────────────────────────────────────────────────── */
function toast(msg) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2400);
}

/* ── Render root ────────────────────────────────────────────── */
function render() {
  if (!isAuthed()) { renderLogin(); return; }
  renderDashboard();
}

/* ══════════════════════════════════════════════════════════════
   LOGIN
   ══════════════════════════════════════════════════════════════ */
function renderLogin() {
  document.body.innerHTML = `
    <div class="login-wrap">
      <div class="login-card">
        <div class="login-logo">⚙ Portfolio Admin</div>
        <p class="login-subtitle">Enter your password to continue</p>
        <form id="login-form">
          <input type="password" id="pass-in" placeholder="Password" autocomplete="current-password" />
          <div id="login-err" class="login-error">Incorrect password</div>
          <button type="submit" class="btn-primary">Sign In</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('pass-in').focus();

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (login(document.getElementById('pass-in').value)) {
      render();
    } else {
      document.getElementById('login-err').classList.add('show');
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════════ */
function renderDashboard() {
  const projects   = getProjects();
  const experience = getExperience();

  document.body.innerHTML = `
    <!-- Topbar -->
    <header class="topbar">
      <div class="topbar-logo">⚙ <span>Portfolio Admin</span></div>
      <a href="/" target="_blank" class="btn-ghost">↗ View Site</a>
      <button id="btn-logout" class="btn-danger-ghost">Logout</button>
    </header>

    <div class="admin-layout">
      <!-- Sidebar -->
      <nav class="sidebar">
        <button class="sidebar-item ${tab === 'projects' ? 'active' : ''}" data-tab="projects">
          <i class="fas fa-briefcase"></i> Projects
          <span class="count">${projects.length}</span>
        </button>
        <button class="sidebar-item ${tab === 'experience' ? 'active' : ''}" data-tab="experience">
          <i class="fas fa-clock"></i> Experience
          <span class="count">${experience.length}</span>
        </button>
      </nav>

      <!-- Main -->
      <main class="main-content">
        <div class="content-header">
          <h1 class="content-title">${tab === 'projects' ? 'Projects' : 'Experience'}</h1>
          <button id="btn-add" class="btn-primary">
            <i class="fas fa-plus"></i>
            Add ${tab === 'projects' ? 'Project' : 'Experience'}
          </button>
        </div>

        <div class="item-list" id="item-list">
          ${tab === 'projects' ? renderProjectList(projects) : renderExpList(experience)}
        </div>
      </main>
    </div>

    <!-- Drawer overlay -->
    <div class="drawer-overlay" id="drawer-overlay"></div>

    <!-- Drawer -->
    <aside class="drawer" id="drawer">
      <div class="drawer-head">
        <div class="drawer-title" id="drawer-title">Edit</div>
        <button class="btn-close" id="drawer-close">✕</button>
      </div>
      <div class="drawer-body" id="drawer-body"></div>
      <div class="drawer-foot">
        <button class="btn-ghost" id="drawer-cancel">Cancel</button>
        <button class="btn-primary" id="drawer-save">
          <i class="fas fa-check"></i> Save
        </button>
      </div>
    </aside>
  `;

  bindDashboard();
}

/* ── Project list HTML ──────────────────────────────────────── */
function renderProjectList(projects) {
  if (!projects.length) return '<div class="empty-state">No projects yet. Click "Add Project" to get started.</div>';
  return projects.map((p, i) => `
    <div class="item-row" data-id="${esc(p.id)}">
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <div class="item-icon"><i class="fas fa-code"></i></div>
      <div class="item-info">
        <div class="item-name">${esc(p.name)}</div>
        <div class="item-meta">${esc(p.stack)}</div>
      </div>
      <span class="item-badge">${esc(p.badge)}</span>
      <div class="item-actions">
        <button class="btn-edit" data-action="edit" data-id="${esc(p.id)}">
          <i class="fas fa-pen"></i> Edit
        </button>
        <button class="btn-delete" data-action="delete" data-id="${esc(p.id)}" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

/* ── Experience list HTML ───────────────────────────────────── */
function renderExpList(experience) {
  if (!experience.length) return '<div class="empty-state">No experience items yet.</div>';
  return experience.map((item) => `
    <div class="item-row" data-id="${esc(item.id)}">
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <div class="item-icon"><i class="fas fa-${esc(item.icon || 'briefcase')}"></i></div>
      <div class="item-info">
        <div class="item-name">${esc(item.role)} — ${esc(item.company)}</div>
        <div class="item-meta">${esc(item.duration)}</div>
      </div>
      <div class="item-actions">
        <button class="btn-edit" data-action="edit" data-id="${esc(item.id)}">
          <i class="fas fa-pen"></i> Edit
        </button>
        <button class="btn-delete" data-action="delete" data-id="${esc(item.id)}" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

/* ── Bind dashboard events ──────────────────────────────────── */
function bindDashboard() {
  /* logout */
  document.getElementById('btn-logout').addEventListener('click', logout);

  /* sidebar tabs */
  document.querySelectorAll('.sidebar-item[data-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      tab = btn.dataset.tab;
      renderDashboard();
    });
  });

  /* add */
  document.getElementById('btn-add').addEventListener('click', () => {
    openDrawer('add', null);
  });

  /* edit / delete */
  document.getElementById('item-list').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit')   openDrawer('edit', id);
    if (action === 'delete') confirmDelete(id);
  });

  /* drawer close */
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);
  document.getElementById('drawer-close').addEventListener('click', closeDrawer);
  document.getElementById('drawer-cancel').addEventListener('click', closeDrawer);

  /* drawer save */
  document.getElementById('drawer-save').addEventListener('click', saveDrawer);

  /* drag-to-reorder */
  initDragSort();
}

/* ══════════════════════════════════════════════════════════════
   DRAWER — PROJECTS
   ══════════════════════════════════════════════════════════════ */
function projectForm(p = {}) {
  return `
    <div class="field">
      <label>Project Name *</label>
      <input id="f-name" type="text" value="${esc(p.name || '')}" placeholder="e.g. My App" />
    </div>
    <div class="field">
      <label>Badge / Tag</label>
      <input id="f-badge" type="text" value="${esc(p.badge || '')}" placeholder="e.g. Hackathon Winner" />
    </div>
    <div class="field">
      <label>Tech Stack</label>
      <input id="f-stack" type="text" value="${esc(p.stack || '')}" placeholder="e.g. Next.js · TypeScript · Tailwind" />
    </div>
    <div class="field">
      <label>Description *</label>
      <textarea id="f-desc" rows="3" placeholder="Short project description...">${esc(p.desc || '')}</textarea>
    </div>
    <div class="field">
      <label>GitHub URL</label>
      <input id="f-github" type="url" value="${esc(p.github || '')}" placeholder="https://github.com/..." />
    </div>
    <div class="field">
      <label>Live URL</label>
      <input id="f-live" type="url" value="${esc(p.live || '')}" placeholder="https://..." />
    </div>
  `;
}

function readProjectForm() {
  return {
    name:   document.getElementById('f-name').value.trim(),
    badge:  document.getElementById('f-badge').value.trim(),
    stack:  document.getElementById('f-stack').value.trim(),
    desc:   document.getElementById('f-desc').value.trim(),
    github: document.getElementById('f-github').value.trim(),
    live:   document.getElementById('f-live').value.trim(),
  };
}

/* ══════════════════════════════════════════════════════════════
   DRAWER — EXPERIENCE
   ══════════════════════════════════════════════════════════════ */
function expForm(item = {}) {
  const pointsHtml = (item.points || []).map((pt, i) => pointRow(pt, i)).join('');
  return `
    <div class="field">
      <label>Role / Position *</label>
      <input id="f-role" type="text" value="${esc(item.role || '')}" placeholder="e.g. Software Developer" />
    </div>
    <div class="field">
      <label>Company / Organisation *</label>
      <input id="f-company" type="text" value="${esc(item.company || '')}" placeholder="e.g. Acme Corp" />
    </div>
    <div class="field">
      <label>Duration</label>
      <input id="f-duration" type="text" value="${esc(item.duration || '')}" placeholder="e.g. Jan 2024 – Present" />
    </div>
    <div class="field">
      <label>Icon (Font Awesome name)</label>
      <select id="f-icon">
        ${['briefcase','code-branch','graduation-cap','laptop-code','server','robot','star'].map(
          (ic) => `<option value="${ic}" ${item.icon === ic ? 'selected' : ''}>${ic}</option>`
        ).join('')}
      </select>
    </div>
    <div class="field">
      <label>Plain description (if no bullet points)</label>
      <textarea id="f-desc" rows="2" placeholder="Optional short description...">${esc(item.desc || '')}</textarea>
    </div>
    <div class="field">
      <label>Bullet Points</label>
      <div class="points-list" id="points-list">${pointsHtml}</div>
      <button type="button" class="btn-add-point" id="btn-add-point">
        <i class="fas fa-plus"></i> Add bullet point
      </button>
    </div>
  `;
}

function pointRow(text = '', idx) {
  return `
    <div class="point-row" data-idx="${idx}">
      <textarea rows="2" class="point-input">${esc(text)}</textarea>
      <button type="button" class="btn-rm-point" title="Remove">✕</button>
    </div>
  `;
}

function bindPointsEvents() {
  const list = document.getElementById('points-list');
  if (!list) return;

  document.getElementById('btn-add-point').addEventListener('click', () => {
    const idx = list.querySelectorAll('.point-row').length;
    list.insertAdjacentHTML('beforeend', pointRow('', idx));
    list.lastElementChild.querySelector('textarea').focus();
  });

  list.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-rm-point')) {
      e.target.closest('.point-row').remove();
    }
  });
}

function readExpForm() {
  const points = [...document.querySelectorAll('.point-input')]
    .map((el) => el.value.trim())
    .filter(Boolean);
  return {
    role:     document.getElementById('f-role').value.trim(),
    company:  document.getElementById('f-company').value.trim(),
    duration: document.getElementById('f-duration').value.trim(),
    icon:     document.getElementById('f-icon').value,
    desc:     document.getElementById('f-desc').value.trim(),
    points,
  };
}

/* ══════════════════════════════════════════════════════════════
   DRAWER OPEN / CLOSE / SAVE
   ══════════════════════════════════════════════════════════════ */
function openDrawer(mode, id) {
  drawerMode = mode;
  editId     = id;

  const isProject = tab === 'projects';
  const isAdd     = mode === 'add';

  document.getElementById('drawer-title').textContent =
    isAdd ? `Add ${isProject ? 'Project' : 'Experience'}` : `Edit ${isProject ? 'Project' : 'Experience'}`;

  const body = document.getElementById('drawer-body');

  if (isProject) {
    const p = isAdd ? {} : getProjects().find((x) => x.id === id) || {};
    body.innerHTML = projectForm(p);
  } else {
    const item = isAdd ? {} : getExperience().find((x) => x.id === id) || {};
    body.innerHTML = expForm(item);
    bindPointsEvents();
  }

  document.getElementById('drawer-overlay').classList.add('show');
  document.getElementById('drawer').classList.add('show');

  body.querySelector('input, textarea')?.focus();
}

function closeDrawer() {
  document.getElementById('drawer-overlay').classList.remove('show');
  document.getElementById('drawer').classList.remove('show');
  drawerMode = null;
  editId     = null;
}

function saveDrawer() {
  if (tab === 'projects') saveProject();
  else                    saveExp();
}

/* ── Save project ───────────────────────────────────────────── */
function saveProject() {
  const data = readProjectForm();
  if (!data.name) { alert('Project name is required.'); return; }

  let projects = getProjects();

  if (drawerMode === 'add') {
    projects.push({ id: uid(), ...data });
  } else {
    projects = projects.map((p) => p.id === editId ? { ...p, ...data } : p);
  }

  saveProjects(projects);
  toast(drawerMode === 'add' ? 'Project added ✓' : 'Project updated ✓');
  closeDrawer();
  renderDashboard();
}

/* ── Save experience ────────────────────────────────────────── */
function saveExp() {
  const data = readExpForm();
  if (!data.role || !data.company) { alert('Role and company are required.'); return; }

  let experience = getExperience();

  if (drawerMode === 'add') {
    experience.push({ id: uid(), ...data });
  } else {
    experience = experience.map((x) => x.id === editId ? { ...x, ...data } : x);
  }

  saveExperience(experience);
  toast(drawerMode === 'add' ? 'Experience added ✓' : 'Experience updated ✓');
  closeDrawer();
  renderDashboard();
}

/* ── Delete ─────────────────────────────────────────────────── */
function confirmDelete(id) {
  if (!confirm('Delete this item? This cannot be undone.')) return;

  if (tab === 'projects') {
    saveProjects(getProjects().filter((p) => p.id !== id));
    toast('Project deleted');
  } else {
    saveExperience(getExperience().filter((x) => x.id !== id));
    toast('Experience deleted');
  }

  renderDashboard();
}

/* ══════════════════════════════════════════════════════════════
   DRAG-TO-REORDER
   ══════════════════════════════════════════════════════════════ */
function initDragSort() {
  const list = document.getElementById('item-list');
  if (!list) return;

  let dragEl = null;

  list.addEventListener('dragstart', (e) => {
    dragEl = e.target.closest('.item-row');
    if (!dragEl) return;
    dragEl.style.opacity = '.4';
    e.dataTransfer.effectAllowed = 'move';
  });

  list.addEventListener('dragend', () => {
    if (dragEl) dragEl.style.opacity = '';
    dragEl = null;
    persistOrder();
  });

  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const over = e.target.closest('.item-row');
    if (!over || over === dragEl) return;
    const rect  = over.getBoundingClientRect();
    const after = e.clientY > rect.top + rect.height / 2;
    list.insertBefore(dragEl, after ? over.nextSibling : over);
  });

  // Make rows draggable
  list.querySelectorAll('.item-row').forEach((row) => {
    row.setAttribute('draggable', 'true');
  });
}

function persistOrder() {
  const ids = [...document.querySelectorAll('.item-row[data-id]')].map((el) => el.dataset.id);

  if (tab === 'projects') {
    const projects = getProjects();
    saveProjects(ids.map((id) => projects.find((p) => p.id === id)).filter(Boolean));
  } else {
    const experience = getExperience();
    saveExperience(ids.map((id) => experience.find((x) => x.id === id)).filter(Boolean));
  }

  // Silently update sidebar count (re-render would close drawer)
  const projects   = getProjects();
  const experience = getExperience();
  document.querySelectorAll('.sidebar-item[data-tab]').forEach((btn) => {
    const count = btn.dataset.tab === 'projects' ? projects.length : experience.length;
    btn.querySelector('.count').textContent = count;
  });
}

/* ── Boot ───────────────────────────────────────────────────── */
render();
