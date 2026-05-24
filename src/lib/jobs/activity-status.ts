export const JOB_STATUSES = [
  "active",
  "inactive",
  "paused",
  "closed",
  "filled",
] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];

export type JobActivityStatusInput = {
  id: string;
  status: JobStatus | string;
  created_at: string;
  updated_at?: string | null;
  last_recruiter_activity_at?: string | null;
  confirmation_due_at?: string | null;
  confirmation_requested_at?: string | null;
  confirmed_at?: string | null;
  requires_confirmation?: boolean | null;
  inactive_reason?: string | null;
};

export type JobActivityStatusUpdate = {
  id: string;
  status?: JobStatus;
  requires_confirmation?: boolean;
  confirmation_requested_at?: string;
  inactive_reason?: string | null;
  closed_at?: string;
  updated_at: string;
};

export type JobActivityStatusSummary = {
  checked: number;
  markedInactive: number;
  confirmationRequested: number;
  closed: number;
  updates: JobActivityStatusUpdate[];
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INACTIVITY_DAYS = 5;
const CONFIRMATION_DAYS = 30;

const MANAGED_STATUSES = new Set<JobStatus>(["active", "inactive"]);

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBefore(now: Date, then: Date): number {
  return (now.getTime() - then.getTime()) / MS_PER_DAY;
}

function isConfirmationStillPending(job: JobActivityStatusInput): boolean {
  if (!job.requires_confirmation || !job.confirmation_requested_at) return false;

  const requestedAt = toDate(job.confirmation_requested_at);
  const confirmedAt = toDate(job.confirmed_at);

  if (!requestedAt) return false;
  return !confirmedAt || confirmedAt.getTime() < requestedAt.getTime();
}

export function getNextJobActivityStatus(
  job: JobActivityStatusInput,
  now = new Date()
): JobActivityStatusUpdate | null {
  if (!MANAGED_STATUSES.has(job.status as JobStatus)) return null;

  const nowIso = now.toISOString();
  const createdAt = toDate(job.created_at);
  const lastActivityAt =
    toDate(job.last_recruiter_activity_at) ??
    toDate(job.updated_at) ??
    createdAt;
  const confirmationDueAt =
    toDate(job.confirmation_due_at) ??
    (createdAt
      ? new Date(createdAt.getTime() + CONFIRMATION_DAYS * MS_PER_DAY)
      : null);

  const update: JobActivityStatusUpdate = {
    id: job.id,
    updated_at: nowIso,
  };

  if (isConfirmationStillPending(job) && confirmationDueAt && confirmationDueAt <= now) {
    return {
      ...update,
      status: "closed",
      requires_confirmation: false,
      inactive_reason: null,
      closed_at: nowIso,
    };
  }

  if (confirmationDueAt && confirmationDueAt <= now) {
    update.requires_confirmation = true;
    update.confirmation_requested_at = nowIso;
  }

  if (
    job.status === "active" &&
    lastActivityAt &&
    daysBefore(now, lastActivityAt) >= INACTIVITY_DAYS
  ) {
    update.status = "inactive";
    update.inactive_reason = "recruiter_inactive_5_days";
  }

  return Object.keys(update).length > 2 ? update : null;
}

export function evaluateJobActivityStatuses(
  jobs: JobActivityStatusInput[],
  now = new Date()
): JobActivityStatusSummary {
  const updates = jobs
    .map((job) => getNextJobActivityStatus(job, now))
    .filter((update): update is JobActivityStatusUpdate => update !== null);

  return {
    checked: jobs.length,
    markedInactive: updates.filter((update) => update.status === "inactive").length,
    confirmationRequested: updates.filter(
      (update) => update.requires_confirmation && update.confirmation_requested_at
    ).length,
    closed: updates.filter((update) => update.status === "closed").length,
    updates,
  };
}

