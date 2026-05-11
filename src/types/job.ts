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
}

export interface FilterState {
  query: string;
  location: string;
  experienceLevel: string[];
  salaryMin: number;
  salaryMax: number;
  remoteOnly: boolean;
  verifiedOnly: boolean;
  locationType: string[];
}

export const EXPERIENCE_ORDER: Record<string, number> = {
  Entry: 0,
  Mid: 1,
  Senior: 2,
  Lead: 3,
  Staff: 4,
};