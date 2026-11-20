// Site content. Experience and projects come from data.json (editable at /admin); the rest is edited here.

import data from "./data.json";
import type { Experience, Project, SiteData } from "./types";

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

export type { Experience, Project, SiteData };

// Experience and projects live in data.json so the /admin panel can edit them.
const siteData = data as SiteData;
export const experience: Experience[] = siteData.experience;
export const projects: Project[] = siteData.projects;

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
