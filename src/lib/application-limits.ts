import type { ApplicationItem } from "@/services/types/service-types";

export type CandidateApplicationPlan = "free" | "premium";
export type ApplicationTimestamp = Pick<ApplicationItem, "appliedAt"> & {
  createdAt?: string;
};

export const FREE_CANDIDATE_DAILY_APPLICATION_LIMIT = 5;

export interface ApplicationLimitResult {
  allowed: boolean;
  countToday: number;
  limit: number | null;
}

function isSameLocalDay(value: string, date: Date): boolean {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  return (
    parsed.getFullYear() === date.getFullYear() &&
    parsed.getMonth() === date.getMonth() &&
    parsed.getDate() === date.getDate()
  );
}

export function countApplicationsCreatedToday(
  applications: ApplicationTimestamp[],
  date = new Date()
): number {
  return applications.filter((application) =>
    isSameLocalDay(application.createdAt ?? application.appliedAt, date)
  ).length;
}

export function getDailyApplicationLimit(
  plan: CandidateApplicationPlan
): number | null {
  if (plan === "premium") {
    return null;
  }

  return FREE_CANDIDATE_DAILY_APPLICATION_LIMIT;
}

export function checkDailyApplicationLimit(
  applications: ApplicationTimestamp[],
  plan: CandidateApplicationPlan = "free",
  date = new Date()
): ApplicationLimitResult {
  const countToday = countApplicationsCreatedToday(applications, date);
  const limit = getDailyApplicationLimit(plan);

  return {
    allowed: limit === null || countToday < limit,
    countToday,
    limit,
  };
}
