export type NormalizedRole = "candidate" | "recruiter" | "admin";
export type OnboardingStep =
  | "select_role"
  | "candidate_resume"
  | "candidate_profile"
  | "recruiter_profile"
  | "completed";

export interface ProfileRouteState {
  role?: string | null;
  onboarding_complete?: boolean | null;
  onboardingComplete?: boolean | null;
  onboarding_step?: string | null;
  onboardingStep?: string | null;
}

export function normalizeRole(role: unknown): NormalizedRole | null {
  if (role === "candidate" || role === "job_seeker") return "candidate";
  if (role === "recruiter" || role === "employer") return "recruiter";
  if (role === "admin") return "admin";
  return null;
}

export function getStepForRole(role: Exclude<NormalizedRole, "admin">): OnboardingStep {
  return role === "recruiter" ? "recruiter_profile" : "candidate_resume";
}

export function normalizeOnboardingStep(step: unknown): OnboardingStep | null {
  if (
    step === "select_role" ||
    step === "candidate_resume" ||
    step === "candidate_profile" ||
    step === "recruiter_profile" ||
    step === "completed"
  ) {
    return step;
  }

  return null;
}

export function getNextRouteForProfile(profile: ProfileRouteState | null | undefined) {
  if (!profile) {
    return "/auth/home";
  }

  const role = normalizeRole(profile.role);
  const onboardingComplete =
    profile.onboarding_complete === true || profile.onboardingComplete === true;
  const onboardingStep = normalizeOnboardingStep(
    profile.onboarding_step ?? profile.onboardingStep
  );

  if (!role) {
    return "/onboarding/select-role";
  }

  if (!onboardingComplete) {
    const route =
      role === "recruiter" || onboardingStep === "recruiter_profile"
        ? "/onboarding/recruiter"
        : "/onboarding/candidate";
    return route;
  }

  if (role === "admin") {
    return "/admin";
  }

  return role === "recruiter" ? "/recruiter/dashboard" : "/dashboard";
}
