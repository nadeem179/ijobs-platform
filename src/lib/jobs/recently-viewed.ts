"use client";

export const RECENT_VIEWED_JOBS_STORAGE_KEY = "ijobs.recent-viewed-jobs";
const MAX_RECENT_VIEWED_JOBS = 5;

export interface RecentlyViewedJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  locationType: string;
  salary: string;
  viewedAt: string;
}

export function readRecentlyViewedJobs(): RecentlyViewedJob[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(RECENT_VIEWED_JOBS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentlyViewedJob[]) : [];
  } catch {
    return [];
  }
}

export function storeRecentlyViewedJob(job: Omit<RecentlyViewedJob, "viewedAt">) {
  if (typeof window === "undefined") return;

  const nextJob: RecentlyViewedJob = {
    ...job,
    viewedAt: new Date().toISOString(),
  };

  const deduped = readRecentlyViewedJobs().filter((item) => item.id !== job.id);
  const next = [nextJob, ...deduped].slice(0, MAX_RECENT_VIEWED_JOBS);
  window.localStorage.setItem(
    RECENT_VIEWED_JOBS_STORAGE_KEY,
    JSON.stringify(next)
  );
}
