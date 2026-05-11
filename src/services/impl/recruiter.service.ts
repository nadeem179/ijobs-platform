/**
 * Recruiter Service Implementation (Mock)
 *
 * Currently wraps the existing data layer with the new service interface.
 * Replace with real API calls when backend is ready.
 */

import type { RecruiterService, RecruiterDashboardStats, RecruiterJobItem, RecruiterCandidateItem, PostJobData } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { wrapRequest } from "@/lib/errors";
import { mockRecruiterJobs, mockCandidates, mockStats } from "@/data/recruiter";

const delay = (ms = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function toStats(raw: any): RecruiterDashboardStats {
  return {
    activeJobs: raw.activeJobs ?? 0,
    totalApplicants: raw.totalApplicants ?? 0,
    interviewsScheduled: raw.interviewsScheduled ?? 0,
    offersExtended: raw.offersExtended ?? 0,
    hireRate: raw.hireRate ?? 0,
  };
}

function toRecruiterJob(job: any): RecruiterJobItem {
  return {
    id: job.id,
    title: job.title,
    status: job.status || "active",
    applicants: job.applicants ?? 0,
    newApplicants: job.newApplicants ?? 0,
    postedAt: job.postedAt || "",
    views: job.views ?? 0,
  };
}

function toCandidate(candidate: any): RecruiterCandidateItem {
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email || "",
    avatarUrl: candidate.avatarUrl,
    appliedFor: candidate.appliedFor || "",
    appliedAt: candidate.appliedAt || "",
    status: candidate.status || "new",
    matchScore: candidate.matchScore ?? 0,
    skills: candidate.skills || [],
    experience: candidate.experience || "",
  };
}

export const recruiterService: RecruiterService = {
  async getStats(): AsyncResult<RecruiterDashboardStats> {
    return wrapRequest(async () => {
      await delay(400);
      return toStats(mockStats);
    });
  },

  async getJobs(): AsyncResult<RecruiterJobItem[]> {
    return wrapRequest(async () => {
      await delay(500);
      return mockRecruiterJobs.map(toRecruiterJob);
    });
  },

  async getCandidates(): AsyncResult<RecruiterCandidateItem[]> {
    return wrapRequest(async () => {
      await delay(500);
      return mockCandidates.map(toCandidate);
    });
  },

  async postJob(): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(700);
    });
  },

  async updateJobStatus(): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(300);
    });
  },
};
