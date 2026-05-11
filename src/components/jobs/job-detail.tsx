"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { TrustPanel } from "@/components/jobs/trust-panel";
import { CompanyCard } from "@/components/jobs/company-card";
import { ApplyModal } from "@/components/apply/apply-modal";
import { SkeletonDetail } from "@/components/jobs/skeleton-detail";
import { Job } from "@/types/job";
import { jobs } from "@/data/jobs";

function formatSalary(job: Job) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} — ${max}${period}`;
}

interface JobDetailProps {
  jobId: string;
}

export function JobDetail({ jobId }: JobDetailProps) {
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [saved, setSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      const found = jobs.find((j) => j.id === jobId) || null;
      setJob(found);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [jobId]);

  const relatedJobs = job
    ? jobs
        .filter(
          (j) =>
            j.id !== job.id &&
            (j.skills.some((s) => job.skills.includes(s)) ||
              j.experienceLevel === job.experienceLevel ||
              j.company === job.company)
        )
        .slice(0, 3)
    : [];

  if (loading) return <SkeletonDetail />;

  if (!job) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-1">Job not found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            This job posting may have been removed or is no longer available.
          </p>
          <Button asChild>
            <Link href="/jobs">Browse all jobs</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Back link */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/jobs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to jobs
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:pb-12">
        <div className="flex gap-8">
          {/* ===== Main Content ===== */}
          <div className="flex-1 min-w-0 max-w-3xl">
            {/* Hero Section */}
            <section className="mb-10">
              <div className="flex items-start gap-4 sm:gap-5 mb-5">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl bg-muted/70 text-lg sm:text-xl font-bold text-muted-foreground">
                  {job.companyLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                        {job.title}
                      </h1>
                      <p className="text-sm sm:text-base text-muted-foreground mt-1">
                        {job.company}
                      </p>
                    </div>
                    <button
                      onClick={() => setSaved(!saved)}
                      className="shrink-0 rounded-lg p-2 -mr-1 text-muted-foreground/40 hover:text-foreground transition-colors"
                      aria-label={saved ? "Unsave" : "Save"}
                    >
                      {saved ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {job.verifiedRecruiter && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
                          <svg
                            width="9"
                            height="9"
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

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 stroke-[1.5]" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 stroke-[1.5]" />
                      {job.locationType}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4 stroke-[1.5]" />
                      {job.postedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="text-lg font-bold tracking-tight">
                  {formatSalary(job)}
                </span>
                <Badge variant="secondary" className="text-xs px-3 py-0.5 font-medium">
                  {job.experienceLevel}
                </Badge>
                {job.activeHiring && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                    Actively hiring
                  </span>
                )}
              </div>

              {/* Desktop Apply button */}
              <div className="hidden lg:flex items-center gap-3 mt-6">
                <Button
                  size="lg"
                  className="rounded-xl text-sm h-11 px-8"
                  onClick={() => setApplyOpen(true)}
                >
                  Apply for this job
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl text-sm h-11 px-6"
                >
                  View company profile
                </Button>
              </div>
            </section>

            {/* Overview */}
            <section className="mb-10">
              <h2 className="text-sm font-semibold mb-3">Overview</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {job.description}
              </p>
            </section>

            {/* Responsibilities */}
            <section className="mb-10">
              <h2 className="text-sm font-semibold mb-3">Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Requirements */}
            <section className="mb-10">
              <h2 className="text-sm font-semibold mb-3">Requirements</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {job.requirements.map((req, i) => (
                  <SkillBadge key={i} className="text-xs px-3 py-1">
                    {req}
                  </SkillBadge>
                ))}
              </div>
              {job.preferredQualifications.length > 0 && (
                <>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
                    Nice to have
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.preferredQualifications.map((qual, i) => (
                      <SkillBadge key={i} className="text-xs px-3 py-1">
                        {qual}
                      </SkillBadge>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Skills */}
            <section className="mb-10">
              <h2 className="text-sm font-semibold mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <SkillBadge key={skill} className="text-xs px-3 py-1">
                    {skill}
                  </SkillBadge>
                ))}
              </div>
            </section>

            {/* Benefits */}
            <section className="mb-10">
              <h2 className="text-sm font-semibold mb-3">Benefits</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {job.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg border border-border/30 bg-background px-3.5 py-2.5"
                  >
                    <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Company Card (mobile) */}
            <div className="lg:hidden mb-10">
              <CompanyCard job={job} />
            </div>

            {/* Related Jobs */}
            {relatedJobs.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-4">
                  Related opportunities
                </h2>
                <div className="space-y-2.5">
                  {relatedJobs.map((rj) => (
                    <Link
                      key={rj.id}
                      href={`/jobs/${rj.id}`}
                      className="flex items-center gap-3 rounded-xl border border-border/30 bg-background p-4 transition-colors hover:border-border/60"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-xs font-bold text-muted-foreground">
                        {rj.companyLogo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{rj.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {rj.company} &middot; {formatSalary(rj)} &middot;{" "}
                          {rj.locationType}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 space-y-5">
              <TrustPanel job={job} />
              <CompanyCard job={job} />
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky Bottom Apply Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 flex items-center gap-3">
        <Button
          size="lg"
          className="flex-1 rounded-xl text-sm h-11"
          onClick={() => setApplyOpen(true)}
        >
          Apply Now
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-xl text-sm h-11 px-4"
          onClick={() => setSaved(!saved)}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        jobTitle={job.title}
        companyName={job.company}
      />
    </div>
  );
}