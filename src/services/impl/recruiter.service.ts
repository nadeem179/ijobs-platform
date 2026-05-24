import type { RecruiterService, RecruiterDashboardStats, RecruiterJobItem, RecruiterCandidateItem, PostJobData } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { ServiceError, wrapRequest } from "@/lib/errors";
import { getSupabaseClient } from "@/lib/supabase/client";
import { normalizeScreeningQuestions } from "@/types/screening";
import type { ScreeningAnswer } from "@/types/screening";

const delay = (ms = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

type SupabaseError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function throwSupabaseError(context: string, error: SupabaseError): never {
  console.error(context, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });

  throw new ServiceError({
    code: error.code || "SUPABASE_ERROR",
    message: error.message || "Supabase request failed.",
    status: 400,
    details: {
      details: error.details,
      hint: error.hint,
    },
  });
}

type RawStats = Partial<RecruiterDashboardStats>;

type RawRecruiterJob = {
  id: string;
  title: string;
  status?: RecruiterJobItem["status"] | null;
  applicants?: number | null;
  applicants_count?: number | null;
  newApplicants?: number | null;
  created_at?: string | null;
  postedAt?: string | null;
  views?: number | null;
  location?: string | null;
  locationType?: string | null;
  location_type?: string | null;
  job_type?: string | null;
  experience_level?: string | null;
  salaryMin?: number | null;
  salary_min?: number | null;
  salaryMax?: number | null;
  salary_max?: number | null;
  salaryCurrency?: string | null;
  salary_currency?: string | null;
  salaryPeriod?: string | null;
  salary_period?: string | null;
  skills?: string[] | null;
  description?: string | null;
  responsibilities?: string[] | null;
  requirements?: string[] | null;
  preferred_qualifications?: string[] | null;
  benefits?: string[] | null;
};

type RawCandidate = {
  id: string;
  jobId?: string | null;
  candidateId?: string | null;
  name: string;
  email?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
  headline?: string | null;
  bio?: string | null;
  currentRole?: string | null;
  experienceLevel?: string | null;
  experienceText?: string | null;
  projectText?: string | null;
  preferredLocations?: string[] | null;
  workModePreference?: string[] | string | null;
  jobTypePreference?: string[] | string | null;
  location?: string | null;
  appliedFor?: string | null;
  appliedAt?: string | null;
  appliedAtTimestamp?: string | null;
  lastActivityAt?: string | null;
  status?: RecruiterCandidateItem["status"] | null;
  matchScore?: number | null;
  skills?: string[] | null;
  experience?: string | number | null;
  viewed_at?: string | null;
  resume_downloaded_at?: string | null;
  shortlisted_at?: string | null;
  rejected_at?: string | null;
  hired_at?: string | null;
  screening_answers?: ScreeningAnswer[] | null;
  applied_at?: string | null;
};

type CandidateProfileSummary = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  headline?: string | null;
  about?: string | null;
  resume_url?: string | null;
};

function toStats(raw: RawStats): RecruiterDashboardStats {
  return {
    activeJobs: raw.activeJobs ?? 0,
    totalApplicants: raw.totalApplicants ?? 0,
    interviewsScheduled: raw.interviewsScheduled ?? 0,
    offersExtended: raw.offersExtended ?? 0,
    hireRate: raw.hireRate ?? 0,
  };
}

function toRecruiterJob(job: RawRecruiterJob): RecruiterJobItem {
  return {
    id: job.id,
    title: job.title,
    status: job.status || "active",
    applicants: job.applicants ?? job.applicants_count ?? 0,
    newApplicants: job.newApplicants ?? 0,
    postedAt: job.postedAt || (job.created_at ? "just now" : ""),
    views: job.views ?? 0,
    location: job.location ?? undefined,
    locationType: job.locationType ?? job.location_type ?? undefined,
    salaryMin: job.salaryMin ?? job.salary_min ?? undefined,
    salaryMax: job.salaryMax ?? job.salary_max ?? undefined,
    salaryCurrency: job.salaryCurrency ?? job.salary_currency ?? undefined,
    salaryPeriod: job.salaryPeriod ?? job.salary_period ?? undefined,
    skills: job.skills ?? [],
    description: job.description ?? undefined,
    responsibilities: job.responsibilities ?? [],
    requirements: job.requirements ?? [],
    preferredQualifications: job.preferred_qualifications ?? [],
    benefits: job.benefits ?? [],
    jobType: job.job_type ?? undefined,
    experienceLevel: job.experience_level ?? undefined,
  };
}

function normalizeScreeningAnswers(value: unknown): ScreeningAnswer[] {
  const parsed =
    typeof value === "string"
      ? (() => {
          try {
            return JSON.parse(value);
          } catch {
            return [];
          }
        })()
      : value;

  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((item): ScreeningAnswer[] => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const answer = row.answer;
    const question = typeof row.question === "string" ? row.question.trim() : "";
    if (!question) return [];

    return [
      {
        question_id:
          typeof row.question_id === "string" && row.question_id.trim()
            ? row.question_id
            : question,
        question,
        type:
          row.type === "checkboxes" ||
          row.type === "multiple_choice" ||
          row.type === "single_choice" ||
          row.type === "text"
            ? row.type
            : "text",
        answer: Array.isArray(answer)
          ? answer.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          : typeof answer === "string"
            ? answer
            : "",
      },
    ];
  });
}

function relativeDate(value: string | null | undefined) {
  if (!value) return "";
  const created = new Date(value);
  if (Number.isNaN(created.getTime())) return "";

  const diffMs = Date.now() - created.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  return `${diffDays} days ago`;
}

function stringifyProfileText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(stringifyProfileText).filter(Boolean).join(" ");
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).map(stringifyProfileText).filter(Boolean).join(" ");
  }
  return "";
}

async function getCurrentRecruiter() {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error("You must be signed in to post jobs.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,role,full_name,email")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throwSupabaseError("[JOBS] Profile lookup failed", profileError);
  if (profile?.role !== "recruiter") {
    throw new Error("Only recruiter accounts can create jobs.");
  }

  const { data: recruiterProfile, error: recruiterProfileError } = await supabase
    .from("recruiter_profiles")
    .select("id,user_id,company_name,company_website,company_size,industry,hiring_title,company_logo_url,location,phone")
    .eq("user_id", user.id)
    .maybeSingle();
  if (recruiterProfileError) {
    throwSupabaseError("[JOBS] Recruiter profile lookup failed", recruiterProfileError);
  }

  const company =
    recruiterProfile?.company_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    profile.full_name ||
    profile.email ||
    user.email ||
    "Recruiter";

  return { supabase, user, profile, recruiterProfile, company };
}

function toCandidate(candidate: RawCandidate): RecruiterCandidateItem {
  return {
    id: candidate.id,
    jobId: candidate.jobId || "",
    candidateId: candidate.candidateId || "",
    name: candidate.name,
    email: candidate.email || "",
    avatarUrl: candidate.avatarUrl ?? undefined,
    resumeUrl: candidate.resumeUrl ?? undefined,
    headline: candidate.headline ?? undefined,
    bio: candidate.bio ?? undefined,
    currentRole: candidate.currentRole ?? undefined,
    experienceLevel: candidate.experienceLevel ?? undefined,
    experienceText: candidate.experienceText ?? undefined,
    projectText: candidate.projectText ?? undefined,
    preferredLocations: candidate.preferredLocations ?? undefined,
    workModePreference: candidate.workModePreference ?? undefined,
    jobTypePreference: candidate.jobTypePreference ?? undefined,
    location: candidate.location ?? undefined,
    appliedFor: candidate.appliedFor || candidate.headline || "",
    appliedAt: candidate.appliedAt || "",
    appliedAtTimestamp: candidate.appliedAtTimestamp ?? undefined,
    lastActivityAt: candidate.lastActivityAt ?? undefined,
    status: candidate.status || "applied",
    matchScore: candidate.matchScore ?? 0,
    skills: candidate.skills || [],
    experience: candidate.experience ? String(candidate.experience) : "",
    viewedAt: candidate.viewed_at ?? undefined,
    resumeDownloadedAt: candidate.resume_downloaded_at ?? undefined,
    shortlistedAt: candidate.shortlisted_at ?? undefined,
    rejectedAt: candidate.rejected_at ?? undefined,
    hiredAt: candidate.hired_at ?? undefined,
    screeningAnswers: candidate.screening_answers ?? [],
  };
}

export const recruiterService: RecruiterService = {
  async getStats(): AsyncResult<RecruiterDashboardStats> {
    return wrapRequest(async () => {
      const recruiter = await getCurrentRecruiter();
      if (recruiter) {
        const activeQuery = await selectRecruiterJobs(recruiter, "id", true, "active");
        const { count: activeJobs, error: activeError } = activeQuery;
        if (activeError) throwSupabaseError("[JOBS] Active jobs count failed", activeError);

        const { data: jobs, error: jobsError } = await selectRecruiterJobs(recruiter, "id");
        if (jobsError) throwSupabaseError("[JOBS] Recruiter jobs lookup failed", jobsError);

        const jobIds = ((jobs ?? []) as unknown as Array<{ id: string }>).map(
          (job) => job.id
        );
        const { count: totalApplicants, error: appError } = jobIds.length
          ? await recruiter.supabase
              .from("applications")
              .select("id", { count: "exact", head: true })
              .in("job_id", jobIds)
          : { count: 0, error: null };
        if (appError) throwSupabaseError("[JOBS] Applications count failed", appError);

        return {
          activeJobs: activeJobs ?? 0,
          totalApplicants: totalApplicants ?? 0,
          interviewsScheduled: 0,
          offersExtended: 0,
          hireRate: 0,
        };
      }
      return toStats({});
    });
  },

  async getJobs(): AsyncResult<RecruiterJobItem[]> {
    return wrapRequest(async () => {
      const recruiter = await getCurrentRecruiter();
      if (recruiter) {
        let { data, error } = await selectRecruiterJobs(
          recruiter,
          "id,title,status,applicants_count,created_at,location,location_type,salary_min,salary_max,salary_currency,salary_period,skills"
        );
        if (error && isSchemaColumnError(error)) {
          const fallback = await selectRecruiterJobs(
            recruiter,
            "id,title,status,created_at"
          );
          data = fallback.data;
          error = fallback.error;
        }
        if (error) throwSupabaseError("[JOBS] Recruiter jobs load failed", error);
        const mappedJobs = ((data ?? []) as unknown as RawRecruiterJob[]).map(toRecruiterJob);
        const jobIds = mappedJobs.map((job) => job.id);
        if (jobIds.length === 0) return mappedJobs;

        const { data: applicationCounts, error: applicationCountsError } = await recruiter.supabase
          .from("applications")
          .select("job_id")
          .in("job_id", jobIds);
        if (applicationCountsError && !isSchemaColumnError(applicationCountsError)) {
          throwSupabaseError("[JOBS] Recruiter job application counts failed", applicationCountsError);
        }

        const counts = new Map<string, number>();
        ((applicationCounts ?? []) as Array<{ job_id?: string | null }>).forEach((application) => {
          if (!application.job_id) return;
          counts.set(application.job_id, (counts.get(application.job_id) ?? 0) + 1);
        });

        return mappedJobs.map((job) => ({
          ...job,
          applicants: counts.get(job.id) ?? job.applicants,
        }));
      }
      return [];
    });
  },

  async getCandidates(jobId?: string): AsyncResult<RecruiterCandidateItem[]> {
    return wrapRequest(async () => {
      const recruiter = await getCurrentRecruiter();
      if (recruiter) {
        const { data: jobs, error: jobsError } = await selectRecruiterJobs(
          recruiter,
          "id,title",
          false,
          undefined,
          jobId
        );
        if (jobsError) throwSupabaseError("[APPLICATIONS] Recruiter jobs lookup failed", jobsError);

        const recruiterJobs = ((jobs ?? []) as unknown as RawRecruiterJob[]);
        if (jobId && recruiterJobs.length === 0) {
          throw new Error("Job not found or not owned by this recruiter.");
        }
        const jobTitleById = new Map(recruiterJobs.map((job) => [job.id, job.title || "Job"]));
        const jobIds = recruiterJobs.map((job) => job.id);
        if (jobIds.length === 0) return [];

        let applications: unknown[] | null = null;
        let applicationsError: SupabaseError | null = null;
        const applicationSelect =
          "id,job_id,job_external_id,user_id,candidate_id,status,created_at,resume_url,screening_answers,viewed_at,resume_downloaded_at,shortlisted_at,rejected_at,hired_at";
        const fallbackApplicationSelect =
          "id,job_id,job_external_id,user_id,candidate_id,status,created_at,viewed_at,resume_downloaded_at,shortlisted_at,rejected_at,hired_at";
        const liveApplicationSelect =
          "id,job_id,candidate_id,status,applied_at,screening_answers,viewed_at,resume_downloaded_at,shortlisted_at";
        const loadApplications = async (select: string) => {
          const byJobIdQuery = recruiter.supabase
            .from("applications")
            .select(select);
          const byJobId = await (jobId
            ? byJobIdQuery.eq("job_id", jobId)
            : byJobIdQuery.in("job_id", jobIds)
          ).order("created_at", { ascending: false });
          if (byJobId.error) return byJobId;

          if (jobId) {
            return { data: byJobId.data ?? [], error: null };
          }

          const byExternalId = await recruiter.supabase
            .from("applications")
            .select(select)
            .in("job_external_id", jobIds)
            .order("created_at", { ascending: false });
          if (byExternalId.error && !isSchemaColumnError(byExternalId.error)) {
            return byExternalId;
          }

          const rows = [
            ...((byJobId.data ?? []) as unknown[]),
            ...((byExternalId.data ?? []) as unknown[]),
          ];
          const unique = new Map<string, unknown>();
          rows.forEach((row) => {
            const id = (row as { id?: string }).id;
            if (id) unique.set(id, row);
          });
          return { data: Array.from(unique.values()), error: null };
        };

        const applicationsResult = await loadApplications(applicationSelect);
        applications = (applicationsResult.data ?? null) as unknown[] | null;
        applicationsError = applicationsResult.error;
        if (applicationsError && isSchemaColumnError(applicationsError)) {
          const fallback = await loadApplications(fallbackApplicationSelect);
          applications = (fallback.data ?? null) as unknown[] | null;
          applicationsError = fallback.error;
        }
        if (applicationsError && isSchemaColumnError(applicationsError)) {
          const liveFallbackQuery = recruiter.supabase
            .from("applications")
            .select(liveApplicationSelect);
          const liveFallback = await (jobId
            ? liveFallbackQuery.eq("job_id", jobId)
            : liveFallbackQuery.in("job_id", jobIds)
          ).order("applied_at", { ascending: false });
          applications = (liveFallback.data ?? null) as unknown[] | null;
          applicationsError = liveFallback.error;
        }
        if (applicationsError) {
          throwSupabaseError("[APPLICATIONS] Recruiter applications load failed", applicationsError);
        }

        const rows = ((applications ?? []) as unknown as Array<{
          id: string;
          job_id?: string | null;
          job_external_id?: string | null;
          user_id?: string | null;
          candidate_id?: string | null;
          status?: string | null;
          created_at?: string | null;
          applied_at?: string | null;
          resume_url?: string | null;
          screening_answers?: ScreeningAnswer[] | null;
          viewed_at?: string | null;
          resume_downloaded_at?: string | null;
          shortlisted_at?: string | null;
          rejected_at?: string | null;
          hired_at?: string | null;
        }>);

        const blockedCandidateIds = new Set<string>();
        const { data: blockedCompanies, error: blockedCompaniesError } = await recruiter.supabase
          .from("blocked_companies")
          .select("candidate_id")
          .eq("company_name", recruiter.company);
        if (blockedCompaniesError && !isSchemaColumnError(blockedCompaniesError)) {
          throwSupabaseError("[APPLICATIONS] Blocked companies lookup failed", blockedCompaniesError);
        }
        ((blockedCompanies ?? []) as Array<{ candidate_id?: string | null }>).forEach((block) => {
          if (block.candidate_id) blockedCandidateIds.add(block.candidate_id);
        });

        const visibleRows = rows.filter((row) => {
          const candidateId = row.candidate_id || row.user_id;
          return !candidateId || !blockedCandidateIds.has(candidateId);
        });
        const identityIds = Array.from(
          new Set(
            visibleRows.flatMap((row) => [row.candidate_id, row.user_id]).filter(Boolean)
          )
        ) as string[];

        let profiles: CandidateProfileSummary[] | null = null;
        let profilesError: SupabaseError | null = null;
        const profilesResult = identityIds.length
          ? await recruiter.supabase
              .from("profiles")
              .select("id,full_name,email,avatar_url,headline,about,resume_url")
              .in("id", identityIds)
          : { data: [], error: null };
        profiles = profilesResult.data as CandidateProfileSummary[] | null;
        profilesError = profilesResult.error;
        if (profilesError && isSchemaColumnError(profilesError) && identityIds.length) {
          const fallback = await recruiter.supabase
            .from("profiles")
            .select("id,full_name,email,avatar_url,resume_url")
            .in("id", identityIds);
          profiles = fallback.data as CandidateProfileSummary[] | null;
          profilesError = fallback.error;
        }
        if (profilesError) {
          throwSupabaseError("[APPLICATIONS] Candidate profiles load failed", profilesError);
        }

        let candidateProfiles: unknown[] | null = [];
        let candidateProfilesError: SupabaseError | null = null;
        if (identityIds.length) {
          const candidateProfileFilter = [
            `user_id.in.(${identityIds.join(",")})`,
            `id.in.(${identityIds.join(",")})`,
          ].join(",");
          const candidateProfileResult = await recruiter.supabase
            .from("candidate_profiles")
            .select("id,user_id,headline,summary,current_title,designation,resume_url,avatar_url,profile_image_url,phone,location,skills,total_experience_years,total_experience_months,experience_level,preferred_locations,work_mode_preference,job_type_preference,experiences,projects")
            .or(candidateProfileFilter);
          candidateProfiles = candidateProfileResult.data as unknown[] | null;
          candidateProfilesError = candidateProfileResult.error;

          if (candidateProfilesError && isSchemaColumnError(candidateProfilesError)) {
            const fallback = await recruiter.supabase
              .from("candidate_profiles")
              .select("id,user_id,headline,current_title,designation,resume_url,avatar_url,profile_image_url,phone,location,skills,total_experience_years,total_experience_months")
              .or(candidateProfileFilter);
            candidateProfiles = fallback.data as unknown[] | null;
            candidateProfilesError = fallback.error;
          }
        }
        if (candidateProfilesError && !isSchemaColumnError(candidateProfilesError)) {
          throwSupabaseError("[APPLICATIONS] Candidate profile details load failed", candidateProfilesError);
        }

        const profileById = new Map(
          (profiles ?? []).map((profile) => [profile.id, profile])
        );
        const candidateProfileById = new Map<string, {
          id?: string | null;
          user_id?: string | null;
          headline?: string | null;
          summary?: string | null;
          current_title?: string | null;
          designation?: string | null;
          resume_url?: string | null;
          avatar_url?: string | null;
          profile_image_url?: string | null;
          location?: string | null;
          skills?: string[] | null;
          total_experience_years?: number | null;
          total_experience_months?: number | null;
          experience_level?: string | null;
          preferred_locations?: string[] | null;
          work_mode_preference?: string[] | string | null;
          job_type_preference?: string[] | string | null;
          experiences?: unknown[] | null;
          projects?: unknown[] | null;
        }>();
        ((candidateProfiles ?? []) as Array<{
            id?: string | null;
            user_id: string;
            headline?: string | null;
            summary?: string | null;
            current_title?: string | null;
            designation?: string | null;
            resume_url?: string | null;
            avatar_url?: string | null;
            profile_image_url?: string | null;
            location?: string | null;
            skills?: string[] | null;
            total_experience_years?: number | null;
            total_experience_months?: number | null;
            experience_level?: string | null;
            preferred_locations?: string[] | null;
            work_mode_preference?: string[] | string | null;
            job_type_preference?: string[] | string | null;
            experiences?: unknown[] | null;
            projects?: unknown[] | null;
          }>).forEach((profile) => {
            if (profile.user_id) candidateProfileById.set(profile.user_id, profile);
            if (profile.id) candidateProfileById.set(profile.id, profile);
          });

        return visibleRows.map((row) => {
          const rowJobId = row.job_id || row.job_external_id || "";
          const candidateProfile =
            candidateProfileById.get(row.candidate_id || "") ||
            candidateProfileById.get(row.user_id || "");
          const profile =
            profileById.get(row.user_id || "") ||
            profileById.get(row.candidate_id || "") ||
            (candidateProfile?.user_id ? profileById.get(candidateProfile.user_id) : undefined);
          const headline =
            candidateProfile?.headline ||
            candidateProfile?.designation ||
            candidateProfile?.current_title ||
            profile?.headline ||
            "";
          const years = candidateProfile?.total_experience_years;
          const months = candidateProfile?.total_experience_months;
          const experience =
            typeof years === "number" || typeof months === "number"
              ? `${years ?? 0}y ${months ?? 0}m`
              : "";
          const appliedTimestamp = row.created_at || row.applied_at || "";
          const lastActivityAt = [
            row.hired_at,
            row.rejected_at,
            row.shortlisted_at,
            row.resume_downloaded_at,
            row.viewed_at,
            appliedTimestamp,
          ].find(Boolean) || "";

          return toCandidate({
            id: row.id,
            jobId: rowJobId,
            candidateId: row.candidate_id || row.user_id || "",
            name: profile?.full_name || profile?.email || "Candidate",
            email: profile?.email || "",
            avatarUrl: candidateProfile?.profile_image_url || candidateProfile?.avatar_url || profile?.avatar_url,
            resumeUrl: row.resume_url || candidateProfile?.resume_url || profile?.resume_url,
            headline,
            bio: candidateProfile?.summary || profile?.about,
            currentRole: candidateProfile?.current_title || candidateProfile?.designation || "",
            experienceLevel: candidateProfile?.experience_level,
            experienceText: stringifyProfileText(candidateProfile?.experiences),
            projectText: stringifyProfileText(candidateProfile?.projects),
            preferredLocations: candidateProfile?.preferred_locations,
            workModePreference: candidateProfile?.work_mode_preference,
            jobTypePreference: candidateProfile?.job_type_preference,
            location: candidateProfile?.location,
            appliedFor: jobTitleById.get(rowJobId) || "Job",
            appliedAt: relativeDate(appliedTimestamp),
            appliedAtTimestamp: appliedTimestamp,
            lastActivityAt,
            status: normalizeApplicationStatus(row.status),
            matchScore: 0,
            skills: candidateProfile?.skills || [],
            experience,
            viewed_at: row.viewed_at,
            resume_downloaded_at: row.resume_downloaded_at,
            shortlisted_at: row.shortlisted_at,
            rejected_at: row.rejected_at,
            hired_at: row.hired_at,
            screening_answers: normalizeScreeningAnswers(row.screening_answers),
          });
        });
      }
      return [];
    });
  },

  async getJob(jobId: string): AsyncResult<RecruiterJobItem> {
    return wrapRequest(async () => {
      const recruiter = await getCurrentRecruiter();
      if (!recruiter) {
        throw new Error("You must be signed in as a recruiter to view this job.");
      }

      const fullSelect =
        "id,title,status,applicants_count,created_at,location,location_type,job_type,experience_level,salary_min,salary_max,salary_currency,salary_period,skills,description,responsibilities,requirements,preferred_qualifications,benefits";
      const fallbackSelect =
        "id,title,status,created_at,location,location_type,salary_min,salary_max,salary_currency,salary_period,skills";
      let { data, error } = await selectRecruiterJobs(
        recruiter,
        fullSelect,
        false,
        undefined,
        jobId
      );

      if (error && isSchemaColumnError(error)) {
        const fallback = await selectRecruiterJobs(
          recruiter,
          fallbackSelect,
          false,
          undefined,
          jobId
        );
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throwSupabaseError("[JOBS] Recruiter job load failed", error);
      const row = ((data ?? []) as unknown as RawRecruiterJob[])[0];
      if (!row) throw new Error("Job not found or not owned by this recruiter.");

      const job = toRecruiterJob(row);
      const { count, error: countError } = await recruiter.supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("job_id", jobId);
      if (countError && !isSchemaColumnError(countError)) {
        throwSupabaseError("[JOBS] Recruiter job application count failed", countError);
      }

      return {
        ...job,
        applicants: count ?? job.applicants,
      };
    });
  },

  async postJob(_data: PostJobData): AsyncResult<void> {
    return wrapRequest(async () => {
      const recruiter = await getCurrentRecruiter();
      if (!recruiter) {
        await delay(700);
        return;
      }

      const salaryMin = _data.salaryMin;
      const salaryMax = _data.salaryMax;
      const status = _data.status || "active";
      const screeningQuestions = normalizeScreeningQuestions(_data.screeningQuestions);
      const payload = {
        recruiter_id: recruiter.user.id,
        recruiter_profile_id: recruiter.user.id,
        title: _data.title,
        company: _data.company || recruiter.company,
        company_name: _data.company || recruiter.company,
        company_logo: _data.companyLogo || (_data.company || recruiter.company).slice(0, 1).toUpperCase(),
        company_description: _data.companyDescription || "",
        company_size: _data.companySize || recruiter.recruiterProfile?.company_size || "",
        company_industry: _data.companyIndustry || recruiter.recruiterProfile?.industry || "",
        location: _data.location,
        location_type:
          _data.locationType === "Hybrid" || _data.locationType === "On-site"
            ? _data.locationType
            : "Remote",
        job_type: _data.jobType,
        salary_min: salaryMin,
        salary_max: salaryMax,
        salary_range: `${_data.currency} ${salaryMin} - ${salaryMax}`,
        salary_currency: _data.currency,
        salary_period: _data.salaryPeriod || "year",
        experience_level: _data.experienceLevel || _data.experience,
        skills: _data.skills,
        description: _data.description,
        responsibilities: _data.responsibilities,
        screening_questions: screeningQuestions,
        requirements:
          _data.requirements.length > 0
            ? _data.requirements
            : [],
        preferred_qualifications: _data.preferredQualifications ?? [],
        benefits: _data.benefits,
        status,
      };

      const attempts = [
        payload,
        omit(payload, ["recruiter_id"]),
        omit(payload, ["recruiter_profile_id"]),
        omit(payload, [
          "recruiter_profile_id",
          "company_name",
          "job_type",
          "salary_range",
          "screening_questions",
        ]),
        omit(payload, [
          "recruiter_profile_id",
          "company_name",
          "job_type",
          "salary_range",
          "screening_questions",
          "responsibilities",
          "requirements",
          "benefits",
        ]),
      ];

      let lastError: SupabaseError | null = null;
      for (const attempt of attempts) {
        const { error } = await recruiter.supabase.from("jobs").insert(attempt);
        if (!error) return;
        lastError = error;
      }

      if (lastError) {
        throwSupabaseError("[JOBS] Create failed", lastError);
      }
    });
  },

  async updateJobStatus(): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(300);
    });
  },

  async updateApplicationStatus(applicationId: string, status: "shortlisted" | "rejected" | "hired"): AsyncResult<void> {
    return wrapRequest(async () => {
      const recruiter = await getCurrentRecruiter();
      if (!recruiter) {
        await delay(300);
        return;
      }

      const now = new Date().toISOString();
      const timestampColumn =
        status === "shortlisted"
          ? "shortlisted_at"
          : status === "rejected"
            ? "rejected_at"
            : "hired_at";

      await updateRecruiterApplication(recruiter, applicationId, [
        { status, updated_at: now, [timestampColumn]: now },
        { status, [timestampColumn]: now },
        { status, updated_at: now },
        { status },
      ]);
    });
  },

  async updateApplicationEvent(applicationId: string, event: "viewed" | "resume_downloaded"): AsyncResult<void> {
    return wrapRequest(async () => {
      const recruiter = await getCurrentRecruiter();
      if (!recruiter) {
        throw new Error("You must be signed in as a recruiter to update applications.");
      }

      const now = new Date().toISOString();
      const timestampColumn = event === "viewed" ? "viewed_at" : "resume_downloaded_at";
      const nextStatus = event === "viewed" ? "viewed" : "resume_downloaded";

      await updateRecruiterApplicationEvent(
        recruiter,
        applicationId,
        timestampColumn,
        nextStatus,
        now
      );
    });
  },
};

type CurrentRecruiter = NonNullable<Awaited<ReturnType<typeof getCurrentRecruiter>>>;

function omit<T extends Record<string, unknown>>(value: T, keys: string[]) {
  const next = { ...value };
  keys.forEach((key) => {
    delete next[key];
  });
  return next;
}

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter(Boolean))) as string[];
}

async function selectRecruiterJobs(
  recruiter: CurrentRecruiter,
  columns: string,
  head = false,
  status?: string,
  jobId?: string
) {
  const userId = recruiter.user.id;
  const recruiterProfileId =
    (recruiter.recruiterProfile as { id?: string | null } | null)?.id ?? null;
  const ownerIds = uniqueValues([userId, recruiterProfileId]);
  const ownedFilter = ownerIds
    .flatMap((id) => [`recruiter_profile_id.eq.${id}`, `recruiter_id.eq.${id}`])
    .join(",");

  const runOwned = async () => {
    let query = recruiter.supabase
      .from("jobs")
      .select(columns, head ? { count: "exact", head: true } : undefined)
      .or(ownedFilter);

    if (status) query = query.eq("status", status);
    if (jobId) query = query.eq("id", jobId);
    if (!head) query = query.order("created_at", { ascending: false });

    return query;
  };

  const run = async (column: "recruiter_profile_id" | "recruiter_id") => {
    let query = recruiter.supabase
      .from("jobs")
      .select(columns, head ? { count: "exact", head: true } : undefined)
      .eq(column, userId);

    if (status) query = query.eq("status", status);
    if (jobId) query = query.eq("id", jobId);
    if (!head) query = query.order("created_at", { ascending: false });

    return query;
  };

  const primary = await runOwned();
  if (!primary.error) return primary;

  const message = primary.error.message || "";
  const shouldFallback =
    primary.error.code === "42703" ||
    message.includes("recruiter_profile_id") ||
    message.includes("schema cache");

  return shouldFallback ? run("recruiter_id") : primary;
}

function isSchemaColumnError(error: SupabaseError) {
  const message = error.message || "";
  return (
    error.code === "42703" ||
    message.includes("schema cache") ||
    message.includes("Could not find the") ||
    message.includes("column")
  );
}

function normalizeApplicationStatus(value: string | null | undefined): RecruiterCandidateItem["status"] {
  if (
    value === "viewed" ||
    value === "resume_downloaded" ||
    value === "shortlisted" ||
    value === "rejected" ||
    value === "interviewing" ||
    value === "hired"
  ) {
    return value;
  }
  return "applied";
}

async function updateRecruiterApplication(
  recruiter: CurrentRecruiter,
  applicationId: string,
  attempts: Array<Record<string, string>>
) {
  let lastError: SupabaseError | null = null;

  for (const attempt of attempts) {
    const { data, error } = await recruiter.supabase
      .from("applications")
      .update(attempt)
      .eq("id", applicationId)
      .select("id")
      .maybeSingle();

    if (!error && data) return;
    if (!error && !data) {
      throw new Error("Application not found or not owned by this recruiter.");
    }
    lastError = error;
  }

  if (lastError) {
    throwSupabaseError("[APPLICATIONS] Update failed", lastError);
  }
}

async function updateRecruiterApplicationEvent(
  recruiter: CurrentRecruiter,
  applicationId: string,
  timestampColumn: "viewed_at" | "resume_downloaded_at",
  status: "viewed" | "resume_downloaded",
  now: string
) {
  const { data, error } = await recruiter.supabase
    .from("applications")
    .update({ [timestampColumn]: now, status, updated_at: now })
    .eq("id", applicationId)
    .in("status", ["applied", "viewed"])
    .select("id")
    .maybeSingle();

  if (!error && data) return;
  if (error && !isSchemaColumnError(error)) {
    throwSupabaseError("[APPLICATIONS] Event status update failed", error);
  }

  await updateRecruiterApplication(recruiter, applicationId, [
    { [timestampColumn]: now, status },
    { [timestampColumn]: now, updated_at: now },
    { [timestampColumn]: now },
  ]);
}
