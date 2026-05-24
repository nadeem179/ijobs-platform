"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { ProtectedLayout } from "@/components/navigation/protected-layout";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useCandidateDashboard } from "@/hooks/use-candidate-dashboard";
import {
  ArrowRight,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  MapPin,
  Search,
  Settings2,
  Upload,
  UserRound,
} from "lucide-react";

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [jobSearch, setJobSearch] = useState("");
  const [profileCompletionOpen, setProfileCompletionOpen] = useState(false);
  const {
    applications,
    applicationsLoaded,
    greeting,
    jobsLoaded,
    limit,
    profile,
    profileError,
    profileLoaded,
    profileStrength,
    recommendedJobs,
    recentlyViewedJobs,
    savedJobs,
    savedJobsLoaded,
    savingIds,
    isSaved,
    toggleSavedJob,
  } = useCandidateDashboard();

  const completionGroups = useMemo(() => {
    const groups = new Map<string, typeof profileStrength.checks>();
    profileStrength.checks.forEach((check) => {
      groups.set(check.group, [...(groups.get(check.group) ?? []), check]);
    });
    return Array.from(groups.entries());
  }, [profileStrength.checks]);

  if (!profileLoaded || !applicationsLoaded || !savedJobsLoaded || !jobsLoaded) {
    return (
      <ProtectedLayout allowedRoles={["candidate"]}>
        <div className="min-h-screen">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <LoadingState variant="spinner" />
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!profile) {
    return (
      <ProtectedLayout allowedRoles={["candidate"]}>
        <div className="min-h-screen">
          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <ErrorState
              title="Profile unavailable"
              message={
                profileError ||
                "We could not load your candidate profile right now. You can retry or complete your profile."
              }
              onRetry={() => window.location.reload()}
            />
            <div className="mt-3 text-center">
              <Button className="rounded-xl" asChild>
                <Link href="/profile/edit">Complete Profile</Link>
              </Button>
            </div>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  const designation = profile.currentTitle || profile.headline || "Add your headline";
  const profileImage = profile.avatarUrl;
  const expectedSalary =
    profile.expectedSalary ||
    (profile.expectedSalaryAmount
      ? `${profile.expectedSalaryCurrency || ""} ${profile.expectedSalaryAmount}`.trim()
      : "");
  const experienceLabel =
    profile.experienceLevel ||
    (profile.totalExperienceYears || profile.totalExperienceMonths
      ? `${profile.totalExperienceYears ?? 0}y ${profile.totalExperienceMonths ?? 0}m`
      : "");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = jobSearch.trim();
    router.push(query ? `/jobs?q=${encodeURIComponent(query)}` : "/jobs");
  };

  return (
    <ProtectedLayout allowedRoles={["candidate"]}>
      <div className="min-h-screen bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <main className="space-y-5">
              <section className="rounded-xl border border-border/30 bg-background p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {greeting}, {profile.name}
                    </p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                      Find the right role faster
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      {profile.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {profile.location}
                        </span>
                      ) : null}
                      {experienceLabel ? <span>{experienceLabel}</span> : null}
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" />
                        {limit.usedToday}/{limit.dailyLimit} applications used today
                      </span>
                    </div>
                  </div>
                  <Button className="rounded-xl" asChild>
                    <Link href="/jobs">
                      Browse jobs
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                <form onSubmit={handleSearch} className="mt-5 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={jobSearch}
                      onChange={(event) => setJobSearch(event.target.value)}
                      placeholder="Search jobs, companies, skills..."
                      className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <Button type="submit" className="h-11 rounded-xl">
                    Search
                  </Button>
                </form>
              </section>

              <DashboardSection title="Recommended Jobs" actionHref="/jobs" actionLabel="Discover jobs">
                {recommendedJobs.length === 0 ? (
                  <EmptyState icon={Briefcase} label="No recommended jobs yet." ctaHref="/jobs" ctaLabel="Browse jobs" />
                ) : (
                  <div className="space-y-3">
                    {recommendedJobs.map(({ job, matchPercentage }) => {
                      const applied = applications.find((application) => application.jobId === job.id);

                      return (
                        <article key={job.id} className="rounded-xl border border-border/30 bg-background p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link href={`/jobs/${job.id}`} className="text-sm font-semibold hover:text-primary">
                                {job.title}
                              </Link>
                              <p className="mt-0.5 text-sm text-muted-foreground">{job.company}</p>
                            </div>
                            {matchPercentage !== null ? (
                              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {matchPercentage}% match
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>{formatSalary(job)}</span>
                            <span>{job.location}</span>
                            <span>{job.locationType}</span>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                              disabled={savingIds.has(job.id)}
                              onClick={() => void toggleSavedJob(job.id)}
                            >
                              <Bookmark className="mr-1.5 h-3.5 w-3.5" />
                              {isSaved(job.id) ? "Saved" : "Save"}
                            </Button>
                            <Button size="sm" className="rounded-xl" asChild>
                              <Link href={applied ? `/jobs/${job.id}` : `/jobs/${job.id}?apply=1`}>
                                {applied ? "Applied" : "Easy Apply"}
                              </Link>
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </DashboardSection>

              <DashboardSection title="Recently Viewed Jobs" actionHref="/jobs" actionLabel="Discover jobs">
                {recentlyViewedJobs.length === 0 ? (
                  <EmptyState icon={Eye} label="No recently viewed jobs yet." />
                ) : (
                  <CompactList>
                    {recentlyViewedJobs.slice(0, 5).map((job) => (
                      <Link key={job.id} href={`/jobs/${job.id}`} className="block rounded-lg p-3 hover:bg-muted/50">
                        <p className="text-sm font-medium">{job.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {job.company} · {job.location} · Viewed {formatViewedAt(job.viewedAt)}
                        </p>
                      </Link>
                    ))}
                  </CompactList>
                )}
              </DashboardSection>
            </main>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <section className="rounded-xl border border-border/30 bg-background p-5">
                <div className="flex items-center gap-3">
                  {profileImage ? (
                    <img src={profileImage} alt="" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {profile.avatarInitials || <UserRound className="h-5 w-5" />}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold">{profile.name}</h2>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{designation}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="font-medium">Profile completion</span>
                  <span className="font-semibold">{profileStrength.percent}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${profileStrength.percent}%` }} />
                </div>
                <Button className="mt-4 w-full rounded-xl" asChild>
                  <Link href={profileStrength.percent >= 100 ? "/profile" : "/profile/edit"}>
                    {profileStrength.percent >= 100 ? "View profile" : "Complete profile"}
                  </Link>
                </Button>
              </section>

              <section className="rounded-xl border border-border/30 bg-background p-5">
                <button
                  type="button"
                  onClick={() => setProfileCompletionOpen((current) => !current)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                  aria-expanded={profileCompletionOpen}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h2 className="text-sm font-semibold">Profile Completion</h2>
                      <span className="text-xs font-semibold">{profileStrength.percent}%</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {profileCompletionOpen
                        ? "Review completed items and remaining actions."
                        : `${profileStrength.missingActions.length} actions remaining`}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                      profileCompletionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {profileCompletionOpen && (
                  <div className="mt-4 space-y-4">
                    {completionGroups.map(([group, checks]) => (
                      <div key={group}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>
                        <div className="space-y-1.5">
                          {checks.map((check) => (
                            <div key={check.label} className="flex items-center justify-between gap-3 text-xs">
                              <span
                                className={`inline-flex min-w-0 items-center gap-1.5 ${
                                  check.done ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                <CheckCircle2
                                  className={`h-3.5 w-3.5 shrink-0 ${
                                    check.done ? "text-emerald-500" : "text-muted-foreground/40"
                                  }`}
                                />
                                <span className="truncate">{check.label}</span>
                              </span>
                              {!check.done && <span className="font-medium text-primary">+{check.points}%</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-border/30 bg-background p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold">Preferences</h2>
                </div>
                <Preference label="Preferred locations" value={profile.preferredLocations?.join(", ")} />
                <Preference label="Work mode" value={profile.workModePreference} />
                <Preference label="Job type" value={profile.jobTypePreference} />
                <Preference label="Expected salary" value={expectedSalary} />
                <Preference label="Experience level" value={profile.experienceLevel} />
              </section>

              <section className="rounded-xl border border-border/30 bg-background p-5">
                <h2 className="mb-3 text-sm font-semibold">Quick actions</h2>
                <div className="grid gap-2">
                  <Button variant="outline" className="justify-start rounded-xl" asChild>
                    <Link href="/profile/edit">
                      <Upload className="mr-2 h-3.5 w-3.5" />
                      {profile.resumeFile ? "Update resume" : "Upload resume"}
                    </Link>
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl" asChild>
                    <Link href="/profile">View profile</Link>
                  </Button>
                  <Button variant="outline" className="justify-start rounded-xl" asChild>
                    <Link href="/applications">Track applications</Link>
                  </Button>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

function DashboardSection({
  title,
  actionHref,
  actionLabel,
  children,
}: {
  title: string;
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="text-xs font-medium text-muted-foreground hover:text-foreground">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function CompactList({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border/30 bg-background p-1">{children}</div>;
}

function EmptyState({
  icon: Icon,
  label,
  ctaHref,
  ctaLabel,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-background px-5 py-8 text-center">
      <Icon className="mx-auto h-5 w-5 text-muted-foreground/50" />
      <p className="mt-3 text-sm text-muted-foreground">{label}</p>
      {ctaHref && ctaLabel ? (
        <Button size="sm" className="mt-4 rounded-xl" asChild>
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}

function Preference({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="border-b border-border/20 py-2.5 last:border-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value && value.trim() ? value : "Not set"}</p>
    </div>
  );
}

function formatSalary(job: {
  salaryCurrency: string;
  salaryMin: number;
  salaryMax: number;
  salaryPeriod: "year" | "hour";
}) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} - ${max}${period}`;
}

function formatViewedAt(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "recently";

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}
