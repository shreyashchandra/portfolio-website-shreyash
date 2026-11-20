// Shapes for the content the admin panel can edit (stored in content/data.json).

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  points: string[];
  stack: string[];
  current?: boolean;
};

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

export type SiteData = {
  experience: Experience[];
  projects: Project[];
};
