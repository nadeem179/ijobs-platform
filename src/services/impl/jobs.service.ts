/**
 * Jobs Service Implementation (Mock)
 *
 * Currently wraps the existing data layer with the new service interface.
 * Replace with real API calls when backend is ready.
 */

import type { JobsService, JobListItem, JobDetail } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { wrapRequest } from "@/lib/errors";
import { jobs as jobsData } from "@/data/jobs";
import type { Job, FilterState } from "@/types";

// ───── Helpers ─────

const delay = (ms = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function applyFilters(jobs: Job[], filters: Record<string, unknown>): Job[] {
  const filterState: FilterState = {
    query: (filters.query as string) ?? "",
    location: (filters.location as string) ?? "",
    experienceLevel: (filters.experienceLevel as string[]) ?? [],
    salaryMin: (filters.salaryMin as number) ?? 0,
    salaryMax: (filters.salaryMax as number) ?? 0,
    remoteOnly: (filters.remoteOnly as boolean) ?? false,
    verifiedOnly: (filters.verifiedOnly as boolean) ?? false,
    locationType: (filters.locationType as string[]) ?? [],
  };

  return jobs.filter((job) => {
    if (filterState.query) {
      const q = filterState.query.toLowerCase();
      if (
        !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q) &&
        !job.skills.some((s: string) => s.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    if (filterState.location && !job.location.toLowerCase().includes(filterState.location.toLowerCase())) {
      return false;
    }
    if (filterState.experienceLevel.length > 0 && !filterState.experienceLevel.includes(job.experienceLevel)) {
      return false;
    }
    if (filterState.salaryMin > 0 && job.salaryMax < filterState.salaryMin) return false;
    if (filterState.salaryMax > 0 && job.salaryMin > filterState.salaryMax) return false;
    if (filterState.remoteOnly && job.locationType !== "Remote") return false;
    if (filterState.verifiedOnly && !job.verifiedRecruiter) return false;
    if (filterState.locationType.length > 0 && !filterState.locationType.includes(job.locationType)) {
      return false;
    }
    return true;
  });
}

function toJobListItem(job: Job): JobListItem {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyLogo: job.companyLogo || undefined,
    location: job.location,
    locationType: job.locationType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.salaryCurrency,
    skills: job.skills,
    experienceLevel: job.experienceLevel,
    postedAt: job.postedAt,
    verifiedRecruiter: job.verifiedRecruiter,
    matchScore: (job as any).matchScore,
  };
}

function toJobDetail(job: Job): JobDetail {
  return {
    ...toJobListItem(job),
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    benefits: job.benefits,
    aboutCompany: job.companyDescription,
    companySize: job.companySize,
    companyIndustry: job.companyIndustry,
    applicationDeadline: (job as any).applicationDeadline,
    recruiterId: (job as any).recruiterId,
  };
}

// ───── Service Implementation ─────

export const jobsService: JobsService = {
  async list(filters?: Record<string, unknown>): AsyncResult<JobListItem[]> {
    return wrapRequest(async () => {
      await delay(600);
      const results = filters ? applyFilters([...jobsData], filters) : [...jobsData];
      return results.map(toJobListItem);
    });
  },

  async getById(id: string): AsyncResult<JobDetail> {
    return wrapRequest(async () => {
      await delay(400);
      const job = jobsData.find((j: Job) => j.id === id);
      if (!job) throw new Error(`Job with id "${id}" not found.`);
      return toJobDetail(job);
    });
  },

  async getRelated(jobId: string): AsyncResult<JobListItem[]> {
    return wrapRequest(async () => {
      await delay(400);
      const job = jobsData.find((j: Job) => j.id === jobId);
      if (!job) return [];
      return jobsData
        .filter(
          (j: Job) =>
            j.id !== jobId &&
            (j.skills.some((s: string) => job.skills.includes(s)) ||
              j.experienceLevel === job.experienceLevel)
        )
        .slice(0, 3)
        .map(toJobListItem);
    });
  },

  async search(query: string): AsyncResult<JobListItem[]> {
    return wrapRequest(async () => {
      await delay(500);
      const q = query.toLowerCase();
      return jobsData
        .filter(
          (job: Job) =>
            job.title.toLowerCase().includes(q) ||
            job.company.toLowerCase().includes(q) ||
            job.skills.some((s: string) => s.toLowerCase().includes(q))
        )
        .map(toJobListItem);
    });
  },
};
