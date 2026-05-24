"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import {
  loadCurrentProfile,
  saveCandidateProfile,
  type CandidateProfileUpdate,
  type LoadedProfile,
} from "@/lib/profile/persistence";
import {
  isSchemaQueryError,
  logOptionalSupabaseLoadFailure,
} from "@/lib/supabase/query-errors";

export type JobSearchStatus =
  | "immediately_looking"
  | "open_to_opportunities"
  | "not_looking";

export type CandidateSettings = {
  candidateId: string;
  jobSearchStatus: JobSearchStatus;
  dailyJobRecommendations: boolean;
  weeklyJobRecommendations: boolean;
  jobStatusUpdates: boolean;
  recruiterMessages: boolean;
  profileViews: boolean;
  promotionalEmails: boolean;
  profileVisibleToRecruiters: boolean;
  accountStatus: "active" | "deactivated";
};

type CandidateSettingsRow = {
  candidate_id: string;
  job_search_status?: string | null;
  daily_job_recommendations?: boolean | null;
  weekly_job_recommendations?: boolean | null;
  job_status_updates?: boolean | null;
  recruiter_messages?: boolean | null;
  profile_views?: boolean | null;
  promotional_emails?: boolean | null;
  profile_visible_to_recruiters?: boolean | null;
  account_status?: string | null;
};

function normalizeJobSearchStatus(value: string | null | undefined): JobSearchStatus {
  if (value === "immediately_looking" || value === "open_to_opportunities" || value === "not_looking") {
    return value;
  }
  return "open_to_opportunities";
}

export function getJobSearchStatusPreset(status: JobSearchStatus) {
  if (status === "immediately_looking") {
    return {
      dailyJobRecommendations: true,
      weeklyJobRecommendations: false,
      jobStatusUpdates: true,
      recruiterMessages: true,
      profileViews: true,
      promotionalEmails: true,
      profileVisibleToRecruiters: true,
    };
  }

  if (status === "not_looking") {
    return {
      dailyJobRecommendations: false,
      weeklyJobRecommendations: false,
      jobStatusUpdates: false,
      recruiterMessages: false,
      profileViews: false,
      promotionalEmails: false,
      profileVisibleToRecruiters: false,
    };
  }

  return {
    dailyJobRecommendations: false,
    weeklyJobRecommendations: true,
    jobStatusUpdates: true,
    recruiterMessages: true,
    profileViews: true,
    promotionalEmails: false,
    profileVisibleToRecruiters: true,
  };
}

function mapCandidateSettings(row: CandidateSettingsRow, candidateId: string): CandidateSettings {
  const status = normalizeJobSearchStatus(row.job_search_status);
  const preset = getJobSearchStatusPreset(status);

  return {
    candidateId,
    jobSearchStatus: status,
    dailyJobRecommendations: row.daily_job_recommendations ?? preset.dailyJobRecommendations,
    weeklyJobRecommendations: row.weekly_job_recommendations ?? preset.weeklyJobRecommendations,
    jobStatusUpdates: row.job_status_updates ?? preset.jobStatusUpdates,
    recruiterMessages: row.recruiter_messages ?? preset.recruiterMessages,
    profileViews: row.profile_views ?? preset.profileViews,
    promotionalEmails: row.promotional_emails ?? preset.promotionalEmails,
    profileVisibleToRecruiters: row.profile_visible_to_recruiters ?? preset.profileVisibleToRecruiters,
    accountStatus: row.account_status === "deactivated" ? "deactivated" : "active",
  };
}

export async function loadCandidateSettings() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!user) return null;

  const loadAttempts = [
    () =>
      supabase
        .from("candidate_settings")
        .select(
          "candidate_id,job_search_status,daily_job_recommendations,weekly_job_recommendations,job_status_updates,recruiter_messages,profile_views,promotional_emails,profile_visible_to_recruiters,account_status"
        )
        .eq("candidate_id", user.id)
        .maybeSingle<CandidateSettingsRow>(),
    () =>
      supabase
        .from("candidate_settings")
        .select("candidate_id,job_search_status,account_status")
        .eq("candidate_id", user.id)
        .maybeSingle<CandidateSettingsRow>(),
  ];

  let data: CandidateSettingsRow | null = null;
  let error: Awaited<ReturnType<(typeof loadAttempts)[number]>>["error"] = null;
  for (const attempt of loadAttempts) {
    const result = await attempt();
    if (!result.error) {
      data = result.data ?? null;
      error = null;
      break;
    }

    error = result.error;
    if (!isSchemaQueryError(result.error)) break;
  }

  if (error) {
    logOptionalSupabaseLoadFailure("[SETTINGS] Candidate settings load failed", error);
    return mapCandidateSettings({ candidate_id: user.id }, user.id);
  }
  return data ? mapCandidateSettings(data, user.id) : mapCandidateSettings({ candidate_id: user.id }, user.id);
}

export async function saveCandidateSettings(settings: CandidateSettings) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Settings are unavailable right now.");

  const payload = {
    candidate_id: settings.candidateId,
    job_search_status: settings.jobSearchStatus,
    daily_job_recommendations: settings.dailyJobRecommendations,
    weekly_job_recommendations: settings.weeklyJobRecommendations,
    job_status_updates: settings.jobStatusUpdates,
    recruiter_messages: settings.recruiterMessages,
    profile_views: settings.profileViews,
    promotional_emails: settings.promotionalEmails,
    profile_visible_to_recruiters: settings.profileVisibleToRecruiters,
    account_status: settings.accountStatus,
  };

  const { error } = await supabase.from("candidate_settings").upsert(payload, {
    onConflict: "candidate_id",
  });

  if (error) throw new Error(error.message);
}

export async function loadCandidateSettingsPageData(): Promise<{
  profileData: LoadedProfile | null;
  settings: CandidateSettings | null;
}> {
  const [profileData, settings] = await Promise.all([
    loadCurrentProfile(),
    loadCandidateSettings(),
  ]);

  return { profileData, settings };
}

export async function saveCandidatePhone(phone: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error("Account settings are unavailable right now.");

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be signed in to update your mobile number.");

  const normalizedPhone = phone.trim() || null;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ phone: normalizedPhone })
    .eq("id", user.id);
  if (profileError) throw new Error(profileError.message);

  const { error: candidateError } = await supabase
    .from("candidate_profiles")
    .upsert({ user_id: user.id, phone: normalizedPhone }, { onConflict: "user_id" });
  if (candidateError) throw new Error(candidateError.message);
}

export async function saveCandidatePreferences(update: Partial<CandidateProfileUpdate>) {
  const profileData = await loadCurrentProfile();
  if (!profileData?.profile || !profileData.candidateProfile) {
    throw new Error("Candidate profile is unavailable right now.");
  }

  const profile = profileData.profile;
  const candidate = profileData.candidateProfile;
  const toLanguagePayload = (values: string[]) =>
    values.map((value) => {
      const [language, fluency = "Professional working"] = value.split(" - ");
      return { language, fluency };
    });

  const payload: CandidateProfileUpdate = {
    fullName: profile.name,
    headline: profile.headline,
    summary: profile.about,
    location: profile.location,
    phone: profile.phone || "",
    avatarUrl: profile.avatarUrl || "",
    resumeUrl: profile.resumeFile || "",
    totalExperience: profile.totalExperience || "",
    totalExperienceYears: profile.totalExperienceYears || 0,
    totalExperienceMonths: profile.totalExperienceMonths || 0,
    experienceLevel: profile.experienceLevel || undefined,
    currentTitle: profile.currentTitle || profile.headline,
    currentCompany: profile.currentCompany || "",
    noticePeriod: profile.noticePeriod || "",
    currentSalary: profile.currentSalary || "",
    currentSalaryCurrency: profile.currentSalaryCurrency || "INR",
    currentSalaryAmount: profile.currentSalaryAmount || "",
    expectedSalary: profile.expectedSalary || "",
    expectedSalaryCurrency: profile.expectedSalaryCurrency || "INR",
    expectedSalaryAmount: profile.expectedSalaryAmount || "",
    preferredLocations: profile.preferredLocations || [],
    jobTypePreference: profile.jobTypePreference
      ? profile.jobTypePreference.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
    workModePreference: profile.workModePreference
      ? profile.workModePreference.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
    skills: profile.skills,
    tools: profile.tools || [],
    languages: toLanguagePayload(profile.languages || []),
    industry: candidate.industry || profile.industry || "",
    industries: candidate.industries || (profile.industry ? profile.industry.split(",").map((item) => item.trim()).filter(Boolean) : []),
    functionalArea: profile.functionalArea || "",
    experiences: candidate.experiences || [],
    education: candidate.education || [],
    certifications: candidate.certifications || [],
    projects: candidate.projects || [],
    linkedinUrl: candidate.linkedin_url || undefined,
    githubUrl: candidate.github_url || undefined,
    dribbbleUrl: candidate.dribbble_url || undefined,
    portfolioUrl: candidate.portfolio_url || undefined,
    ...update,
  };

  await saveCandidateProfile(payload);
}
