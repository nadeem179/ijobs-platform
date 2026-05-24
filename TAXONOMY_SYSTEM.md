# Taxonomy System

The app works best when candidate and recruiter inputs use the same option sets and alias rules.

This matters because the same values are reused across:

- matching
- search
- recommendations
- profile completion
- job posting

When those values diverge, the app starts to miss matches, show inconsistent labels, or store values that do not line up with the search/ranking code.

## 1. Shared Taxonomy Purpose

### Why shared taxonomies matter

- Matching depends on exact or normalized overlap between candidate and job fields.
- Search depends on query parsing, suggestion generation, and filter chips using the same vocabulary.
- Recommendations depend on consistent designation, skills, tools, location, and work mode labels.
- Profile completion checks whether the user has filled the expected taxonomy-backed fields.
- Job posting must use values the search and candidate profile layers can understand later.

### Principle

- One concept should have one canonical option set.
- UI labels can vary slightly, but stored values should be normalized and shared.

## 2. Existing Taxonomies

### Skills

- Source: `src/lib/profile/options.ts`
- List: `skillsList`
- Used as the main candidate skills vocabulary and also reused for experience/project skill pickers.

### Tools

- Source: `src/lib/profile/options.ts`
- List: `toolsList`
- Used for candidate tools, portfolio tech stack, and recommendation suggestions.

### Designations

- Source: `src/lib/profile/options.ts`
- List: `designations`
- Used in onboarding and search suggestions.

### Industries

- Source: `src/lib/profile/options.ts`
- List: `industries`
- Used in candidate profile edit, onboarding, settings, and recruiter job posting.

### Locations

- Source: `src/lib/profile/options.ts`
- List: `cities`
- Includes `Remote` plus major Indian and global cities.

### Currencies

- Source: `src/lib/profile/options.ts`
- List: `currencies`
- Codes:
  - INR
  - USD
  - EUR
  - GBP
  - AED
  - SGD
  - AUD
  - CAD
  - JPY
  - CHF

### Languages

- Source: `src/lib/profile/options.ts`
- List: `languageOptions`

### Fluency levels

- Source: `src/lib/profile/options.ts`
- List: `fluencyOptions`
- Values:
  - Beginner
  - Intermediate
  - Professional working
  - Full professional
  - Native/Bilingual

### Experience levels

- Canonical job profile level:
  - `Entry`
  - `Mid`
  - `Senior`
  - `Lead`
  - `Staff`
- Additional UI labels appear in onboarding and profile editors:
  - Fresher
  - Intern
  - Junior
  - Manager
  - Director
  - Executive

### Job types

- Source: `src/lib/profile/options.ts`
- List: `jobTypeOptions`
- Values:
  - Full-time
  - Part-time
  - Contract
  - Freelance
  - Internship
  - Temporary

### Work modes

- Source: `src/lib/profile/options.ts`
- List: `workModeOptions`
- Values:
  - Remote
  - Hybrid
  - On-site
  - Flexible

## 3. Candidate Usage

### Onboarding

- `src/app/onboarding/candidate/page.tsx`
  - designation
  - locations
  - job types
  - work modes
  - industries
  - skills
  - tools
  - languages
  - fluency
  - experience

### Profile edit

- `src/app/profile/edit/page.tsx`
  - designation / headline
  - locations
  - job types
  - work modes
  - industries
  - skills
  - tools
  - languages
  - currency
  - experience level

### Dashboard

- `src/app/dashboard/page.tsx`
  - display and matching depend on:
    - current title / designation
    - skills
    - preferred locations
    - work mode
    - experience level

### Search

- `src/components/jobs/job-feed.tsx`
  - designation filter
  - location filter
  - job type filter
  - experience level filter
  - skill filter
  - salary range
  - work mode / location type

- `src/lib/jobs/candidate-search.ts`
  - search suggestions from:
    - roles
    - skills
    - locations
    - company names

### Recommendations

- Candidate recommendation logic uses:
  - designation
  - headline
  - skills
  - preferred locations
  - work mode
  - experience level

## 4. Recruiter Usage

### Post job form

- `src/app/recruiter/post-job/page.tsx`
  - company industry
  - location
  - work mode
  - job type
  - salary currency
  - salary period
  - experience
  - skills
  - status

### Job details

- Job detail surfaces show:
  - job type
  - location type
  - experience level
  - skills
  - salary
  - company industry

### Applicant matching

- Recruiter candidate matching depends on:
  - job title / designation
  - candidate headline / current title
  - skills
  - tools
  - location
  - experience level
  - industry

### Recruiter filters

- Recruiter candidate and job lists mainly reuse the same canonical labels indirectly through shared job and profile fields.
- There is no separate recruiter-only taxonomy file yet.

## 5. Matching Rules

### Skills must normalize

- Compare lowercased normalized skill strings.
- Avoid treating `UI Design`, `UI/UX`, and `UI UX` as unrelated if the intent is the same.

### Tools must normalize

- Normalize tool labels the same way as skills.
- Treat `VS Code`, `Visual Studio Code`, and similar aliases as the same concept if they appear in the data model.

### UI/UX vs UI UX

- These should be handled consistently in both search and recommendations.
- Current code mostly relies on string matching, so alias maps are the safe fix.

### Designation aliases

- `getDesignationRecommendations()` already supports alias-style matching:
  - designer
  - frontend
  - backend
  - data
  - product
  - marketing
  - hr / recruiter
  - support
  - machine learning / AI
- Search parsing also maps some role words to canonical values.

### Work mode labels

- Use the same labels everywhere:
  - Remote
  - Hybrid
  - On-site
- If you want `Flexible`, it needs to be treated as a separate intentional option, not a synonym for one of the above.

## 6. Search Rules

### Keyword search

- Search should match against:
  - title
  - company
  - skills
  - tools when available
  - description
  - location
  - work mode
  - designation / headline signals

### Filters

- Filters should only use canonical option values.
- Dropdowns and chips should not introduce values that the search engine cannot understand.

### Highlighted search results

- Highlighting should respect the same normalized terms used by search parsing.
- Multi-keyword queries should remain stable when aliases are expanded.

### Ranking

- Ranking improves when taxonomy values are shared:
  - exact designation overlaps
  - skill overlap
  - preferred location overlap
  - work mode match
  - experience match

## 7. Known Risks

- Duplicate skill names can appear with slightly different punctuation or casing.
- Inconsistent labels can split the same concept into multiple values.
- Candidate and recruiter fields do not always use the same storage shape.
- Tiny option lists can overfit the UI to a small set of examples.
- Hardcoded local options still exist in some components instead of a single source of truth.
- Mismatched DB values can happen when UI labels are not normalized before save.

### Specific inconsistencies found

- `jobTypeOptions` includes `Temporary`, but the job posting form and job typing logic do not fully model it everywhere.
- `workModeOptions` includes `Flexible`, but the job and search model mostly understands Remote, Hybrid, and On-site.
- The recruiter post-job form currently shows `Remote`, `Hybrid`, and `On-site` inside the job type select, which is a taxonomy bug.
- The filters use their own hardcoded experience list, while job data uses `Entry`, `Mid`, `Senior`, `Lead`, `Staff`.
- Candidate onboarding has `Fresher`, `Intern`, `Junior`, `Mid`, `Senior`, `Lead`, `Manager`, `Director`, `Executive`, which is broader than the job model.
- `designationRecommendations` is intentionally alias-aware, but that behavior is not shared by every other taxonomy path yet.

## 8. Future Improvements

1. Move all taxonomy constants into centralized files with one canonical export per concept.
2. Add alias maps for skills, tools, designations, work modes, and experience levels.
3. Normalize values to stable slugs for storage and matching.
4. Keep UI labels separate from stored values.
5. Share dropdown and combobox components so the same taxonomy list is rendered everywhere.
6. Add a single validation layer before persisting candidate or recruiter form data.
7. Avoid AI/vector search unless explicitly requested.

