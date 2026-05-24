import type { SupabaseClient } from "@supabase/supabase-js";
import {
  evaluateJobActivityStatuses,
  type JobActivityStatusInput,
  type JobActivityStatusSummary,
} from "@/lib/jobs/activity-status";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const JOB_ACTIVITY_COLUMNS = [
  "id",
  "status",
  "created_at",
  "updated_at",
  "last_recruiter_activity_at",
  "confirmation_due_at",
  "confirmation_requested_at",
  "confirmed_at",
  "requires_confirmation",
  "inactive_reason",
].join(",");

export type RunJobActivityStatusResult = JobActivityStatusSummary & {
  dryRun: boolean;
};

export async function runJobActivityStatusSync(options?: {
  db?: SupabaseClient;
  dryRun?: boolean;
  now?: Date;
}): Promise<RunJobActivityStatusResult> {
  const db = options?.db ?? getSupabaseAdminClient();

  if (!db) {
    throw new Error(
      "Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const { data, error } = await db
    .from("jobs")
    .select(JOB_ACTIVITY_COLUMNS)
    .in("status", ["active", "inactive"]);

  if (error) throw error;

  const jobs = (data ?? []) as unknown as JobActivityStatusInput[];
  const summary = evaluateJobActivityStatuses(jobs, options?.now);

  if (!options?.dryRun) {
    for (const update of summary.updates) {
      const { id, ...values } = update;
      const { error: updateError } = await db
        .from("jobs")
        .update(values)
        .eq("id", id);

      if (updateError) throw updateError;
    }
  }

  return {
    ...summary,
    dryRun: Boolean(options?.dryRun),
  };
}
