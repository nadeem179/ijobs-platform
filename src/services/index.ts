/**
 * Service Registry
 *
 * Central export point for all services.
 * Import from here instead of individual service files.
 *
 * When switching to real backend:
 * 1. Update the implementation imports below
 * 2. The consumer code stays unchanged
 */

export { authService } from "./impl/auth.service";
export { jobsService } from "./impl/jobs.service";
export { profileService } from "./impl/profile.service";
export { recruiterService } from "./impl/recruiter.service";
export { uploadService } from "./impl/upload.service";

// Types re-exported for convenience
export type {
  AuthService,
  JobsService,
  ProfileService,
  RecruiterService,
  UploadService,
  Session,
  JobListItem,
  JobDetail,
  UserProfile,
  ApplicationItem,
  SavedJobItem,
  RecruiterDashboardStats,
  RecruiterJobItem,
  RecruiterCandidateItem,
  UploadResult,
} from "./types/service-types";
