// All site content lives here. Edit this file, commit, and the site updates for everyone.

export const profile = {
  name: "Shreyash Chandra",
  role: "Full Stack Engineer",
  focus: "Backend & DevOps",
  status: "System Engineer at TCS",
  location: "India",
  timeZone: "Asia/Kolkata",
  email: "shreyash.chandra123@gmail.com",
  github: "https://github.com/shreyashchandra",
  githubUser: "shreyashchandra",
  chessUser: "shreyashchandraa",
  chessProfile: "https://www.chess.com/member/shreyashchandraa",
  linkedin: "https://www.linkedin.com/in/shreyashchandra/",
  x: "https://x.com/shreyashchandra",
  xHandle: "@shreyashchandra",
  // Drop the PDF into /public with this name to enable the download link.
  resume: "/Shreyash_Chandra_CV.pdf",
  site: "https://www.shreyash.world",
};

export const intro = {
  lead: "I build the systems behind the screen.",
  body: "Backends, data pipelines and the infrastructure that keeps data-heavy products fast once real traffic shows up. A 350+ endpoint microservices platform, a RAG debugger, CI/CD on AWS. I like the parts of software most people never see.",
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  points: string[];
  stack: string[];
  current?: boolean;
};

export const experience: Experience[] = [
  {
    company: "Tata Consultancy Services",
    role: "System Engineer",
    period: "Aug 2026 — Now",
    summary: "Engineering at enterprise scale.",
    points: [],
    stack: [],
    current: true,
  },
  {
    company: "RedSling",
    role: "Software Developer",
    period: "Apr 2025 — Aug 2026",
    summary: "Compilers for no-code workflows, GenAI services, and the infra under them.",
    points: [
      "Built backend services that compile user-authored Blockly workflows into executable JavaScript.",
      "Engineered a RAG-based debugger on a Python backend (LangChain, Pinecone, GPT-4o) indexing 1,000+ custom blocks at ~200 ms average latency, serving 500+ sessions a month and cutting user-reported errors by 45%.",
      "Built Python GenAI services, including a multi-model LLM layer supporting 7+ LLMs with user-supplied API keys.",
      "Deployed the Builder on AWS ECS/ECR with Terraform, Docker and GitHub Actions, cutting p99 latency 30% and build time 60%.",
    ],
    stack: ["Python", "LangChain", "Pinecone", "AWS ECS", "Terraform", "Docker"],
  },
  {
    company: "TechPlek Technologies",
    role: "Jr. Software Developer",
    period: "Sep 2024 — Apr 2025",
    summary: "A billing platform for cab travel, from first endpoint to 10k concurrent users.",
    points: [
      "Architected a cab-travel billing platform of 4 microservices and 350+ REST endpoints in Node.js covering trips, billing, invoices, vendors and drivers, scaling to 10k+ concurrent users.",
      "Developed a React Native ride-booking app with real-time GPS tracking, published on the Google Play Store.",
      "Introduced Redis caching in high-traffic Node.js APIs, cutting response latency by 50%.",
    ],
    stack: ["Node.js", "Microservices", "Redis", "React Native", "NGINX"],
  },
  {
    company: "Tech Oceanic Technologies",
    role: "Developer Intern",
    period: "May 2024 — Sep 2024",
    summary: "React apps and animated marketing sites.",
    points: [
      "Built a React app from scratch, improving load times by 20%.",
      "Developed a SaaS marketing site with GSAP and Particle.js.",
    ],
    stack: ["React", "GSAP"],
  },
];

export type Project = {
  name: string;
  kind: string;
  year: string;
  blurb: string;
  stack: string[];
  live?: string;
  code?: string;
  /** Short line shown in the hover preview, styled like a terminal. */
  snippet: string;
  /** Accent hue (0–360) for the generated preview. */
  hue: number;
  award?: string;
};

export const projects: Project[] = [
  {
    name: "TradeArena",
    kind: "Paper trading platform",
    year: "2026",
    blurb: "Trade stocks with virtual capital. Order matching, portfolio tracking, transaction history and real-time dashboards behind authenticated REST APIs.",
    stack: ["Next.js", "TypeScript", "Node.js", "C++"],
    live: "https://trade-arena-opal.vercel.app",
    code: "https://github.com/shreyashchandra/TradeArena",
    snippet: "POST /orders  → 201 filled ✓",
    hue: 152,
  },
  {
    name: "Wazir",
    kind: "Chrome extension",
    year: "2025",
    blurb: "Free Chess.com game review. Stockfish 17 compiled to WebAssembly, running in a Web Worker, fully client-side at 60 fps.",
    stack: ["MV3", "Stockfish WASM", "Web Workers"],
    live: "https://wazir.shreyash.world/",
    code: "https://github.com/shreyashchandra/Wazir",
    snippet: "eval +1.42 · depth 22 · best Nf5",
    hue: 38,
  },
  {
    name: "PadhLyeBhaiAI",
    kind: "AI study planner",
    year: "2024",
    blurb: "Built with a team of four in 48 hours. Won first place among 20 teams at the GPT-4o hackathon.",
    stack: ["Python", "OpenAI", "Next.js"],
    live: "https://padhlyebhaiai.shreyash.world/",
    code: "https://github.com/shreyashchandra/padhlyebhaiai",
    snippet: "plan.generate(syllabus, 14d) ✓",
    hue: 262,
    award: "1st place · GPT-4o Hackathon",
  },
  {
    name: "PayNow",
    kind: "Digital wallet",
    year: "2024",
    blurb: "Balances, peer search, transfers and payment requests on a Node.js/Express API with MongoDB ledgers, JWT auth and Zod validation.",
    stack: ["React", "Express", "MongoDB", "JWT"],
    live: "https://paynow.shreyash.world/",
    code: "https://github.com/shreyashchandra/PayNow-frontend",
    snippet: "txn.commit()  ledger balanced ✓",
    hue: 220,
  },
  {
    name: "Cognito",
    kind: "Edge blog platform",
    year: "2024",
    blurb: "React + TypeScript frontend, Hono API on Cloudflare Workers, Postgres via Prisma, and shared types published to npm.",
    stack: ["Hono", "Cloudflare Workers", "Prisma", "Postgres"],
    live: "https://cognito.shreyash.world/",
    code: "https://github.com/shreyashchandra/Medium-Blog",
    snippet: "GET /api/v1/blog  → 200 OK · edge",
    hue: 14,
  },
  {
    name: "Flow Builder",
    kind: "Visual workflow designer",
    year: "2025",
    blurb: "Drag, drop and connect nodes into conditional flows with live JSON preview, inline validation and import/export.",
    stack: ["React", "TypeScript", "React Flow"],
    live: "https://flow-builder-iota-puce.vercel.app",
    code: "https://github.com/shreyashchandra/flow-builder",
    snippet: "nodes: 12 · edges: 14 · valid ✓",
    hue: 190,
  },
];

export const numbers = [
  { value: 350, suffix: "+", label: "REST endpoints across 4 microservices" },
  { value: 10, suffix: "k+", label: "concurrent users on a platform I architected" },
  { value: 60, suffix: "%", label: "faster builds after moving to ECS + Terraform" },
  { value: 45, suffix: "%", label: "fewer user-reported errors from a RAG debugger" },
];

export const stack: { group: string; items: string[] }[] = [
  { group: "Backend", items: ["Node.js", "Express", "Hono", "FastAPI", "REST", "WebSockets", "Microservices"] },
  { group: "Data", items: ["PostgreSQL", "MongoDB", "Redis", "Prisma", "Pinecone", "Qdrant"] },
  { group: "Cloud & DevOps", items: ["AWS ECS / ECR / ALB", "Terraform", "Docker", "GitHub Actions", "NGINX", "Cloudflare Workers", "Linux"] },
  { group: "Frontend", items: ["React", "Next.js", "React Native", "Tailwind", "WebAssembly"] },
  { group: "AI", items: ["LangChain", "RAG", "Vercel AI SDK", "OpenAI", "Gemini"] },
  { group: "Languages", items: ["TypeScript", "JavaScript", "Python", "C++", "SQL"] },
];

export const offClock = [
  {
    title: "Movies",
    line: "Deep into cinema.",
    body: "The kind of person who stays for the credits and argues about the ending on the way out.",
  },
  {
    title: "Sports",
    line: "Always watching something.",
    body: "Match days get blocked on the calendar. Good systems and good teams have a lot in common.",
  },
  {
    title: "Chess",
    line: "One more game.",
    body: "Mostly bullet, mostly online as @shreyashchandraa. I liked post-game analysis enough to build Wazir, a free game-review extension running Stockfish in the browser.",
  },
];

export const education = {
  school: "Guru Tegh Bahadur Institute of Technology, GGSIPU",
  degree: "B.Tech, Electronics & Communication",
  period: "2020 — 2024",
  note: "GPA 8.71 / 10 · top 10%",
};
