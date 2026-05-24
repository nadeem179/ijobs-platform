export const recruiterTitleOptions = [
  "Founder",
  "Hiring Manager",
  "Talent Acquisition Lead",
  "HR Manager",
  "Engineering Manager",
  "Recruiter",
  "Technical Recruiter",
];

export const recruiterIndustryOptions = [
  "Technology",
  "SaaS",
  "AI/ML",
  "Finance",
  "Healthcare",
  "E-commerce",
  "Education",
  "Consulting",
  "Manufacturing",
  "Media",
  "Retail",
  "Real Estate",
  "Hospitality",
  "Logistics",
  "Construction",
  "Energy",
  "Telecommunications",
  "Legal",
  "Government",
  "Non-profit",
  "Skincare",
  "Beauty & Wellness",
  "Other",
];

export const companySizeOptions = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export const hiringRoleSuggestions = [
  "Software Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Data Scientist",
  "Sales Executive",
  "Marketing Manager",
  "Operations Manager",
  "Customer Support",
];

export const hiringModelOptions = [
  "Internal recruiter",
  "Agency recruiter",
  "Founder hiring directly",
];

export const hiringLocationSuggestions = [
  "Bangalore",
  "Remote India",
  "United States",
  "Europe",
];

export const remotePolicyOptions = ["Remote", "Hybrid", "On-site"];

export const monthlyHiringVolumeOptions = [
  "1-2 hires",
  "3-10 hires",
  "10+ hires",
  "Ongoing hiring",
];

export const preferredExperienceLevelOptions = [
  "Intern",
  "Junior",
  "Mid-level",
  "Senior",
  "Leadership",
];

export const preferredSkillSuggestions = [
  "React",
  "Python",
  "Node.js",
  "AI",
  "Figma",
  "Sales",
  "Product Management",
];

export const commonSalaryRangeOptions = [
  "Not sure yet",
  "Under 10 LPA",
  "10-25 LPA",
  "25-50 LPA",
  "50 LPA+",
  "Hourly / contract",
];

export function normalizeWebsite(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidDomainUrl(value: string) {
  const normalized = normalizeWebsite(value);
  try {
    const url = new URL(normalized);
    return Boolean(url.hostname.includes(".") && !url.hostname.startsWith(".") && !url.hostname.includes(" "));
  } catch {
    return false;
  }
}

export function isValidOptionalUrl(value: string) {
  if (!value.trim()) return true;
  return isValidDomainUrl(value);
}

export function companyInitials(value: string) {
  return (
    value
      .split(/[ ._-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "iJ"
  );
}

export function cleanStringList(values: string[]) {
  const seen = new Set<string>();
  return values
    .map((item) => item.trim())
    .filter((item) => {
      if (!item) return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
