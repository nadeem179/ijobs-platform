"use client";

import { useMemo } from "react";
import type { Application } from "@/types/profile";
import {
  FREE_CANDIDATE_DAILY_APPLICATION_LIMIT,
  checkDailyApplicationLimit,
  type CandidateApplicationPlan,
} from "@/lib/application-limits";

export function useApplicationLimit(
  applications: Application[],
  candidatePlan: CandidateApplicationPlan = "free"
) {
  return useMemo(() => {
    const result = checkDailyApplicationLimit(applications, candidatePlan);
    const dailyLimit = result.limit ?? FREE_CANDIDATE_DAILY_APPLICATION_LIMIT;
    const remainingToday =
      result.limit === null
        ? dailyLimit
        : Math.max(dailyLimit - result.countToday, 0);

    return {
      dailyLimit,
      usedToday: result.countToday,
      remainingToday,
      canApplyToday: result.allowed,
    };
  }, [applications, candidatePlan]);
}
