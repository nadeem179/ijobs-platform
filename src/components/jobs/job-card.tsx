"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, BookmarkCheck, Briefcase, Clock, MapPin } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { ApplicationStatus } from "@/components/applications/application-status";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth";
import type { SavedJobActionResult } from "@/hooks/use-saved-jobs";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { HighlightedText } from "@/components/jobs/highlighted-text";
import type { Job } from "@/types/job";
import type { Application } from "@/types/profile";
import { cn } from "@/lib/utils";

function formatSalary(job: Job) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} - ${max}${period}`;
}

interface JobCardProps {
  job: Job;
  onSave: (id: string) => Promise<SavedJobActionResult>;
  applicationStatus?: Application["status"];
  highlightQuery?: string;
}

export function JobCard({ job, onSave, applicationStatus, highlightQuery = "" }: JobCardProps) {
  const { showToast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    if (isLoading) return;

    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSave(job.id);

      if (result.requiresAuth) {
        setAuthOpen(true);
        return;
      }

      if (result.error) {
        showToast(result.error, "error");
        return;
      }

      showToast(
        result.saved === false
          ? "Job removed from saved jobs."
          : "Job saved for later.",
        "success"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-background p-4 transition-all duration-200",
        job.featured
          ? "border-primary/20 hover:border-primary/30 shadow-sm hover:shadow-md"
          : "border-border/30 hover:border-border/60 shadow-xs hover:shadow-sm"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div
          className={cn(
            "hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold sm:flex",
            job.featured
              ? "bg-primary/8 text-primary"
              : "bg-muted/70 text-muted-foreground"
          )}
        >
          {job.companyLogo}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 flex items-center gap-2 sm:hidden">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-bold",
                    job.featured
                      ? "bg-primary/8 text-primary"
                      : "bg-muted/70 text-muted-foreground"
                  )}
                >
                  {job.companyLogo}
                </div>
                <span className="text-xs text-muted-foreground">
                  <HighlightedText text={job.company} query={highlightQuery} />
                </span>
              </div>

              <h3 className="text-sm font-semibold leading-snug tracking-tight sm:text-[15px]">
                <HighlightedText text={job.title} query={highlightQuery} />
              </h3>
              <p className="mt-0.5 hidden text-xs text-muted-foreground sm:block">
                <HighlightedText text={job.company} query={highlightQuery} />
              </p>
            </div>

            <button
              onClick={() => void handleSave()}
              disabled={isSaving || isLoading}
              className="shrink-0 rounded-lg p-2 -mr-1 -mt-1 text-muted-foreground/40 transition-colors hover:text-foreground sm:mr-0 sm:mt-0"
              aria-label={job.saved ? "Unsave job" : "Save job"}
            >
              {job.saved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>

          {job.verifiedRecruiter && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground/70">
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-primary"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
                Verified recruiter
              </span>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                Easy Apply
              </span>
            </div>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 stroke-[1.5]" />
              <HighlightedText text={job.location} query={highlightQuery} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 stroke-[1.5]" />
              <HighlightedText text={job.locationType} query={highlightQuery} />
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 stroke-[1.5]" />
              {job.postedAt}
            </span>
          </div>

          <p className="mt-2.5 text-sm font-semibold tracking-tight">
            {formatSalary(job)}
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">
              &middot; {job.jobType} &middot; {job.experienceLevel}
            </span>
          </p>

          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground/80">
            <HighlightedText text={job.description} query={highlightQuery} />
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <SkillBadge key={skill}>
                <HighlightedText text={skill} query={highlightQuery} />
              </SkillBadge>
            ))}
            {job.skills.length > 4 && (
              <SkillBadge>+{job.skills.length - 4}</SkillBadge>
            )}
          </div>

          {(job.activeHiring || job.responseRate >= 80) && (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border/20 pt-3">
              {job.activeHiring && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Actively hiring
                </span>
              )}
              {job.responseRate >= 80 && (
                <span className="text-[11px] text-muted-foreground/70">
                  {'>'}{job.responseRate}% response rate
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex items-center gap-2.5">
            {applicationStatus ? (
              <Button
                size="sm"
                className="h-9 rounded-xl px-5 text-xs font-medium"
                disabled
              >
                Applied
              </Button>
            ) : (
              <Link href={`/jobs/${job.id}`}>
                <Button size="sm" className="h-9 rounded-xl px-5 text-xs font-medium">
                  Apply Now
                </Button>
              </Link>
            )}
            {applicationStatus && <ApplicationStatus status={applicationStatus} />}
            <Link href={`/jobs/${job.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl px-5 text-xs font-medium"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <AuthModalShell isOpen={authOpen} onClose={() => setAuthOpen(false)}>
        <AuthModal onClose={() => setAuthOpen(false)} />
      </AuthModalShell>
    </div>
  );
}
