export type Project = {
  /** Stable React key; also the slug to use if these ever get their own route. */
  slug: string;
  title: string;
  summary: string;
  year: string;
  tags: string[];
  repo?: string;
  live?: string;
};

// PLACEHOLDER — replace with real work before this goes live. Links are left
// off deliberately: a card with no link beats a card that links nowhere useful.
// The layout adapts to 2–6 entries.
export const projects: Project[] = [
  {
    slug: "placeholder-platform",
    title: "Project One",
    summary:
      "A short, concrete description of what you built, who it was for, and the result it produced.",
    year: "2025",
    tags: ["Next.js", "PostgreSQL", "AWS"],
  },
  {
    slug: "placeholder-api",
    title: "Project Two",
    summary:
      "Another build worth showing. Lead with the problem, then the technical decision you are proudest of.",
    year: "2024",
    tags: ["Node.js", "TypeScript", "Redis"],
  },
  {
    slug: "placeholder-tool",
    title: "Project Three",
    summary:
      "An internal tool, side project, or open-source library. Numbers help: users, latency, uptime, scale.",
    year: "2024",
    tags: ["React", "Docker", "CI/CD"],
  },
];
