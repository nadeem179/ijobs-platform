"use client";

import { Bookmark, BookmarkCheck, MapPin, Clock, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { Job } from "@/types/job";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

function formatSalary(job: Job) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} — ${max}${period}`;
}

interface JobCardProps {
  job: Job;
  onSave: (id: string) => void;
}

export function JobCard({ job, onSave }: JobCardProps) {
  const { showToast } = useToast();
  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-background p-5 sm:p-6 transition-all duration-200",
        job.featured
          ? "border-primary/20 hover:border-primary/30 shadow-sm hover:shadow-md"
          : "border-border/30 hover:border-border/60 shadow-xs hover:shadow-sm"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
        {/* Company Logo — hidden on smallest mobile, visible sm+ */}
        <div
          className={cn(
            "hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-bold",
            job.featured
              ? "bg-primary/8 text-primary"
              : "bg-muted/70 text-muted-foreground"
          )}
        >
          {job.companyLogo}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header: Title + Save */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Mobile: inline logo + company */}
              <div className="flex sm:hidden items-center gap-2 mb-1.5">
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
                  {job.company}
                </span>
              </div>

              <h3 className="text-[15px] sm:text-base font-semibold leading-snug tracking-tight">
                {job.title}
              </h3>
              {/* Desktop company */}
              <p className="hidden sm:block text-sm text-muted-foreground mt-0.5">
                {job.company}
              </p>
            </div>

            {/* Save button — larger touch target on mobile */}
            <button
              onClick={() => {
                onSave(job.id);
                showToast(
                  job.saved ? "Job removed from saved" : "Job saved for later",
                  "success"
                );
              }}
              className="shrink-0 rounded-lg p-2 -mr-1 -mt-1 sm:mr-0 sm:mt-0 text-muted-foreground/40 hover:text-foreground transition-colors"
              aria-label={job.saved ? "Unsave job" : "Save job"}
            >
              {job.saved ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Verified recruiter badge */}
          {job.verifiedRecruiter && (
            <div className="flex items-center gap-1.5 mt-1.5">
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
            </div>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 stroke-[1.5]" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 stroke-[1.5]" />
              {job.locationType}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 stroke-[1.5]" />
              {job.postedAt}
            </span>
          </div>

          {/* Salary + Level */}
          <p className="text-sm font-semibold mt-3 tracking-tight">
            {formatSalary(job)}
            <span className="text-xs text-muted-foreground font-normal ml-1.5">
              &middot; {job.experienceLevel}
            </span>
          </p>

          {/* Description */}
          <p className="text-sm text-muted-foreground/80 leading-relaxed mt-2 line-clamp-2">
            {job.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.skills.slice(0, 4).map((skill) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
            {job.skills.length > 4 && (
              <SkillBadge>+{job.skills.length - 4}</SkillBadge>
            )}
          </div>

          {/* Trust signals divider */}
          {(job.activeHiring || job.responseRate >= 80) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3.5 pt-3.5 border-t border-border/20">
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

          {/* CTA Actions */}
          <div className="flex items-center gap-2.5 mt-4">
            <Link href={`/jobs/${job.id}`}>
              <Button
                size="sm"
                className="text-xs h-9 px-5 rounded-xl font-medium"
              >
                Apply Now
              </Button>
            </Link>
            <Link href={`/jobs/${job.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-9 px-5 rounded-xl font-medium"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}