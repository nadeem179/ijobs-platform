"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { jobs } from "@/data/jobs";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  isSchemaQueryError,
  logOptionalSupabaseLoadFailure,
} from "@/lib/supabase/query-errors";
import { useAuth } from "@/context/auth";
import type { SavedJob } from "@/types/profile";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function formatSalary(job: (typeof jobs)[number]) {
  const min = job.salaryCurrency + (job.salaryMin / 1000).toFixed(0) + "K";
  const max = job.salaryCurrency + (job.salaryMax / 1000).toFixed(0) + "K";
  const period = job.salaryPeriod === "year" ? "/yr" : "/hr";
  return `${min} - ${max}${period}`;
}

function relativeDate(value: string) {
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return "recently";
  const diffDays = Math.floor((Date.now() - created.getTime()) / 86400000);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

type SavedJobRow = {
  id: string;
  job_id?: string | null;
  job_external_id?: string | null;
  created_at?: string | null;
  jobs?: {
    title?: string | null;
    company?: string | null;
    company_name?: string | null;
    company_logo?: string | null;
    location?: string | null;
    salary_range?: string | null;
  } | null;
};

export type SavedJobActionResult = {
  error: string | null;
  saved?: boolean;
  requiresAuth?: boolean;
  requiresOnboarding?: boolean;
  blockedRole?: boolean;
};

function mapSavedJob(row: SavedJobRow): SavedJob {
  const jobId = row.job_external_id || row.job_id || row.id;
  const fallbackJob = jobs.find((job) => job.id === jobId);
  const job = row.jobs ?? {};
  const company = job.company_name || job.company || fallbackJob?.company || "Company";

  return {
    id: row.id,
    jobId,
    title: job.title || fallbackJob?.title || "Job",
    company,
    companyLogo: job.company_logo || fallbackJob?.companyLogo || company.slice(0, 1).toUpperCase(),
    salary: job.salary_range || (fallbackJob ? formatSalary(fallbackJob) : ""),
    location: job.location || fallbackJob?.location || "",
    savedAt: relativeDate(row.created_at || new Date().toISOString()),
  };
}

export function useSavedJobs() {
  const { user, isAuthenticated, role, onboardingComplete } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const useSupabase = Boolean(isAuthenticated && user?.id && role === "candidate");

  const savedIds = useMemo(
    () => new Set(savedJobs.map((job) => job.jobId)),
    [savedJobs]
  );

  const refetchSavedJobs = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !user?.id || role !== "candidate") {
      setSavedJobs([]);
      setLoaded(true);
      return false;
    }

    const loadAttempts = [
      () =>
        supabase
          .from("saved_jobs")
          .select("id,job_id,job_external_id,created_at,jobs(id,title,company,company_name,company_logo,location,salary_range)")
          .or(`candidate_id.eq.${user.id},user_id.eq.${user.id}`)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("saved_jobs")
          .select("id,job_id,created_at,jobs(id,title,company,company_logo,location,salary_range)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("saved_jobs")
          .select("id,job_id,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("saved_jobs")
          .select("id,job_id")
          .eq("user_id", user.id),
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
      logOptionalSupabaseLoadFailure("[SAVED_JOBS] Load failed", lastError);
      setSavedJobs([]);
      return false;
    } else {
      setSavedJobs(((data ?? []) as SavedJobRow[]).map(mapSavedJob));
    }
    setLoaded(true);
    return true;
  }, [role, user]);

  useEffect(() => {
    if (!useSupabase) {
      const timer = window.setTimeout(() => {
        setSavedJobs([]);
        setLoaded(true);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      void refetchSavedJobs();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refetchSavedJobs, useSupabase]);

  const isSaved = useCallback((jobId: string) => savedIds.has(jobId), [savedIds]);

  const toggleSavedJob = useCallback(
    async (jobId: string): Promise<SavedJobActionResult> => {
      const supabase = getSupabaseClient();
      if (!isAuthenticated || !user?.id) {
        return { error: "Sign in to save jobs.", requiresAuth: true };
      }

      if (role !== "candidate") {
        return { error: "Only candidates can save jobs.", blockedRole: true };
      }

      if (!onboardingComplete) {
        return {
          error: "Complete your candidate onboarding to save jobs.",
          requiresOnboarding: true,
        };
      }

      if (!supabase) {
        return { error: "Saved jobs are unavailable right now." };
      }

      setSavingIds((current) => new Set(current).add(jobId));
      const existing = savedJobs.find((job) => job.jobId === jobId);
      if (existing) {
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("id", existing.id);
        setSavingIds((current) => {
          const next = new Set(current);
          next.delete(jobId);
          return next;
        });
        if (error) return { error: error.message };
        setSavedJobs((current) => current.filter((job) => job.id !== existing.id));
        return { error: null, saved: false };
      }

      const payload: Record<string, string> = {
        candidate_id: user.id,
        user_id: user.id,
        ...(isUuid(jobId) ? { job_id: jobId } : { job_external_id: jobId }),
      };
      const primaryInsert = await supabase
        .from("saved_jobs")
        .insert(payload)
        .select("id,job_id,job_external_id,created_at,jobs(id,title,company,company_name,company_logo,location,salary_range)")
        .single();
      let data: unknown = primaryInsert.data;
      let error = primaryInsert.error;
      if (error && isSchemaQueryError(error)) {
        const fallback = await supabase
          .from("saved_jobs")
          .insert(payload)
          .select("id,job_id,created_at")
          .single();
        data = fallback.data;
        error = fallback.error;
      }
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(jobId);
        return next;
      });

      if (error) {
        if (error.code !== "23505") return { error: error.message };
        const refreshed = await refetchSavedJobs();
        if (!refreshed) {
          return {
            error: "This job is already saved, but we could not refresh your saved jobs.",
          };
        }
        return { error: null, saved: true };
      }
      if (!data) {
        return {
          error: "We saved the job, but could not read it back from Supabase.",
        };
      }

      const mapped = mapSavedJob(data as SavedJobRow);
      setSavedJobs((current) =>
        current.some((job) => job.jobId === jobId) ? current : [mapped, ...current]
      );
      return { error: null, saved: true };
    },
    [isAuthenticated, onboardingComplete, refetchSavedJobs, role, savedJobs, user]
  );

  return {
    savedJobs,
    loaded,
    savingIds,
    isSaved,
    toggleSavedJob,
    refetchSavedJobs,
  };
}
