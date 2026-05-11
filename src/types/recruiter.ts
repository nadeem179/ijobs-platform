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
  status: "active" | "draft" | "paused";
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
}

export interface RecruiterStats {
  activeListings: number;
  totalApplicants: number;
  interviewsScheduled: number;
  profileViews: number;
}