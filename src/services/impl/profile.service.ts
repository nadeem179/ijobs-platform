/**
 * Profile Service Implementation (Mock)
 *
 * Currently wraps the existing data layer with the new service interface.
 * Replace with real API calls when backend is ready.
 */

import type { ProfileService, UserProfile, ApplicationItem, SavedJobItem, ApplyData } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { wrapRequest } from "@/lib/errors";
import { mockProfile, mockApplications, mockSavedJobs } from "@/data/profile";

const delay = (ms = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function toUserProfile(profile: any): UserProfile {
  return {
    name: profile.name || "",
    headline: profile.headline || "",
    bio: profile.about || "",
    avatarUrl: undefined,
    location: profile.location || "",
    email: profile.email || "",
    phone: profile.phone,
    skills: profile.skills || [],
    experience: (profile.experience || []).map((exp: any) => ({
      id: exp.id,
      title: exp.role,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate || undefined,
      current: !exp.endDate,
      description: exp.description || "",
    })),
    education: (profile.education || []).map((edu: any) => ({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      startDate: String(edu.startYear || ""),
      endDate: edu.endYear ? String(edu.endYear) : undefined,
      gpa: undefined,
    })),
    portfolio: (profile.portfolio || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      projectUrl: item.projectUrl,
      technologies: item.tools || [],
    })),
    certifications: (profile.certifications || []).map((cert: any) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer,
      date: String(cert.year || ""),
      url: cert.credentialUrl,
    })),
    links: (profile.links || []).map((link: any) => ({
      id: link.id,
      platform: link.icon || link.label,
      url: link.url,
      label: link.label,
    })),
    resumeUrl: profile.resumeFile,
  };
}

function toApplicationItem(app: any): ApplicationItem {
  return {
    id: app.id,
    jobId: app.jobId,
    jobTitle: app.jobTitle,
    company: app.company,
    status: app.status === "hired" ? "offered" : app.status,
    appliedAt: app.appliedAt,
    updatedAt: app.updatedAt || app.appliedAt,
    notes: undefined,
  };
}

function toSavedJobItem(sj: any): SavedJobItem {
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
      return mockApplications.map(toApplicationItem);
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

  async apply(): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(800);
    });
  },
};
