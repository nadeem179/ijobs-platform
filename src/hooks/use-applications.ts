"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { jobs } from "@/data/jobs";
import { mockApplications } from "@/data/profile";
import type { Application } from "@/types/profile";
import type { Job } from "@/types/job";
import { useApplicationLimit } from "@/hooks/use-application-limit";
import { FREE_CANDIDATE_DAILY_APPLICATION_LIMIT } from "@/lib/application-limits";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  isSchemaQueryError,
  logOptionalSupabaseLoadFailure,
} from "@/lib/supabase/query-errors";
import { useAuth } from "@/context/auth";
import type { ScreeningAnswer } from "@/types/screening";

function formatSalary(job: Job) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} - ${max}${period}`;
}

function formatLocation(job: Job) {
  if (job.locationType === "Remote") return "Remote";
  return `${job.location} (${job.locationType})`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function omit<T extends Record<string, unknown>>(value: T, keys: string[]) {
  const next = { ...value };
  keys.forEach((key) => {
    delete next[key];
  });
  return next;
}

function relativeDate(value?: string | null) {
  if (!value) return "recently";
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return "recently";

  const diffMs = Date.now() - created.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

type ApplicationJobRow = {
  id?: string | null;
  title?: string | null;
  company?: string | null;
  company_name?: string | null;
  location?: string | null;
  location_type?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_range?: string | null;
  company_description?: string | null;
  company_size?: string | null;
  company_industry?: string | null;
  recruiter_id?: string | null;
  recruiter_profile_id?: string | null;
};

type ApplicationRow = {
  id: string;
  job_id?: string | null;
  job_external_id?: string | null;
  candidate_id?: string | null;
  user_id?: string | null;
  status?: Application["status"] | null;
  screening_answers?: ScreeningAnswer[] | string | null;
  created_at?: string | null;
  applied_at?: string | null;
  updated_at?: string | null;
  viewed_at?: string | null;
  resume_downloaded_at?: string | null;
  contacted_at?: string | null;
  shortlisted_at?: string | null;
  rejected_at?: string | null;
  hired_at?: string | null;
  jobs?: ApplicationJobRow | null;
};

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean))) as string[];
}

function uniqueIdentityFilters(userId: string, candidateProfileId?: string | null) {
  const candidateIds = uniqueValues([userId, candidateProfileId]);
  return [
    `user_id.eq.${userId}`,
    ...candidateIds.map((id) => `candidate_id.eq.${id}`),
  ].join(",");
}

function candidateOnlyFilter(userId: string, candidateProfileId?: string | null) {
  return uniqueValues([userId, candidateProfileId])
    .map((id) => `candidate_id.eq.${id}`)
    .join(",");
}

function screeningAnswerCount(value: unknown) {
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
  return Array.isArray(parsed) ? parsed.length : 0;
}

const allowedApplicationStatuses = new Set<Application["status"]>([
  "applied",
  "viewed",
  "resume_downloaded",
  "shortlisted",
  "rejected",
  "interviewing",
  "hired",
]);

function normalizeApplicationStatus(value: unknown): Application["status"] {
  return typeof value === "string" && allowedApplicationStatuses.has(value as Application["status"])
    ? (value as Application["status"])
    : "applied";
}

function mapApplication(row: ApplicationRow): Application {
  const fallbackJob = row.job_external_id
    ? jobs.find((item) => item.id === row.job_external_id)
    : null;
  const job = row.jobs ?? {};
  const salary =
    job.salary_range ||
    (typeof job.salary_min === "number" && typeof job.salary_max === "number"
      ? `${job.salary_currency || "$"} ${job.salary_min} - ${job.salary_max}`
      : fallbackJob
        ? formatSalary(fallbackJob)
      : "");

  return {
    id: row.id,
    jobId: row.job_external_id || row.job_id || row.id,
    jobTitle: job.title || fallbackJob?.title || "Job",
    company: job.company_name || job.company || fallbackJob?.company || "Company",
    companyLogo: (job.company_name || job.company || fallbackJob?.company || "C")
      .slice(0, 1)
      .toUpperCase(),
    status: normalizeApplicationStatus(row.status),
    appliedAt: relativeDate(row.created_at || row.applied_at),
    updatedAt: relativeDate(row.updated_at || row.created_at || row.applied_at),
    createdAt: row.created_at || row.applied_at || new Date().toISOString(),
    viewedAt: row.viewed_at,
    resumeDownloadedAt: row.resume_downloaded_at,
    contactedAt: row.contacted_at,
    shortlistedAt: row.shortlisted_at,
    rejectedAt: row.rejected_at,
    hiredAt: row.hired_at,
    salary,
    location: job.location || (fallbackJob ? formatLocation(fallbackJob) : ""),
    locationType: job.location_type || fallbackJob?.locationType,
    companyDescription: job.company_description || fallbackJob?.companyDescription,
    companySize: job.company_size || fallbackJob?.companySize,
    companyIndustry: job.company_industry || fallbackJob?.companyIndustry,
    recruiterId: job.recruiter_profile_id || job.recruiter_id || null,
  };
}

export function useApplications() {
  const { user, role, isAuthenticated } = useAuth();
  const [dbApplications, setDbApplications] = useState<Application[]>([]);
  const [loaded, setLoaded] = useState(false);

  const useSupabase = Boolean(isAuthenticated && user?.id);
  const applications = useMemo(
    () => (useSupabase ? dbApplications : mockApplications),
    [dbApplications, useSupabase]
  );
  const limit = useApplicationLimit(applications);

  const getApplicationForJob = useCallback(
    (jobId: string) => applications.find((app) => app.jobId === jobId) ?? null,
    [applications]
  );

  const refetchApplications = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user?.id) {
      setDbApplications([]);
      setLoaded(true);
      return;
    }

    let candidateProfileId: string | null = null;
    const candidateProfileResult = await supabase
      .from("candidate_profiles")
      .select("id,user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!candidateProfileResult.error) {
      candidateProfileId =
        (candidateProfileResult.data as { id?: string | null } | null)?.id ?? null;
    } else if (!isSchemaQueryError(candidateProfileResult.error)) {
      logOptionalSupabaseLoadFailure(
        "[APPLICATIONS] Candidate profile identity lookup failed",
        candidateProfileResult.error
      );
    }

    const identityFilter = uniqueIdentityFilters(user.id, candidateProfileId);
    const candidateFilter = candidateOnlyFilter(user.id, candidateProfileId);
    const loadAttempts = [
      () =>
        supabase
          .from("applications")
          .select("id,job_id,job_external_id,status,created_at,updated_at,viewed_at,resume_downloaded_at,contacted_at,shortlisted_at,rejected_at,hired_at")
          .or(identityFilter)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("applications")
          .select("id,job_id,job_external_id,created_at,updated_at,viewed_at,resume_downloaded_at,shortlisted_at,rejected_at,hired_at")
          .or(identityFilter)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("applications")
          .select("id,job_id,created_at,updated_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("applications")
          .select("id,job_id,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("applications")
          .select("id,job_id,candidate_id,status,applied_at,viewed_at,resume_downloaded_at,shortlisted_at")
          .or(candidateFilter)
          .order("applied_at", { ascending: false }),
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
      logOptionalSupabaseLoadFailure("[APPLICATIONS] Load failed", lastError);
      setDbApplications([]);
    } else {
      const rows = (data ?? []) as ApplicationRow[];
      const jobIds = uniqueValues(rows.map((row) => row.job_id));
      let jobById = new Map<string, ApplicationJobRow>();

      if (jobIds.length > 0) {
        const jobAttempts = [
          () =>
            supabase
              .from("jobs")
              .select("id,title,company,company_name,company_logo,location,location_type,salary_min,salary_max,salary_currency,salary_range,company_description,company_size,company_industry,recruiter_id,recruiter_profile_id")
              .in("id", jobIds),
          () =>
            supabase
              .from("jobs")
              .select("id,title,company,company_name,company_logo,location,salary_min,salary_max,salary_currency")
              .in("id", jobIds),
          () => supabase.from("jobs").select("id,title,company,location").in("id", jobIds),
        ];

        for (const attempt of jobAttempts) {
          const result = await attempt();
          if (!result.error) {
            jobById = new Map(
              ((result.data ?? []) as ApplicationJobRow[])
                .filter((job) => job.id)
                .map((job) => [job.id as string, job])
            );
            break;
          }
          if (!isSchemaQueryError(result.error)) break;
        }
      }

      setDbApplications(
        rows.map((row) => mapApplication({ ...row, jobs: row.job_id ? jobById.get(row.job_id) ?? null : null }))
      );
    }

    setLoaded(true);
  }, [user]);

  useEffect(() => {
    if (useSupabase) {
      const timer = window.setTimeout(() => {
        void refetchApplications();
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setDbApplications([]);
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refetchApplications, useSupabase]);

  const applyToJob = useCallback(
    async (
      jobId: string,
      options?: { screeningAnswers?: ScreeningAnswer[] }
    ) => {
      const currentUserId = user?.id;
      const existingApplication = applications.find((app) => app.jobId === jobId);
      if (existingApplication) {
        return {
          application: existingApplication,
          error: "You have already applied to this job.",
        };
      }

      if (!limit.canApplyToday) {
        return {
          application: null,
          error: `Free candidates can apply to ${FREE_CANDIDATE_DAILY_APPLICATION_LIMIT} jobs per day. Upgrade limits will be added here for premium candidates.`,
        };
      }

      const supabase = getSupabaseClient();
      if (useSupabase && supabase && currentUserId) {
        if (role !== "candidate") {
          return {
            application: null,
            error: "Only candidates can apply to jobs.",
          };
        }

        let candidateProfileId: string | null = null;
        const candidateProfileResult = await supabase
          .from("candidate_profiles")
          .select("id,user_id")
          .eq("user_id", currentUserId)
          .maybeSingle();
        if (!candidateProfileResult.error) {
          candidateProfileId =
            (candidateProfileResult.data as { id?: string | null } | null)?.id ?? null;
        } else if (!isSchemaQueryError(candidateProfileResult.error)) {
          return { application: null, error: candidateProfileResult.error.message };
        }

        const identityFilter = uniqueIdentityFilters(currentUserId, candidateProfileId);
        const candidateFilter = candidateOnlyFilter(currentUserId, candidateProfileId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let { count: todaysCount, error: countError } = await supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .or(identityFilter)
          .gte("created_at", today.toISOString());
        if (countError && isSchemaQueryError(countError)) {
          const fallbackCount = await supabase
            .from("applications")
            .select("id", { count: "exact", head: true })
            .or(candidateFilter)
            .gte("applied_at", today.toISOString());
          todaysCount = fallbackCount.count;
          countError = fallbackCount.error;
        }

        if (countError) {
          console.error("[APPLICATIONS] Daily limit count failed", countError.message);
          return { application: null, error: countError.message };
        }

        if ((todaysCount ?? 0) >= FREE_CANDIDATE_DAILY_APPLICATION_LIMIT) {
          return {
            application: null,
            error: `Free candidates can apply to ${FREE_CANDIDATE_DAILY_APPLICATION_LIMIT} jobs per day. Upgrade limits will be added here for premium candidates.`,
          };
        }

        let jobIdentity: { job_id: string } | { job_external_id: string } =
          isUuid(jobId) ? { job_id: jobId } : { job_external_id: jobId };
        if (isUuid(jobId)) {
          const { data: jobRow, error: jobLookupError } = await supabase
            .from("jobs")
            .select("id")
            .eq("id", jobId)
            .maybeSingle();
          if (!jobLookupError && jobRow?.id) {
            jobIdentity = { job_id: String(jobRow.id) };
          } else if (jobLookupError && !isSchemaQueryError(jobLookupError)) {
            return { application: null, error: jobLookupError.message };
          }
        }

        const payload: Record<string, unknown> = {
          ...jobIdentity,
          user_id: currentUserId,
          candidate_id: currentUserId,
          status: "applied",
          screening_answers: options?.screeningAnswers ?? [],
        };

        const insertAttempts: Array<Record<string, unknown>> = [
          payload,
          omit(payload, ["user_id"]),
          omit(payload, ["candidate_id"]),
          omit(payload, ["status"]),
          omit(payload, ["candidate_id", "status"]),
        ];

        let insertError: {
          message: string;
          code?: string;
          details?: string;
          hint?: string;
        } | null = null;
        let insertedRow: ApplicationRow | null = null;
        for (const attempt of insertAttempts) {
          const selectAttempts = [
            "id,job_id,job_external_id,candidate_id,user_id,status,screening_answers,created_at,updated_at,viewed_at,resume_downloaded_at,contacted_at,shortlisted_at,rejected_at,hired_at",
            "id,job_id,job_external_id,candidate_id,status,screening_answers,created_at,updated_at,viewed_at,resume_downloaded_at,shortlisted_at,rejected_at,hired_at",
          ];

          for (const columns of selectAttempts) {
            const { data, error } = await supabase
              .from("applications")
              .insert(attempt)
              .select(columns)
              .maybeSingle();
            if (!error) {
              insertError = null;
              insertedRow = data as ApplicationRow | null;
              break;
            }

            insertError = error;
            if (error.code === "23505") break;
            if (!isSchemaQueryError(error)) break;
          }

          if (!insertError || insertError.code === "23505" || !isSchemaQueryError(insertError)) break;
        }

        if (insertError) {
          if (insertError.code === "23505") {
            await refetchApplications();
            const duplicateApplication = getApplicationForJob(jobId);
            return {
              application: duplicateApplication,
              error: "You have already applied to this job.",
            };
          }

          console.error("[APPLICATIONS] Apply failed", {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint,
          });
          return { application: null, error: insertError.message };
        }

        const verificationQuery = supabase
          .from("applications")
          .select("id,job_id,job_external_id,candidate_id,user_id,status,screening_answers,created_at,applied_at,viewed_at,resume_downloaded_at,shortlisted_at")
          .or(candidateFilter);
        const verifiedResult = insertedRow?.id
          ? await verificationQuery.eq("id", insertedRow.id).maybeSingle()
          : "job_id" in jobIdentity
            ? await verificationQuery.eq("job_id", jobIdentity.job_id).maybeSingle()
            : await verificationQuery.eq("job_external_id", jobIdentity.job_external_id).maybeSingle();

        if (verifiedResult.error) {
          return { application: null, error: verifiedResult.error.message };
        }
        const expectedScreeningAnswers = options?.screeningAnswers ?? [];
        if (
          expectedScreeningAnswers.length > 0 &&
          screeningAnswerCount((verifiedResult.data as ApplicationRow | null)?.screening_answers) === 0
        ) {
          return {
            application: null,
            error: "Application saved, but screening answers were not persisted. Please try again.",
          };
        }

        const fallbackJob = jobs.find((item) => item.id === jobId);
        const optimisticApplication: Application = {
          id: `app-${jobId}-${Date.now()}`,
          jobId,
          jobTitle: fallbackJob?.title || "Job",
          company: fallbackJob?.company || "Company",
          companyLogo: fallbackJob?.companyLogo || (fallbackJob?.company || "C").slice(0, 1).toUpperCase(),
          status: "applied",
          appliedAt: "today",
          updatedAt: "today",
          createdAt: new Date().toISOString(),
          salary: fallbackJob ? formatSalary(fallbackJob) : "",
          location: fallbackJob ? formatLocation(fallbackJob) : "",
        };
        await refetchApplications();
        setDbApplications((current) =>
          current.some((application) => application.jobId === jobId)
            ? current
            : [optimisticApplication, ...current]
        );
        return { application: optimisticApplication, error: null };
      }

      const job = jobs.find((item) => item.id === jobId);
      if (!job) {
        return {
          application: null,
          error: "This job is no longer available.",
        };
      }

      const now = new Date().toISOString();
      const application: Application = {
        id: `app-${job.id}-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        company: job.company,
        companyLogo: job.companyLogo,
        status: "applied",
        appliedAt: "just now",
        updatedAt: "just now",
        createdAt: now,
        salary: formatSalary(job),
        location: formatLocation(job),
      };

      setDbApplications((current) => [...current, application]);
      return { application, error: null };
    },
    [
      applications,
      getApplicationForJob,
      limit.canApplyToday,
      refetchApplications,
      role,
      useSupabase,
      user,
    ]
  );

  return {
    applications,
    loaded,
    getApplicationForJob,
    applyToJob,
    limit,
    refetchApplications,
    source: useSupabase ? "supabase" : "demo",
  };
}
