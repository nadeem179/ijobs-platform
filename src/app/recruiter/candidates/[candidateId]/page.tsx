"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  ExternalLink,
  Mail,
  MapPin,
} from "lucide-react";
import { RecruiterGuard } from "@/components/navigation/recruiter-guard";
import { Button } from "@/components/ui/button";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { getSupabaseClient } from "@/lib/supabase/client";
import { isSchemaQueryError } from "@/lib/supabase/query-errors";
import type { ScreeningAnswer } from "@/types/screening";

type ProfileRow = {
  id: string;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  headline?: string | null;
  about?: string | null;
  location?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  resume_url?: string | null;
  experience_level?: string | null;
  skills?: unknown;
};

type ExperiencePayload = {
  title?: string | null;
  company?: string | null;
  employment_type?: string | null;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  currently_working?: boolean | null;
  description?: string | null;
  achievements?: string | null;
  skills_used?: string[] | null;
};

type EducationPayload = {
  degree?: string | null;
  institution?: string | null;
  field_of_study?: string | null;
  field?: string | null;
  start_year?: string | null;
  end_year?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  grade?: string | null;
  description?: string | null;
};

type CertificationPayload = {
  name?: string | null;
  issuer?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  credential_id?: string | null;
  credential_url?: string | null;
};

type ProjectPayload = {
  name?: string | null;
  role?: string | null;
  description?: string | null;
  tech_stack?: string[] | null;
  project_url?: string | null;
  url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

type CandidateProfileRow = {
  id?: string | null;
  user_id?: string | null;
  avatar_url?: string | null;
  profile_image_url?: string | null;
  headline?: string | null;
  summary?: string | null;
  current_title?: string | null;
  designation?: string | null;
  phone?: string | null;
  location?: string | null;
  resume_url?: string | null;
  skills?: unknown;
  tools?: unknown;
  languages?: unknown;
  total_experience?: string | null;
  total_experience_years?: number | null;
  total_experience_months?: number | null;
  current_company?: string | null;
  notice_period?: string | null;
  expected_salary?: string | null;
  preferred_locations?: unknown;
  job_type_preference?: unknown;
  work_mode_preference?: unknown;
  industry?: string | null;
  industries?: unknown;
  functional_area?: string | null;
  experience_level?: string | null;
  experiences?: unknown;
  education?: unknown;
  certifications?: unknown;
  projects?: unknown;
  portfolioLinks?: unknown;
  portfolio_links?: unknown;
  links?: unknown;
  linkedin_url?: string | null;
  github_url?: string | null;
  dribbble_url?: string | null;
  portfolio_url?: string | null;
  website_url?: string | null;
};

type ApplicationStatus =
  | "applied"
  | "viewed"
  | "resume_downloaded"
  | "shortlisted"
  | "rejected"
  | "interviewing"
  | "hired";

type ApplicationRow = {
  id: string;
  job_id?: string | null;
  candidate_id?: string | null;
  user_id?: string | null;
  status?: ApplicationStatus | null;
  created_at?: string | null;
  applied_at?: string | null;
  viewed_at?: string | null;
  resume_downloaded_at?: string | null;
  shortlisted_at?: string | null;
  rejected_at?: string | null;
  hired_at?: string | null;
  screening_answers?: unknown;
};

type JobRow = {
  id: string;
  title?: string | null;
  recruiter_id?: string | null;
  recruiter_profile_id?: string | null;
};

const profileSelect =
  "id,full_name,name,email,headline,about,location,phone,avatar_url,resume_url,experience_level,skills";
const profileFallbackSelect =
  "id,full_name,name,email,headline,location,resume_url";
const candidateProfileSelect =
  "id,user_id,resume_url,avatar_url,profile_image_url,headline,summary,phone,location,total_experience,total_experience_years,total_experience_months,current_title,current_company,notice_period,expected_salary,preferred_locations,job_type_preference,work_mode_preference,skills,tools,languages,industry,industries,functional_area,experience_level,experiences,education,certifications,projects";
const candidateProfileFallbackSelect =
  "id,user_id,resume_url,headline,summary,location,total_experience,total_experience_years,total_experience_months,current_title,current_company,experience_level,skills,tools";
const candidateProfileLinksSelect =
  "id,user_id,linkedin_url,github_url,dribbble_url,portfolio_url";
const candidateProfileLinksWithWebsiteSelect =
  "id,user_id,linkedin_url,github_url,dribbble_url,portfolio_url,website_url";
const candidateProfileRichSelect =
  "id,user_id,experiences,education,certifications,projects";
const applicationSelect =
  "id,job_id,candidate_id,user_id,status,created_at,applied_at,viewed_at,resume_downloaded_at,shortlisted_at,rejected_at,hired_at,screening_answers";
const applicationFallbackSelect =
  "id,job_id,candidate_id,status,created_at,applied_at,viewed_at,resume_downloaded_at,shortlisted_at,rejected_at,hired_at,screening_answers";

const statusStyles: Record<string, string> = {
  applied: "bg-blue-50 text-blue-600",
  viewed: "bg-slate-100 text-slate-700",
  resume_downloaded: "bg-slate-100 text-slate-700",
  shortlisted: "bg-purple-50 text-purple-600",
  rejected: "bg-red-50 text-red-600",
  interviewing: "bg-zinc-100 text-zinc-700",
  hired: "bg-emerald-50 text-emerald-600",
};

const terminalStatuses = new Set<ApplicationStatus>([
  "shortlisted",
  "rejected",
  "interviewing",
  "hired",
]);

function uniqueTruthy(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
    )
  );
}

function buildIdentityFilter(ids: string[], includeUserId: boolean) {
  return ids
    .flatMap((id) => [
      `candidate_id.eq.${id}`,
      ...(includeUserId ? [`user_id.eq.${id}`] : []),
    ])
    .join(",");
}

function buildCandidateProfileIdentityFilter(ids: string[]) {
  return [
    `id.in.(${ids.join(",")})`,
    `user_id.in.(${ids.join(",")})`,
  ].join(",");
}

function relativeDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatStatus(status?: string | null) {
  if (!status) return "Applied";
  if (status === "resume_downloaded") return "Resume downloaded";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatExperience(candidate?: CandidateProfileRow | null) {
  if (!candidate) return "";
  if (candidate.total_experience) return candidate.total_experience;
  const years = candidate.total_experience_years;
  const months = candidate.total_experience_months;
  if (typeof years === "number" || typeof months === "number") {
    return `${years ?? 0}y ${months ?? 0}m`;
  }
  return candidate.experience_level || "";
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
    const question = typeof row.question === "string" ? row.question.trim() : "";
    if (!question) return [];
    const answer = row.answer;

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
          ? answer.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
          : typeof answer === "string"
            ? answer
            : "",
      },
    ];
  });
}

function renderAnswer(answer: string | string[]) {
  if (!Array.isArray(answer)) return <span>{answer || "No answer"}</span>;
  const values = answer.filter(Boolean);
  if (values.length === 0) return <span>No answer</span>;
  return (
    <span className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span key={value} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {value}
        </span>
      ))}
    </span>
  );
}

function parseJsonLike(value: unknown) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || !["[", "{"].includes(trimmed[0])) return value;
  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    return value;
  }
}

function objectFromString<T>(value: string, stringKey: string): T {
  return { [stringKey]: value } as T;
}

function normalizeObjectArray<T>(value: unknown, stringKey = "name"): T[] {
  const parsed = parseJsonLike(value);
  if (Array.isArray(parsed)) {
    return parsed.flatMap((item): T[] => {
      if (item && typeof item === "object") return [item as T];
      if (typeof item === "string" && item.trim()) return [objectFromString<T>(item.trim(), stringKey)];
      return [];
    });
  }
  if (parsed && typeof parsed === "object") {
    const row = parsed as Record<string, unknown>;
    const nestedKeys = [
      "items",
      "data",
      "values",
      "entries",
      "experiences",
      "experience",
      "education",
      "certifications",
      "certificates",
      "projects",
      "portfolio",
      "portfolioLinks",
      "portfolio_links",
      "links",
    ];
    for (const key of nestedKeys) {
      if (key in row) {
        const nested = normalizeObjectArray<T>(row[key], stringKey);
        if (nested.length > 0) return nested;
      }
    }
    const values = Object.values(parsed as Record<string, unknown>);
    const objectValues = values.flatMap((item): T[] => {
      if (Array.isArray(item)) return normalizeObjectArray<T>(item, stringKey);
      if (item && typeof item === "object") return [item as T];
      if (typeof item === "string" && item.trim()) return [objectFromString<T>(item.trim(), stringKey)];
      return [];
    });
    return objectValues.length > 0 ? objectValues : [parsed as T];
  }
  if (typeof parsed === "string") {
    return parsed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => objectFromString<T>(item, stringKey));
  }
  return [];
}

function normalizeStringArray(value: unknown): string[] {
  const parsed = parseJsonLike(value);
  if (Array.isArray(parsed)) {
    return parsed
      .flatMap((item) => {
        if (typeof item === "string") return [item];
        if (!item || typeof item !== "object") return [];
        const row = item as Record<string, unknown>;
        const label = row.label ?? row.name ?? row.title ?? row.value ?? row.language;
        return typeof label === "string" ? [label] : [];
      })
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (typeof parsed === "string") {
    return parsed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function readText(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function readBoolean(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") return value;
  }
  return false;
}

function readStringArray(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = normalizeStringArray(row[key]);
    if (value.length > 0) return value;
  }
  return [];
}

function normalizeExperiences(value: unknown): ExperiencePayload[] {
  return normalizeObjectArray<Record<string, unknown>>(value, "title").map((item) => ({
    title: readText(item, ["title", "role", "position", "designation"]),
    company: readText(item, ["company", "companyName", "company_name", "organization", "employer"]),
    employment_type: readText(item, ["employment_type", "employmentType", "type"]),
    location: readText(item, ["location", "city"]),
    start_date: readText(item, ["start_date", "startDate", "from"]),
    end_date: readText(item, ["end_date", "endDate", "to"]),
    currently_working: readBoolean(item, ["currently_working", "currentlyWorking", "is_current"]),
    description: readText(item, ["description", "summary"]),
    achievements: readText(item, ["achievements", "achievement"]),
    skills_used: readStringArray(item, ["skills_used", "skillsUsed", "skills"]),
  }));
}

function normalizeEducation(value: unknown): EducationPayload[] {
  return normalizeObjectArray<Record<string, unknown>>(value, "degree").map((item) => ({
    degree: readText(item, ["degree", "qualification", "title"]),
    institution: readText(item, ["institution", "school", "college", "university"]),
    field_of_study: readText(item, ["fieldOfStudy", "field_of_study", "field", "specialization", "major"]),
    start_year: readText(item, ["start_year", "startYear"]),
    end_year: readText(item, ["end_year", "endYear"]),
    start_date: readText(item, ["start_date", "startDate"]),
    end_date: readText(item, ["end_date", "endDate"]),
    grade: readText(item, ["grade", "score", "cgpa"]),
    description: readText(item, ["description", "summary"]),
  }));
}

function normalizeCertifications(value: unknown): CertificationPayload[] {
  return normalizeObjectArray<Record<string, unknown>>(value, "name").map((item) => ({
    name: readText(item, ["name", "title", "certification"]),
    issuer: readText(item, ["issuer", "issuingOrganization", "organization", "authority"]),
    issue_date: readText(item, ["issue_date", "issueDate", "date", "issued_at", "issuedAt"]),
    expiry_date: readText(item, ["expiry_date", "expiryDate", "expires_at", "expiresAt"]),
    credential_id: readText(item, ["credential_id", "credentialId", "id"]),
    credential_url: readText(item, ["credential_url", "credentialUrl", "url", "link"]),
  }));
}

function normalizeProjects(value: unknown): ProjectPayload[] {
  return normalizeObjectArray<Record<string, unknown>>(value, "name").map((item) => ({
    name: readText(item, ["name", "title"]),
    role: readText(item, ["role", "position"]),
    description: readText(item, ["description", "summary"]),
    tech_stack: readStringArray(item, ["tech_stack", "techStack", "technologies", "tools", "skills"]),
    project_url: readText(item, ["project_url", "projectUrl", "url", "link"]),
    start_date: readText(item, ["start_date", "startDate"]),
    end_date: readText(item, ["end_date", "endDate"]),
  }));
}

function hasText(value?: string | null) {
  return Boolean(value && value.trim());
}

function candidateRichnessScore(candidate?: CandidateProfileRow | null) {
  if (!candidate) return 0;
  return [
    normalizeExperiences(candidate.experiences).length * 4,
    normalizeEducation(candidate.education).length * 3,
    normalizeCertifications(candidate.certifications).length * 3,
    normalizeProjects(candidate.projects).length * 3,
    normalizeProjects(candidate.portfolioLinks).length * 3,
    normalizeProjects(candidate.portfolio_links).length * 3,
    normalizeObjectArray<Record<string, unknown>>(candidate.links, "url").length * 2,
    normalizeStringArray(candidate.skills).length,
    normalizeStringArray(candidate.tools).length,
    normalizeStringArray(candidate.languages).length,
    hasText(candidate.resume_url) ? 2 : 0,
    hasText(candidate.summary) ? 2 : 0,
    hasText(candidate.headline || candidate.current_title) ? 1 : 0,
    hasText(candidate.linkedin_url) ||
    hasText(candidate.github_url) ||
    hasText(candidate.dribbble_url) ||
    hasText(candidate.portfolio_url) ||
    hasText(candidate.website_url)
      ? 2
      : 0,
  ].reduce((total, value) => total + value, 0);
}

function pickRichestCandidateProfile(
  candidates: CandidateProfileRow[],
  identityIds: string[],
  routeCandidate?: CandidateProfileRow | null
) {
  const identityMatches = candidates.filter(
    (row) =>
      (row.user_id && identityIds.includes(row.user_id)) ||
      (row.id && identityIds.includes(row.id))
  );
  const allMatches = [...identityMatches, ...(routeCandidate ? [routeCandidate] : [])];
  return (
    allMatches.sort(
      (left, right) => candidateRichnessScore(right) - candidateRichnessScore(left)
    )[0] ??
    routeCandidate ??
    null
  );
}

function mergeCandidateProfileFields(
  target: CandidateProfileRow,
  source?: CandidateProfileRow | null
) {
  if (!source) return;
  if (source.experiences !== undefined) target.experiences = source.experiences;
  if (source.education !== undefined) target.education = source.education;
  if (source.certifications !== undefined) target.certifications = source.certifications;
  if (source.projects !== undefined) target.projects = source.projects;
  if (source.portfolioLinks !== undefined) target.portfolioLinks = source.portfolioLinks;
  if (source.portfolio_links !== undefined) target.portfolio_links = source.portfolio_links;
  if (source.links !== undefined) target.links = source.links;
  if (source.linkedin_url !== undefined) target.linkedin_url = source.linkedin_url;
  if (source.github_url !== undefined) target.github_url = source.github_url;
  if (source.dribbble_url !== undefined) target.dribbble_url = source.dribbble_url;
  if (source.portfolio_url !== undefined) target.portfolio_url = source.portfolio_url;
  if (source.website_url !== undefined) target.website_url = source.website_url;
}

function linkRows(candidate?: CandidateProfileRow | null) {
  const directLinks = [
    ["Portfolio", candidate?.portfolio_url],
    ["LinkedIn", candidate?.linkedin_url],
    ["GitHub", candidate?.github_url],
    ["Dribbble", candidate?.dribbble_url],
    ["Website", candidate?.website_url],
  ].filter((row): row is [string, string] => Boolean(row[1]));
  const structuredLinks = [
    ...normalizeObjectArray<Record<string, unknown>>(candidate?.links, "url"),
    ...normalizeObjectArray<Record<string, unknown>>(candidate?.portfolioLinks, "url"),
    ...normalizeObjectArray<Record<string, unknown>>(candidate?.portfolio_links, "url"),
  ].flatMap((item): [string, string][] => {
    const url = readText(item, ["url", "link", "href", "project_url", "projectUrl"]);
    if (!url) return [];
    const label = readText(item, ["label", "platform", "title", "name"]) || "Link";
    return [[label, url]];
  });
  const seen = new Set<string>();
  return [...directLinks, ...structuredLinks].filter(([, url]) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

export default function RecruiterCandidateProfilePage() {
  const params = useParams<{ candidateId: string }>();
  const candidateId = params.candidateId;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileRow | null>(null);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [jobById, setJobById] = useState<Map<string, JobRow>>(new Map());

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseClient();

    void (async () => {
      try {
        if (!supabase || !candidateId) {
          throw new Error("Candidate profile is unavailable.");
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("You must be signed in as a recruiter.");

        const { data: recruiterProfile } = await supabase
          .from("recruiter_profiles")
          .select("id,user_id")
          .eq("user_id", user.id)
          .maybeSingle();
        const recruiterProfileId =
          (recruiterProfile as { id?: string | null } | null)?.id ?? null;
        const ownerIds = Array.from(new Set([user.id, recruiterProfileId].filter(Boolean))) as string[];
        const jobOwnerFilter = ownerIds
          .flatMap((id) => [`recruiter_profile_id.eq.${id}`, `recruiter_id.eq.${id}`])
          .join(",");

        const { data: jobs, error: jobsError } = await supabase
          .from("jobs")
          .select("id,title,recruiter_id,recruiter_profile_id")
          .or(jobOwnerFilter);
        if (jobsError) throw jobsError;

        const ownedJobs = (jobs ?? []) as JobRow[];
        const ownedJobIds = ownedJobs.map((job) => job.id);
        if (ownedJobIds.length === 0) throw new Error("No candidate profile found for your applications.");

        const routeCandidateAttempts = [
          () =>
            supabase
              .from("candidate_profiles")
              .select(candidateProfileSelect)
              .or(`user_id.eq.${candidateId},id.eq.${candidateId}`)
              .limit(1),
          () =>
            supabase
              .from("candidate_profiles")
              .select(candidateProfileFallbackSelect)
              .or(`user_id.eq.${candidateId},id.eq.${candidateId}`)
              .limit(1),
        ];

        let routeCandidateData: CandidateProfileRow | null = null;
        let routeCandidateError: unknown = null;
        for (const attempt of routeCandidateAttempts) {
          const result = await attempt();
          if (!result.error) {
            routeCandidateData = ((result.data ?? []) as CandidateProfileRow[])[0] ?? null;
            routeCandidateError = null;
            break;
          }
          routeCandidateError = result.error;
          if (!isSchemaQueryError(result.error)) break;
        }
        if (routeCandidateError) throw routeCandidateError;

        const initialIdentityIds = uniqueTruthy([
          candidateId,
          routeCandidateData?.id,
          routeCandidateData?.user_id,
        ]);
        const userAwareIdentityFilter = buildIdentityFilter(initialIdentityIds, true);
        const candidateOnlyIdentityFilter = buildIdentityFilter(initialIdentityIds, false);

        const applicationAttempts = [
          () =>
            supabase
              .from("applications")
              .select(applicationSelect)
              .in("job_id", ownedJobIds)
              .or(userAwareIdentityFilter)
              .order("created_at", { ascending: false }),
          () =>
            supabase
              .from("applications")
              .select(applicationFallbackSelect)
              .in("job_id", ownedJobIds)
              .or(candidateOnlyIdentityFilter)
              .order("created_at", { ascending: false }),
          () =>
            supabase
              .from("applications")
              .select(applicationFallbackSelect)
              .in("job_id", ownedJobIds)
              .or(candidateOnlyIdentityFilter)
              .order("applied_at", { ascending: false }),
        ];

        let ownedApplications: ApplicationRow[] = [];
        let lastApplicationError: unknown = null;
        for (const attempt of applicationAttempts) {
          const result = await attempt();
          if (!result.error) {
            ownedApplications = (result.data ?? []) as ApplicationRow[];
            lastApplicationError = null;
            break;
          }
          lastApplicationError = result.error;
          if (!isSchemaQueryError(result.error)) break;
        }
        if (lastApplicationError) throw lastApplicationError;
        if (ownedApplications.length === 0) {
          throw new Error("You can only view candidates who applied to your jobs.");
        }

        const applicationIdentityIds = uniqueTruthy(
          ownedApplications.flatMap((application) => [
            application.candidate_id,
            application.user_id,
          ])
        );
        const resolvedIdentityIds = uniqueTruthy([
          ...initialIdentityIds,
          ...applicationIdentityIds,
        ]);

        const candidateIdentityFilter = buildCandidateProfileIdentityFilter(resolvedIdentityIds);
        const candidateAttempts = [
          () =>
            supabase
              .from("candidate_profiles")
              .select(candidateProfileSelect)
              .or(candidateIdentityFilter),
          () =>
            supabase
              .from("candidate_profiles")
              .select(candidateProfileFallbackSelect)
              .or(candidateIdentityFilter),
        ];

        let candidateRows: CandidateProfileRow[] = [];
        let candidateError: unknown = null;
        for (const attempt of candidateAttempts) {
          const result = await attempt();
          if (!result.error) {
            candidateRows = (result.data ?? []) as CandidateProfileRow[];
            candidateError = null;
            break;
          }
          candidateError = result.error;
          if (!isSchemaQueryError(result.error)) break;
        }
        if (candidateError) throw candidateError;

        const preferredApplication = ownedApplications[0];
        const candidateData = pickRichestCandidateProfile(
          candidateRows,
          resolvedIdentityIds,
          routeCandidateData
        );

        if (candidateData) {
          const selectedCandidateIds = uniqueTruthy([
            candidateData.id,
            candidateData.user_id,
            candidateId,
            preferredApplication.user_id,
            preferredApplication.candidate_id,
          ]);
          const selectedCandidateFilter = buildCandidateProfileIdentityFilter(selectedCandidateIds);
          const { data: richRows, error: richError } = await supabase
            .from("candidate_profiles")
            .select(candidateProfileRichSelect)
            .or(selectedCandidateFilter)
            .limit(3);
          if (!richError) {
            const richData = pickRichestCandidateProfile(
              (richRows ?? []) as CandidateProfileRow[],
              selectedCandidateIds,
              null
            );
            mergeCandidateProfileFields(candidateData, richData);
          } else if (!isSchemaQueryError(richError)) {
            throw richError;
          }

          const linkAttempts = [
            () =>
              supabase
                .from("candidate_profiles")
                .select(candidateProfileLinksWithWebsiteSelect)
                .or(`id.eq.${candidateData.id},user_id.eq.${candidateData.user_id || candidateId}`)
                .limit(1),
            () =>
              supabase
                .from("candidate_profiles")
                .select(candidateProfileLinksSelect)
                .or(`id.eq.${candidateData.id},user_id.eq.${candidateData.user_id || candidateId}`)
                .limit(1),
          ];
          let linkData: CandidateProfileRow | null = null;
          for (const attempt of linkAttempts) {
            const result = await attempt();
            if (!result.error) {
              linkData = ((result.data ?? []) as CandidateProfileRow[])[0] ?? null;
              break;
            }
            if (!isSchemaQueryError(result.error)) break;
          }
          if (linkData) {
            candidateData.linkedin_url = linkData.linkedin_url;
            candidateData.github_url = linkData.github_url;
            candidateData.dribbble_url = linkData.dribbble_url;
            candidateData.portfolio_url = linkData.portfolio_url;
            candidateData.website_url = linkData.website_url;
          }
        }

        const profileIdentityIds = uniqueTruthy([
          candidateData?.user_id,
          preferredApplication.user_id,
          preferredApplication.candidate_id,
          candidateId,
        ]);
        const profileAttempts = [
          () =>
            supabase
              .from("profiles")
              .select(profileSelect)
              .in("id", profileIdentityIds),
          () =>
            supabase
              .from("profiles")
              .select(profileFallbackSelect)
              .in("id", profileIdentityIds),
        ];

        let profileRows: ProfileRow[] = [];
        let profileError: unknown = null;
        for (const attempt of profileAttempts) {
          const result = await attempt();
          if (!result.error) {
            profileRows = (result.data ?? []) as ProfileRow[];
            profileError = null;
            break;
          }
          profileError = result.error;
          if (!isSchemaQueryError(result.error)) break;
        }
        if (profileError) throw profileError;

        const profileData =
          profileRows.find((row) => row.id === candidateData?.user_id) ??
          profileRows.find((row) => row.id === preferredApplication.user_id) ??
          profileRows.find((row) => row.id === preferredApplication.candidate_id) ??
          profileRows.find((row) => row.id === candidateId) ??
          profileRows[0] ??
          null;

        if (!mounted) return;
        setProfile(profileData);
        setCandidateProfile(candidateData);
        setApplications(ownedApplications);
        setJobById(new Map(ownedJobs.map((job) => [job.id, job])));
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Could not load candidate profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [candidateId]);

  const primaryApplication = applications[0] ?? null;
  const resumeUrl = candidateProfile?.resume_url || profile?.resume_url || "";
  const name = profile?.full_name || profile?.name || profile?.email || "Candidate";
  const headline =
    candidateProfile?.headline ||
    candidateProfile?.designation ||
    candidateProfile?.current_title ||
    profile?.headline ||
    "";
  const location = candidateProfile?.location || profile?.location || "";
  const experience = formatExperience(candidateProfile);
  const skills = useMemo(
    () =>
      Array.from(
        new Set([
          ...normalizeStringArray(candidateProfile?.skills),
          ...normalizeStringArray(profile?.skills),
          ...normalizeStringArray(candidateProfile?.tools),
        ])
      ),
    [candidateProfile?.skills, candidateProfile?.tools, profile?.skills]
  );
  const screeningAnswers = normalizeScreeningAnswers(primaryApplication?.screening_answers);

  const updateApplication = async (
    applicationId: string,
    status: ApplicationStatus,
    timestampColumn?: string
  ) => {
    const supabase = getSupabaseClient();
    if (!supabase || saving) return;

    setSaving(true);
    setError(null);
    const now = new Date().toISOString();
    const attempts = [
      { status, updated_at: now, ...(timestampColumn ? { [timestampColumn]: now } : {}) },
      { status, ...(timestampColumn ? { [timestampColumn]: now } : {}) },
      { status },
    ];

    let lastError: unknown = null;
    for (const payload of attempts) {
      const { data, error: updateError } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", applicationId)
        .select("id")
        .maybeSingle();
      if (!updateError && data) {
        setApplications((current) =>
          current.map((application) =>
            application.id === applicationId
              ? {
                  ...application,
                  status,
                  ...(timestampColumn ? { [timestampColumn]: now } : {}),
                }
              : application
          )
        );
        setSaving(false);
        return;
      }
      lastError = updateError;
      if (updateError && !isSchemaQueryError(updateError)) break;
    }

    setSaving(false);
    setError(lastError instanceof Error ? lastError.message : "Could not update application status.");
  };

  const handleDownloadResume = async () => {
    if (!resumeUrl || !primaryApplication) return;
    if (
      primaryApplication.status &&
      !terminalStatuses.has(primaryApplication.status)
    ) {
      await updateApplication(primaryApplication.id, "resume_downloaded", "resume_downloaded_at");
    }
    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  const links = linkRows(candidateProfile);
  const experiences = normalizeExperiences(candidateProfile?.experiences);
  const education = normalizeEducation(candidateProfile?.education);
  const certifications = normalizeCertifications(candidateProfile?.certifications);
  const projects = [
    ...normalizeProjects(candidateProfile?.projects),
    ...normalizeProjects(candidateProfile?.portfolioLinks),
    ...normalizeProjects(candidateProfile?.portfolio_links),
  ];

  return (
    <RecruiterGuard>
      <div className="min-h-screen">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {loading && <p className="text-sm text-muted-foreground">Loading candidate evaluation...</p>}

          {!loading && error && (
            <div className="rounded-xl border border-border/40 p-6 text-sm text-muted-foreground">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-5">
              <section className="rounded-2xl border border-border/40 bg-background p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Candidate Evaluation Workspace
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight">{name}</h1>
                    {headline && <p className="mt-1 text-sm text-muted-foreground">{headline}</p>}
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {profile?.email && (
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </span>
                      )}
                      {location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {location}
                        </span>
                      )}
                      {experience && <span>{experience}</span>}
                      {primaryApplication?.status && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusStyles[primaryApplication.status] || "bg-muted text-muted-foreground"
                          }`}
                        >
                          {formatStatus(primaryApplication.status)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-xl">
                      <Link href="/recruiter/candidates">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Applications
                      </Link>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl"
                      disabled={!resumeUrl || saving}
                      onClick={() => void handleDownloadResume()}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {resumeUrl ? "Download Resume" : "No resume uploaded"}
                    </Button>
                    {primaryApplication && (
                      <>
                        <Button
                          type="button"
                          className={`rounded-xl ${
                            primaryApplication.status === "shortlisted"
                              ? "bg-purple-600 text-white hover:bg-purple-600"
                              : ""
                          }`}
                          disabled={saving || primaryApplication.status === "shortlisted"}
                          onClick={() => void updateApplication(primaryApplication.id, "shortlisted", "shortlisted_at")}
                        >
                          {primaryApplication.status === "shortlisted" ? "Shortlisted" : "Shortlist"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className={`rounded-xl ${
                            primaryApplication.status === "rejected"
                              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-50"
                              : ""
                          }`}
                          disabled={saving || primaryApplication.status === "rejected"}
                          onClick={() => void updateApplication(primaryApplication.id, "rejected", "rejected_at")}
                        >
                          {primaryApplication.status === "rejected" ? "Rejected" : "Reject"}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border/40 bg-background p-5">
                <h2 className="text-sm font-semibold">Application Context</h2>
                {primaryApplication ? (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <InfoCard label="Job applied for" value={jobById.get(primaryApplication.job_id || "")?.title || "Job"} />
                    <InfoCard label="Applied date" value={relativeDate(primaryApplication.created_at || primaryApplication.applied_at) || "Not available"} />
                    <InfoCard label="Current status" value={formatStatus(primaryApplication.status)} />
                    {primaryApplication.viewed_at && <InfoCard label="Viewed" value={relativeDate(primaryApplication.viewed_at)} />}
                    {primaryApplication.resume_downloaded_at && <InfoCard label="Resume downloaded" value={relativeDate(primaryApplication.resume_downloaded_at)} />}
                    {primaryApplication.shortlisted_at && <InfoCard label="Shortlisted" value={relativeDate(primaryApplication.shortlisted_at)} />}
                    {primaryApplication.rejected_at && <InfoCard label="Rejected" value={relativeDate(primaryApplication.rejected_at)} />}
                    {primaryApplication.hired_at && <InfoCard label="Hired" value={relativeDate(primaryApplication.hired_at)} />}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">No application context available.</p>
                )}
              </section>

              <section className="rounded-2xl border border-border/40 bg-background p-5">
                <h2 className="text-sm font-semibold">Screening Answers</h2>
                {screeningAnswers.length > 0 ? (
                  <div className="mt-3 space-y-2.5">
                    {screeningAnswers.map((answer) => (
                      <div key={`${answer.question_id}-${answer.question}`} className="rounded-xl border border-border/30 p-3">
                        <p className="text-sm font-semibold">{answer.question}</p>
                        <div className="mt-2 text-sm text-muted-foreground">{renderAnswer(answer.answer)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 rounded-xl border border-dashed border-border/50 p-4 text-sm text-muted-foreground">
                    No screening answers submitted.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-border/40 bg-background p-5">
                <h2 className="text-sm font-semibold">Resume</h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl"
                    disabled={!resumeUrl || saving}
                    onClick={() => void handleDownloadResume()}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {resumeUrl ? "Download Resume" : "No resume uploaded"}
                  </Button>
                  {!resumeUrl && <p className="text-sm text-muted-foreground">No resume uploaded.</p>}
                </div>
              </section>

              <section className="rounded-2xl border border-border/40 bg-background p-5">
                <h2 className="text-sm font-semibold">Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)
                  ) : (
                    <p className="text-sm text-muted-foreground">No skills listed.</p>
                  )}
                </div>
              </section>

              <SectionList
                title="Experience / Work History"
                empty="No work history listed."
                items={experiences}
                render={(item, index) => (
                  <TimelineCard key={`${item.company}-${item.title}-${index}`}>
                    <p className="font-medium">{item.title || "Role"}</p>
                    <p className="text-sm text-muted-foreground">
                      {[item.company, item.employment_type, item.location].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.start_date, item.currently_working ? "Present" : item.end_date].filter(Boolean).join(" - ")}
                    </p>
                    {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
                    {item.skills_used && item.skills_used.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {item.skills_used.map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
                      </div>
                    )}
                  </TimelineCard>
                )}
              />

              <SectionList
                title="Education"
                empty="No education listed."
                items={education}
                render={(item, index) => (
                  <TimelineCard key={`${item.institution}-${item.degree}-${index}`}>
                    <p className="font-medium">{item.degree || "Education"}</p>
                    <p className="text-sm text-muted-foreground">
                      {[item.institution, item.field_of_study || item.field].filter(Boolean).join(" · ")}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.start_year || item.start_date, item.end_year || item.end_date].filter(Boolean).join(" - ")}
                    </p>
                    {item.description && <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>}
                  </TimelineCard>
                )}
              />

              <SectionList
                title="Certifications"
                empty="No certifications listed."
                items={certifications}
                render={(item, index) => (
                  <TimelineCard key={`${item.name}-${item.issuer}-${index}`}>
                    <p className="font-medium">{item.name || "Certification"}</p>
                    <p className="text-sm text-muted-foreground">{item.issuer || "Issuer not listed"}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.issue_date, item.expiry_date].filter(Boolean).join(" - ")}
                    </p>
                    {item.credential_url && (
                      <a
                        href={item.credential_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-sm text-foreground underline-offset-4 hover:underline"
                      >
                        View credential <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </TimelineCard>
                )}
              />

              <section className="rounded-2xl border border-border/40 bg-background p-5">
                <h2 className="text-sm font-semibold">Links / Portfolio</h2>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {links.length > 0 || projects.length > 0 ? (
                    <>
                      {links.map(([label, url]) => (
                        <a
                          key={label}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between rounded-xl border border-border/30 p-3 text-sm hover:border-border/60"
                        >
                          {label}
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        </a>
                      ))}
                      {projects.map((project, index) => (
                        <a
                          key={`${project.name}-${index}`}
                          href={project.project_url || project.url || "#"}
                          target={project.project_url || project.url ? "_blank" : undefined}
                          rel={project.project_url || project.url ? "noopener noreferrer" : undefined}
                          className="rounded-xl border border-border/30 p-3 text-sm hover:border-border/60"
                        >
                          <span className="font-medium">{project.name || "Project"}</span>
                          {project.description && (
                            <span className="mt-1 block text-xs text-muted-foreground">{project.description}</span>
                          )}
                        </a>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No links or portfolio projects listed.</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-border/40 bg-background p-5">
                <h2 className="text-sm font-semibold">Applications to Your Jobs</h2>
                <div className="mt-3 space-y-2">
                  {applications.map((application) => {
                    const job = application.job_id ? jobById.get(application.job_id) : null;
                    return (
                      <div key={application.id} className="rounded-xl border border-border/30 p-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{job?.title || "Job"}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {application.created_at || application.applied_at
                                ? `Applied ${relativeDate(application.created_at || application.applied_at)}`
                                : "Applied date unavailable"}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              statusStyles[application.status || "applied"] || "bg-muted text-muted-foreground"
                            }`}
                          >
                            {formatStatus(application.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </RecruiterGuard>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function TimelineCard({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border/30 p-3 text-sm">{children}</div>;
}

function SectionList<T>({
  title,
  empty,
  items,
  render,
}: {
  title: string;
  empty: string;
  items: T[];
  render: (item: T, index: number) => ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/40 bg-background p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 space-y-2.5">
        {items.length > 0 ? items.map(render) : <p className="text-sm text-muted-foreground">{empty}</p>}
      </div>
    </section>
  );
}
