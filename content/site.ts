export const site = {
  name: "Iman Heidari",
  initials: "IH",
  role: "Full-stack developer",
  location: "Vancouver, Canada",
  email: "iman@heidari.ca",
  url: "https://heidari.ca",
  tagline: "I build fast, reliable web products — end to end.",
  intro:
    "Full-stack developer with a bias for shipping. I design the data model, write the API, build the interface, and stay until it runs well in production.",
  available: true,
  socials: {
    github: "https://github.com/iheidari/",
    linkedin: "https://www.linkedin.com/in/iheidari/",
    twitter: "https://twitter.com/ximaneshon/",
    youtube: "https://www.youtube.com/channel/UC0Yh_8K94hOmtErgCvsR3Og",
  },
  stack: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "AWS",
    "Docker",
  ],
  /** Section copy lives here too, so a heading is never defined in two files. */
  sections: {
    work: {
      title: "Selected work",
      lead: "A few things I have designed, built, and shipped end to end.",
    },
    writing: {
      title: "Writing",
      lead: "Notes on building software — architecture, databases, and the parts that only show up in production.",
    },
    contact: {
      title: "Have something to build?",
      lead: "I am open to full-stack contract and full-time work. The fastest way to reach me is email.",
    },
  },
} as const;
