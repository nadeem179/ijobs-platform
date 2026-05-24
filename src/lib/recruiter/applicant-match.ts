import type { RecruiterCandidateItem, RecruiterJobItem } from "@/services";

const SKILL_ALIASES: Record<string, string> = {
  "node": "node.js",
  "nodejs": "node.js",
  "next": "next.js",
  "nextjs": "next.js",
  "reactjs": "react",
  "react.js": "react",
  "ts": "typescript",
  "js": "javascript",
  "postgres": "postgresql",
  "postgre": "postgresql",
  "tailwindcss": "tailwind css",
  "k8s": "kubernetes",
  "amazon web services": "aws",
};

const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "have",
  "into",
  "our",
  "that",
  "the",
  "this",
  "with",
  "you",
  "your",
]);

export type ApplicantMatchLevel = "Strong Match" | "Moderate Match" | "Weak Match";

export type ApplicantMatchResult = {
  score: number | null;
  level: ApplicantMatchLevel | "Match pending";
  matchedSkills: string[];
  missingSkills: string[];
  keywordOverlap: string[];
  breakdown: {
    skills: number;
    keywords: number;
    context: number;
  };
};

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

export function normalizeSkill(value: string) {
  const normalized = normalizeText(value).replace(/\s+/g, " ");
  return SKILL_ALIASES[normalized] || normalized;
}

export function normalizeSkills(values?: string[] | null) {
  const byNormalized = new Map<string, string>();
  (values ?? []).forEach((value) => {
    const normalized = normalizeSkill(value);
    if (!normalized) return;
    if (!byNormalized.has(normalized)) byNormalized.set(normalized, normalized);
  });
  return Array.from(byNormalized.values());
}

function tokenize(values: Array<string | string[] | undefined | null>) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => Array.isArray(value) ? value : [value])
        .join(" ")
        .toLowerCase()
        .split(/[^a-z0-9+#.]+/)
        .map((token) => token.trim())
        .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
    )
  );
}

function includesLoose(left?: string | null, right?: string | null) {
  const leftText = normalizeText(left);
  const rightText = normalizeText(right);
  return Boolean(leftText && rightText && (leftText.includes(rightText) || rightText.includes(leftText)));
}

function preferenceIncludes(preference?: string[] | string | null, target?: string | null) {
  if (!target) return false;
  const values = Array.isArray(preference) ? preference : preference ? [preference] : [];
  return values.some((value) => includesLoose(value, target));
}

function getLevel(score: number): ApplicantMatchLevel {
  if (score >= 80) return "Strong Match";
  if (score >= 50) return "Moderate Match";
  return "Weak Match";
}

export function scoreApplicantMatch(
  job: RecruiterJobItem | null,
  candidate: RecruiterCandidateItem
): ApplicantMatchResult {
  const jobSkills = normalizeSkills(job?.skills);
  const candidateSkills = normalizeSkills(candidate.skills);
  const candidateSkillSet = new Set(candidateSkills);
  const matchedSkills = jobSkills.filter((skill) => candidateSkillSet.has(skill));
  const missingSkills = jobSkills.filter((skill) => !candidateSkillSet.has(skill));
  const skillsScore = jobSkills.length > 0
    ? (matchedSkills.length / jobSkills.length) * 60
    : 0;

  const jobKeywords = tokenize([
    job?.title,
    job?.description,
    job?.responsibilities,
    job?.requirements,
    job?.preferredQualifications,
  ]);
  const candidateKeywords = tokenize([
    candidate.headline,
    candidate.currentRole,
    candidate.bio,
    candidate.experience,
    candidate.experienceText,
    candidate.projectText,
    candidate.skills,
  ]);
  const candidateKeywordSet = new Set(candidateKeywords);
  const keywordOverlap = jobKeywords.filter((keyword) => candidateKeywordSet.has(keyword));
  const keywordScore = jobKeywords.length > 0 && candidateKeywords.length > 0
    ? (keywordOverlap.length / jobKeywords.length) * 25
    : 0;

  const contextChecks = [
    job?.experienceLevel && candidate.experienceLevel
      ? normalizeText(job.experienceLevel) === normalizeText(candidate.experienceLevel)
      : null,
    job?.location && candidate.location
      ? includesLoose(job.location, candidate.location)
      : null,
    job?.locationType && candidate.workModePreference
      ? preferenceIncludes(candidate.workModePreference, job.locationType)
      : null,
    job?.jobType && candidate.jobTypePreference
      ? preferenceIncludes(candidate.jobTypePreference, job.jobType)
      : null,
  ].filter((value): value is boolean => value !== null);
  const contextScore = contextChecks.length > 0
    ? (contextChecks.filter(Boolean).length / contextChecks.length) * 15
    : 0;

  const hasSignals =
    jobSkills.length > 0 ||
    candidateSkills.length > 0 ||
    (jobKeywords.length > 0 && candidateKeywords.length > 0) ||
    contextChecks.length > 0;

  if (!hasSignals) {
    return {
      score: null,
      level: "Match pending",
      matchedSkills,
      missingSkills,
      keywordOverlap,
      breakdown: { skills: 0, keywords: 0, context: 0 },
    };
  }

  const score = Math.max(0, Math.min(100, Math.round(skillsScore + keywordScore + contextScore)));
  return {
    score,
    level: getLevel(score),
    matchedSkills,
    missingSkills,
    keywordOverlap,
    breakdown: {
      skills: Math.round(skillsScore),
      keywords: Math.round(keywordScore),
      context: Math.round(contextScore),
    },
  };
}
