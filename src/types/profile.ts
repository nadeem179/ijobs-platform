export interface Profile {
  id: string;
  name: string;
  headline: string;
  location: string;
  email: string;
  phone?: string;
  avatarInitials: string;
  experienceLevel: string;
  about: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  portfolio: PortfolioItem[];
  certifications: Certification[];
  links: SocialLink[];
  resumeFile?: string;
  verifiedEmail: boolean;
  profileStrength: number; // 0–100
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null; // null = current
  description: string;
  skills: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number | null;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  tools: string[];
  imageUrl?: string;
  projectUrl?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
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
  status: "applied" | "reviewing" | "interview" | "rejected" | "hired";
  appliedAt: string;
  updatedAt: string;
  salary: string;
  location: string;
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