// asset/data.js — shared data layer
// Admin panel writes here via localStorage; main site reads from here.

export const PROJ_KEY = 'sc_projects_v1';
export const EXP_KEY  = 'sc_experience_v1';

/* ── Default Projects ─────────────────────────────────────── */
export const defaultProjects = [
  {
    id: 'wazir',
    name: 'Wazir',
    badge: 'Chrome Extension',
    stack: 'HTML · CSS · JS · Stockfish API',
    desc: 'A free chrome extension for chess.com game review using Stockfish.',
    github: 'https://github.com/shreyashchandra/Wazir',
    live: 'https://wazir.shreyash.world/',
  },
  {
    id: 'padhlybhai',
    name: 'Padhlybh.ai',
    badge: 'GPT‑4o Hackathon Winner',
    stack: 'Next.js · TypeScript · OpenAI · Tailwind',
    desc: 'AI-powered study planner with an NLP scheduler that improves study efficiency by 40%. Built in 48 hours and won 1st place among 20 teams.',
    github: 'https://github.com/shreyashchandra/padhlyebhaiai',
    live: 'https://padhlyebhaiai.shreyash.world/',
  },
  {
    id: 'paynow',
    name: 'PayNow',
    badge: 'Payments Platform',
    stack: 'Node.js · Express · React · MongoDB · Tailwind',
    desc: 'Full-stack payment platform processing 5k+ monthly transactions with JWT auth and MongoDB transactions to guarantee 99.9% data integrity.',
    github: 'https://github.com/shreyashchandra/PayNow-frontend',
    live: 'https://paynow.shreyash.world/',
  },
  {
    id: 'spaceverse',
    name: 'SpaceVerse',
    badge: 'Photo Gallery',
    stack: 'Next.js · TypeScript · Vercel DB · Drizzle ORM · Clerk · Uploadthing',
    desc: 'Space-themed photo gallery for 2k+ monthly users with auth, optimized queries, and mobile‑first UX.',
    github: 'https://github.com/shreyashchandra/t3gallery',
    live: 'https://t3gallery-neon-six.vercel.app/',
  },
  {
    id: 'cognito',
    name: 'Cognito',
    badge: 'Blog Platform',
    stack: 'React · TypeScript · Cloudflare Workers · Hono · Postgres · Prisma',
    desc: 'Blog app deployed on Cloudflare Workers with 99.9% uptime, ACID guarantees via Postgres + Prisma, and shared types published as an npm package.',
    github: '',
    live: '',
  },
  {
    id: 'weather-io',
    name: 'weather‑io',
    badge: 'Utility',
    stack: 'JavaScript · REST APIs',
    desc: 'Weather app consuming public APIs with a clean, responsive UI and focus on simple UX.',
    github: 'https://github.com/shreyashchandra/weather-io',
    live: 'https://shreyashchandra.github.io/weather-io/',
  },
  {
    id: 'ng-calculator',
    name: 'NG Calculator',
    badge: 'Mini App',
    stack: 'JavaScript · UI Experiments',
    desc: 'Minimal calculator app showcasing UI and basic interaction logic.',
    github: 'https://github.com/shreyashchandra/NG-calculator',
    live: 'https://ng-calculator-one.vercel.app/',
  },
  {
    id: 'docs-view',
    name: 'Docs View',
    badge: 'Docs Tool',
    stack: 'Next.js · TypeScript · Editor / Docs UX',
    desc: 'Document viewing and management app with a clean, responsive interface for browsing and reading docs.',
    github: 'https://github.com/shreyashchandra/Docs-View',
    live: 'https://docs-view.vercel.app/',
  },
];

/* ── Default Experience ───────────────────────────────────── */
export const defaultExperience = [
  {
    id: 'redsling',
    company: 'RedSling',
    role: 'Software Developer',
    duration: 'Apr 2025 – Present',
    icon: 'briefcase',
    points: [
      'Built an AI-powered code debugger for the RedSling platform.',
      'Designed a Docker tarball pipeline over HTTP, eliminating child processes and cutting build times by 60%.',
      'Containerized the Redsling Builder on AWS ECS/ECR with ALB auto-scaling, reducing latency by 30% and infra costs by 20%.',
      'Automated CI/CD with GitHub Actions and Bitbucket, enforcing IAM roles for 90% faster deployments and 99.9% uptime.',
      'Built an agentic AI tool using LLMs to auto-generate data models, slashing design cycles by 70%.',
    ],
    desc: '',
  },
  {
    id: 'techplek',
    company: 'TechPlek Technologies',
    role: 'Jr Developer',
    duration: 'Sep 2024 – Apr 2025',
    icon: 'briefcase',
    points: [
      'Led backend DevOps operations, cutting deployment lead time by 90% via automated pipelines.',
      'Architected a billing platform with 4 microservices and 350+ API endpoints, scaling to 10k+ concurrent users.',
      'Configured NGINX for blue/green releases, ensuring 99.9% availability.',
      'Launched cross-platform web push notifications, boosting user engagement by 35%.',
      'Integrated Redis caching in Node.js, cutting API latency by 50%.',
    ],
    desc: '',
  },
  {
    id: 'techoceanic',
    company: 'Tech Oceanic Technologies',
    role: 'Developer Intern',
    duration: 'May 2024 – Sep 2024',
    icon: 'briefcase',
    points: [
      'Built a React.js app from scratch, improving load times by 20% and user retention.',
      'Developed a SaaS portfolio site with GSAP and Particle.js, elevating brand engagement.',
      'Streamlined processes, reducing delivery cycle by 30%.',
      'Refactored legacy code, enhancing developer productivity by 30%.',
    ],
    desc: '',
  },
  {
    id: 'mps',
    company: 'MPS LTD',
    role: 'Frontend Intern',
    duration: '2023 – 2 Months',
    icon: 'briefcase',
    points: [],
    desc: 'Completed a 2-month internship focused on frontend development.',
  },
  {
    id: 'opensource',
    company: 'Open Source',
    role: 'Contributions',
    duration: '2023 – Present',
    icon: 'code-branch',
    points: [],
    desc: 'Actively learning and contributing to open-source projects, focusing on web infrastructure, tooling, and developer experience.',
  },
  {
    id: 'education',
    company: 'GGSIPU (GTBIT), New Delhi, IN',
    role: 'B.Tech, Electronics and Communication',
    duration: '2020 – 2024',
    icon: 'graduation-cap',
    points: [],
    desc: 'GPA: 8.71 / 10.0. Relevant coursework: OOP, Data Structures & Algorithms, Operating Systems, DBMS. Graduated in the top 10% of the cohort.',
  },
];

/* ── Storage helpers ──────────────────────────────────────── */
export function getProjects() {
  try {
    const raw = localStorage.getItem(PROJ_KEY);
    return raw ? JSON.parse(raw) : [...defaultProjects];
  } catch {
    return [...defaultProjects];
  }
}

export function saveProjects(data) {
  localStorage.setItem(PROJ_KEY, JSON.stringify(data));
}

export function getExperience() {
  try {
    const raw = localStorage.getItem(EXP_KEY);
    return raw ? JSON.parse(raw) : [...defaultExperience];
  } catch {
    return [...defaultExperience];
  }
}

export function saveExperience(data) {
  localStorage.setItem(EXP_KEY, JSON.stringify(data));
}

/* ── Tiny HTML escape ─────────────────────────────────────── */
export function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
