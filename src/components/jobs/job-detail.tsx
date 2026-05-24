"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  MapPin,
  Briefcase,
  Clock,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  Check,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { TrustPanel } from "@/components/jobs/trust-panel";
import { CompanyCard } from "@/components/jobs/company-card";
import { CompanyProfileModal, type CompanyProfileSummary } from "@/components/jobs/company-profile-modal";
import { ApplyModal } from "@/components/apply/apply-modal";
import { ApplicationStatus } from "@/components/applications/application-status";
import { SkeletonDetail } from "@/components/jobs/skeleton-detail";
import { Job } from "@/types/job";
import { jobs } from "@/data/jobs";
import { useApplications } from "@/hooks/use-applications";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/context/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isSchemaQueryError } from "@/lib/supabase/query-errors";
import { storeRecentlyViewedJob } from "@/lib/jobs/recently-viewed";
import {
  normalizeScreeningQuestions,
  screeningTypeNeedsOptions,
  type ScreeningAnswer,
  type ScreeningQuestion,
} from "@/types/screening";

function formatSalary(job: Job) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} — ${max}${period}`;
}

interface JobDetailProps {
  jobId: string;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function JobDetail({ jobId }: JobDetailProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<Job | null>(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [screeningOpen, setScreeningOpen] = useState(false);
  const [screeningStep, setScreeningStep] = useState(0);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, string | string[]>>({});
  const [screeningError, setScreeningError] = useState("");
  const [companyOpen, setCompanyOpen] = useState(false);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const { getApplicationForJob, applyToJob, loaded: applicationsLoaded } = useApplications();
  const { isSaved, toggleSavedJob, savingIds } = useSavedJobs();
  const { showToast } = useToast();
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    role,
    onboardingComplete,
    getPostAuthRedirect,
  } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const loadingTimer = window.setTimeout(() => {
      setLoading(true);
    }, 0);
    const timer = window.setTimeout(() => {
      const found = jobs.find((j) => j.id === jobId) || null;
      if (found) {
        setJob(found);
        setLoading(false);
        return;
      }

      const supabase = getSupabaseClient();
      if (!supabase) {
        setJob(null);
        setLoading(false);
        return;
      }

      void (async () => {
        try {
          const { data } = await supabase
            .from("jobs")
            .select("*")
            .eq("id", jobId)
            .maybeSingle();
          if (!data) {
            setJob(null);
            return;
          }
          const row = data as Record<string, unknown>;
          const company = String(row.company_name || row.company || "Company");
          setJob({
            id: String(row.id),
            title: String(row.title || "Job"),
            company,
            companyLogo: String(row.company_logo || company.slice(0, 1).toUpperCase()),
            companyDescription: String(row.company_description || ""),
            companySize: String(row.company_size || ""),
            companyIndustry: String(row.company_industry || ""),
            location: String(row.location || ""),
            locationType:
              row.location_type === "Hybrid" || row.location_type === "On-site"
                ? row.location_type
                : "Remote",
            jobType:
              row.job_type === "Contract" ||
              row.job_type === "Part-time" ||
              row.job_type === "Internship"
                ? row.job_type
                : "Full-time",
            salaryMin: Number(row.salary_min || 0),
            salaryMax: Number(row.salary_max || 0),
            salaryCurrency: String(row.salary_currency || "$"),
            salaryPeriod: row.salary_period === "hour" ? "hour" : "year",
            experienceLevel:
              row.experience_level === "Entry" ||
              row.experience_level === "Senior" ||
              row.experience_level === "Lead" ||
              row.experience_level === "Staff"
                ? row.experience_level
                : "Mid",
            skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
            description: String(row.description || ""),
            responsibilities: Array.isArray(row.responsibilities)
              ? (row.responsibilities as string[])
              : [],
            requirements: Array.isArray(row.requirements) ? (row.requirements as string[]) : [],
            preferredQualifications: Array.isArray(row.preferred_qualifications)
              ? (row.preferred_qualifications as string[])
              : [],
            benefits: Array.isArray(row.benefits) ? (row.benefits as string[]) : [],
            screeningQuestions: normalizeScreeningQuestions(row.screening_questions),
            postedAt: "recently",
            verifiedRecruiter: true,
            activeHiring: row.status === "active",
            responseRate: 0,
            saved: false,
            featured: Boolean(row.featured),
            status: row.status === "active" ? "active" : "inactive",
          });
        } finally {
          setLoading(false);
        }
      })();
    }, 400);
    return () => {
      window.clearTimeout(loadingTimer);
      window.clearTimeout(timer);
    };
  }, [jobId]);

  useEffect(() => {
    if (!job) return;

    storeRecentlyViewedJob({
      id: job.id,
      title: job.title,
      company: job.company,
      companyLogo: job.companyLogo,
      location: job.location,
      locationType: job.locationType,
      salary: formatSalary(job),
    });
  }, [job]);

  const checkExistingApplication = useCallback(
    async (targetJobId: string) => {
      if (!isAuthenticated || role !== "candidate" || !userId) return false;
      const supabase = getSupabaseClient();
      if (!supabase) return false;

      const jobColumn = isUuid(targetJobId) ? "job_id" : "job_external_id";
      const identityAttempts = [
        { type: "or" as const },
        { type: "eq" as const, column: "candidate_id" },
        { type: "eq" as const, column: "user_id" },
      ];

      for (const identity of identityAttempts) {
        let query = supabase
          .from("applications")
          .select("id,status")
          .eq(jobColumn, targetJobId)
          .limit(1);

        query =
          identity.type === "or"
            ? query.or(`candidate_id.eq.${userId},user_id.eq.${userId}`)
            : query.eq(identity.column, userId);

        const { data, error } = await query.maybeSingle();
        if (!error) return Boolean(data);
        if (!isSchemaQueryError(error)) return false;
      }

      return false;
    },
    [isAuthenticated, role, userId]
  );

  useEffect(() => {
    if (!job || authLoading) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!isAuthenticated || role !== "candidate") {
        if (!cancelled) setHasApplied(false);
        return;
      }

      void (async () => {
        const alreadyApplied = await checkExistingApplication(job.id);
        if (!cancelled) setHasApplied(alreadyApplied);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [authLoading, checkExistingApplication, isAuthenticated, job, role]);

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

  const application = job ? getApplicationForJob(job.id) : null;
  const applied = hasApplied || Boolean(application);
  const saved = job ? isSaved(job.id) : false;
  const screeningQuestions = job?.screeningQuestions ?? [];
  const pendingApplyReturn = searchParams.get("apply") === "1";
  const blockedRoleMessage = "Only candidates can apply to jobs.";

  const updateScreeningAnswer = (questionId: string, value: string | string[]) => {
    setScreeningAnswers((current) => ({ ...current, [questionId]: value }));
    setScreeningError("");
  };

  const isQuestionAnswered = (question: ScreeningQuestion) => {
    const answer = screeningAnswers[question.id];
    if (Array.isArray(answer)) return answer.length > 0;
    return typeof answer === "string" && answer.trim().length > 0;
  };

  const buildScreeningAnswers = (): ScreeningAnswer[] =>
    screeningQuestions
      .map((question) => ({
        question_id: question.id,
        question: question.question,
        type: question.type,
        answer: screeningAnswers[question.id] ?? (screeningTypeNeedsOptions(question.type) ? [] : ""),
      }))
      .filter((answer) =>
        Array.isArray(answer.answer)
          ? answer.answer.length > 0
          : answer.answer.trim().length > 0
      );

  const validateCurrentQuestion = () => {
    const question = screeningQuestions[screeningStep];
    if (!question || !question.required || isQuestionAnswered(question)) return true;
    setScreeningError("This question is required.");
    return false;
  };

  const handleScreeningNext = () => {
    if (!validateCurrentQuestion()) return;
    setScreeningStep((current) => Math.min(current + 1, screeningQuestions.length - 1));
  };

  const handleScreeningSubmit = async () => {
    if (applied) {
      setScreeningOpen(false);
      return;
    }
    if (!validateCurrentQuestion()) return;
    const missingRequired = screeningQuestions.find(
      (question) => question.required && !isQuestionAnswered(question)
    );
    if (missingRequired) {
      setScreeningStep(screeningQuestions.indexOf(missingRequired));
      setScreeningError("This question is required.");
      return;
    }

    const submitted = await submitEasyApply(buildScreeningAnswers());
    if (submitted) {
      setScreeningOpen(false);
      setScreeningAnswers({});
    }
  };

  const submitEasyApply = useCallback(async (answers?: ScreeningAnswer[]) => {
    if (!job || applying || applied) {
      if (applied) showToast("You have already applied to this job.", "error");
      return false;
    }

    const alreadyApplied = await checkExistingApplication(job.id);
    if (alreadyApplied) {
      setHasApplied(true);
      showToast("You have already applied to this job.", "error");
      return false;
    }

    setApplying(true);
    const result = await applyToJob(job.id, { screeningAnswers: answers ?? [] });
    setApplying(false);

    if (result.error) {
      if (result.error.toLowerCase().includes("already applied")) {
        const rowExists = await checkExistingApplication(job.id);
        if (rowExists || result.application) setHasApplied(true);
      }
      showToast(result.error, "error");
      return false;
    }

    setHasApplied(true);
    showToast("You have successfully applied for this job.", "success");
    return true;
  }, [applied, applyToJob, applying, checkExistingApplication, job, showToast]);

  const openApplyFlow = () => {
    if (authLoading || !job) return;

    if (!isAuthenticated) {
      setApplyOpen(true);
      return;
    }

    const nextRoute = getPostAuthRedirect(user);
    if (!onboardingComplete || !role) {
      router.replace(nextRoute);
      return;
    }

    if (role !== "candidate") {
      showToast(blockedRoleMessage, "error");
      router.replace(nextRoute);
      return;
    }

    if (applied) {
      showToast("You have already applied to this job.", "error");
      return;
    }

    if ((job.screeningQuestions ?? []).length > 0) {
      setScreeningStep(0);
      setScreeningError("");
      setScreeningOpen(true);
      return;
    }

    void submitEasyApply();
  };

  const handleToggleSaved = async () => {
    if (!job) return;
    if (!isAuthenticated || role !== "candidate") {
      showToast("Sign in as a candidate to save jobs.", "error");
      return;
    }
    const result = await toggleSavedJob(job.id);
    if (result.error) {
      showToast(result.error, "error");
      return;
    }
    showToast(result.saved ? "Job saved." : "Job removed from saved jobs.", "success");
  };

  const companySummary: CompanyProfileSummary | null = job
    ? {
        name: job.company,
        logo: job.companyLogo,
        industry: job.companyIndustry,
        size: job.companySize,
        description: job.companyDescription,
        activeJobs: jobs.filter((item) => item.company === job.company && item.status !== "closed").length,
      }
    : null;

  useEffect(() => {
    if (
      applyOpen ||
      applying ||
      !pendingApplyReturn ||
      authLoading ||
      loading ||
      !applicationsLoaded ||
      !job
    ) {
      return;
    }

    if (!isAuthenticated) {
      return;
    }

    const nextRoute = getPostAuthRedirect(user);
    if (!onboardingComplete || !role) {
      router.replace(nextRoute);
      return;
    }

    if (role !== "candidate") {
      showToast(blockedRoleMessage, "error");
      router.replace(nextRoute);
      return;
    }

    const timer = window.setTimeout(() => {
      if (applied) {
        showToast("You have already applied to this job.", "error");
      } else if ((job.screeningQuestions ?? []).length > 0) {
        setScreeningStep(0);
        setScreeningError("");
        setScreeningOpen(true);
      } else {
        void submitEasyApply();
      }
      router.replace(pathname);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    applicationsLoaded,
    applied,
    authLoading,
    blockedRoleMessage,
    getPostAuthRedirect,
    isAuthenticated,
    job,
    loading,
    onboardingComplete,
    pathname,
    applyOpen,
    applying,
    pendingApplyReturn,
    role,
    router,
    submitEasyApply,
    showToast,
    user,
  ]);

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
                      onClick={() => void handleToggleSaved()}
                      disabled={job ? savingIds.has(job.id) : false}
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
                  onClick={openApplyFlow}
                  disabled={authLoading || applying || applied}
                >
                  {applied ? "Applied" : applying ? "Applying..." : "Apply for this job"}
                </Button>
                {applied && <ApplicationStatus status={application?.status || "applied"} />}
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl text-sm h-11 px-6"
                  onClick={() => setCompanyOpen(true)}
                >
                  View company profile
                </Button>
              </div>
              {screeningQuestions.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  This application includes {screeningQuestions.length} screening{" "}
                  {screeningQuestions.length === 1 ? "question" : "questions"}.
                </p>
              )}
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
          onClick={openApplyFlow}
          disabled={authLoading || applying || applied}
        >
          {applied ? "Applied" : applying ? "Applying..." : "Apply Now"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="rounded-xl text-sm h-11 px-4"
          onClick={() => void handleToggleSaved()}
          disabled={job ? savingIds.has(job.id) : false}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4 text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>

      {screeningOpen && screeningQuestions.length > 0 && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => {
              if (!applying) setScreeningOpen(false);
            }}
          />
          <aside className="absolute inset-y-0 left-0 flex w-full max-w-full flex-col border-r border-border/40 bg-background shadow-xl sm:max-w-[480px]">
            <div className="border-b border-border/30 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">Apply for this job</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Question {screeningStep + 1} of {screeningQuestions.length}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScreeningOpen(false)}
                  disabled={applying}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  aria-label="Close application questions"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 h-1 rounded-full bg-muted">
                <div
                  className="h-1 rounded-full bg-foreground transition-all"
                  style={{
                    width: `${((screeningStep + 1) / screeningQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              {(() => {
                const question = screeningQuestions[screeningStep];
                if (!question) return null;
                const answer = screeningAnswers[question.id];
                const selectedAnswers = Array.isArray(answer) ? answer : [];

                return (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm font-medium leading-relaxed">
                        {question.question}
                        {question.required && <span className="ml-1 text-destructive">*</span>}
                      </p>
                      {!question.required && (
                        <p className="mt-1 text-xs text-muted-foreground">Optional</p>
                      )}
                    </div>

                    {question.type === "text" ? (
                      <textarea
                        value={typeof answer === "string" ? answer : ""}
                        onChange={(event) =>
                          updateScreeningAnswer(question.id, event.target.value)
                        }
                        className="min-h-[140px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        placeholder="Type your answer..."
                      />
                    ) : question.type === "single_choice" ? (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 rounded-xl border border-border/30 px-3 py-2.5 text-sm"
                          >
                            <input
                              type="radio"
                              name={`screening-${question.id}`}
                              checked={answer === option}
                              onChange={() => updateScreeningAnswer(question.id, option)}
                              className="h-4 w-4 border-input"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <label
                            key={option}
                            className="flex items-center gap-3 rounded-xl border border-border/30 px-3 py-2.5 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={selectedAnswers.includes(option)}
                              onChange={(event) => {
                                const next = event.target.checked
                                  ? [...selectedAnswers, option]
                                  : selectedAnswers.filter((item) => item !== option);
                                updateScreeningAnswer(question.id, next);
                              }}
                              className="h-4 w-4 rounded border-input"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {screeningError && (
                      <p className="mt-3 text-xs text-destructive">{screeningError}</p>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-border/30 px-5 py-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  setScreeningError("");
                  setScreeningStep((current) => Math.max(0, current - 1));
                }}
                disabled={applying || screeningStep === 0}
              >
                Back
              </Button>
              {screeningStep === screeningQuestions.length - 1 ? (
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => void handleScreeningSubmit()}
                  disabled={applying || applied}
                >
                  {applying ? "Submitting..." : "Submit Application"}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleScreeningNext}
                  disabled={applying}
                >
                  Next
                </Button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Apply Modal */}
      <ApplyModal
        isOpen={applyOpen}
        onClose={() => setApplyOpen(false)}
        continueTo={`${pathname}?apply=1`}
      />
      <CompanyProfileModal
        company={companySummary}
        isOpen={companyOpen}
        onClose={() => setCompanyOpen(false)}
      />
    </div>
  );
}
