import type { ScreeningQuestion } from "@/types/screening";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
  companySize: string;
  companyIndustry: string;
  location: string;
  locationType: "Remote" | "Hybrid" | "On-site";
  jobType: "Full-time" | "Contract" | "Part-time" | "Internship";
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: "year" | "hour";
  experienceLevel: "Entry" | "Mid" | "Senior" | "Lead" | "Staff";
  skills: string[];
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  benefits: string[];
  postedAt: string;
  verifiedRecruiter: boolean;
  activeHiring: boolean;
  responseRate: number;
  saved: boolean;
  featured: boolean;
  status?: "active" | "inactive" | "paused" | "closed" | "filled";
  screeningQuestions?: ScreeningQuestion[];
}

export interface FilterState {
  query: string;
  designation: string;
  location: string;
  jobType: string[];
  experienceLevel: string[];
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  freshness: "any" | "24h" | "3d" | "7d" | "14d" | "30d";
  remoteOnly: boolean;
  verifiedOnly: boolean;
  easyApply: boolean;
  activeOnly: boolean;
  locationType: string[];
  sort: "relevant" | "recent" | "salary";
}

export const EXPERIENCE_ORDER: Record<string, number> = {
  Entry: 0,
  Mid: 1,
  Senior: 2,
  Lead: 3,
  Staff: 4,
};
