"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Briefcase,
  Building2,
  FileText,
  Lightbulb,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RecruiterGuard } from "@/components/navigation/recruiter-guard";
import { useAuth } from "@/context/auth";
import { loadCurrentProfile, type RecruiterProfileRow } from "@/lib/profile/persistence";
import { recruiterService } from "@/services";
import type { RecruiterCandidateItem, RecruiterJobItem } from "@/services";

const pipelineStages = [
  { label: "New", statuses: ["applied"] },
  { label: "Shortlisted", statuses: ["shortlisted"] },
  { label: "Interviewing", statuses: ["interviewing", "interview"] },
  { label: "Offer", statuses: ["offer"] },
  { label: "Hired", statuses: ["hired"] },
];

const statusVariant: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  active: "success",
  draft: "secondary",
  inactive: "secondary",
  paused: "outline",
  closed: "destructive",
  filled: "success",
  applied: "secondary",
  shortlisted: "outline",
  rejected: "destructive",
  hired: "success",
};

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [candidates, setCandidates] = useState<RecruiterCandidateItem[]>([]);
  const [profile, setProfile] = useState<RecruiterProfileRow | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadDashboard() {
      const [jobsResult, candidatesResult, profileResult] = await Promise.all([
        recruiterService.getJobs(),
        recruiterService.getCandidates(),
        loadCurrentProfile().catch(() => null),
      ]);
      if (!mounted) return;
      setJobs(jobsResult.data ?? []);
      setCandidates(candidatesResult.data ?? []);
      setProfile(profileResult?.recruiterProfile ?? null);
      setLoaded(true);
    }

    void loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status === "active"),
    [jobs]
  );
  const applicationsByJob = useMemo(() => {
    const grouped = new Map<string, RecruiterCandidateItem[]>();
    candidates.forEach((candidate) => {
      if (!candidate.jobId) return;
      grouped.set(candidate.jobId, [...(grouped.get(candidate.jobId) ?? []), candidate]);
    });
    return grouped;
  }, [candidates]);
  const newApplicants = candidates.filter((candidate) => candidate.status === "applied").length;
  const hasApplications = candidates.length > 0;
  const hasMatchScores = candidates.some((candidate) => candidate.matchScore > 0);
  const zeroApplicationJobs = jobs.filter((job) => (applicationsByJob.get(job.id)?.length ?? job.applicants) === 0);
  const profileCompletion = getCompanyProfileCompletion(profile);
  const greetingName = profile?.company_name || profile?.recruiter_full_name || user?.name || "Recruiter";
  const summary = jobs.length
    ? `You have ${newApplicants} new applicants across ${activeJobs.length} active roles.`
    : "Post your first job to start receiving matched candidates.";

  return (
    <RecruiterGuard>
      <div className="min-h-screen">
        <section className="border-b border-border/40 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">AI Hiring Command Center</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  Good to see you, {greetingName}
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">{loaded ? summary : "Loading your hiring workspace..."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button className="rounded-xl" asChild>
                  <Link href="/recruiter/post-job">
                    <Plus className="mr-2 h-4 w-4" />
                    Post a Job
                  </Link>
                </Button>
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link href="/recruiter/candidates">View Candidates</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <main className="page-container">
          <div className="grid gap-8 xl:grid-cols-[1fr_340px]">
            <div className="space-y-8">
              <DashboardSection title="Needs Attention">
                {newApplicants > 0 || zeroApplicationJobs.length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {newApplicants > 0 ? (
                      <AttentionCard
                        icon={<Users className="h-4 w-4" />}
                        title={`${newApplicants} new applicants`}
                        copy="Review the newest applications while the role context is fresh."
                        actionHref="/recruiter/candidates"
                        actionLabel="Review"
                      />
                    ) : null}
                    {zeroApplicationJobs.length > 0 ? (
                      <AttentionCard
                        icon={<Briefcase className="h-4 w-4" />}
                        title={`${zeroApplicationJobs.length} jobs with zero applications`}
                        copy="Check title clarity, location, salary, and required skills."
                        actionHref="/recruiter/jobs"
                        actionLabel="View jobs"
                      />
                    ) : null}
                  </div>
                ) : (
                  <EmptyState
                    title="No urgent actions yet."
                    copy="Post a job to start your hiring pipeline."
                    actionHref="/recruiter/post-job"
                    actionLabel="Post a Job"
                  />
                )}
              </DashboardSection>

              <DashboardSection title="Hiring Pipeline Snapshot">
                {hasApplications ? (
                  <div className="card-base">
                    <div className="grid gap-3 sm:grid-cols-5">
                      {pipelineStages.map((stage) => {
                        const count = candidates.filter((candidate) =>
                          stage.statuses.includes(candidate.status)
                        ).length;
                        return (
                          <div key={stage.label} className="rounded-lg border border-border/30 p-3">
                            <p className="text-xs text-muted-foreground">{stage.label}</p>
                            <p className="mt-2 text-2xl font-semibold tracking-tight">{count}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <EmptyState title="Pipeline will appear once candidates apply." />
                )}
              </DashboardSection>

              <DashboardSection title="Active Jobs Performance">
                {jobs.length > 0 ? (
                  <div className="space-y-3">
                    {jobs.map((job) => {
                      const jobApplications = applicationsByJob.get(job.id) ?? [];
                      const applicationCount = jobApplications.length || job.applicants;
                      const strongMatches = hasMatchScores
                        ? jobApplications.filter((candidate) => candidate.matchScore >= 80).length
                        : null;
                      const lastApplication = jobApplications[0]?.appliedAt || "";
                      return (
                        <article key={job.id} className="card-interactive">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold">{job.title}</h3>
                                <Badge variant={statusVariant[job.status] || "outline"}>
                                  {capitalize(job.status)}
                                </Badge>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {job.location || "Location not set"} {job.postedAt ? `· Posted ${job.postedAt}` : ""}
                              </p>
                            </div>
                            <div className="grid gap-3 text-sm sm:grid-cols-3 lg:min-w-[420px]">
                              <Metric label="Applications" value={String(applicationCount)} />
                              <Metric label="Strong matches" value={strongMatches === null ? "Not available" : String(strongMatches)} />
                              <Metric label="Last application" value={lastApplication || "None yet"} />
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl lg:shrink-0" asChild>
                              <Link href={`/recruiter/jobs/${job.id}/applicants`}>View Applications</Link>
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="Create your first job post"
                    copy="Define the role, publish it, and Diplotix will start matching candidates."
                    actionHref="/recruiter/post-job"
                    actionLabel="Post a Job"
                  />
                )}
              </DashboardSection>

              <DashboardSection title="Top Matches">
                {hasMatchScores ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {candidates
                      .filter((candidate) => candidate.matchScore > 0)
                      .sort((a, b) => b.matchScore - a.matchScore)
                      .slice(0, 4)
                      .map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} showMatch />
                      ))}
                  </div>
                ) : (
                  <EmptyState title="Top matches will appear after candidates apply." />
                )}
              </DashboardSection>

              <DashboardSection title="Recent Applicants Feed">
                {hasApplications ? (
                  <div className="space-y-3">
                    {candidates.slice(0, 6).map((candidate) => (
                      <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                  </div>
                ) : (
                  <EmptyState title="No applications yet." />
                )}
              </DashboardSection>
            </div>

            <aside className="space-y-8">
              <DashboardSection title="Hiring Insights">
                {jobs.length || hasApplications ? (
                  <div className="card-base space-y-4">
                    <InsightRow icon={<Briefcase className="h-4 w-4" />} label="Active jobs" value={activeJobs.length} />
                    <InsightRow icon={<Users className="h-4 w-4" />} label="Total applications" value={candidates.length} />
                    {hasMatchScores ? (
                      <InsightRow icon={<Sparkles className="h-4 w-4" />} label="Average match score" value={`${averageMatchScore(candidates)}%`} />
                    ) : null}
                    <InsightRow icon={<FileText className="h-4 w-4" />} label="Jobs with zero applications" value={zeroApplicationJobs.length} />
                  </div>
                ) : (
                  <EmptyState title="Insights will appear once your jobs receive applications." />
                )}
              </DashboardSection>

              <DashboardSection title="Company Profile">
                <div className="card-base">
                  {profileCompletion.total > 0 ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-2xl font-semibold tracking-tight">{profileCompletion.percent}%</p>
                          <p className="mt-1 text-xs text-muted-foreground">Company profile completeness</p>
                        </div>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-foreground" style={{ width: `${profileCompletion.percent}%` }} />
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">
                        Complete your company profile to improve candidate trust.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Complete your company profile to improve candidate trust.
                    </p>
                  )}
                  <Button variant="outline" size="sm" className="mt-4 w-full rounded-xl" asChild>
                    <Link href="/profile/edit">Update Profile</Link>
                  </Button>
                </div>
              </DashboardSection>

              <DashboardSection title="AI Recommendations">
                <div className="card-base">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5">
                    <Lightbulb className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium">Recommendations need hiring signal.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    AI guidance will appear when Diplotix has real job and applicant activity to analyze.
                  </p>
                </div>
              </DashboardSection>
            </aside>
          </div>
        </main>
      </div>
    </RecruiterGuard>
  );
}

function DashboardSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-section-title">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function EmptyState({
  title,
  copy,
  actionHref,
  actionLabel,
}: {
  title: string;
  copy?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="card-base border-dashed">
      <p className="text-sm font-medium">{title}</p>
      {copy ? <p className="mt-2 text-sm text-muted-foreground">{copy}</p> : null}
      {actionHref && actionLabel ? (
        <Button size="sm" className="mt-4 rounded-xl" asChild>
          <Link href={actionHref}>
            {actionLabel}
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function AttentionCard({
  icon,
  title,
  copy,
  actionHref,
  actionLabel,
}: {
  icon: ReactNode;
  title: string;
  copy: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="card-base">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary">
        {icon}
      </div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{copy}</p>
      <Button variant="outline" size="sm" className="mt-4 rounded-xl" asChild>
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}

function CandidateCard({ candidate, showMatch = false }: { candidate: RecruiterCandidateItem; showMatch?: boolean }) {
  return (
    <article className="card-interactive">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{candidate.name}</h3>
            <Badge variant={statusVariant[candidate.status] || "outline"}>{capitalize(candidate.status)}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {candidate.appliedFor} {candidate.appliedAt ? `· ${candidate.appliedAt}` : ""}
          </p>
          {candidate.skills.length > 0 ? (
            <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
              Skills: {candidate.skills.slice(0, 4).join(", ")}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 sm:shrink-0">
          {showMatch ? (
            <Badge variant="outline">{candidate.matchScore}% match</Badge>
          ) : null}
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link href="/recruiter/candidates">Review</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function InsightRow({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="inline-flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function getCompanyProfileCompletion(profile: RecruiterProfileRow | null) {
  if (!profile) return { total: 0, complete: 0, percent: 0 };
  const fields = [
    profile.company_name,
    profile.company_website,
    profile.company_size,
    profile.industry,
    profile.company_location || profile.location,
    profile.company_description,
    profile.company_logo_url,
  ];
  const complete = fields.filter((value) => Boolean(value && String(value).trim())).length;
  return {
    total: fields.length,
    complete,
    percent: Math.round((complete / fields.length) * 100),
  };
}

function averageMatchScore(candidates: RecruiterCandidateItem[]) {
  const scored = candidates.filter((candidate) => candidate.matchScore > 0);
  if (!scored.length) return 0;
  return Math.round(scored.reduce((total, candidate) => total + candidate.matchScore, 0) / scored.length);
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
