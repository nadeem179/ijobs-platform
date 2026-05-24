"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecruiterHeader } from "@/components/recruiter/recruiter-header";
import { RecruiterGuard } from "@/components/navigation/recruiter-guard";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { recruiterService, type RecruiterCandidateItem, type RecruiterJobItem } from "@/services";
import { getSupabaseClient } from "@/lib/supabase/client";
import { scoreApplicantMatch } from "@/lib/recruiter/applicant-match";
import type { ScreeningAnswer } from "@/types/screening";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ChevronDown,
  Download,
  Eye,
  XCircle,
  Star,
  MapPin,
  UserCheck,
  X,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  applied: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  viewed: "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  resume_downloaded:
    "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300",
  shortlisted:
    "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  interviewing:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  rejected: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  hired: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
};

const filters = [
  { id: "newest", label: "Newest" },
  { id: "applied", label: "Applied" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "rejected", label: "Rejected" },
  { id: "hired", label: "Hired" },
] as const;

const filterStatusMap: Record<string, RecruiterCandidateItem["status"][]> = {
  applied: ["applied", "viewed", "resume_downloaded"],
  shortlisted: ["shortlisted"],
  rejected: ["rejected"],
  hired: ["hired"],
};

function formatStatus(status: RecruiterCandidateItem["status"]) {
  if (status === "resume_downloaded") return "Resume downloaded";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatEvent(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startDate) / 86400000);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function initialsFor(candidate: RecruiterCandidateItem) {
  return candidate.name
    .split(/[ @._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getStatusTimestampField(status: "shortlisted" | "rejected" | "hired") {
  if (status === "shortlisted") return "shortlistedAt";
  if (status === "rejected") return "rejectedAt";
  return "hiredAt";
}

function applicationEvents(candidate: RecruiterCandidateItem) {
  return [
    candidate.viewedAt ? `Viewed ${formatEvent(candidate.viewedAt)}` : "",
    candidate.resumeDownloadedAt ? `Resume downloaded ${formatEvent(candidate.resumeDownloadedAt)}` : "",
    candidate.shortlistedAt ? `Shortlisted ${formatEvent(candidate.shortlistedAt)}` : "",
    candidate.rejectedAt ? `Rejected ${formatEvent(candidate.rejectedAt)}` : "",
    candidate.hiredAt ? `Hired ${formatEvent(candidate.hiredAt)}` : "",
  ].filter(Boolean);
};

function formatList(values?: string[]) {
  return (values ?? []).filter((value) => value && value.trim());
}

function formatSalary(job: RecruiterJobItem) {
  if (!job.salaryMin && !job.salaryMax) return "Compensation not set";
  const currency = job.salaryCurrency || "$";
  const period = job.salaryPeriod === "hour" ? "hr" : "yr";
  const min = job.salaryMin ? `${currency}${(job.salaryMin / 1000).toFixed(0)}K` : "";
  const max = job.salaryMax ? `${currency}${(job.salaryMax / 1000).toFixed(0)}K` : "";
  return `${[min, max].filter(Boolean).join(" - ")}/${period}`;
}

function formatPostedDate(value?: string) {
  return value || "Posted date unavailable";
}

type MatchFilter = "all" | "80" | "50-79" | "below-50" | "pending";
type ExperienceFilter = "all" | "0-2" | "3-5" | "6-10" | "10-plus";
type ResumeFilter = "all" | "available" | "missing";
type AppliedDateFilter = "all" | "today" | "7d" | "30d";
type ApplicantSort = "best-match" | "newest" | "experience" | "recent-activity";

function getMatchTone(score: number | null) {
  if (score === null) return "border-border/50 bg-muted/40 text-muted-foreground";
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300";
  if (score >= 50) return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300";
  return "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300";
}

function normalizeSearchText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function getExperienceYears(value?: string) {
  if (!value) return null;
  const yearMatch = value.match(/(\d+(?:\.\d+)?)\s*y/i);
  if (yearMatch) return Number(yearMatch[1]);
  const numberMatch = value.match(/\d+(?:\.\d+)?/);
  return numberMatch ? Number(numberMatch[0]) : null;
}

function getTime(value?: string | null) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function isWithinAppliedDate(candidate: RecruiterCandidateItem, filter: AppliedDateFilter) {
  if (filter === "all") return true;
  const appliedTime = getTime(candidate.appliedAtTimestamp);
  if (!appliedTime) return false;
  const now = Date.now();
  const dayMs = 86400000;
  if (filter === "today") return now - appliedTime <= dayMs;
  if (filter === "7d") return now - appliedTime <= 7 * dayMs;
  return now - appliedTime <= 30 * dayMs;
}

function normalizeScreeningAnswers(value: unknown): ScreeningAnswer[] {
  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        })()
      : value;

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item): ScreeningAnswer[] => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const question =
      typeof row.question === "string"
        ? row.question.trim()
        : typeof row.label === "string"
          ? row.label.trim()
          : "";
    if (!question) return [];

    const answer = row.answer;
    return [
      {
        question_id:
          typeof row.question_id === "string" && row.question_id.trim()
            ? row.question_id
            : typeof row.id === "string" && row.id.trim()
              ? row.id
              : question,
        question,
        type:
          row.type === "checkboxes" ||
          row.type === "multiple_choice" ||
          row.type === "single_choice" ||
          row.type === "text"
            ? row.type
            : "text",
        answer: Array.isArray(answer)
          ? answer.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
          : typeof answer === "string"
            ? answer
            : "",
      },
    ];
  });
}

type RecruiterApplicantsPageProps = {
  jobId?: string;
  backHref?: string;
  emptyMessage?: string;
  showHeader?: boolean;
  showFilters?: boolean;
  showJobContext?: boolean;
};

export function RecruiterApplicantsPage({
  jobId,
  backHref = "/recruiter",
  emptyMessage = "Applications for your jobs will appear here.",
  showHeader = true,
  showFilters = true,
  showJobContext = false,
}: RecruiterApplicantsPageProps) {
  const [candidates, setCandidates] = useState<RecruiterCandidateItem[]>([]);
  const [job, setJob] = useState<RecruiterJobItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobSummaryOpen, setJobSummaryOpen] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]["id"]>("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [experienceFilter, setExperienceFilter] = useState<ExperienceFilter>("all");
  const [skillFilter, setSkillFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<RecruiterCandidateItem["status"] | "all">("all");
  const [resumeFilter, setResumeFilter] = useState<ResumeFilter>("all");
  const [appliedDateFilter, setAppliedDateFilter] = useState<AppliedDateFilter>("all");
  const [sortBy, setSortBy] = useState<ApplicantSort>("best-match");
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<RecruiterCandidateItem | null>(null);

  useEffect(() => {
    let mounted = true;
    const requests = [
      recruiterService.getCandidates(jobId),
      jobId && showJobContext ? recruiterService.getJob(jobId) : Promise.resolve({ data: null, error: null }),
    ] as const;

    void Promise.all(requests).then(([candidatesResult, jobResult]) => {
      if (!mounted) return;
      if (candidatesResult.data) {
        setCandidates(candidatesResult.data);
      } else if (candidatesResult.error) {
        setError(candidatesResult.error.message);
      }
      if (jobResult.data) setJob(jobResult.data);
      if (jobResult.error) setError(jobResult.error.message);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [jobId, showJobContext]);

  const skillOptions = useMemo(() => {
    return Array.from(
      new Set(
        candidates
          .flatMap((candidate) => candidate.skills)
          .map((skill) => skill.trim())
          .filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right));
  }, [candidates]);

  const displayCandidates = useMemo(() => {
    const filtered =
      activeFilter === "newest"
        ? candidates
        : candidates.filter((candidate) =>
            (filterStatusMap[activeFilter] ?? [activeFilter as RecruiterCandidateItem["status"]]).includes(candidate.status)
          );

    if (!showJobContext) return filtered;

    const query = normalizeSearchText(searchQuery);
    const next = filtered.filter((candidate) => {
      const match = scoreApplicantMatch(job, candidate);
      const experienceYears = getExperienceYears(candidate.experience);
      const searchText = [
        candidate.name,
        candidate.headline,
        candidate.currentRole,
        candidate.bio,
        candidate.resumeText,
        candidate.skills.join(" "),
      ]
        .map(normalizeSearchText)
        .join(" ");

      if (query && !searchText.includes(query)) return false;
      if (matchFilter === "80" && (match.score === null || match.score < 80)) return false;
      if (matchFilter === "50-79" && (match.score === null || match.score < 50 || match.score > 79)) return false;
      if (matchFilter === "below-50" && (match.score === null || match.score >= 50)) return false;
      if (matchFilter === "pending" && match.score !== null) return false;
      if (experienceFilter === "0-2" && (experienceYears === null || experienceYears > 2)) return false;
      if (experienceFilter === "3-5" && (experienceYears === null || experienceYears < 3 || experienceYears > 5)) return false;
      if (experienceFilter === "6-10" && (experienceYears === null || experienceYears < 6 || experienceYears > 10)) return false;
      if (experienceFilter === "10-plus" && (experienceYears === null || experienceYears < 10)) return false;
      if (skillFilter !== "all" && !candidate.skills.some((skill) => skill.trim().toLowerCase() === skillFilter.trim().toLowerCase())) return false;
      if (statusFilter !== "all" && candidate.status !== statusFilter) return false;
      if (resumeFilter === "available" && !candidate.resumeUrl) return false;
      if (resumeFilter === "missing" && candidate.resumeUrl) return false;
      if (!isWithinAppliedDate(candidate, appliedDateFilter)) return false;

      return true;
    });

    return next.sort((left, right) => {
      if (sortBy === "newest") {
        return getTime(right.appliedAtTimestamp) - getTime(left.appliedAtTimestamp);
      }
      if (sortBy === "experience") {
        return (getExperienceYears(right.experience) ?? -1) - (getExperienceYears(left.experience) ?? -1);
      }
      if (sortBy === "recent-activity") {
        return getTime(right.lastActivityAt || right.appliedAtTimestamp) - getTime(left.lastActivityAt || left.appliedAtTimestamp);
      }

      const leftScore = scoreApplicantMatch(job, left).score;
      const rightScore = scoreApplicantMatch(job, right).score;

      if (leftScore === null && rightScore === null) return 0;
      if (leftScore === null) return 1;
      if (rightScore === null) return -1;
      return rightScore - leftScore;
    });
  }, [
    activeFilter,
    appliedDateFilter,
    candidates,
    experienceFilter,
    job,
    matchFilter,
    resumeFilter,
    searchQuery,
    showJobContext,
    skillFilter,
    sortBy,
    statusFilter,
  ]);

  const runCandidateAction = async (
    id: string,
    action: () => Promise<{ error: { message: string } | null } | { error: null }>
  ) => {
    if (savingIds.has(id)) return false;
    setError(null);
    setSavingIds((current) => new Set(current).add(id));
    const result = await action();
    setSavingIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

    if (result.error) {
      setError(result.error.message);
      return false;
    }
    return true;
  };

  const markEvent = async (id: string, event: "viewed" | "resume_downloaded") => {
    const succeeded = await runCandidateAction(id, () => recruiterService.updateApplicationEvent(id, event));
    if (!succeeded) return;
    const now = new Date().toISOString();
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status:
                candidate.status === "applied" ||
                (event === "resume_downloaded" && candidate.status === "viewed")
                  ? event === "viewed"
                    ? "viewed"
                    : "resume_downloaded"
                  : candidate.status,
              viewedAt: event === "viewed" ? now : candidate.viewedAt,
              resumeDownloadedAt:
                event === "resume_downloaded" ? now : candidate.resumeDownloadedAt,
            }
          : candidate
      )
    );
    setSelectedApplication((current) =>
      current?.id === id
        ? {
            ...current,
            status:
              current.status === "applied" ||
              (event === "resume_downloaded" && current.status === "viewed")
                ? event === "viewed"
                  ? "viewed"
                  : "resume_downloaded"
                : current.status,
            viewedAt: event === "viewed" ? now : current.viewedAt,
            resumeDownloadedAt:
              event === "resume_downloaded" ? now : current.resumeDownloadedAt,
          }
        : current
    );
  };

  const updateStatus = async (id: string, status: "shortlisted" | "rejected" | "hired") => {
    const succeeded = await runCandidateAction(id, () => recruiterService.updateApplicationStatus(id, status));
    if (!succeeded) return;

    const now = new Date().toISOString();
    const timestampField = getStatusTimestampField(status);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === id
          ? {
              ...candidate,
              status,
              [timestampField]: now,
            }
          : candidate
      )
    );
    setSelectedApplication((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            [timestampField]: now,
          }
        : current
    );
  };

  const openResume = async (candidate: RecruiterCandidateItem) => {
    if (!candidate.resumeUrl) return;
    await markEvent(candidate.id, "resume_downloaded");
    window.open(candidate.resumeUrl, "_blank", "noopener,noreferrer");
  };

  const refreshSelectedApplicationAnswers = async (applicationId: string) => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("applications")
      .select("id,job_id,candidate_id,status,screening_answers")
      .eq("id", applicationId)
      .maybeSingle();

    if (error || !data) return;

    const row = data as {
      id: string;
      status?: RecruiterCandidateItem["status"] | null;
      screening_answers?: unknown;
    };
    const screeningAnswers = normalizeScreeningAnswers(row.screening_answers);
    setCandidates((current) =>
      current.map((candidate) =>
        candidate.id === applicationId
          ? {
              ...candidate,
              status: row.status || candidate.status,
              screeningAnswers,
            }
          : candidate
      )
    );
    setSelectedApplication((current) =>
      current?.id === applicationId
        ? {
            ...current,
            status: row.status || current.status,
            screeningAnswers,
          }
        : current
    );
  };

  const openApplication = async (candidate: RecruiterCandidateItem) => {
    setSelectedApplication(candidate);
    await refreshSelectedApplicationAnswers(candidate.id);
    if (candidate.status === "applied") {
      await markEvent(candidate.id, "viewed");
      setSelectedApplication((current) =>
        current?.id === candidate.id
          ? {
              ...current,
              status: "viewed",
              viewedAt: new Date().toISOString(),
            }
          : current
      );
    }
  };

  const renderAnswer = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      const values = answer.filter(Boolean);
      if (values.length === 0) return <span>No answer</span>;
      return (
        <span className="flex flex-wrap gap-1.5">
          {values.map((value) => (
            <span key={value} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {value}
            </span>
          ))}
        </span>
      );
    }
    return <span>{answer || "No answer"}</span>;
  };

  return (
    <RecruiterGuard>
      <div className="min-h-screen">

  {showHeader && (
    <section className="border-b border-border/40 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <RecruiterHeader />
      </div>
    </section>
  )}

  <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {showJobContext ? (
            <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
              <Link href="/recruiter/jobs" className="hover:text-foreground">
                Jobs
              </Link>
              <span>/</span>
              <span className="max-w-[220px] truncate text-foreground sm:max-w-md">
                {job?.title || "Job"}
              </span>
              <span>/</span>
              <span>Applicants</span>
            </nav>
          ) : (
            <Link
              href={backHref}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          )}

          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight mb-1">
              Applications
            </h1>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading applicants..." : `${candidates.length} total applicants`}
            </p>
          </div>

          {showJobContext && (
            <div className="mb-6 rounded-xl border border-border/40 bg-background p-4">
              <button
                type="button"
                onClick={() => setJobSummaryOpen((open) => !open)}
                className="flex w-full items-start justify-between gap-4 text-left"
                aria-expanded={jobSummaryOpen}
              >
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-sm font-semibold">
                      {job?.title || "Loading job..."}
                    </h2>
                    {job?.status && (
                      <span className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium capitalize">
                        {job.status}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{job?.applicants ?? candidates.length} applicants</span>
                    <span>{job?.locationType || "Work mode not set"}</span>
                    <span>{job?.experienceLevel || "Experience not set"}</span>
                    <span>{job ? formatSalary(job) : "Compensation not set"}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {formatList(job?.skills).slice(0, 5).map((skill) => (
                      <SkillBadge key={skill}>{skill}</SkillBadge>
                    ))}
                    {formatList(job?.skills).length > 5 && (
                      <SkillBadge>+{formatList(job?.skills).length - 5}</SkillBadge>
                    )}
                    {formatList(job?.skills).length === 0 && (
                      <span className="text-xs text-muted-foreground">Required skills not set</span>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    jobSummaryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {jobSummaryOpen && job && (
                <div className="mt-4 border-t border-border/30 pt-4">
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <JobSummaryField label="Location" value={job.location || "Location not set"} />
                    <JobSummaryField label="Job type" value={job.jobType || "Job type not set"} />
                    <JobSummaryField label="Work mode" value={job.locationType || "Work mode not set"} />
                    <JobSummaryField label="Experience" value={job.experienceLevel || "Experience not set"} />
                    <JobSummaryField label="Compensation" value={formatSalary(job)} />
                    <JobSummaryField label="Posted" value={formatPostedDate(job.postedAt)} />
                  </div>
                  <JobSummaryText label="Description" value={job.description} />
                  <JobSummaryList label="Responsibilities" values={job.responsibilities} />
                  <JobSummaryList label="Requirements" values={job.requirements} />
                  <JobSummaryList label="Nice to have" values={job.preferredQualifications} />
                  <JobSummaryList label="Benefits" values={job.benefits} />
                </div>
              )}
            </div>
          )}

          {error && (
            <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {showJobContext && candidates.length > 0 && (
            <div className="mb-5 rounded-xl border border-border/40 bg-background p-3">
              <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_160px_150px]">
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search applicants"
                  className="h-9 rounded-lg border border-border/50 bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
                />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as ApplicantSort)}
                  className="h-9 rounded-lg border border-border/50 bg-background px-3 text-sm outline-none focus:border-foreground"
                  aria-label="Sort applicants"
                >
                  <option value="best-match">Best Match</option>
                  <option value="newest">Newest</option>
                  <option value="experience">Most Experienced</option>
                  <option value="recent-activity">Recently Active</option>
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-lg"
                  onClick={() => {
                    setSearchQuery("");
                    setMatchFilter("all");
                    setExperienceFilter("all");
                    setSkillFilter("all");
                    setStatusFilter("all");
                    setResumeFilter("all");
                    setAppliedDateFilter("all");
                    setSortBy("best-match");
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
                <select
                  value={matchFilter}
                  onChange={(event) => setMatchFilter(event.target.value as MatchFilter)}
                  className="h-9 rounded-lg border border-border/50 bg-background px-2 text-xs outline-none focus:border-foreground"
                  aria-label="Filter by match score"
                >
                  <option value="all">All matches</option>
                  <option value="80">80%+</option>
                  <option value="50-79">50-79%</option>
                  <option value="below-50">Below 50%</option>
                  <option value="pending">Match pending</option>
                </select>
                <select
                  value={experienceFilter}
                  onChange={(event) => setExperienceFilter(event.target.value as ExperienceFilter)}
                  className="h-9 rounded-lg border border-border/50 bg-background px-2 text-xs outline-none focus:border-foreground"
                  aria-label="Filter by experience"
                >
                  <option value="all">All experience</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10-plus">10+ years</option>
                </select>
                <select
                  value={skillFilter}
                  onChange={(event) => setSkillFilter(event.target.value)}
                  className="h-9 rounded-lg border border-border/50 bg-background px-2 text-xs outline-none focus:border-foreground"
                  aria-label="Filter by skill"
                >
                  <option value="all">All skills</option>
                  {skillOptions.map((skill) => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as RecruiterCandidateItem["status"] | "all")}
                  className="h-9 rounded-lg border border-border/50 bg-background px-2 text-xs outline-none focus:border-foreground"
                  aria-label="Filter by application status"
                >
                  <option value="all">All statuses</option>
                  <option value="applied">Applied</option>
                  <option value="viewed">Viewed</option>
                  <option value="resume_downloaded">Resume downloaded</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
                <select
                  value={resumeFilter}
                  onChange={(event) => setResumeFilter(event.target.value as ResumeFilter)}
                  className="h-9 rounded-lg border border-border/50 bg-background px-2 text-xs outline-none focus:border-foreground"
                  aria-label="Filter by resume availability"
                >
                  <option value="all">Any resume</option>
                  <option value="available">Resume available</option>
                  <option value="missing">No resume</option>
                </select>
                <select
                  value={appliedDateFilter}
                  onChange={(event) => setAppliedDateFilter(event.target.value as AppliedDateFilter)}
                  className="h-9 rounded-lg border border-border/50 bg-background px-2 text-xs outline-none focus:border-foreground"
                  aria-label="Filter by applied date"
                >
                  <option value="all">Any date</option>
                  <option value="today">Today</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
              </div>
            </div>
          )}

          {showFilters && (
          <div className="mb-5 flex flex-wrap gap-1 border-b border-border/30 pb-1">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeFilter === filter.id
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          )}

          {!loading && candidates.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          )}

          {!loading && candidates.length > 0 && displayCandidates.length === 0 && (
            <div className="rounded-xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
              {showJobContext ? "No applicants match current filters." : "No applicants match this filter."}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {displayCandidates.map((candidate) => (
              showJobContext ? (
                <ApplicantReviewCard
                  key={candidate.id}
                  candidate={candidate}
                  job={job}
                  saving={savingIds.has(candidate.id)}
                  onOpen={() => void openApplication(candidate)}
                  onDownloadResume={() => void openResume(candidate)}
                  onShortlist={() => void updateStatus(candidate.id, "shortlisted")}
                  onReject={() => void updateStatus(candidate.id, "rejected")}
                />
              ) : (
                <div
                  key={candidate.id}
                  className="rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-sm font-medium text-primary">
                        {candidate.avatarUrl ? (
                          <img
                            src={candidate.avatarUrl}
                            alt={`${candidate.name} profile image`}
                            className="h-full w-full rounded-xl object-cover"
                          />
                        ) : (
                          initialsFor(candidate)
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium">{candidate.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">
                          {candidate.headline || candidate.currentRole || "No headline yet"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        statusStyles[candidate.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {formatStatus(candidate.status)}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mb-3">
                    <span className="inline-flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {candidate.appliedFor}
                    </span>
                    {candidate.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {candidate.location}
                      </span>
                    )}
                    {candidate.experience && <span>{candidate.experience}</span>}
                    {candidate.appliedAt && <span>Applied {candidate.appliedAt}</span>}
                    <span>{candidate.resumeUrl ? "Resume available" : "No resume"}</span>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {candidate.skills.slice(0, 4).map((skill) => (
                      <SkillBadge key={skill}>{skill}</SkillBadge>
                    ))}
                    {candidate.skills.length > 4 && (
                      <SkillBadge>+{candidate.skills.length - 4}</SkillBadge>
                    )}
                  </div>

                  {applicationEvents(candidate).length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {applicationEvents(candidate).map((event) => (
                        <span key={event} className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                          {event}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Status + actions */}
                  <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => void markEvent(candidate.id, "viewed")}
                        className="rounded-md p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                        title="Mark viewed"
                        disabled={savingIds.has(candidate.id)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => void openResume(candidate)}
                        className="rounded-md p-1.5 text-muted-foreground/60 hover:text-foreground transition-colors disabled:opacity-40"
                        title={candidate.resumeUrl ? "Download resume" : "Resume unavailable"}
                        disabled={savingIds.has(candidate.id) || !candidate.resumeUrl}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      {candidate.status !== "shortlisted" && (
                        <button
                          onClick={() => void updateStatus(candidate.id, "shortlisted")}
                          className="rounded-md p-1.5 text-muted-foreground/50 hover:text-purple-500 transition-colors"
                          title="Shortlist"
                          disabled={savingIds.has(candidate.id)}
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {candidate.status !== "rejected" && (
                        <button
                          onClick={() => void updateStatus(candidate.id, "rejected")}
                          className="rounded-md p-1.5 text-muted-foreground/50 hover:text-red-500 transition-colors"
                          title="Reject"
                          disabled={savingIds.has(candidate.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {candidate.status !== "hired" && (
                        <button
                          onClick={() => void updateStatus(candidate.id, "hired")}
                          className="rounded-md p-1.5 text-muted-foreground/50 hover:text-emerald-500 transition-colors"
                          title="Mark hired"
                          disabled={savingIds.has(candidate.id)}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                      )}
                  </div>

                  {/* View profile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 text-xs h-8 rounded-lg"
                    onClick={() => void openApplication(candidate)}
                  >
                    Open Application
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              )
            ))}
          </div>
        </div>

        {selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/20 p-0 sm:items-center sm:p-4">
            <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-border/40 bg-background shadow-xl sm:max-w-2xl sm:rounded-2xl">
              <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-border/30 bg-background px-5 py-4">
                <div>
                  <p className="text-xs text-muted-foreground">Application</p>
                  <h2 className="text-base font-semibold">{selectedApplication.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>{selectedApplication.appliedFor}</span>
                    {selectedApplication.appliedAt && <span>Applied {selectedApplication.appliedAt}</span>}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        statusStyles[selectedApplication.status] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {formatStatus(selectedApplication.status)}
                    </span>
                  </div>
                  <p className="hidden">
                    {selectedApplication.appliedFor} · Applied {selectedApplication.appliedAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="rounded-md p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Close application detail"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-5 px-5 py-5">
                <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-border/30 p-3">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="mt-1 truncate font-medium">{selectedApplication.email || "Not available"}</p>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="mt-1 font-medium">{selectedApplication.experience || "Not available"}</p>
                  </div>
                  <div className="rounded-xl border border-border/30 p-3">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="mt-1 font-medium">{selectedApplication.location || "Not available"}</p>
                  </div>
                </div>

                <section>
                  <h3 className="mb-3 text-sm font-semibold">Screening answers</h3>
                  {selectedApplication.screeningAnswers?.length ? (
                    <div className="space-y-2.5">
                      {selectedApplication.screeningAnswers.map((answer) => (
                        <div
                          key={`${answer.question_id}-${answer.question}`}
                          className="rounded-xl border border-border/30 p-3"
                        >
                          <p className="text-sm font-semibold">{answer.question}</p>
                          <div className="mt-2 text-sm text-muted-foreground">
                            {renderAnswer(answer.answer)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-border/50 p-4 text-sm text-muted-foreground">
                      No screening answers submitted.
                    </p>
                  )}
                </section>

                <div className="sticky bottom-0 -mx-5 flex flex-wrap items-center gap-2 border-t border-border/30 bg-background px-5 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={() => void openResume(selectedApplication)}
                    disabled={!selectedApplication.resumeUrl || savingIds.has(selectedApplication.id)}
                  >
                    {selectedApplication.resumeUrl ? "Download resume" : "No resume uploaded"}
                  </Button>
                  <Button
                    asChild
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    disabled={!selectedApplication.candidateId}
                  >
                    <Link href={`/recruiter/candidates/${selectedApplication.candidateId}`}>View profile</Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className={`rounded-xl ${
                      selectedApplication.status === "shortlisted"
                        ? "bg-purple-600 text-white hover:bg-purple-600"
                        : ""
                    }`}
                    onClick={() => void updateStatus(selectedApplication.id, "shortlisted")}
                    disabled={savingIds.has(selectedApplication.id) || selectedApplication.status === "shortlisted"}
                  >
                    {selectedApplication.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`rounded-xl ${
                      selectedApplication.status === "rejected"
                        ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-50"
                        : ""
                    }`}
                    onClick={() => void updateStatus(selectedApplication.id, "rejected")}
                    disabled={savingIds.has(selectedApplication.id) || selectedApplication.status === "rejected"}
                  >
                    {selectedApplication.status === "rejected" ? "Rejected" : "Reject"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RecruiterGuard>
  );
}

function JobSummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function ApplicantReviewCard({
  candidate,
  job,
  saving,
  onOpen,
  onDownloadResume,
  onShortlist,
  onReject,
}: {
  candidate: RecruiterCandidateItem;
  job: RecruiterJobItem | null;
  saving: boolean;
  onOpen: () => void;
  onDownloadResume: () => void;
  onShortlist: () => void;
  onReject: () => void;
}) {
  const match = scoreApplicantMatch(job, candidate);
  const visibleMatchedSkills = match.matchedSkills.slice(0, 3);
  const visibleMissingSkills = match.missingSkills.slice(0, 3);

  return (
    <article className="rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-sm font-semibold text-primary">
            {candidate.avatarUrl ? (
              <img
                src={candidate.avatarUrl}
                alt={`${candidate.name} profile image`}
                className="h-full w-full rounded-xl object-cover"
              />
            ) : (
              initialsFor(candidate)
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{candidate.name}</h3>
            <p className="truncate text-xs text-muted-foreground">
              {candidate.headline || candidate.currentRole || "Current role not available"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getMatchTone(match.score)}`}>
            {match.score === null ? "Match pending" : `${match.level} ${match.score}%`}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              statusStyles[candidate.status] || "bg-muted text-muted-foreground"
            }`}
          >
            {formatStatus(candidate.status)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {candidate.location || "Location not available"}
        </span>
        <span>{candidate.experience || "Experience not available"}</span>
        <span>{candidate.appliedAt ? `Applied ${candidate.appliedAt}` : "Applied date unavailable"}</span>
        <span>{candidate.resumeUrl ? "Resume available" : "No resume"}</span>
      </div>

      <div className="mt-3 space-y-2">
        {visibleMatchedSkills.length > 0 && (
          <SkillRow label="Matched" skills={visibleMatchedSkills} extraCount={match.matchedSkills.length - visibleMatchedSkills.length} />
        )}
        {visibleMissingSkills.length > 0 && (
          <SkillRow label="Missing" skills={visibleMissingSkills} extraCount={match.missingSkills.length - visibleMissingSkills.length} muted />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/30 pt-3">
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-lg text-xs"
          onClick={onOpen}
        >
          Open Application
        </Button>
        {candidate.candidateId && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg text-xs"
            asChild
          >
            <Link href={`/recruiter/candidates/${candidate.candidateId}`}>View profile</Link>
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={onDownloadResume}
            className="rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:text-foreground disabled:opacity-40"
            title={candidate.resumeUrl ? "Download resume" : "Resume unavailable"}
            disabled={saving || !candidate.resumeUrl}
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {candidate.status !== "shortlisted" && (
            <button
              onClick={onShortlist}
              className="rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:text-foreground disabled:opacity-40"
              title="Shortlist"
              disabled={saving}
            >
              <Star className="h-3.5 w-3.5" />
            </button>
          )}
          {candidate.status !== "rejected" && (
            <button
              onClick={onReject}
              className="rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:text-foreground disabled:opacity-40"
              title="Reject"
              disabled={saving}
            >
              <XCircle className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function SkillRow({
  label,
  skills,
  extraCount,
  muted = false,
}: {
  label: string;
  skills: string[];
  extraCount: number;
  muted?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[10px] font-medium uppercase text-muted-foreground">{label}</span>
      {skills.map((skill) => (
        <span
          key={`${label}-${skill}`}
          className={`rounded-full border px-2 py-0.5 text-[10px] ${
            muted
              ? "border-border/50 bg-muted/30 text-muted-foreground"
              : "border-border/60 bg-background text-foreground"
          }`}
        >
          {skill}
        </span>
      ))}
      {extraCount > 0 && (
        <span className="text-[10px] text-muted-foreground">+{extraCount}</span>
      )}
    </div>
  );
}

function JobSummaryText({ label, value }: { label: string; value?: string }) {
  if (!value?.trim()) return null;
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </section>
  );
}

function JobSummaryList({ label, values }: { label: string; values?: string[] }) {
  const items = formatList(values);
  if (items.length === 0) return null;
  return (
    <section className="mt-4">
      <h3 className="text-sm font-semibold">{label}</h3>
      <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
