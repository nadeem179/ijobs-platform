"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useAuth } from "@/context/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { ProfileDropdown } from "@/components/navigation/profile-dropdown";
import { LogoIcon } from "@/branding";

const defaultNavLinks = [
  { href: "/jobs", label: "Find Jobs" },
  { href: "/recruiter", label: "For Recruiters" },
];

const candidateNavLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "Jobs" },
  { href: "/applications", label: "Applications" },
  { href: "/saved-jobs", label: "Saved Jobs" },
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
  const { isAuthenticated, user, role, onboardingComplete, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  const hasRoleNavigation = isAuthenticated && onboardingComplete && role;

  const navLinks = !hasRoleNavigation
    ? defaultNavLinks
    : role === "candidate"
    ? candidateNavLinks
    : role === "recruiter"
    ? recruiterNavLinks
    : defaultNavLinks;

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
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <LogoIcon size={32} className="text-primary" />
            <span className="text-base font-semibold tracking-tight hidden sm:inline">
              iJobs
            </span>
          </Link>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, skills..."
                className="pl-9 h-9 text-sm bg-muted/50 border-muted focus-visible:bg-background"
              />
            </div>
          </div>

          {/* Desktop nav — role-based */}
          <nav className="hidden md:flex items-center gap-6">
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
                <span className="max-w-40 truncate text-sm font-medium text-muted-foreground">
                  Welcome, {user?.name || "there"}
                </span>
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
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="text-sm"
                  onClick={() => openAuth("signup")}
                >
                  Get Started
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
                placeholder="Search jobs..."
                className="pl-9 h-9 text-sm"
              />
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
                    Welcome, {user?.name || "there"}
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
                    Sign In
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => openAuth("signup")}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth modal */}
      <AuthModalShell isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)}>
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
        />
      </AuthModalShell>
    </>
  );
}
