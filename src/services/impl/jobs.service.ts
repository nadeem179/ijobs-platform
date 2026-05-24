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
import { normalizeScreeningQuestions } from "@/types/screening";

// ───── Helpers ─────

const delay = (ms = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function getLocationSearchText(job: Job) {
  const extra = job as Job & {
    location_type?: string;
    workArrangement?: string;
    work_arrangement?: string;
  };

  return [
    job.location,
    job.locationType,
    extra.location_type,
    extra.workArrangement,
    extra.work_arrangement,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

type JobWithOptionalMetadata = Job & {
  matchScore?: number;
  applicationDeadline?: string;
  recruiterId?: string;
};

function applyFilters(jobs: Job[], filters: Record<string, unknown>): Job[] {
  const filterState: FilterState = {
    query: (filters.query as string) ?? "",
    designation: (filters.designation as string) ?? "",
    location: (filters.location as string) ?? "",
    jobType: (filters.jobType as string[]) ?? [],
    experienceLevel: (filters.experienceLevel as string[]) ?? [],
    skills: (filters.skills as string[]) ?? [],
    salaryMin: (filters.salaryMin as number) ?? 0,
    salaryMax: (filters.salaryMax as number) ?? 0,
    freshness: (filters.freshness as FilterState["freshness"]) ?? "any",
    remoteOnly: (filters.remoteOnly as boolean) ?? false,
    verifiedOnly: (filters.verifiedOnly as boolean) ?? false,
    easyApply: (filters.easyApply as boolean) ?? false,
    activeOnly: (filters.activeOnly as boolean) ?? true,
    locationType: (filters.locationType as string[]) ?? [],
    sort: (filters.sort as FilterState["sort"]) ?? "relevant",
  };

  const freshnessLimit =
    filterState.freshness === "24h"
      ? 1
      : filterState.freshness === "7d"
        ? 7
        : filterState.freshness === "14d"
          ? 14
          : null;

  return jobs.filter((job) => {
    if (filterState.activeOnly && !job.activeHiring) return false;

    if (filterState.query) {
      const q = filterState.query.toLowerCase();
      if (
        !job.title.toLowerCase().includes(q) &&
        !job.company.toLowerCase().includes(q) &&
        !job.skills.some((s: string) => s.toLowerCase().includes(q)) &&
        !getLocationSearchText(job).includes(q)
      ) {
        return false;
      }
    }
    if (filterState.location && !getLocationSearchText(job).includes(filterState.location.toLowerCase())) {
      return false;
    }
    if (filterState.experienceLevel.length > 0 && !filterState.experienceLevel.includes(job.experienceLevel)) {
      return false;
    }
    if (filterState.jobType.length > 0 && !filterState.jobType.includes(job.jobType)) {
      return false;
    }
    if (filterState.skills.length > 0) {
      const selectedSkills = filterState.skills.map((skill) => skill.toLowerCase());
      const jobSkills = job.skills.map((skill) => skill.toLowerCase());
      if (!selectedSkills.every((skill) => jobSkills.some((jobSkill) => jobSkill.includes(skill)))) {
        return false;
      }
    }
    if (filterState.salaryMin > 0 && job.salaryMax < filterState.salaryMin) return false;
    if (filterState.salaryMax > 0 && job.salaryMin > filterState.salaryMax) return false;
    if (filterState.remoteOnly && job.locationType !== "Remote") return false;
    if (filterState.verifiedOnly && !job.verifiedRecruiter) return false;
    if (filterState.locationType.length > 0 && !filterState.locationType.includes(job.locationType)) {
      return false;
    }
    if (freshnessLimit !== null) {
      const normalized = job.postedAt.toLowerCase();
      const amount = Number(normalized.match(/\d+/)?.[0] ?? 1);
      const ageDays = normalized.includes("week")
        ? amount * 7
        : normalized.includes("month")
          ? amount * 30
          : normalized.includes("day")
            ? amount
            : 0;
      if (ageDays > freshnessLimit) return false;
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
    jobType: job.jobType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.salaryCurrency,
    skills: job.skills,
    experienceLevel: job.experienceLevel,
    postedAt: job.postedAt,
    verifiedRecruiter: job.verifiedRecruiter,
    matchScore: (job as JobWithOptionalMetadata).matchScore,
    screeningQuestions: normalizeScreeningQuestions(job.screeningQuestions),
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
    applicationDeadline: (job as JobWithOptionalMetadata).applicationDeadline,
    recruiterId: (job as JobWithOptionalMetadata).recruiterId,
  };
}

// ───── Service Implementation ─────

export const jobsService: JobsService = {
  async list(filters?: Record<string, unknown>): AsyncResult<JobListItem[]> {
    return wrapRequest(async () => {
      await delay(600);
      const results = applyFilters([...jobsData], filters ?? { activeOnly: true });
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
            getLocationSearchText(job).includes(q) ||
            job.skills.some((s: string) => s.toLowerCase().includes(q))
        )
        .map(toJobListItem);
    });
  },
};
