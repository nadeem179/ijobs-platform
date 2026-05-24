export const BRAND = {
  appName: "Diplotix",
  tagline: "Trusted hiring for modern professionals",
  description:
    "Diplotix is a trusted hiring marketplace with verified jobs, transparent salaries, and AI-assisted matching.",
  logoBlackPath: "/diplotix-logo.svg",
  logoIconPath: "/diplotix-logo.svg",
  faviconPath: "/favicon.ico",
  website: "https://diplotix.com",
} as const;

export const BRAND_METADATA = {
  title: BRAND.appName,
  openGraphTitle: BRAND.appName,
} as const;
