export interface RecruiterJob {
  id: string;
  title: string;
  company: string;
  location: string;
  locationType: "Remote" | "On-site" | "Hybrid";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: "year" | "hour";
  experienceLevel: string;
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  status: "active" | "inactive" | "paused" | "closed" | "filled";
  applicants: number;
  newApplicants: number;
  postedAt: string;
  featured: boolean;
}

export interface RecruiterCandidate {
  id: string;
  name: string;
  headline: string;
  avatarInitials: string;
  location: string;
  experienceLevel: string;
  skills: string[];
  experience: number;
  match: number;
  appliedAt: string;
  profileStrength: number;
  status: "new" | "reviewed" | "shortlisted" | "rejected";
  viewedAt?: string | null;
  resumeDownloadedAt?: string | null;
  shortlistedAt?: string | null;
  rejectedAt?: string | null;
  hiredAt?: string | null;
}

export interface RecruiterStats {
  activeListings: number;
  totalApplicants: number;
  interviewsScheduled: number;
  profileViews: number;
}
