import type { Profile } from "@/types/profile";

export interface ProfileCompletionCheck {
  label: string;
  done: boolean;
  points: number;
  group: string;
}

export interface ProfileCompletionSummary {
  percent: number;
  checks: ProfileCompletionCheck[];
  missingActions: string[];
}

function hasAny(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

export function calculateProfileCompletion(profile: Profile | null): ProfileCompletionSummary {
  const checks: ProfileCompletionCheck[] = [
    { group: "Basic profile", label: "Full name", done: hasAny(profile?.name), points: 5 },
    { group: "Basic profile", label: "Email present", done: hasAny(profile?.email), points: 5 },
    { group: "Basic profile", label: "Phone", done: hasAny(profile?.phone), points: 5 },
    { group: "Basic profile", label: "Location", done: hasAny(profile?.location), points: 5 },
    {
      group: "Professional summary",
      label: "Headline or designation",
      done: hasAny(profile?.headline) || hasAny(profile?.currentTitle),
      points: 5,
    },
    { group: "Professional summary", label: "About / summary", done: hasAny(profile?.about), points: 5 },
    { group: "Professional summary", label: "Profile image", done: hasAny(profile?.avatarUrl), points: 5 },
    { group: "Resume", label: "Resume uploaded", done: hasAny(profile?.resumeFile), points: 10 },
    {
      group: "Career preferences",
      label: "Total experience",
      done: hasAny(profile?.totalExperience) || Boolean(profile?.totalExperienceYears || profile?.totalExperienceMonths),
      points: 3,
    },
    {
      group: "Career preferences",
      label: "Current title / designation",
      done: hasAny(profile?.currentTitle) || hasAny(profile?.headline),
      points: 3,
    },
    {
      group: "Career preferences",
      label: "Salary expectations",
      done:
        hasAny(profile?.expectedSalary) ||
        hasAny(profile?.expectedSalaryAmount) ||
        hasAny(profile?.currentSalary) ||
        hasAny(profile?.currentSalaryAmount),
      points: 3,
    },
    {
      group: "Career preferences",
      label: "Preferred locations",
      done: hasAny(profile?.preferredLocations),
      points: 3,
    },
    {
      group: "Career preferences",
      label: "Job type / work mode / industry",
      done: hasAny(profile?.jobTypePreference) || hasAny(profile?.workModePreference) || hasAny(profile?.industry),
      points: 3,
    },
    { group: "Skills and tools", label: "Skills", done: hasAny(profile?.skills), points: 7 },
    { group: "Skills and tools", label: "Tools", done: hasAny(profile?.tools), points: 4 },
    { group: "Skills and tools", label: "Languages", done: hasAny(profile?.languages), points: 4 },
    { group: "Experience", label: "Experience entry", done: hasAny(profile?.experience), points: 10 },
    { group: "Education", label: "Education entry", done: hasAny(profile?.education), points: 10 },
    {
      group: "Certifications/projects/links",
      label: "Certification, project, or link",
      done: hasAny(profile?.certifications) || hasAny(profile?.portfolio) || hasAny(profile?.links),
      points: 5,
    },
  ];

  return {
    percent: Math.min(
      100,
      checks.reduce((total, check) => total + (check.done ? check.points : 0), 0)
    ),
    checks,
    missingActions: checks
      .filter((check) => !check.done)
      .map((check) => `${check.label} (+${check.points}%)`),
  };
}
