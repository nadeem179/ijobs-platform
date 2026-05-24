"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Clock3, MapPin, Search, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { ProfileDropdown } from "@/components/navigation/profile-dropdown";
import { LogoWordmark } from "@/branding";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  buildCandidateSearchSuggestions,
  loadRecentSearches,
  parseJobQuery,
  RECENT_SEARCHES_KEY,
  saveRecentSearch,
  SEARCH_QUERY_PARAM,
  type SearchSuggestion,
} from "@/lib/jobs/candidate-search";
import type { Job } from "@/types/job";

const defaultNavLinks = [
  { href: "/discover-jobs", label: "Find Jobs" },
  { href: "/companies", label: "Companies" },
  { href: "/for-recruiters", label: "For Recruiters" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

const candidateNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Discover Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/saved-jobs", label: "Saved" },
  { href: "/profile", label: "Profile" },
];

const recruiterNavLinks = [
  { href: "/recruiter", label: "Dashboard" },
  { href: "/recruiter/jobs", label: "Jobs" },
  { href: "/recruiter/candidates", label: "Candidates" },
  { href: "/recruiter/post-job", label: "Post Job" },
  { href: "/profile", label: "Company/Profile" },
];

export function Header() {
  const { isAuthenticated, user, role, onboardingComplete, getPostAuthRedirect, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [searchQuery, setSearchQuery] = useState("");
  const [desktopFocused, setDesktopFocused] = useState(false);
  const [mobileFocused, setMobileFocused] = useState(false);
  const [suggestionJobs, setSuggestionJobs] = useState<Job[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const desktopBlurTimer = useRef<number | null>(null);
  const mobileBlurTimer = useRef<number | null>(null);

  const hasRoleNavigation = isAuthenticated && onboardingComplete && role;
  const isCandidateNavigation = hasRoleNavigation && role === "candidate";

  const navLinks = !hasRoleNavigation
    ? defaultNavLinks
    : role === "candidate"
    ? candidateNavLinks
    : role === "recruiter"
    ? recruiterNavLinks
    : defaultNavLinks;
  const logoHref = !isAuthenticated
    ? "/"
    : !onboardingComplete
      ? getPostAuthRedirect(user)
      : role === "candidate"
      ? "/dashboard"
      : role === "recruiter"
        ? "/recruiter"
        : role === "admin"
          ? "/admin"
          : "/";
  const searchPlaceholder = "Search jobs, companies, skills";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecentSearches(loadRecentSearches());
    }, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === RECENT_SEARCHES_KEY) {
        setRecentSearches(loadRecentSearches());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/jobs") return;
    const query = new URLSearchParams(window.location.search).get(SEARCH_QUERY_PARAM) ?? "";
    const timer = window.setTimeout(() => {
      setSearchQuery(query);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    if (!isCandidateNavigation) return;
    const supabase = getSupabaseClient();
    if (!supabase) {
      const timer = window.setTimeout(() => {
        setSuggestionJobs([]);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    void supabase
      .from("jobs")
      .select("id,title,company,company_name,company_industry,location,location_type,skills,description,status")
      .eq("status", "active")
      .limit(50)
      .then(({ data, error }) => {
        if (error || !data?.length) {
          setSuggestionJobs([]);
          return;
        }

        setSuggestionJobs(
          data.map((row) => ({
            id: String(row.id),
            title: String(row.title || "Job"),
            company: String(row.company_name || row.company || "Company"),
            companyLogo: "",
            companyDescription: "",
            companySize: "",
            companyIndustry: String(row.company_industry || ""),
            location: String(row.location || ""),
            locationType:
              row.location_type === "Hybrid" || row.location_type === "On-site"
                ? row.location_type
                : "Remote",
            jobType: "Full-time",
            salaryMin: 0,
            salaryMax: 0,
            salaryCurrency: "$",
            salaryPeriod: "year",
            experienceLevel: "Mid",
            skills: Array.isArray(row.skills) ? row.skills.filter((skill): skill is string => typeof skill === "string") : [],
            description: String(row.description || ""),
            responsibilities: [],
            requirements: [],
            preferredQualifications: [],
            benefits: [],
            postedAt: "recently",
            verifiedRecruiter: true,
            activeHiring: true,
            responseRate: 0,
            saved: false,
            featured: false,
            status: "active",
          }))
        );
      });
  }, [isCandidateNavigation]);

  const suggestions = useMemo(() => {
    if (!isCandidateNavigation) return [];
    const parsed = parseJobQuery(searchQuery);
    const suggestionQuery = parsed.normalizedQuery;
    return buildCandidateSearchSuggestions(suggestionJobs, recentSearches).filter((suggestion) => {
      if (!suggestionQuery) return true;
      return suggestion.label.toLowerCase().includes(suggestionQuery);
    });
  }, [isCandidateNavigation, recentSearches, searchQuery, suggestionJobs]);

  const runCandidateSearch = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!isCandidateNavigation) {
      router.push(trimmed ? `/discover-jobs?${SEARCH_QUERY_PARAM}=${encodeURIComponent(trimmed)}` : "/discover-jobs");
      return;
    }
    if (trimmed) {
      const nextRecent = saveRecentSearch(trimmed);
      setRecentSearches(nextRecent);
      router.push(`/jobs?${SEARCH_QUERY_PARAM}=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push("/jobs");
  };

  const scheduleBlur = (type: "desktop" | "mobile") => {
    const timerRef = type === "desktop" ? desktopBlurTimer : mobileBlurTimer;
    timerRef.current = window.setTimeout(() => {
      if (type === "desktop") setDesktopFocused(false);
      else setMobileFocused(false);
    }, 120);
  };

  const clearBlurTimer = (type: "desktop" | "mobile") => {
    const timerRef = type === "desktop" ? desktopBlurTimer : mobileBlurTimer;
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const openAuth = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setMobileOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href={logoHref} className="flex items-center gap-2 shrink-0">
            <LogoWordmark className="w-20 sm:w-20" priority />
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="h-9 rounded-full border-border/70 bg-muted/20 pl-9 text-sm shadow-sm focus-visible:bg-background"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => {
                  clearBlurTimer("desktop");
                  setDesktopFocused(true);
                }}
                onBlur={() => scheduleBlur("desktop")}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  setDesktopFocused(false);
                  runCandidateSearch(searchQuery);
                }}
              />
              {isCandidateNavigation && desktopFocused && suggestions.length > 0 && (
                <SearchSuggestions
                  suggestions={suggestions}
                  onSelect={(value) => {
                    clearBlurTimer("desktop");
                    setSearchQuery(value);
                    setDesktopFocused(false);
                    runCandidateSearch(value);
                  }}
                />
              )}
            </div>
          </div>

          {/* Desktop nav — role-based */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop actions — conditional on auth */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                {role !== "candidate" && (
                  <span className="max-w-40 truncate text-sm font-medium text-muted-foreground">
                    Welcome, {user?.name || "there"}
                  </span>
                )}
                <ProfileDropdown />
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm"
                  onClick={() => openAuth("signin")}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="rounded-full px-5 text-sm"
                  onClick={() => openAuth("signup")}
                >
                  Get started
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label="Toggle menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M3 12h18" />
                  <path d="M3 6h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <div
          className={cn(
            "md:hidden border-t border-border/40 overflow-hidden transition-all duration-200",
            mobileOpen ? "max-h-96" : "max-h-0"
          )}
        >
          <div className="space-y-1 px-4 py-3">
            {/* Mobile search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-9 h-9 text-sm"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => {
                  clearBlurTimer("mobile");
                  setMobileFocused(true);
                }}
                onBlur={() => scheduleBlur("mobile")}
                onKeyDown={(event) => {
                  if (event.key !== "Enter") return;
                  event.preventDefault();
                  setMobileFocused(false);
                  setMobileOpen(false);
                  runCandidateSearch(searchQuery);
                }}
              />
              {isCandidateNavigation && mobileFocused && suggestions.length > 0 && (
                <SearchSuggestions
                  suggestions={suggestions}
                  onSelect={(value) => {
                    clearBlurTimer("mobile");
                    setSearchQuery(value);
                    setMobileFocused(false);
                    setMobileOpen(false);
                    runCandidateSearch(value);
                  }}
                />
              )}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile auth actions */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/20 mt-2">
              {isAuthenticated ? (
                <div className="flex items-center justify-between gap-3 w-full">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                      {user?.initials || "iJ"}
                    </div>
                    {role === "candidate" ? "Account" : `Welcome, ${user?.name || "there"}`}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMobileOpen(false);
                      void logout();
                    }}
                  >
                    Log out
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => openAuth("signin")}
                  >
                    Sign in
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => openAuth("signup")}
                  >
                    Get started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModalShell isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)}>
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
          roleIntent="candidate"
          continueTo={undefined}
        />
      </AuthModalShell>

    </>
  );
}

function SearchSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: SearchSuggestion[];
  onSelect: (value: string) => void;
}) {
  const visibleSuggestions = suggestions.slice(0, 16);

  return (
    <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 rounded-xl border border-border/50 bg-background p-2 shadow-lg">
      <div className="max-h-80 overflow-y-auto">
        {visibleSuggestions.map((suggestion, index) => {
          const showSection =
            index === 0 || suggestion.section !== visibleSuggestions[index - 1]?.section;

          return (
            <div key={`${suggestion.section}:${suggestion.value}`}>
              {showSection && (
                <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {suggestion.section}
                </div>
              )}
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSelect(suggestion.value)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted/60"
              >
                {suggestion.section === "Recent Searches" ? (
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                ) : suggestion.section === "Popular Locations" ? (
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="truncate">{suggestion.label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
