"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth";
import { useApplications } from "@/hooks/use-applications";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import {
  loadCurrentProfile,
  type CandidateProfileRow,
  type LoadedProfile,
} from "@/lib/profile/persistence";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { Application, Profile } from "@/types/profile";
import type { Job } from "@/types/job";
import {
  readRecentlyViewedJobs,
  type RecentlyViewedJob,
} from "@/lib/jobs/recently-viewed";
import { useBlockedCompanies } from "@/hooks/use-blocked-companies";
import {
  calculateProfileCompletion,
  type ProfileCompletionCheck,
} from "@/lib/profile/completion";
import {
  isSchemaQueryError,
  logOptionalSupabaseLoadFailure,
} from "@/lib/supabase/query-errors";

type JobRow = {
  id: string;
  title?: string | null;
  company?: string | null;
  company_name?: string | null;
  company_logo?: string | null;
  company_description?: string | null;
  company_size?: string | null;
  company_industry?: string | null;
  location?: string | null;
  location_type?: string | null;
  job_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_range?: string | null;
  salary_currency?: string | null;
  salary_period?: string | null;
  experience_level?: string | null;
  skills?: string[] | null;
  description?: string | null;
  responsibilities?: string[] | null;
  requirements?: string[] | null;
  preferred_qualifications?: string[] | null;
  benefits?: string[] | null;
  status?: string | null;
  featured?: boolean | null;
  response_rate?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export interface ApplicationUpdateItem {
  id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDisplayTime: string;
  type:
    | "applied"
    | "viewed"
    | "resume_downloaded"
    | "shortlisted"
    | "rejected"
    | "hired";
  label: string;
  timestamp: string;
  displayTime: string;
}

export interface RecommendedJobItem {
  job: Job;
  matchPercentage: number | null;
}

export type ProfileStrengthItem = ProfileCompletionCheck;

function formatRelativeDate(value: string) {
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
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatSalary(job: Pick<Job, "salaryCurrency" | "salaryMin" | "salaryMax" | "salaryPeriod">) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} - ${max}${period}`;
}

function mapJobRow(row: JobRow): Job {
  const company = String(row.company_name || row.company || "Company");
  const locationType =
    row.location_type === "Hybrid" || row.location_type === "On-site"
      ? row.location_type
      : "Remote";
  const jobType =
    row.job_type === "Contract" ||
    row.job_type === "Part-time" ||
    row.job_type === "Internship"
      ? row.job_type
      : "Full-time";
  const experienceLevel =
    row.experience_level === "Entry" ||
    row.experience_level === "Senior" ||
    row.experience_level === "Lead" ||
    row.experience_level === "Staff"
      ? row.experience_level
      : "Mid";

  return {
    id: row.id,
    title: String(row.title || "Job"),
    company,
    companyLogo: String(row.company_logo || company.slice(0, 1).toUpperCase()),
    companyDescription: String(row.company_description || ""),
    companySize: String(row.company_size || ""),
    companyIndustry: String(row.company_industry || ""),
    location: String(row.location || ""),
    locationType,
    jobType,
    salaryMin: Number(row.salary_min || 0),
    salaryMax: Number(row.salary_max || 0),
    salaryCurrency: String(row.salary_currency || "$"),
    salaryPeriod: row.salary_period === "hour" ? "hour" : "year",
    experienceLevel,
    skills: Array.isArray(row.skills) ? row.skills : [],
    description: String(row.description || ""),
    responsibilities: Array.isArray(row.responsibilities) ? row.responsibilities : [],
    requirements: Array.isArray(row.requirements) ? row.requirements : [],
    preferredQualifications: Array.isArray(row.preferred_qualifications)
      ? row.preferred_qualifications
      : [],
    benefits: Array.isArray(row.benefits) ? row.benefits : [],
    postedAt: row.created_at ? formatRelativeDate(row.created_at) : "recently",
    verifiedRecruiter: true,
    activeHiring: row.status === "active" || !row.status,
    responseRate: Number(row.response_rate || 0),
    saved: false,
    featured: Boolean(row.featured),
    status:
      row.status === "inactive" ||
      row.status === "paused" ||
      row.status === "closed" ||
      row.status === "filled"
        ? row.status
        : "active",
  };
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function tokenSet(value: string) {
  return new Set(
    normalizeText(value)
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2)
  );
}

function hasLocationMatch(job: Job, preferredLocations: string[]) {
  const locationText = `${job.location} ${job.locationType}`.toLowerCase();
  return preferredLocations.some((location) =>
    locationText.includes(location.trim().toLowerCase())
  );
}

function hasWorkModeMatch(job: Job, workModePreference?: string) {
  if (!workModePreference) return false;
  return workModePreference.toLowerCase().includes(job.locationType.toLowerCase());
}

function getRecommendedJobs(
  activeJobs: Job[],
  profile: Profile | null,
  candidateProfile: CandidateProfileRow | null,
  applications: Application[]
): RecommendedJobItem[] {
  if (!profile) return [];

  const appliedJobIds = new Set(applications.map((application) => application.jobId));
  const titleSignal = profile.currentTitle || profile.headline;
  const titleTokens = titleSignal ? tokenSet(titleSignal) : new Set<string>();
  const skillTokens = new Set(profile.skills.map((skill) => skill.toLowerCase()));
  const preferredLocations = profile.preferredLocations ?? [];
  const workModePreference =
    Array.isArray(candidateProfile?.work_mode_preference)
      ? candidateProfile.work_mode_preference.join(" ")
      : typeof candidateProfile?.work_mode_preference === "string"
        ? candidateProfile.work_mode_preference
        : profile.workModePreference;
  const experienceLevel = profile.experienceLevel;

  return activeJobs
    .filter((job) => !appliedJobIds.has(job.id))
    .map((job) => {
      let score = 0;
      let maxScore = 0;

      if (titleTokens.size > 0) {
        maxScore += 40;
        const jobTitleTokens = tokenSet(job.title);
        const titleOverlap = Array.from(titleTokens).filter((token) =>
          jobTitleTokens.has(token)
        ).length;
        score += Math.min(40, titleOverlap * 12);
      }

      if (skillTokens.size > 0) {
        maxScore += 40;
        const matchedSkills = job.skills.filter((skill) =>
          skillTokens.has(skill.toLowerCase())
        ).length;
        score += Math.min(40, matchedSkills * 10);
      }

      if (preferredLocations.length > 0) {
        maxScore += 10;
        if (hasLocationMatch(job, preferredLocations)) score += 10;
      }

      if (workModePreference) {
        maxScore += 5;
        if (hasWorkModeMatch(job, workModePreference)) score += 5;
      }

      if (experienceLevel) {
        maxScore += 5;
        if (job.experienceLevel === experienceLevel) score += 5;
      }

      return {
        job,
        score,
        matchPercentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : null,
      };
    })
    .sort((left, right) => right.score - left.score || Number(right.job.featured) - Number(left.job.featured))
    .slice(0, 4)
    .map(({ job, matchPercentage }) => ({ job, matchPercentage }));
}

function getApplicationUpdates(applications: Application[]) {
  return applications
    .flatMap<ApplicationUpdateItem>((application) => {
      const events: Array<
        Omit<ApplicationUpdateItem, "displayTime" | "appliedDisplayTime">
      > = [];

      events.push({
        id: `${application.id}-applied`,
        applicationId: application.id,
        jobId: application.jobId,
        jobTitle: application.jobTitle,
        company: application.company,
        type: "applied",
        label: "Applied",
        timestamp: application.createdAt,
      });

      if (application.viewedAt) {
        events.push({
          id: `${application.id}-viewed`,
          applicationId: application.id,
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          company: application.company,
          type: "viewed",
          label: "Viewed by recruiter",
          timestamp: application.viewedAt,
        });
      }

      if (application.resumeDownloadedAt) {
        events.push({
          id: `${application.id}-resume`,
          applicationId: application.id,
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          company: application.company,
          type: "resume_downloaded",
          label: "Resume downloaded",
          timestamp: application.resumeDownloadedAt,
        });
      }

      if (application.shortlistedAt) {
        events.push({
          id: `${application.id}-shortlisted`,
          applicationId: application.id,
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          company: application.company,
          type: "shortlisted",
          label: "Shortlisted",
          timestamp: application.shortlistedAt,
        });
      }

      if (application.rejectedAt) {
        events.push({
          id: `${application.id}-rejected`,
          applicationId: application.id,
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          company: application.company,
          type: "rejected",
          label: "Rejected",
          timestamp: application.rejectedAt,
        });
      }

      if (application.hiredAt) {
        events.push({
          id: `${application.id}-hired`,
          applicationId: application.id,
          jobId: application.jobId,
          jobTitle: application.jobTitle,
          company: application.company,
          type: "hired",
          label: "Hired",
          timestamp: application.hiredAt,
        });
      }

      return events.map((event) => ({
        ...event,
        appliedDisplayTime: formatRelativeDate(application.createdAt),
        displayTime: formatRelativeDate(event.timestamp),
      }));
    })
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
    )
    .slice(0, 6);
}

export function useCandidateDashboard() {
  const { isAuthenticated, role, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<LoadedProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeJobs, setActiveJobs] = useState<Job[]>([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [recentlyViewedJobs, setRecentlyViewedJobs] = useState<RecentlyViewedJob[]>([]);
  const {
    applications,
    loaded: applicationsLoaded,
    limit,
    source: applicationsSource,
  } = useApplications();
  const {
    savedJobs,
    loaded: savedJobsLoaded,
    savingIds,
    isSaved,
    toggleSavedJob,
  } = useSavedJobs();
  const { isCompanyBlocked } = useBlockedCompanies();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecentlyViewedJobs(readRecentlyViewedJobs());
    }, 0);

    const onStorage = () => {
      setRecentlyViewedJobs(readRecentlyViewedJobs());
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || role !== "candidate") {
      const timer = window.setTimeout(() => {
        setProfileData(null);
        setProfileError(null);
        setProfileLoaded(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const loadingTimer = window.setTimeout(() => setProfileLoaded(false), 0);
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          setProfileError(null);
          const data = await loadCurrentProfile();
          setProfileData(data);
        } catch (error) {
          console.error("[DASHBOARD] Profile load failed", error);
          setProfileData(null);
          setProfileError(
            error instanceof Error && error.message
              ? error.message
              : "We could not load your candidate profile."
          );
        } finally {
          setProfileLoaded(true);
        }
      })();
    }, 0);

    return () => {
      window.clearTimeout(loadingTimer);
      window.clearTimeout(timer);
    };
  }, [authLoading, isAuthenticated, role]);

  useEffect(() => {
    if (authLoading) return;

    const supabase = getSupabaseClient();
    if (!isAuthenticated || role !== "candidate") {
      const timer = window.setTimeout(() => {
        setActiveJobs([]);
        setJobsLoaded(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    if (!supabase) {
      const timer = window.setTimeout(() => {
        setActiveJobs([]);
        setJobsLoaded(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const loadingTimer = window.setTimeout(() => setJobsLoaded(false), 0);
    const timer = window.setTimeout(() => {
      void (async () => {
        const loadAttempts = [
          () =>
            supabase
              .from("jobs")
              .select(
                "id,title,company,company_name,company_logo,company_description,company_size,company_industry,location,location_type,job_type,salary_min,salary_max,salary_range,salary_currency,salary_period,experience_level,skills,description,responsibilities,requirements,preferred_qualifications,benefits,status,featured,response_rate,created_at,updated_at"
              )
              .eq("status", "active")
              .order("created_at", { ascending: false }),
          () =>
            supabase
              .from("jobs")
              .select(
                "id,title,company,company_name,company_logo,company_description,company_size,company_industry,location,location_type,job_type,salary_min,salary_max,salary_currency,salary_period,experience_level,skills,description,created_at,updated_at"
              )
              .eq("status", "active")
              .order("created_at", { ascending: false }),
          () =>
            supabase
              .from("jobs")
              .select("id,title,company,company_name,company_logo,location,location_type,job_type,salary_min,salary_max,salary_currency,skills,description,created_at")
              .order("created_at", { ascending: false }),
          () =>
            supabase
              .from("jobs")
              .select("id,title,company,location,created_at")
              .order("created_at", { ascending: false }),
          () =>
            supabase
              .from("jobs")
              .select("id,title,company,location"),
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
          logOptionalSupabaseLoadFailure("[DASHBOARD] Jobs load failed", lastError);
          setActiveJobs([]);
          setJobsLoaded(true);
          return;
        }

        const mapped = ((data ?? []) as JobRow[]).map(mapJobRow);
        setActiveJobs(mapped);
        setJobsLoaded(true);
      })();
    }, 0);

    return () => {
      window.clearTimeout(loadingTimer);
      window.clearTimeout(timer);
    };
  }, [authLoading, isAuthenticated, role]);

  const profile = profileData?.profile ?? null;
  const candidateProfile = profileData?.candidateProfile ?? null;
  const profileStrength = useMemo(() => calculateProfileCompletion(profile), [profile]);
  const applicationUpdates = useMemo(
    () => getApplicationUpdates(applications),
    [applications]
  );
  const recommendedJobs = useMemo(
    () => getRecommendedJobs(
      activeJobs.filter((job) => !isCompanyBlocked(job.company)),
      profile,
      candidateProfile,
      applications
    ),
    [activeJobs, applications, candidateProfile, isCompanyBlocked, profile]
  );
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  return {
    activeJobs,
    applicationUpdates,
    applications,
    applicationsLoaded,
    applicationsSource,
    candidateProfile,
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
  };
}
