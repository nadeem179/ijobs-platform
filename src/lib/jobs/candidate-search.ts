"use client";

import { cities, designations, skillsList } from "@/lib/profile/options";
import type { Job } from "@/types/job";

export const SEARCH_QUERY_PARAM = "q";
export const RECENT_SEARCHES_KEY = "ijobs.candidateRecentSearches";
export const MAX_RECENT_SEARCHES = 5;

const WORK_MODE_ALIASES = [
  { terms: ["remote"], value: "Remote" as const },
  { terms: ["hybrid"], value: "Hybrid" as const },
  { terms: ["on-site", "onsite", "on site"], value: "On-site" as const },
];

const EXPERIENCE_ALIASES = [
  { terms: ["fresher"], value: "Entry" },
  { terms: ["intern", "internship"], value: "Entry" },
  { terms: ["junior", "jr"], value: "Entry" },
  { terms: ["mid", "mid-level", "midlevel"], value: "Mid" },
  { terms: ["senior", "sr"], value: "Senior" },
  { terms: ["lead"], value: "Lead" },
  { terms: ["manager"], value: "Lead" },
  { terms: ["director"], value: "Staff" },
];

const LOCATION_TERMS = Array.from(new Set(cities)).sort((a, b) => b.length - a.length);

export type CandidateSearchProfile = {
  designation?: string;
  headline?: string;
  skills: string[];
  preferredLocations: string[];
  workModes: string[];
  experienceLevel?: string;
};

export type ParsedJobQuery = {
  normalizedQuery: string;
  titleTerms: string[];
  location: string;
  workMode: "" | Job["locationType"];
  experienceLevel: string;
};

export type SearchSuggestion = {
  label: string;
  value: string;
  section: "Recent Searches" | "Popular Roles" | "Popular Skills" | "Popular Locations" | "Companies";
};

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function normalizeSearchValue(value: string) {
  return value.trim().toLowerCase();
}

export function splitSearchTerms(value: string) {
  return normalizeSearchValue(value)
    .split(/[\s,]+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

export function getJobLocationSearchText(job: Job) {
  return [job.location, job.locationType].join(" ").toLowerCase();
}

export function getJobSearchText(job: Job) {
  return [
    job.title,
    job.company,
    job.skills.join(" "),
    job.description,
    job.companyIndustry,
    job.location,
    job.locationType,
  ]
    .join(" ")
    .toLowerCase();
}

export function parseJobQuery(query: string, availableLocations: string[] = []) {
  const normalizedQuery = normalizeSearchValue(query);
  const knownLocations = unique([...availableLocations, ...LOCATION_TERMS]).sort((a, b) => b.length - a.length);
  const workMode = WORK_MODE_ALIASES.find(({ terms }) =>
    terms.some((term) => normalizedQuery.includes(term))
  )?.value ?? "";
  const location =
    knownLocations.find((item) => normalizedQuery.includes(normalizeSearchValue(item))) ?? "";
  const experienceLevel =
    EXPERIENCE_ALIASES.find(({ terms }) =>
      terms.some((term) => normalizedQuery.includes(term))
    )?.value ?? "";

  let titleQuery = normalizedQuery;
  if (location) {
    titleQuery = titleQuery.replace(normalizeSearchValue(location), " ");
  }
  if (workMode) {
    for (const term of WORK_MODE_ALIASES.find(({ value }) => value === workMode)?.terms ?? []) {
      titleQuery = titleQuery.replace(term, " ");
    }
  }
  if (experienceLevel) {
    for (const term of EXPERIENCE_ALIASES.find(({ value }) => value === experienceLevel)?.terms ?? []) {
      titleQuery = titleQuery.replace(term, " ");
    }
  }

  return {
    normalizedQuery,
    titleTerms: splitSearchTerms(titleQuery),
    location,
    workMode,
    experienceLevel,
  } satisfies ParsedJobQuery;
}

function countMatchingTerms(haystack: string, terms: string[]) {
  return terms.filter((term) => haystack.includes(term)).length;
}

export function scoreCandidateJobSearch(
  job: Job,
  query: string,
  profile: CandidateSearchProfile | null,
  parsed: ParsedJobQuery
) {
  const normalizedQuery = normalizeSearchValue(query);
  const normalizedTitle = normalizeSearchValue(job.title);
  const normalizedCompany = normalizeSearchValue(job.company);
  const normalizedDescription = normalizeSearchValue(job.description);
  const normalizedIndustry = normalizeSearchValue(job.companyIndustry);
  const jobSkills = job.skills.map(normalizeSearchValue);
  const locationSearchText = getJobLocationSearchText(job);
  let score = 0;

  if (!normalizedQuery) {
    score += 1;
  } else {
    if (normalizedTitle === normalizedQuery) score += 120;
    else if (normalizedTitle.startsWith(normalizedQuery)) score += 80;
    else if (normalizedTitle.includes(normalizedQuery)) score += 60;

    if (normalizedCompany === normalizedQuery) score += 70;
    else if (normalizedCompany.includes(normalizedQuery)) score += 50;

    if (jobSkills.some((skill) => skill === normalizedQuery)) score += 55;
    score += countMatchingTerms(normalizedTitle, parsed.titleTerms) * 18;
    score += countMatchingTerms(normalizedCompany, parsed.titleTerms) * 16;
    score += countMatchingTerms(normalizedDescription, parsed.titleTerms) * 8;
    score += countMatchingTerms(normalizedIndustry, parsed.titleTerms) * 8;
    score += jobSkills.filter((skill) => parsed.titleTerms.some((term) => skill.includes(term))).length * 20;

    if (parsed.location && locationSearchText.includes(normalizeSearchValue(parsed.location))) score += 24;
    if (parsed.workMode && job.locationType === parsed.workMode) score += 24;
    if (parsed.experienceLevel && job.experienceLevel === parsed.experienceLevel) score += 16;
  }

  if (profile) {
    const preferenceTerms = unique([
      profile.designation ?? "",
      profile.headline ?? "",
      ...profile.skills,
      ...profile.preferredLocations,
    ])
      .map(normalizeSearchValue)
      .filter(Boolean);

    score += countMatchingTerms(normalizedTitle, preferenceTerms) * 10;
    score += jobSkills.filter((skill) => profile.skills.map(normalizeSearchValue).includes(skill)).length * 12;

    if (profile.preferredLocations.map(normalizeSearchValue).some((location) => locationSearchText.includes(location))) {
      score += 12;
    }
    if (profile.workModes.includes(job.locationType)) score += 10;
    if (profile.experienceLevel === job.experienceLevel) score += 10;
  }

  if (job.featured) score += 4;
  if (job.verifiedRecruiter) score += 3;
  if (job.activeHiring) score += 3;

  return score;
}

export function matchesSearchQuery(
  job: Job,
  query: string,
  profile: CandidateSearchProfile | null,
  parsed: ParsedJobQuery
) {
  if (!normalizeSearchValue(query)) return true;
  return scoreCandidateJobSearch(job, query, profile, parsed) > 0;
}

export function loadRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    return parsed.filter(Boolean).slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string) {
  if (typeof window === "undefined") return [];
  const trimmed = query.trim();
  if (!trimmed) return loadRecentSearches();
  const next = [trimmed, ...loadRecentSearches().filter((item) => normalizeSearchValue(item) !== normalizeSearchValue(trimmed))]
    .slice(0, MAX_RECENT_SEARCHES);
  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  return next;
}

export function buildCandidateSearchSuggestions(jobs: Job[], recentSearches: string[]) {
  const companies = unique(jobs.map((job) => job.company).filter(Boolean)).slice(0, 5);
  const popularRoles = designations.slice(0, 5);
  const popularSkills = skillsList.slice(0, 5);
  const popularLocations = cities.slice(0, 5);

  return [
    ...recentSearches.map((label) => ({ label, value: label, section: "Recent Searches" as const })),
    ...popularRoles.map((label) => ({ label, value: label, section: "Popular Roles" as const })),
    ...popularSkills.map((label) => ({ label, value: label, section: "Popular Skills" as const })),
    ...popularLocations.map((label) => ({ label, value: label, section: "Popular Locations" as const })),
    ...companies.map((label) => ({ label, value: label, section: "Companies" as const })),
  ];
}
