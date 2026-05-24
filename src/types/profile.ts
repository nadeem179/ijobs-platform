export interface Profile {
  id: string;
  name: string;
  headline: string;
  location: string;
  email: string;
  phone?: string;
  phone_country?: string;
  phone_country_code?: string;
  phone_number?: string;
  company_logo_url?: string;
  avatarInitials: string;
  avatarUrl?: string;
  experienceLevel: string;
  about: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  portfolio: PortfolioItem[];
  certifications: Certification[];
  links: SocialLink[];
  resumeFile?: string;
  totalExperience?: string;
  totalExperienceYears?: number;
  totalExperienceMonths?: number;
  currentTitle?: string;
  currentCompany?: string;
  noticePeriod?: string;
  currentSalary?: string;
  currentSalaryCurrency?: string;
  currentSalaryAmount?: string;
  expectedSalary?: string;
  expectedSalaryCurrency?: string;
  expectedSalaryAmount?: string;
  preferredLocations?: string[];
  jobTypePreference?: string;
  workModePreference?: string;
  tools?: string[];
  languages?: string[];
  industry?: string;
  functionalArea?: string;
  verifiedEmail: boolean;
  profileStrength: number; // 0–100
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  employmentType?: string;
  location?: string;
  startDate: string;
  endDate: string | null; // null = current
  currentlyWorking?: boolean;
  description: string;
  achievements?: string;
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
  grade?: string;
  description?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  role?: string;
  description: string;
  tools: string[];
  imageUrl?: string;
  projectUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
  issueDate?: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: "linkedin" | "github" | "dribbble" | "website";
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  companyLogo: string;
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
  createdAt: string;
  viewedAt?: string | null;
  resumeDownloadedAt?: string | null;
  contactedAt?: string | null;
  shortlistedAt?: string | null;
  rejectedAt?: string | null;
  hiredAt?: string | null;
  salary: string;
  location: string;
  locationType?: string;
  companyDescription?: string;
  companySize?: string;
  companyIndustry?: string;
  recruiterId?: string | null;
}

export interface SavedJob {
  id: string;
  jobId: string;
  title: string;
  company: string;
  companyLogo: string;
  salary: string;
  location: string;
  savedAt: string;
}
