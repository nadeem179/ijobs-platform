import type { SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "@/lib/supabase/db";

export const RECRUITER_JOB_ACTIVITY_TYPES = [
  "job_created",
  "job_updated",
  "application_reviewed",
  "candidate_contacted",
  "job_confirmed",
] as const;

export type RecruiterJobActivityType =
  (typeof RECRUITER_JOB_ACTIVITY_TYPES)[number];

export async function recordRecruiterJobActivity(options: {
  recruiterId: string;
  jobId: string;
  activityType: RecruiterJobActivityType;
  metadata?: Record<string, unknown>;
  db?: SupabaseClient;
}) {
  const db = options.db ?? getDb();

  if (!db) {
    throw new Error("Supabase client is not configured.");
  }

  const { error } = await db.from("recruiter_job_activities").insert({
    recruiter_id: options.recruiterId,
    job_id: options.jobId,
    activity_type: options.activityType,
    metadata: options.metadata ?? {},
  });

  if (error) throw error;
}

export function confirmRecruiterJobActivity(options: {
  recruiterId: string;
  jobId: string;
  db?: SupabaseClient;
}) {
  return recordRecruiterJobActivity({
    ...options,
    activityType: "job_confirmed",
  });
}

