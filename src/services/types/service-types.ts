import type { ScreeningQuestion } from "@/types/screening";
import type { ScreeningAnswer } from "@/types/screening";

/**
 * Service Layer Types
 *
 * These define the contract for every service in the application.
 * Each service encapsulates a domain, with mock implementations
 * ready to be swapped for real API calls.
 */

// ───── Generic API Result ─────

export type ApiResult<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: ApiError;
};

export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: unknown;
}

export type AsyncResult<T> = Promise<ApiResult<T>>;

// ───── Service Interfaces ─────

export interface AuthService {
  signIn(email: string, password: string): AsyncResult<Session>;
  signUp(email: string, password: string, name: string): AsyncResult<Session>;
  signOut(): AsyncResult<void>;
  getSession(): AsyncResult<Session | null>;
  onAuthStateChange(callback: (session: Session | null) => void): () => void;
}

export interface JobsService {
  list(filters?: Record<string, unknown>): AsyncResult<JobListItem[]>;
  getById(id: string): AsyncResult<JobDetail>;
  getRelated(jobId: string): AsyncResult<JobListItem[]>;
  search(query: string): AsyncResult<JobListItem[]>;
}

export interface ProfileService {
  get(): AsyncResult<UserProfile>;
  update(data: Partial<UserProfile>): AsyncResult<UserProfile>;
  getApplications(): AsyncResult<ApplicationItem[]>;
  getSavedJobs(): AsyncResult<SavedJobItem[]>;
  saveJob(jobId: string): AsyncResult<void>;
  unsaveJob(jobId: string): AsyncResult<void>;
  apply(jobId: string, data: ApplyData): AsyncResult<void>;
}

export interface RecruiterService {
  getStats(): AsyncResult<RecruiterDashboardStats>;
  getJobs(): AsyncResult<RecruiterJobItem[]>;
  getJob(jobId: string): AsyncResult<RecruiterJobItem>;
  getCandidates(jobId?: string): AsyncResult<RecruiterCandidateItem[]>;
  postJob(data: PostJobData): AsyncResult<void>;
  updateJobStatus(jobId: string, status: string): AsyncResult<void>;
  updateApplicationStatus(applicationId: string, status: "shortlisted" | "rejected" | "hired"): AsyncResult<void>;
  updateApplicationEvent(applicationId: string, event: "viewed" | "resume_downloaded"): AsyncResult<void>;
}

export interface UploadService {
  uploadResume(file: File): AsyncResult<UploadResult>;
  uploadAvatar(file: File): AsyncResult<UploadResult>;
  uploadCompanyLogo(file: File): AsyncResult<UploadResult>;
  uploadPortfolioImage(file: File, index?: number): AsyncResult<UploadResult>;
  delete(url: string): AsyncResult<void>;
}

// ───── Domain Types ─────

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    initials: string;
  };
  accessToken?: string;
  expiresAt?: number;
}

export interface JobListItem {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  locationType: string;
  jobType: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  skills: string[];
  experienceLevel: string;
  postedAt: string;
  verifiedRecruiter: boolean;
  matchScore?: number;
  screeningQuestions?: ScreeningQuestion[];
}

export interface JobDetail extends JobListItem {
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  aboutCompany: string;
  companySize?: string;
  companyIndustry?: string;
  applicationDeadline?: string;
  recruiterId?: string;
}

export interface UserProfile {
  name: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  location: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  portfolio: PortfolioItem[];
  certifications: Certification[];
  links: SocialLink[];
  resumeUrl?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  projectUrl?: string;
  technologies: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  label: string;
}

export interface ApplicationItem {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status:
    | "applied"
    | "viewed"
    | "resume_downloaded"
    | "shortlisted"
    | "rejected"
    | "interviewing"
    | "hired";
  appliedAt: string;
  updatedAt: string;
  notes?: string;
}

export interface SavedJobItem {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  location: string;
  salaryRange: string;
  savedAt: string;
  matchScore?: number;
}

export interface ApplyData {
  coverLetter?: string;
  resumeUrl?: string;
  answers?: Record<string, string>;
}

export interface RecruiterDashboardStats {
  activeJobs: number;
  totalApplicants: number;
  interviewsScheduled: number;
  offersExtended: number;
  hireRate: number;
}

export interface RecruiterJobItem {
  id: string;
  title: string;
  status: "active" | "draft" | "inactive" | "paused" | "closed" | "filled";
  applicants: number;
  newApplicants: number;
  postedAt: string;
  views: number;
  location?: string;
  locationType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  skills?: string[];
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  preferredQualifications?: string[];
  benefits?: string[];
  jobType?: string;
  experienceLevel?: string;
}

export interface RecruiterCandidateItem {
  id: string;
  jobId: string;
  candidateId: string;
  name: string;
  email: string;
  avatarUrl?: string;
  resumeUrl?: string;
  headline?: string;
  bio?: string;
  currentRole?: string;
  resumeText?: string;
  experienceLevel?: string;
  experienceText?: string;
  projectText?: string;
  preferredLocations?: string[];
  workModePreference?: string[] | string;
  jobTypePreference?: string[] | string;
  location?: string;
  appliedFor: string;
  appliedAt: string;
  appliedAtTimestamp?: string;
  lastActivityAt?: string;
  status:
    | "applied"
    | "viewed"
    | "resume_downloaded"
    | "shortlisted"
    | "rejected"
    | "interviewing"
    | "hired";
  matchScore: number;
  skills: string[];
  experience: string;
  viewedAt?: string | null;
  resumeDownloadedAt?: string | null;
  shortlistedAt?: string | null;
  rejectedAt?: string | null;
  hiredAt?: string | null;
  screeningAnswers?: ScreeningAnswer[];
}

export interface PostJobData {
  title: string;
  company: string;
  companyLogo?: string;
  companyDescription?: string;
  companySize?: string;
  companyIndustry?: string;
  description: string;
  location: string;
  jobType: string;
  status: "active" | "draft" | "inactive" | "closed";
  salaryMin: number;
  salaryMax: number;
  currency: string;
  salaryPeriod?: "year" | "hour";
  salaryVerified?: boolean;
  skills: string[];
  experience: string;
  screeningQuestions?: ScreeningQuestion[];
  locationType?: string;
  experienceLevel?: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications?: string[];
  benefits: string[];
  applicationDeadline?: string;
}

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}
