import { getSupabaseClient } from "@/lib/supabase/client";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import {
  isSchemaQueryError,
  logOptionalSupabaseLoadFailure,
} from "@/lib/supabase/query-errors";
import {
  formatRecruiterPhone,
  normalizePhoneCountryCode,
} from "@/lib/recruiter/phone";
import type { Certification, Education, Experience, PortfolioItem, Profile } from "@/types/profile";

type SupabaseError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

const candidateSocialColumns = [
  "linkedin_url",
  "github_url",
  "dribbble_url",
  "portfolio_url",
] as const;

type ProfileRow = {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  headline?: string | null;
  about?: string | null;
  location?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  resume_url?: string | null;
  experience_level?: string | null;
  skills?: string[] | null;
  role?: string | null;
};

export type CandidateProfileRow = {
  resume_url?: string | null;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  headline?: string | null;
  summary?: string | null;
  phone?: string | null;
  location?: string | null;
  total_experience?: string | null;
  total_experience_years?: number | null;
  total_experience_months?: number | null;
  current_title?: string | null;
  current_company?: string | null;
  notice_period?: string | null;
  current_salary?: string | null;
  current_salary_currency?: string | null;
  current_salary_amount?: number | null;
  experience_level?: string | null;
  skills?: string[] | null;
  tools?: string[] | null;
  languages?: LanguagePayload[] | string[] | null;
  industry?: string | null;
  industries?: string[] | null;
  functional_area?: string | null;
  education?: EducationPayload[] | null;
  expected_salary?: string | null;
  expected_salary_currency?: string | null;
  expected_salary_amount?: number | null;
  preferred_locations?: string[] | null;
  job_type_preference?: string[] | string | null;
  work_mode_preference?: string[] | string | null;
  job_preferences?: { text?: string } | string | null;
  experiences?: ExperiencePayload[] | null;
  certifications?: CertificationPayload[] | null;
  projects?: ProjectPayload[] | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  dribbble_url?: string | null;
  portfolio_url?: string | null;
};

export type RecruiterProfileRow = {
  recruiter_full_name?: string | null;
  company_name?: string | null;
  company_website?: string | null;
  company_size?: string | null;
  industry?: string | null;
  hiring_title?: string | null;
  recruiter_title?: string | null;
  company_logo_url?: string | null;
  company_country?: string | null;
  company_state_or_region?: string | null;
  company_city?: string | null;
  company_street_address?: string | null;
  company_postal_code?: string | null;
  company_location?: string | null;
  company_description?: string | null;
  hiring_roles?: string[] | null;
  hiring_model?: string | null;
  hiring_locations?: string[] | null;
  remote_policy?: string | null;
  monthly_hiring_volume?: string | null;
  preferred_experience_levels?: string[] | null;
  preferred_skills?: string[] | null;
  common_salary_range?: string | null;
  urgent_hiring?: boolean | null;
  onboarding_completed?: boolean | null;
  onboarding_step?: number | null;
  location?: string | null;
  phone?: string | null;
  phone_country?: string | null;
  phone_country_code?: string | null;
  phone_number?: string | null;
};

export type LoadedProfile = {
  profile: Profile;
  role: "candidate" | "recruiter" | "admin" | null;
  recruiterProfile: RecruiterProfileRow | null;
  candidateProfile: CandidateProfileRow | null;
};

export type CandidateProfileUpdate = {
  fullName: string;
  headline: string;
  summary: string;
  location: string;
  phone: string;
  avatarUrl: string;
  resumeUrl: string;
  totalExperience: string;
  totalExperienceYears: number;
  totalExperienceMonths: number;
  experienceLevel?: string;
  currentTitle?: string;
  currentCompany: string;
  noticePeriod: string;
  currentSalary: string;
  currentSalaryCurrency: string;
  currentSalaryAmount: string;
  expectedSalary: string;
  expectedSalaryCurrency: string;
  expectedSalaryAmount: string;
  preferredLocations: string[];
  jobTypePreference: string[];
  workModePreference: string[];
  skills: string[];
  tools: string[];
  languages: LanguagePayload[];
  industry: string;
  industries: string[];
  functionalArea: string;
  experiences: ExperiencePayload[];
  education: EducationPayload[];
  certifications: CertificationPayload[];
  projects: ProjectPayload[];
  linkedinUrl?: string;
  githubUrl?: string;
  dribbbleUrl?: string;
  portfolioUrl?: string;
};

export type RecruiterProfileUpdate = {
  fullName: string;
  phone: string;
  phoneCountry?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  location?: string;
  recruiterTitle?: string;
  companyName: string;
  companyWebsite: string;
  companySize: string;
  industry: string;
  hiringTitle: string;
  companyLogoUrl?: string;
  companyCountry?: string;
  companyStateOrRegion?: string;
  companyCity?: string;
  companyStreetAddress?: string;
  companyPostalCode?: string;
  companyLocation?: string;
  companyDescription?: string;
  hiringRoles?: string[];
  hiringModel?: string;
  hiringLocations?: string[];
  remotePolicy?: string;
  monthlyHiringVolume?: string;
  preferredExperienceLevels?: string[];
  preferredSkills?: string[];
  commonSalaryRange?: string;
  urgentHiring?: boolean;
  onboardingCompleted?: boolean;
  onboardingStep?: number;
};

export function logSupabaseProfileError(context: string, error: SupabaseError) {
  console.error(context, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
}

function omitCandidateSocialColumns(payload: Record<string, unknown>) {
  const next = { ...payload };
  candidateSocialColumns.forEach((column) => {
    delete next[column];
  });
  return next;
}

function isMissingCandidateSocialColumn(error: SupabaseError) {
  const message = error.message || "";
  return (
    isSchemaQueryError(error) &&
    candidateSocialColumns.some((column) => message.includes(column))
  );
}

export type ExperiencePayload = {
  title: string;
  company: string;
  employment_type: string;
  location: string;
  start_date: string;
  end_date: string;
  currently_working: boolean;
  description: string;
  achievements: string;
  skills_used: string[];
};

export type LanguagePayload = {
  language: string;
  fluency: string;
};

export type EducationPayload = {
  degree: string;
  institution: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  grade: string;
  description: string;
};

export type CertificationPayload = {
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date: string;
  credential_id: string;
  credential_url: string;
};

export type ProjectPayload = {
  name: string;
  role: string;
  description: string;
  tech_stack: string[];
  project_url: string;
  start_date: string;
  end_date: string;
};

function asArray<T>(value: T[] | string | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function asStringArray(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function getInitials(nameOrEmail: string) {
  return nameOrEmail
    .split(/[ @._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapProfile(
  profile: ProfileRow,
  candidateProfile: CandidateProfileRow | null,
  verifiedEmail: boolean
): Profile {
  const name = profile.full_name || profile.name || profile.email || "User";
  const skills = candidateProfile?.skills ?? profile.skills ?? [];
  const headline =
    candidateProfile?.headline ||
    candidateProfile?.current_title ||
    profile.headline ||
    "";
  const experiences = asArray<ExperiencePayload>(candidateProfile?.experiences);
  const education = asArray<EducationPayload>(candidateProfile?.education);
  const certifications = asArray<CertificationPayload>(candidateProfile?.certifications);
  const projects = asArray<ProjectPayload>(candidateProfile?.projects);
  const languageItems = Array.isArray(candidateProfile?.languages)
    ? candidateProfile.languages
    : [];
  const languageLabels = languageItems.map((item) =>
    typeof item === "string" ? item : `${item.language} - ${item.fluency}`
  );
  const links = [
    { id: "linkedin", label: "LinkedIn", url: candidateProfile?.linkedin_url || "", icon: "linkedin" as const },
    { id: "github", label: "GitHub", url: candidateProfile?.github_url || "", icon: "github" as const },
    { id: "dribbble", label: "Dribbble", url: candidateProfile?.dribbble_url || "", icon: "dribbble" as const },
    { id: "portfolio", label: "Portfolio", url: candidateProfile?.portfolio_url || "", icon: "website" as const },
  ].filter((link) => link.url);
  const avatarUrl =
    candidateProfile?.profile_image_url ||
    candidateProfile?.avatar_url ||
    profile.avatar_url ||
    undefined;
  const resumeFile = candidateProfile?.resume_url || profile.resume_url || undefined;
  const experienceLevel =
    candidateProfile?.experience_level ||
    profile.experience_level ||
    "";
  const mappedProfile: Profile = {
    id: profile.id,
    name,
    headline,
    about: candidateProfile?.summary || profile.about || "",
    location: candidateProfile?.location || profile.location || "",
    email: profile.email || "",
    phone: candidateProfile?.phone || profile.phone || undefined,
    avatarInitials: getInitials(name),
    avatarUrl,
    resumeFile,
    experienceLevel,
    skills,
    totalExperience: candidateProfile?.total_experience || undefined,
    totalExperienceYears: candidateProfile?.total_experience_years ?? undefined,
    totalExperienceMonths: candidateProfile?.total_experience_months ?? undefined,
    currentTitle: candidateProfile?.current_title || undefined,
    currentCompany: candidateProfile?.current_company || undefined,
    noticePeriod: candidateProfile?.notice_period || undefined,
    currentSalary: candidateProfile?.current_salary || undefined,
    currentSalaryCurrency: candidateProfile?.current_salary_currency || undefined,
    currentSalaryAmount: candidateProfile?.current_salary_amount ? String(candidateProfile.current_salary_amount) : undefined,
    expectedSalary: candidateProfile?.expected_salary || undefined,
    expectedSalaryCurrency: candidateProfile?.expected_salary_currency || undefined,
    expectedSalaryAmount: candidateProfile?.expected_salary_amount ? String(candidateProfile.expected_salary_amount) : undefined,
    preferredLocations: candidateProfile?.preferred_locations || [],
    jobTypePreference: asStringArray(candidateProfile?.job_type_preference).join(", ") || undefined,
    workModePreference: asStringArray(candidateProfile?.work_mode_preference).join(", ") || undefined,
    tools: candidateProfile?.tools || [],
    languages: languageLabels,
    industry: candidateProfile?.industries?.join(", ") || candidateProfile?.industry || undefined,
    functionalArea: candidateProfile?.functional_area || undefined,
    experience: experiences.map<Experience>((item, index) => ({
      id: `exp-${index}`,
      role: item.title,
      company: item.company,
      employmentType: item.employment_type,
      location: item.location,
      startDate: item.start_date,
      endDate: item.currently_working ? null : item.end_date || null,
      currentlyWorking: item.currently_working,
      description: item.description,
      achievements: item.achievements,
      skills: item.skills_used,
    })),
    education: education.map<Education>((item, index) => ({
      id: `edu-${index}`,
      degree: item.degree,
      institution: item.institution,
      field: item.field_of_study,
      startYear: Number(item.start_year) || 0,
      endYear: Number(item.end_year) || null,
      grade: item.grade,
      description: item.description,
    })),
    certifications: certifications.map<Certification>((item, index) => ({
      id: `cert-${index}`,
      name: item.name,
      issuer: item.issuer,
      year: Number(item.issue_date?.slice(0, 4)) || new Date().getFullYear(),
      issueDate: item.issue_date,
      expiryDate: item.expiry_date,
      credentialId: item.credential_id,
      credentialUrl: item.credential_url,
    })),
    portfolio: projects.map<PortfolioItem>((item, index) => ({
      id: `project-${index}`,
      title: item.name,
      role: item.role,
      description: item.description,
      tools: item.tech_stack,
      projectUrl: item.project_url,
      startDate: item.start_date,
      endDate: item.end_date,
    })),
    links,
    verifiedEmail,
    profileStrength: 0,
  };

  return {
    ...mappedProfile,
    profileStrength: calculateProfileCompletion(mappedProfile).percent,
  };
}

export async function loadCurrentProfile(): Promise<LoadedProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    logSupabaseProfileError("[PROFILE] Auth user lookup failed", userError);
    throw new Error(userError.message);
  }
  if (!user) return null;

  const profileAttempts = [
    () =>
      supabase
        .from("profiles")
        .select("id,name,full_name,email,headline,about,location,phone,avatar_url,resume_url,experience_level,skills,role")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>(),
    () =>
      supabase
        .from("profiles")
        .select("id,name,full_name,email,avatar_url,role")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>(),
    () =>
      supabase
        .from("profiles")
        .select("id,email,role")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>(),
  ];

  let profile: ProfileRow | null = null;
  let profileError: Awaited<ReturnType<(typeof profileAttempts)[number]>>["error"] = null;
  for (const attempt of profileAttempts) {
    const result = await attempt();
    if (!result.error) {
      profile = result.data ?? null;
      profileError = null;
      break;
    }

    profileError = result.error;
    if (!isSchemaQueryError(result.error)) break;
  }

  if (profileError) {
    logSupabaseProfileError("[PROFILE] Profile load failed", profileError);
    throw new Error(profileError.message);
  }
  if (!profile) return null;

  const role =
    profile.role === "candidate" || profile.role === "recruiter" || profile.role === "admin"
      ? profile.role
      : null;

  const candidateAttempts = [
    () =>
      supabase
        .from("candidate_profiles")
        .select("resume_url,avatar_url,profile_image_url,headline,summary,phone,location,total_experience,total_experience_years,total_experience_months,current_title,current_company,notice_period,current_salary,current_salary_currency,current_salary_amount,experience_level,skills,tools,languages,industry,industries,functional_area,education,expected_salary,expected_salary_currency,expected_salary_amount,preferred_locations,job_type_preference,work_mode_preference,job_preferences,experiences,certifications,projects,linkedin_url,github_url,dribbble_url,portfolio_url")
        .eq("user_id", user.id)
        .maybeSingle<CandidateProfileRow>(),
    () =>
      supabase
        .from("candidate_profiles")
        .select("resume_url,avatar_url,profile_image_url,headline,summary,phone,location,total_experience,total_experience_years,total_experience_months,current_title,current_company,experience_level,skills,tools,languages,industry,preferred_locations,job_type_preference,work_mode_preference")
        .eq("user_id", user.id)
        .maybeSingle<CandidateProfileRow>(),
    () =>
      supabase
        .from("candidate_profiles")
        .select("resume_url,avatar_url,headline,summary,location,current_title,skills")
        .eq("user_id", user.id)
        .maybeSingle<CandidateProfileRow>(),
  ];

  let candidateProfile: CandidateProfileRow | null = null;
  let candidateError: Awaited<ReturnType<(typeof candidateAttempts)[number]>>["error"] = null;
  for (const attempt of candidateAttempts) {
    const result = await attempt();
    if (!result.error) {
      candidateProfile = result.data ?? null;
      candidateError = null;
      break;
    }

    candidateError = result.error;
    if (!isSchemaQueryError(result.error)) break;
  }
  if (candidateError) {
    logOptionalSupabaseLoadFailure("[PROFILE] Candidate profile load failed", candidateError);
  }

  const { data: recruiterProfile, error: recruiterError } = await supabase
    .from("recruiter_profiles")
    .select("recruiter_full_name,company_name,company_website,company_size,industry,hiring_title,recruiter_title,company_logo_url,company_country,company_state_or_region,company_city,company_street_address,company_postal_code,company_location,company_description,hiring_roles,hiring_model,hiring_locations,remote_policy,monthly_hiring_volume,preferred_experience_levels,preferred_skills,common_salary_range,urgent_hiring,onboarding_completed,onboarding_step,location,phone,phone_country,phone_country_code,phone_number")
    .eq("user_id", user.id)
    .maybeSingle<RecruiterProfileRow>();
  if (recruiterError) {
    const fallback = await supabase
      .from("recruiter_profiles")
      .select("company_name,company_website,company_size,industry,hiring_title,company_logo_url,location,phone")
      .eq("user_id", user.id)
      .maybeSingle<RecruiterProfileRow>();

    if (!fallback.error) {
      return {
        profile: mapProfile(
          profile,
          candidateProfile ?? null,
          Boolean(user.email_confirmed_at)
        ),
        role,
        candidateProfile: candidateProfile ?? null,
        recruiterProfile: fallback.data ?? null,
      };
    }

    logOptionalSupabaseLoadFailure("[PROFILE] Recruiter profile load failed", recruiterError);
  }

  return {
    profile: mapProfile(
      profile,
      candidateProfile ?? null,
      Boolean(user.email_confirmed_at)
    ),
    role,
    candidateProfile: candidateProfile ?? null,
    recruiterProfile: recruiterProfile ?? null,
  };
}

export async function saveCandidateProfile(update: CandidateProfileUpdate) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    logSupabaseProfileError("[PROFILE] Auth user lookup failed", userError);
    throw new Error(userError.message);
  }
  if (!user) throw new Error("You must be signed in to update your profile.");

  const profileUpdate: Record<string, string | string[] | null> = {
    full_name: update.fullName,
    name: update.fullName,
    headline: update.headline,
    about: update.summary,
    location: update.location,
    phone: update.phone || null,
    avatar_url: update.avatarUrl || null,
    resume_url: update.resumeUrl || null,
    skills: update.skills,
  };
  if (update.experienceLevel !== undefined) {
    profileUpdate.experience_level = update.experienceLevel || null;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (profileError) {
    logSupabaseProfileError("[PROFILE] Candidate profiles update failed", profileError);
    throw new Error(profileError.message);
  }

  const candidateUpdate: Record<string, unknown> = {
    user_id: user.id,
    resume_url: update.resumeUrl || null,
    avatar_url: update.avatarUrl || null,
    profile_image_url: update.avatarUrl || null,
    headline: update.headline,
    summary: update.summary,
    phone: update.phone || null,
    location: update.location,
    total_experience: update.totalExperience,
    total_experience_years: update.totalExperienceYears,
    total_experience_months: update.totalExperienceMonths,
    current_title: update.currentTitle || update.headline,
    current_company: update.currentCompany,
    notice_period: update.noticePeriod,
    current_salary: update.currentSalary,
    current_salary_currency: update.currentSalaryCurrency,
    current_salary_amount: update.currentSalaryAmount ? Number(update.currentSalaryAmount) : null,
    expected_salary: update.expectedSalary || null,
    expected_salary_currency: update.expectedSalaryCurrency,
    expected_salary_amount: update.expectedSalaryAmount ? Number(update.expectedSalaryAmount) : null,
    preferred_locations: update.preferredLocations,
    job_type_preference: update.jobTypePreference,
    work_mode_preference: update.workModePreference,
    skills: update.skills,
    tools: update.tools,
    languages: update.languages,
    industry: update.industry,
    industries: update.industries,
    functional_area: update.functionalArea,
    experiences: update.experiences,
    education: update.education,
    certifications: update.certifications,
    projects: update.projects,
    profile_completion: 90,
  };
  if (update.experienceLevel !== undefined) candidateUpdate.experience_level = update.experienceLevel || null;
  if (update.linkedinUrl !== undefined) candidateUpdate.linkedin_url = update.linkedinUrl || null;
  if (update.githubUrl !== undefined) candidateUpdate.github_url = update.githubUrl || null;
  if (update.dribbbleUrl !== undefined) candidateUpdate.dribbble_url = update.dribbbleUrl || null;
  if (update.portfolioUrl !== undefined) candidateUpdate.portfolio_url = update.portfolioUrl || null;

  const upsertCandidateProfile = (payload: Record<string, unknown>) =>
    supabase
      .from("candidate_profiles")
      .upsert(payload, { onConflict: "user_id" });

  let { error: candidateError } = await upsertCandidateProfile(candidateUpdate);
  if (candidateError && isMissingCandidateSocialColumn(candidateError)) {
    const fallback = await upsertCandidateProfile(
      omitCandidateSocialColumns(candidateUpdate)
    );
    candidateError = fallback.error;
  }

  if (candidateError) {
    logSupabaseProfileError("[PROFILE] Candidate profile update failed", candidateError);
    throw new Error(candidateError.message);
  }
}

export async function saveCandidateSocialLink(
  platform: "linkedin" | "github" | "dribbble" | "portfolio",
  url: string
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    logSupabaseProfileError("[PROFILE] Auth user lookup failed", userError);
    throw new Error(userError.message);
  }
  if (!user) throw new Error("You must be signed in to update your profile.");

  const columnByPlatform = {
    linkedin: "linkedin_url",
    github: "github_url",
    dribbble: "dribbble_url",
    portfolio: "portfolio_url",
  } as const;

  const { error } = await supabase
    .from("candidate_profiles")
    .upsert({ user_id: user.id, [columnByPlatform[platform]]: url || null }, { onConflict: "user_id" });

  if (error) {
    logSupabaseProfileError("[PROFILE] Candidate social link update failed", error);
    throw new Error(error.message);
  }
}

export async function saveRecruiterProfile(update: RecruiterProfileUpdate) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    logSupabaseProfileError("[PROFILE] Auth user lookup failed", userError);
    throw new Error(userError.message);
  }
  if (!user) throw new Error("You must be signed in to update your company profile.");

  const companyLocation =
    update.companyLocation?.trim() ||
    (update.companyStreetAddress &&
    update.companyCity &&
    update.companyStateOrRegion &&
    update.companyPostalCode &&
    update.companyCountry
      ? [
          update.companyStreetAddress,
          update.companyCity,
          update.companyStateOrRegion,
          update.companyPostalCode,
          update.companyCountry,
        ]
      .map((value) => value.trim())
          .filter(Boolean)
          .join(", ")
      : "");
  const structuredPhoneCountry = update.phoneCountry?.trim() || "";
  const structuredPhoneCountryCode = normalizePhoneCountryCode(update.phoneCountryCode || "");
  const structuredPhoneNumber = update.phoneNumber?.trim() || "";
  const hasStructuredPhone =
    Boolean(structuredPhoneCountry) &&
    Boolean(structuredPhoneCountryCode) &&
    Boolean(structuredPhoneNumber);
  const formattedPhone = hasStructuredPhone
    ? formatRecruiterPhone(structuredPhoneCountryCode, structuredPhoneNumber)
    : "";

  const profileUpdate: Record<string, unknown> = {
    full_name: update.fullName,
    name: update.fullName,
  };

  const { error: profileError } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", user.id);

  if (profileError) {
    logSupabaseProfileError("[PROFILE] Recruiter profiles update failed", profileError);
    throw new Error(profileError.message);
  }

  const recruiterUpdate: Record<string, unknown> = {
    user_id: user.id,
    recruiter_full_name: update.fullName,
    company_name: update.companyName,
    company_website: update.companyWebsite || null,
    company_size: update.companySize,
    industry: update.industry,
    hiring_title: update.hiringTitle || update.recruiterTitle || null,
    recruiter_title: update.recruiterTitle || update.hiringTitle || null,
    company_description: update.companyDescription || null,
    company_country: update.companyCountry?.trim() || null,
    company_state_or_region: update.companyStateOrRegion?.trim() || null,
    company_city: update.companyCity?.trim() || null,
    company_street_address: update.companyStreetAddress?.trim() || null,
    company_postal_code: update.companyPostalCode?.trim() || null,
    ...(companyLocation
      ? {
          company_location: companyLocation,
        }
      : update.companyLocation?.trim()
        ? {
            company_location: update.companyLocation.trim(),
          }
        : {}),
    hiring_roles: update.hiringRoles || [],
    hiring_model: update.hiringModel || null,
    hiring_locations: update.hiringLocations || [],
    remote_policy: update.remotePolicy || null,
    monthly_hiring_volume: update.monthlyHiringVolume || null,
    preferred_experience_levels: update.preferredExperienceLevels || [],
    preferred_skills: update.preferredSkills || [],
    common_salary_range: update.commonSalaryRange || null,
    urgent_hiring: update.urgentHiring ?? false,
    onboarding_completed: update.onboardingCompleted ?? false,
    onboarding_step: update.onboardingStep ?? 1,
  };

  if (update.companyLogoUrl !== undefined) {
    recruiterUpdate.company_logo_url = update.companyLogoUrl.trim() || null;
  }
  if (update.location !== undefined || companyLocation) {
    recruiterUpdate.location = update.location?.trim() || companyLocation || null;
  }
  if (hasStructuredPhone) {
    recruiterUpdate.phone_country = structuredPhoneCountry;
    recruiterUpdate.phone_country_code = structuredPhoneCountryCode;
    recruiterUpdate.phone_number = structuredPhoneNumber;
    recruiterUpdate.phone = formattedPhone || null;
  } else if (update.phone?.trim()) {
    recruiterUpdate.phone = update.phone.trim();
  }

  const upsertRecruiterProfile = (payload: Record<string, unknown>) =>
    supabase
      .from("recruiter_profiles")
      .upsert(payload, { onConflict: "user_id" });

  const { error: recruiterError } = await upsertRecruiterProfile(recruiterUpdate);
  if (recruiterError) {
    if (isSchemaQueryError(recruiterError)) {
      const fallbackUpdate = omitOptionalRecruiterProfileColumns(recruiterUpdate);
      const fallback = await upsertRecruiterProfile(fallbackUpdate);

      if (!fallback.error) return;

      if (isSchemaQueryError(fallback.error) && update.onboardingCompleted) {
        const completionOnly = await upsertRecruiterProfile({
          user_id: user.id,
          recruiter_full_name: update.fullName,
          company_name: update.companyName,
          company_website: update.companyWebsite || null,
          company_size: update.companySize,
          industry: update.industry,
          hiring_title: update.hiringTitle || update.recruiterTitle || null,
          recruiter_title: update.recruiterTitle || update.hiringTitle || null,
          onboarding_completed: true,
          onboarding_step: update.onboardingStep ?? 5,
        });

        if (!completionOnly.error) return;
        logSupabaseProfileError("[PROFILE] Recruiter completion fallback failed", completionOnly.error);
        throw new Error(completionOnly.error.message);
      }

      logSupabaseProfileError("[PROFILE] Recruiter profile update failed", fallback.error);
      throw new Error(fallback.error.message);
    }

    logSupabaseProfileError("[PROFILE] Recruiter profile update failed", recruiterError);
    throw new Error(recruiterError.message);
  }
}

function omitOptionalRecruiterProfileColumns(payload: Record<string, unknown>) {
  const fallback = { ...payload };
  delete fallback.phone_country;
  delete fallback.phone_country_code;
  delete fallback.phone_number;
  delete fallback.phone;
  delete fallback.company_logo_url;
  return fallback;
}
