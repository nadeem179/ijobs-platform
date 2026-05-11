/**
 * Design Tokens
 *
 * Central source of truth for spacing, typography, and layout constants.
 * Use these values to keep the UI visually consistent across all pages.
 */

export const SPACING = {
  page: {
    x: "px-4 sm:px-6 lg:px-8",
    y: "py-8 sm:py-10",
    container: "mx-auto max-w-7xl",
    narrow: "mx-auto max-w-3xl",
  },
  section: {
    default: "py-12",
    tight: "py-10",
    compact: "py-8",
  },
  card: {
    padding: "p-4 sm:p-5",
    gap: "gap-4",
    innerGap: "space-y-4",
  },
  grid: {
    default: "grid gap-4",
    wide: "grid gap-6",
  },
} as const;

export const TYPOGRAPHY = {
  pageTitle: "text-xl font-semibold tracking-tight",
  sectionTitle: "text-sm font-semibold",
  body: "text-sm text-muted-foreground leading-relaxed",
  caption: "text-xs text-muted-foreground",
  label: "text-xs font-medium",
} as const;

export const CARD = {
  base: "rounded-xl border border-border/30 bg-background p-4 sm:p-5 transition-all hover:border-border/60 hover:shadow-sm",
  compact: "rounded-xl border border-border/30 bg-background p-4",
  interactive:
    "rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm",
  sidebar:
    "rounded-xl border border-border/30 bg-background p-4",
} as const;

export const BUTTON = {
  primary: "rounded-xl text-sm",
  secondary: "rounded-xl text-sm",
  ghost: "rounded-lg text-sm",
} as const;

export const INPUT = {
  base: "h-10 text-sm",
  textarea: "w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y",
} as const;

export const AVATAR = {
  sm: "flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-[10px] font-bold text-muted-foreground",
  md: "flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-xs font-bold text-muted-foreground",
  lg: "flex h-12 w-12 items-center justify-center rounded-xl bg-muted/70 text-sm font-bold text-muted-foreground",
} as const;