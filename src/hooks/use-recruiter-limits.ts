"use client";

import { useState, useCallback } from "react";

const STORAGE_KEY = "ijobs_jobs_posted";

/**
 * Tracks how many jobs a recruiter has posted.
 * First job is free; subsequent jobs require a payment placeholder.
 *
 * Replace with real backend counting when Supabase is integrated.
 */
export function useRecruiterLimits() {
  const [jobsPosted, setJobsPosted] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
    } catch {
      return 0;
    }
  });

  const [showUpgrade, setShowUpgrade] = useState(false);

  const canPostJob = jobsPosted < 1;

  const incrementJobsPosted = useCallback(() => {
    const next = jobsPosted + 1;
    setJobsPosted(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, [jobsPosted]);

  const tryPublish = useCallback((): boolean => {
    if (canPostJob) {
      incrementJobsPosted();
      return true;
    }
    setShowUpgrade(true);
    return false;
  }, [canPostJob, incrementJobsPosted]);

  return {
    jobsPosted,
    canPostJob,
    showUpgrade,
    setShowUpgrade,
    tryPublish,
    incrementJobsPosted,
  };
}

/**
 * Upgrade modal content.
 */
export function getUpgradeMessage(jobsPosted: number) {
  if (jobsPosted === 0) {
    return {
      title: "Your first job listing is free",
      message:
        "Post your first job at no cost. Upgrade anytime to post more listings and access advanced features.",
      cta: "Publish My First Job",
    };
  }
  return {
    title: "Upgrade to post more jobs",
    message:
      "You've used your free listing. Extra job posts are ₹500 each. Payment integration will be connected when billing is ready.",
    cta: "View Pricing",
  };
}
