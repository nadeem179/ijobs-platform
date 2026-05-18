/**
 * Mock API Service Layer
 *
 * Simulates async backend calls with realistic delays.
 * All functions return Promises and accept/return typed data.
 *
 * To replace with real backend:
 * 1. Swap the import source for each data function
 * 2. Replace setTimeout with real fetch calls
 * 3. The component interfaces stay unchanged
 */

import { Job, FilterState, Profile, Application, SavedJob } from "@/types";
import { jobs as jobsData } from "@/data/jobs";
import {
  mockProfile,
  mockApplications,
  mockSavedJobs,
} from "@/data/profile";
import {
  mockRecruiterJobs,
  mockCandidates,
  mockStats,
} from "@/data/recruiter";
import { RecruiterJob, RecruiterCandidate, RecruiterStats } from "@/types/recruiter";

// ───── Helpers ─────

const delay = (ms = 600): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function filterJobs(jobs: Job[], filters: FilterState): Job[] {
  return jobs.filter((job) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      if (
        !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q) &&
        !job.skills.some((s) => s.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    if (filters.experienceLevel.length > 0 && !filters.experienceLevel.includes(job.experienceLevel)) {
      return false;
    }
    if (filters.salaryMin > 0 && job.salaryMax < filters.salaryMin) return false;
    if (filters.salaryMax > 0 && job.salaryMin > filters.salaryMax) return false;
    if (filters.remoteOnly && job.locationType !== "Remote") return false;
    if (filters.verifiedOnly && !job.verifiedRecruiter) return false;
    if (filters.locationType.length > 0 && !filters.locationType.includes(job.locationType)) {
      return false;
    }
    return true;
  });
}

// ───── Jobs ─────

export async function getJobs(filters?: FilterState): Promise<Job[]> {
  await delay();
  if (filters) return filterJobs([...jobsData], filters);
  return [...jobsData];
}

export async function getJobById(id: string): Promise<Job | null> {
  await delay();
  return jobsData.find((j) => j.id === id) ?? null;
}

export async function getRelatedJobs(jobId: string): Promise<Job[]> {
  await delay(400);
  const job = jobsData.find((j) => j.id === jobId);
  if (!job) return [];
  return jobsData
    .filter(
      (j) =>
        j.id !== jobId &&
        (j.skills.some((s) => job.skills.includes(s)) ||
          j.experienceLevel === job.experienceLevel)
    )
    .slice(0, 3);
}

// ───── Profile ─────

export async function getUserProfile(): Promise<Profile> {
  await delay(500);
  return { ...mockProfile };
}

export async function getApplications(): Promise<Application[]> {
  await delay(400);
  return [...mockApplications];
}

export async function getSavedJobs(): Promise<SavedJob[]> {
  await delay(300);
  return [...mockSavedJobs];
}

// ───── Recruiter ─────

export async function getRecruiterStats(): Promise<RecruiterStats> {
  await delay(400);
  return { ...mockStats };
}

export async function getRecruiterJobs(): Promise<RecruiterJob[]> {
  await delay(500);
  return [...mockRecruiterJobs];
}

export async function getRecruiterCandidates(): Promise<RecruiterCandidate[]> {
  await delay(500);
  return [...mockCandidates];
}

