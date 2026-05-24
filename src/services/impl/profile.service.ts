/**
 * Profile Service Implementation (Mock)
 *
 * Currently wraps the existing data layer with the new service interface.
 * Replace with real API calls when backend is ready.
 */

import type { ProfileService, UserProfile, ApplicationItem, SavedJobItem, ApplyData } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { ServiceError, wrapRequest } from "@/lib/errors";
import {
  FREE_CANDIDATE_DAILY_APPLICATION_LIMIT,
  checkDailyApplicationLimit,
} from "@/lib/application-limits";
import { mockProfile, mockApplications, mockSavedJobs } from "@/data/profile";
import { jobs } from "@/data/jobs";
import type {
  Application,
  Certification,
  Education,
  Experience,
  PortfolioItem,
  Profile,
  SavedJob,
  SocialLink,
} from "@/types/profile";

const delay = (ms = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const candidateApplications: ApplicationItem[] = mockApplications.map(toApplicationItem);

function toUserProfile(profile: Profile): UserProfile {
  return {
    name: profile.name || "",
    headline: profile.headline || "",
    bio: profile.about || "",
    avatarUrl: undefined,
    location: profile.location || "",
    email: profile.email || "",
    phone: profile.phone,
    skills: profile.skills || [],
    experience: (profile.experience || []).map((exp: Experience) => ({
      id: exp.id,
      title: exp.role,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate || undefined,
      current: !exp.endDate,
      description: exp.description || "",
    })),
    education: (profile.education || []).map((edu: Education) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: String(edu.startYear || ""),
      endDate: edu.endYear ? String(edu.endYear) : undefined,
      gpa: undefined,
    })),
    portfolio: (profile.portfolio || []).map((item: PortfolioItem) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      projectUrl: item.projectUrl,
      technologies: item.tools || [],
    })),
    certifications: (profile.certifications || []).map((cert: Certification) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      date: String(cert.year || ""),
      url: cert.credentialUrl,
    })),
    links: (profile.links || []).map((link: SocialLink) => ({
      id: link.id,
      platform: link.icon || link.label,
      url: link.url,
      label: link.label,
    })),
    resumeUrl: profile.resumeFile,
  };
}

function toApplicationItem(app: Application): ApplicationItem {
  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    company: app.company,
    status: app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt || app.appliedAt,
    notes: undefined,
  };
}

function toSavedJobItem(sj: SavedJob): SavedJobItem {
  return {
    id: sj.id,
    jobId: sj.jobId,
    jobTitle: sj.title,
    company: sj.company,
    location: sj.location || "",
    salaryRange: sj.salary || "",
    savedAt: sj.savedAt,
    matchScore: undefined,
  };
}

export const profileService: ProfileService = {
  async get(): AsyncResult<UserProfile> {
    return wrapRequest(async () => {
      await delay(500);
      return toUserProfile(mockProfile);
    });
  },

  async update(_data: Partial<UserProfile>): AsyncResult<UserProfile> {
    return wrapRequest(async () => {
      await delay(600);
      return toUserProfile(mockProfile);
    });
  },

  async getApplications(): AsyncResult<ApplicationItem[]> {
    return wrapRequest(async () => {
      await delay(400);
      return [...candidateApplications];
    });
  },

  async getSavedJobs(): AsyncResult<SavedJobItem[]> {
    return wrapRequest(async () => {
      await delay(300);
      return mockSavedJobs.map(toSavedJobItem);
    });
  },

  async saveJob(): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(200);
    });
  },

  async unsaveJob(): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(200);
    });
  },

  async apply(jobId: string, _data: ApplyData): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(800);

      if (candidateApplications.some((application) => application.jobId === jobId)) {
        throw new ServiceError({
          code: "DUPLICATE_APPLICATION",
          message: "You have already applied to this job.",
          status: 409,
        });
      }

      // Candidate application limits are enforced here so all apply entry points share the same rule.
      const candidatePlan = "free";
      const limit = checkDailyApplicationLimit(candidateApplications, candidatePlan);

      if (!limit.allowed) {
        throw new ServiceError({
          code: "APPLICATION_LIMIT_REACHED",
          message: `Free candidates can apply to ${FREE_CANDIDATE_DAILY_APPLICATION_LIMIT} jobs per day. Upgrade limits will be added here for premium candidates.`,
          status: 429,
          details: limit,
        });
      }

      const job = jobs.find((item) => item.id === jobId);

      const appliedAt = new Date().toISOString();

      candidateApplications.push({
        id: `app-${Date.now()}`,
        jobId,
        jobTitle: job?.title ?? "Job",
        company: job?.company ?? "Company",
        status: "applied",
        appliedAt,
        updatedAt: appliedAt,
      });
    });
  },
};
