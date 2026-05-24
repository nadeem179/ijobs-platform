"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FilterState, Job } from "@/types/job";
import { jobs as fallbackJobs } from "@/data/jobs";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters, JobSearchBar } from "@/components/filters/job-filters";
import { SkeletonCard } from "@/components/jobs/skeleton-card";
import { NoResultsEmptyState, NoSavedJobsEmptyState } from "@/components/jobs/empty-states";
import { Button } from "@/components/ui/button";
import { useApplications } from "@/hooks/use-applications";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { useAuth } from "@/context/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  isSchemaQueryError,
  logOptionalSupabaseLoadFailure,
} from "@/lib/supabase/query-errors";
import {
  matchesSearchQuery,
  parseJobQuery,
  saveRecentSearch,
  scoreCandidateJobSearch,
  SEARCH_QUERY_PARAM,
  type CandidateSearchProfile,
} from "@/lib/jobs/candidate-search";

const STORAGE_KEY = "ijobs.jobSearchState";

const INITIAL_FILTERS: FilterState = {
  query: "",
  designation: "",
  location: "",
  jobType: [],
  experienceLevel: [],
  skills: [],
  salaryMin: 0,
  salaryMax: 5000000,
  freshness: "any",
  remoteOnly: false,
  verifiedOnly: false,
  easyApply: false,
  activeOnly: true,
  locationType: [],
  sort: "relevant",
};

function getPostedAgeDays(postedAt: string) {
  const normalized = postedAt.toLowerCase();
  const amount = Number(normalized.match(/\d+/)?.[0] ?? 1);
  if (normalized.includes("hour")) return 0;
  if (normalized.includes("day")) return amount;
  if (normalized.includes("week")) return amount * 7;
  if (normalized.includes("month")) return amount * 30;
  return 0;
}

function getFreshnessLimit(freshness: FilterState["freshness"]) {
  if (freshness === "24h") return 1;
  if (freshness === "3d") return 3;
  if (freshness === "7d") return 7;
  if (freshness === "14d") return 14;
  if (freshness === "30d") return 30;
  return null;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matchesExperience(jobLevel: string, selected: string[]) {
  if (selected.length === 0) return true;
  const aliases: Record<string, string[]> = {
    Intern: ["Intern", "Internship"],
    Fresher: ["Entry", "Fresher", "Junior"],
    Junior: ["Entry", "Junior"],
    Manager: ["Lead", "Manager"],
    Director: ["Lead", "Staff", "Director"],
  };
  return selected.some((level) => level === jobLevel || aliases[level]?.includes(jobLevel));
}

function getLocationSearchText(job: Job) {
  return [job.location, job.locationType].join(" ").toLowerCase();
}

function mapJobRow(row: Record<string, unknown>): Job {
  const company = String(row.company_name || row.company || "Company");
  const status = String(row.status || "active");
  return {
    id: String(row.id),
    title: String(row.title || "Job"),
    company,
    companyLogo: String(row.company_logo || company.slice(0, 1).toUpperCase()),
    companyDescription: String(row.company_description || ""),
    companySize: String(row.company_size || ""),
    companyIndustry: String(row.company_industry || ""),
    location: String(row.location || ""),
    locationType: row.location_type === "Hybrid" || row.location_type === "On-site" ? row.location_type : "Remote",
    jobType:
      row.job_type === "Contract" || row.job_type === "Part-time" || row.job_type === "Internship"
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
    responsibilities: Array.isArray(row.responsibilities) ? (row.responsibilities as string[]) : [],
    requirements: Array.isArray(row.requirements) ? (row.requirements as string[]) : [],
    preferredQualifications: Array.isArray(row.preferred_qualifications) ? (row.preferred_qualifications as string[]) : [],
    benefits: Array.isArray(row.benefits) ? (row.benefits as string[]) : [],
    postedAt: row.created_at ? "recently" : "recently",
    verifiedRecruiter: true,
    activeHiring: status === "active",
    responseRate: Number(row.response_rate || 0),
    saved: false,
    featured: Boolean(row.featured),
    status: status === "active" ? "active" : "inactive",
  };
}

export function JobFeed({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const { user, isAuthenticated, role } = useAuth();
  const [filters, setFilters] = useState<FilterState>({ ...INITIAL_FILTERS, query: initialQuery });
  const [jobs, setJobs] = useState<Job[]>(fallbackJobs);
  const [profile, setProfile] = useState<CandidateSearchProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSaved, setShowSaved] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { getApplicationForJob } = useApplications();
  const { savedJobs, isSaved, toggleSavedJob } = useSavedJobs();

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const timer = window.setTimeout(() => {
      try {
        setFilters({ ...INITIAL_FILTERS, ...(JSON.parse(saved) as Partial<FilterState>), query: initialQuery });
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialQuery]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const supabase = getSupabaseClient();
      if (!supabase || !isAuthenticated) {
        setJobs(fallbackJobs);
        setLoading(false);
        return;
      }

      void (async () => {
        try {
          const loadAttempts = [
            () =>
              supabase
                .from("jobs")
                .select("id,title,company,company_name,company_logo,company_description,company_size,company_industry,location,location_type,job_type,salary_min,salary_max,salary_currency,salary_period,experience_level,skills,description,responsibilities,requirements,preferred_qualifications,benefits,status,featured,response_rate,created_at")
                .eq("status", "active")
                .order("created_at", { ascending: false })
                .limit(100),
            () =>
              supabase
                .from("jobs")
                .select("id,title,company,company_name,company_logo,company_description,company_size,company_industry,location,location_type,job_type,salary_min,salary_max,salary_currency,salary_period,experience_level,skills,description,created_at")
                .eq("status", "active")
                .order("created_at", { ascending: false })
                .limit(100),
            () =>
              supabase
                .from("jobs")
                .select("id,title,company,company_name,company_logo,location,location_type,job_type,salary_min,salary_max,salary_currency,skills,description,created_at")
                .order("created_at", { ascending: false })
                .limit(100),
            () =>
              supabase
                .from("jobs")
                .select("id,title,company,location,created_at")
                .order("created_at", { ascending: false })
                .limit(100),
          ];

          let data: unknown[] | null = null;
          let lastError: Awaited<ReturnType<(typeof loadAttempts)[number]>>["error"] = null;
          for (const attempt of loadAttempts) {
            const result = await attempt();
            if (!result.error) {
              data = (result.data ?? []) as unknown[];
              lastError = null;
              break;
            }

            lastError = result.error;
            if (!isSchemaQueryError(result.error)) break;
          }

          if (lastError) {
            logOptionalSupabaseLoadFailure("[JOBS] Load failed", lastError);
            setJobs([]);
            return;
          }
          setJobs(((data ?? []) as Record<string, unknown>[]).map(mapJobRow));
        } finally {
          setLoading(false);
        }
      })();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase || !user?.id || role !== "candidate") return;

    void supabase
      .from("candidate_profiles")
      .select("designation,current_title,headline,skills,preferred_locations,work_mode_preference,experience_level")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) return;
        if (!data) return;
        const row = data as Record<string, unknown>;
        setProfile({
          designation: String(row.designation || row.current_title || ""),
          headline: String(row.headline || ""),
          skills: Array.isArray(row.skills) ? (row.skills as string[]) : [],
          preferredLocations: Array.isArray(row.preferred_locations) ? (row.preferred_locations as string[]) : [],
          workModes: Array.isArray(row.work_mode_preference) ? (row.work_mode_preference as string[]) : [],
          experienceLevel: typeof row.experience_level === "string" ? row.experience_level : undefined,
        });
      });
  }, [role, user]);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    if (initialQuery) {
      router.push("/jobs");
    }
  }, [initialQuery, router]);
  const clearSearch = useCallback(() => {
    setFilters((current) => ({ ...current, query: "" }));
    router.push("/jobs");
  }, [router]);
  const browseAllJobs = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    router.push("/jobs");
  }, [router]);

  const availableSkills = useMemo(() => Array.from(new Set(jobs.flatMap((job) => job.skills))).sort(), [jobs]);
  const availableLocations = useMemo(() => Array.from(new Set(jobs.map((job) => job.location).filter(Boolean))).sort(), [jobs]);
  const availableDesignations = useMemo(() => Array.from(new Set(jobs.map((job) => job.title).filter(Boolean))).sort(), [jobs]);
  const parsedQuery = useMemo(() => parseJobQuery(filters.query, availableLocations), [availableLocations, filters.query]);

  const filteredJobs = useMemo(() => {
    const freshnessLimit = getFreshnessLimit(filters.freshness);

    return jobs
      .filter((job) => {
        if (filters.activeOnly && !job.activeHiring) return false;
        if (filters.easyApply && !job.id) return false;

        if (!matchesSearchQuery(job, filters.query, profile, parsedQuery)) {
          return false;
        }

        if (parsedQuery.experienceLevel && job.experienceLevel !== parsedQuery.experienceLevel) {
          const hasExplicitExperienceFilter = filters.experienceLevel.length > 0;
          if (!hasExplicitExperienceFilter) return false;
        }

        if (filters.designation && !normalize(job.title).includes(normalize(filters.designation))) return false;
        if (filters.location && !getLocationSearchText(job).includes(normalize(filters.location))) return false;
        if (filters.locationType.length > 0 && !filters.locationType.includes(job.locationType)) return false;
        if (filters.jobType.length > 0 && !filters.jobType.includes(job.jobType)) return false;
        if (!matchesExperience(job.experienceLevel, filters.experienceLevel)) return false;

        if (filters.skills.length > 0) {
          const jobSkills = job.skills.map(normalize);
          if (!filters.skills.every((skill) => jobSkills.some((jobSkill) => jobSkill.includes(normalize(skill))))) {
            return false;
          }
        }

        if (job.salaryMax < filters.salaryMin) return false;
        if (job.salaryMin > filters.salaryMax) return false;
        if (freshnessLimit !== null && getPostedAgeDays(job.postedAt) > freshnessLimit) return false;
        return true;
      })
      .map((job) => ({
        ...job,
        saved: isSaved(job.id),
        relevanceScore: scoreCandidateJobSearch(job, filters.query, profile, parsedQuery),
      }))
      .sort((a, b) => {
        if (filters.sort === "recent") return getPostedAgeDays(a.postedAt) - getPostedAgeDays(b.postedAt);
        if (filters.sort === "salary") return b.salaryMax - a.salaryMax;
        return b.relevanceScore - a.relevanceScore;
      });
  }, [filters, isSaved, jobs, parsedQuery, profile]);

  const recommendedJobs = useMemo(
    () =>
      jobs
        .map((job) => ({
          ...job,
          saved: isSaved(job.id),
          relevanceScore: scoreCandidateJobSearch(job, filters.query, profile, parsedQuery),
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3),
    [filters.query, isSaved, jobs, parsedQuery, profile]
  );

  const displayJobs = showSaved
    ? savedJobs.map((saved) => jobs.find((job) => job.id === saved.jobId)).filter((job): job is Job => Boolean(job))
    : filteredJobs;

  const activeFilterCount = [
    filters.query,
    filters.designation,
    filters.location,
    ...filters.jobType,
    ...filters.experienceLevel,
    ...filters.skills,
    filters.freshness !== "any" ? filters.freshness : null,
    ...filters.locationType,
    filters.easyApply ? "easy" : null,
  ].filter(Boolean).length;

  const activeChips = [
    filters.designation && { label: `Title: ${filters.designation}`, clear: () => setFilters((current) => ({ ...current, designation: "" })) },
    filters.location && { label: `Location: ${filters.location}`, clear: () => setFilters((current) => ({ ...current, location: "" })) },
    ...filters.locationType.map((value) => ({
      label: value,
      clear: () =>
        setFilters((current) => ({
          ...current,
          locationType: current.locationType.filter((item) => item !== value),
        })),
    })),
    ...filters.experienceLevel.map((value) => ({
      label: value,
      clear: () =>
        setFilters((current) => ({
          ...current,
          experienceLevel: current.experienceLevel.filter((item) => item !== value),
        })),
    })),
    ...filters.jobType.map((value) => ({
      label: value,
      clear: () =>
        setFilters((current) => ({
          ...current,
          jobType: current.jobType.filter((item) => item !== value),
        })),
    })),
    ...filters.skills.map((value) => ({
      label: value,
      clear: () =>
        setFilters((current) => ({
          ...current,
          skills: current.skills.filter((item) => item !== value),
        })),
    })),
    filters.freshness !== "any" && { label: `Posted: ${filters.freshness}`, clear: () => setFilters((current) => ({ ...current, freshness: "any" })) },
    filters.easyApply && { label: "Easy Apply", clear: () => setFilters((current) => ({ ...current, easyApply: false })) },
    (filters.salaryMin > 0 || filters.salaryMax < 5000000) && {
      label: `Salary: ${filters.salaryMin || 0}-${filters.salaryMax}`,
      clear: () => setFilters((current) => ({ ...current, salaryMin: 0, salaryMax: 5000000 })),
    },
  ].filter(Boolean) as Array<{ label: string; clear: () => void }>;

  return (
    <div className="space-y-5">
      <JobSearchBar
        query={filters.query}
        onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
        onQuerySubmit={(query) => {
          const trimmed = query.trim();
          if (trimmed) {
            saveRecentSearch(trimmed);
            router.push(`/jobs?${SEARCH_QUERY_PARAM}=${encodeURIComponent(trimmed)}`);
            return;
          }
          router.push("/jobs");
        }}
        onOpenFilters={() => setMobileFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <div className="flex gap-6 lg:gap-8">
        <JobFilters
          filters={filters}
          onFilterChange={setFilters}
          availableSkills={availableSkills}
          availableLocations={availableLocations}
          availableDesignations={availableDesignations}
          onClear={clearFilters}
          activeFilterCount={activeFilterCount}
          mobileOpen={mobileFiltersOpen}
          onMobileOpenChange={setMobileFiltersOpen}
        />

        <main className="min-w-0 flex-1">
          <div className="mb-4 rounded-xl border border-border/30 bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  {showSaved ? "Saved Jobs" : "Jobs for you"}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {showSaved
                    ? `${savedJobs.length} saved job${savedJobs.length !== 1 ? "s" : ""}`
                    : `${filteredJobs.length} ${filteredJobs.length === 1 ? "job" : "jobs"} found`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => setShowSaved(!showSaved)}
                  className={`text-sm font-medium transition-colors ${showSaved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Saved ({savedJobs.length})
                </button>
                <select
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground"
                  value={filters.sort}
                  onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as FilterState["sort"] }))}
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="recent">Most Recent</option>
                  <option value="salary">Highest Salary</option>
                </select>
              </div>
            </div>

            {activeChips.length > 0 && !showSaved && (
              <div className="mt-3 flex flex-wrap gap-2">
                {activeChips.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={chip.clear}
                    className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {chip.label}
                    <span className="text-muted-foreground/60">x</span>
                  </button>
                ))}
                <button type="button" onClick={clearFilters} className="text-xs font-medium text-primary">
                  Clear all
                </button>
              </div>
            )}
          </div>

          {loading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {!loading && showSaved && savedJobs.length === 0 && <NoSavedJobsEmptyState />}

          {!loading && !showSaved && filteredJobs.length === 0 && (
            <div className="space-y-5">
              <NoResultsEmptyState query={filters.query} onClear={clearSearch} onBrowseAll={browseAllJobs} />
              {recommendedJobs.length > 0 && (
                <div>
                  <h2 className="mb-3 text-sm font-semibold">Recommended instead</h2>
                  <div className="space-y-3">
                    {recommendedJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onSave={() => toggleSavedJob(job.id)}
                        applicationStatus={getApplicationForJob(job.id)?.status}
                        highlightQuery={filters.query}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!loading && displayJobs.length > 0 && (
            <div className="space-y-3">
              {displayJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={{ ...job, saved: isSaved(job.id) }}
                  onSave={() => toggleSavedJob(job.id)}
                  applicationStatus={getApplicationForJob(job.id)?.status}
                  highlightQuery={filters.query}
                />
              ))}
            </div>
          )}

          {!loading && displayJobs.length > 8 && (
            <div className="mt-5 flex justify-center">
              <Button variant="outline" className="rounded-xl">
                Load more
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
