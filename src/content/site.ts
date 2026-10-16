export const site = {
  name: "Iman Heidari",
  initials: "IH",
  role: "Full-stack developer",
  location: "Vancouver, Canada",
  email: "iman@heidari.ca",
  /** Derived once here rather than rebuilt at each link. */
  get mailto() {
    return `mailto:${this.email}`;
  },
  tagline: "I build fast, reliable web and mobile products — end to end.",
  intro:
    "Full-stack developer with 16+ years of shipping. I design the data model, write the API, build the web and mobile interfaces, and stay until it runs well in production. I work AI-native every day, and build LLM-powered features into the products I ship.",
  available: true,
  socials: {
    github: "https://github.com/iheidari/",
    linkedin: "https://www.linkedin.com/in/iheidari/",
    twitter: "https://twitter.com/im0xn/",
    youtube: "https://www.youtube.com/channel/UC0Yh_8K94hOmtErgCvsR3Og",
  },
  stack: [
    "TypeScript",
    "React",
    "React Native",
    "Next.js",
    "Expo",
    "Node.js",
    "PostgreSQL",
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
