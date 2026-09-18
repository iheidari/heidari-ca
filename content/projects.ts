export type Project = {
  /** Stable React key; also the slug to use if these ever get their own route. */
  slug: string;
  title: string;
  summary: string;
  /** Shipping year. Omitted where the release date isn't recorded anywhere. */
  year?: string;
  tags: string[];
  repo?: string;
  live?: string;
  appStore?: string;
  googlePlay?: string;
};

/** Newest first. The layout adapts to 2–6 entries. */
export const projects: Project[] = [
  {
    slug: "milemark",
    title: "Milemark",
    summary:
      "A location-based website and mobile app for discovering campgrounds, with full access for the backcountry where signal disappears.",
    year: "2026",
    tags: ["Web App", "Mobile", "iOS · Android"],
    live: "https://milemark.camp",
    appStore:
      "https://apps.apple.com/us/app/milemark-campground-finder/id6779515208",
    googlePlay:
      "https://play.google.com/store/apps/details?id=com.zeroxcode.milemark",
  },
  {
    slug: "true-north-prep",
    title: "True North Prep",
    summary:
      "A free study app for the Canadian Citizenship Test — practice by category, take weighted mock exams, and track readiness, fully offline on web and mobile.",
    year: "2026",
    tags: ["Web App", "Mobile", "iOS · Android"],
    live: "https://truenorthprep.ca",
    appStore: "https://apps.apple.com/us/app/true-north-prep/id6784186570",
    googlePlay:
      "https://play.google.com/store/apps/details?id=com.zeroxcode.truenorthprep",
  },
  {
    slug: "exchange-widget",
    title: "Exchange Widget",
    summary:
      "A home-screen currency exchange widget with live rates and quick-glance conversions.",
    tags: ["Widget", "iOS · Android"],
    appStore: "https://apps.apple.com/us/app/exchangewidget/id6762816436",
    googlePlay:
      "https://play.google.com/store/apps/details?id=com.zeroxcode.exchangewidget",
  },
  {
    slug: "better-bc-assessment",
    title: "Better BC Assessment",
    summary:
      "A mobile app improving access to BC property assessment data with clear, usable visuals.",
    tags: ["Mobile", "iOS · Android"],
    appStore: "https://apps.apple.com/ca/app/better-bc-assessment/id6504163154",
    googlePlay:
      "https://play.google.com/store/apps/details?id=com.oxcode.betterbcassessment",
  },
];
