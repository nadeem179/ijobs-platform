# Service Layer

This repo does not have a single unified backend service layer yet. The current architecture is a mix of:

- service interfaces in `src/services/types/service-types.ts`
- a registry in `src/services/index.ts`
- mock-first service implementations in `src/services/impl/*`
- real Supabase orchestration in `src/lib/profile/persistence.ts`, `src/lib/settings/persistence.ts`, `src/hooks/*`, and `src/context/auth.tsx`

That split is the main source of duplication and schema drift.

## 1. Service Layer Structure

### Where candidate logic lives

- `src/lib/profile/persistence.ts`
  - Loads and saves candidate profile data.
  - Maps overlapping `profiles` and `candidate_profiles` schemas into one UI profile model.
- `src/lib/settings/persistence.ts`
  - Loads and saves candidate settings.
  - Also updates phone number in both `profiles` and `candidate_profiles`.
- `src/hooks/use-applications.ts`
  - Candidate application list, application creation, duplicate checks, and daily limit checks.
- `src/hooks/use-saved-jobs.ts`
  - Candidate saved-job toggle, saved-job loading, duplicate handling, onboarding/role gating.
- `src/hooks/use-candidate-dashboard.ts`
  - Candidate dashboard composition, recommended jobs, recent activity, saved jobs, blocked company filtering.
- `src/hooks/use-blocked-companies.ts`
  - Candidate company blocking/unblocking and visibility checks.
- `src/context/auth.tsx`
  - Candidate session restore, profile row creation, role/onboarding routing, logout.

### Where recruiter logic lives

- `src/services/impl/recruiter.service.ts`
  - Recruiter dashboard stats, recruiter jobs, candidate list, job posting, application status updates, application events.
- `src/lib/jobs/recruiter-activity.ts`
  - Activity/timeline writes for recruiter-side events.
- `src/hooks/use-recruiter-limits.ts`
  - Recruiter posting quota placeholder.

### Where jobs logic lives

- `src/services/impl/jobs.service.ts`
  - Mock jobs service for list/detail/search/related jobs.
- `src/hooks/use-candidate-dashboard.ts`
  - Live candidate dashboard job loading and ranking.
- `src/components/jobs/job-feed.tsx`
  - Search/filter state and job list behavior.
- `src/lib/jobs/candidate-search.ts`
  - Search parsing, scoring, highlight-friendly query handling, recent searches.

### Where applications logic lives

- `src/hooks/use-applications.ts`
  - Candidate application loading, creation, duplicate handling, daily limit.
- `src/services/impl/recruiter.service.ts`
  - Recruiter application status updates and recruiter-side timeline events.
- `src/hooks/use-candidate-dashboard.ts`
  - Converts application rows into dashboard activity items.

### Where saved jobs logic lives

- `src/hooks/use-saved-jobs.ts`
  - Candidate save/unsave flows and saved-job loading.
- `src/lib/jobs/recently-viewed.ts`
  - Separate recently-viewed jobs list stored in localStorage.

### Where profile persistence lives

- `src/lib/profile/persistence.ts`
  - Main profile read/write layer for candidate and recruiter profiles.
- `src/lib/settings/persistence.ts`
  - Settings-page profile edits that reuse the profile persistence layer.
- `src/context/auth.tsx`
  - Creates missing `profiles` rows after auth and writes role/onboarding state.

## 2. Hooks

### Important hooks

- `src/hooks/use-candidate-dashboard.ts`
  - Candidate dashboard orchestrator.
  - Loads profile, active jobs, applications, saved jobs, blocked companies, and recently viewed jobs.
  - Builds recommended jobs and application activity items.
- `src/hooks/use-applications.ts`
  - Candidate applications hook.
  - Uses Supabase when authenticated; otherwise falls back to mock applications for demo state.
- `src/hooks/use-saved-jobs.ts`
  - Saved jobs hook.
  - Uses Supabase only for authenticated candidates.
- `src/context/auth.tsx`
  - Auth context and session restore.
  - Also exposes onboarding state helpers and post-auth routing.
- `src/hooks/use-blocked-companies.ts`
  - Blocked company state for candidates.
- `src/hooks/use-data.ts`
  - Generic service wrapper hook for `ApiResult<T>`.
  - Not the primary data path for the main app, but it defines the intended service contract.
- `src/hooks/use-application-limit.ts`
  - Daily apply limit calculation.
- `src/hooks/use-recruiter-limits.ts`
  - Recruiter posting quota placeholder.

## 3. Supabase Usage

### Auth / session

- `src/lib/supabase/client.ts`
  - Browser-only Supabase client.
  - Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Uses `persistSession`, `autoRefreshToken`, `detectSessionInUrl: false`, `flowType: "pkce"`.
- `src/services/impl/auth.service.ts`
  - Uses OTP/magic-link for sign-up flow.
  - `signIn()` is intentionally blocked and tells callers to use Google OAuth or email magic link.

### Candidate profile save

- Table(s): `profiles`, `candidate_profiles`
- Read pattern:
  - `loadCurrentProfile()` reads `profiles` first, then `candidate_profiles`.
- Write pattern:
  - `saveCandidateProfile()` updates `profiles` and upserts `candidate_profiles`.
  - `saveCandidateSocialLink()` upserts a single social-link field in `candidate_profiles`.
- Ownership field:
  - `profiles.id`
  - `candidate_profiles.user_id`
- RLS assumption:
  - The current user can only read/write their own profile rows.

### Recruiter profile save

- Table(s): `profiles`, `recruiter_profiles`
- Read pattern:
  - `loadCurrentProfile()` reads both tables by `user.id`.
- Write pattern:
  - `saveRecruiterProfile()` updates `profiles` and upserts `recruiter_profiles`.
- Ownership field:
  - `profiles.id`
  - `recruiter_profiles.user_id`

### Candidate settings

- Table: `candidate_settings`
- Read pattern:
  - `loadCandidateSettings()` selects by `candidate_id`.
- Write pattern:
  - `saveCandidateSettings()` upserts on `candidate_id`.
  - `saveCandidatePhone()` also updates phone in `profiles` and `candidate_profiles`.
- Ownership field:
  - `candidate_id`

### Applications

- Table: `applications`
- Read pattern:
  - `useApplications()` selects by `user_id` or `candidate_id`.
  - It also joins `jobs(...)` for display data.
- Write pattern:
  - Candidate apply inserts `job_id` or `job_external_id`, plus both `user_id` and `candidate_id` where possible.
  - Recruiter updates patch `status`, `updated_at`, and timeline columns like `viewed_at`, `resume_downloaded_at`, `shortlisted_at`, `rejected_at`, `hired_at`.
- Ownership field:
  - Candidate side: `user_id` and `candidate_id`
  - Recruiter side: ownership is inferred through the recruiter-owned jobs query, not by writing to applications directly.
- RLS assumption:
  - Candidates see their own applications.
  - Recruiters only update applications for jobs they own.

### Saved jobs

- Table: `saved_jobs`
- Read pattern:
  - `useSavedJobs()` selects by `candidate_id` or `user_id`, with a `jobs(...)` join for presentation.
- Write pattern:
  - Toggle save inserts either `job_id` or `job_external_id` plus both identity columns when possible.
  - Duplicate saves rely on `23505` handling.
- Ownership field:
  - `candidate_id` and legacy `user_id`

### Recruiter jobs and candidates

- Table: `jobs`
- Read pattern:
  - `recruiterService.getJobs()` uses `selectRecruiterJobs()` and falls back to legacy ownership columns when schema cache or column lookup fails.
  - `recruiterService.getCandidates()` loads recruiter-owned jobs, then applications for those job IDs, then candidate profiles.
- Write pattern:
  - `recruiterService.postJob()` inserts a compatibility-rich job payload.
  - `updateJobStatus()` is still a stub.
- Ownership field:
  - `recruiter_profile_id` first, then fallback to `recruiter_id`

### Storage

- `src/services/impl/upload.service.ts`
  - Avatar upload uses Supabase Storage when enabled.
  - Resume and portfolio image uploads are still mock/future paths.
- Bucket usage is controlled by `storageConfig` and `storageConfig.avatarsBucket`.

## 4. Data Flow

### Candidate profile save

1. UI gathers candidate profile edits.
2. `src/lib/profile/persistence.ts` updates `profiles`.
3. The same function upserts `candidate_profiles` with the extended profile payload.
4. `src/context/auth.tsx` may also update role/onboarding fields as part of onboarding completion.
5. After save, dashboards and settings reload from Supabase-backed profile reads.

### Recruiter job post

1. Recruiter UI collects job form data.
2. `src/services/impl/recruiter.service.ts` builds a compatibility payload with recruiter identity and company metadata.
3. The service inserts into `jobs`, trying multiple payload variants if older schemas reject columns.
4. If insert succeeds, recruiter dashboards and job lists read the new row.

### Candidate apply

1. `src/hooks/use-applications.ts` checks for duplicates in loaded applications.
2. It enforces the daily application limit from `src/hooks/use-application-limit.ts`.
3. If authenticated and allowed, it inserts into `applications`.
4. It retries with a smaller payload if schema compatibility fails.
5. The hook then refetches and/or appends an optimistic application item.

### Save job

1. `src/hooks/use-saved-jobs.ts` checks auth, candidate role, and onboarding completion.
2. It inserts or deletes from `saved_jobs`.
3. The hook uses duplicate handling for `23505`.
4. Saved-job state is refetched after changes.

### Application status update

1. Recruiter UI sends a status/event change.
2. `src/services/impl/recruiter.service.ts` updates `applications`.
3. It writes the status plus the relevant timeline timestamp column.
4. Candidate dashboard activity is derived from those timestamps, not from a separate activity table.

### Dashboard data loading

1. `src/hooks/use-candidate-dashboard.ts` waits for auth to settle.
2. It loads the current profile from `src/lib/profile/persistence.ts`.
3. It fetches active jobs directly from Supabase.
4. It loads applications, saved jobs, blocked companies, and recently viewed jobs.
5. It computes recommendation cards and activity updates locally.

### Search data loading

1. Search UI keeps query/filter state in component state and localStorage.
2. Job rows come from Supabase when authenticated; otherwise the UI falls back to static job data.
3. `src/lib/jobs/candidate-search.ts` parses the query and scores results.
4. The job feed applies client-side filters and sort logic.

## 5. Error Handling

### Current pattern

- Most service functions wrap work in `wrapRequest()` from `src/lib/errors.ts`.
- `wrapRequest()` converts exceptions into `ApiResult<T>` with a normalized `ApiError`.
- The app often logs Supabase errors to `console.error()` with a context tag.
- UI components usually show a toast, inline message, or empty-state fallback after a service error.

### Toast / error display pattern

- Save/apply/profile flows typically surface errors through toasts or inline form messages.
- Hooks usually return `{ error: string | null }` or `loaded` state so the UI can decide how to render failures.
- Auth failures and redirect issues are usually logged and then the user is routed back to a safe page.

### Known weak areas

- Some services still throw directly instead of returning a typed `ApiResult`.
- `jobs.service.ts` and `profile.service.ts` are still mock implementations, so they can hide real backend issues during local testing.
- `recruiter.service.ts` has schema fallback logic that can mask underlying schema drift until a later insert/select path fails.
- `useApplications()` and `useSavedJobs()` still mix optimistic updates with refetches, which can briefly desync UI and DB state.

## 6. Mock / Fallback Rules

### Where mock data still exists

- `src/services/impl/jobs.service.ts`
- `src/services/impl/profile.service.ts`
- `src/services/mock-api.ts`
- `src/services/impl/recruiter.service.ts` when no recruiter session is available
- `src/hooks/use-applications.ts` when the user is not authenticated
- `src/hooks/use-saved-jobs.ts` when the user is not authenticated or not a candidate
- `src/services/impl/upload.service.ts` for resume/portfolio uploads
- `src/hooks/use-recruiter-limits.ts`

### When fallback is allowed

- Anonymous browsing of jobs.
- Local demo experience when no Supabase client is configured.
- Recruiter dashboard placeholders when the user is not authenticated.
- Recently viewed jobs and search state stored locally.

### When fallback is forbidden

- Authenticated candidate dashboard data should come from real Supabase data.
- Authenticated candidate applications and saved jobs should not silently show fake data.
- Candidate profile edit and settings should not be treated as mock once the user is signed in.
- Recruiter-owned job/application actions should not silently succeed with fake persistence.

### Important caveat

The intended product rule is:

- authenticated users should not see fake data

But some legacy paths still violate that intent:

- `profile.service.ts` still returns mock profile data
- `jobs.service.ts` still uses static jobs
- `useApplications()` falls back to mock applications when the user is not authenticated
- `recruiter.service.ts` falls back to mock recruiter data when no recruiter session is available

That means the repo currently mixes “real” and “demo” flows depending on auth and environment.

## 7. Duplication Risks

### Duplicated fetch logic

- Job loading is implemented in several places:
  - `src/services/impl/jobs.service.ts`
  - `src/hooks/use-candidate-dashboard.ts`
  - `src/components/jobs/job-feed.tsx`
  - `src/lib/jobs/candidate-search.ts`
- Application loading exists in both:
  - `src/hooks/use-applications.ts`
  - `src/services/impl/recruiter.service.ts`
- Profile loading exists in both:
  - `src/lib/profile/persistence.ts`
  - `src/lib/settings/persistence.ts`
  - `src/context/auth.tsx`

### Duplicate schema mapping

- `profiles` and `candidate_profiles` both carry overlapping candidate identity fields.
- `recruiter_id` and `recruiter_profile_id` are both used for job ownership.
- `user_id` and `candidate_id` are both used for applications and saved jobs.
- `company` and `company_name` are both read in multiple selectors.
- `avatar_url` and `profile_image_url` are both treated as candidate image sources.

### Old compatibility paths

- `recruiterService.selectRecruiterJobs()` falls back from `recruiter_profile_id` to `recruiter_id`.
- `loadCurrentProfile()` and `ensureProfile()` handle missing `onboarding_step`.
- Application loading and saving retry smaller payloads when older schemas reject columns.
- Recruiter job insert retries omit newer columns after schema errors.

### Places likely to regress

- Application status timeline fields.
- Candidate save/unsave consistency.
- Job ownership resolution for recruiter dashboards.
- Profile completion and onboarding state, because the auth layer and profile layer both write route state.
- Search/ranking behavior, because UI filters and score utilities are split across multiple files.

## 8. Recommended Refactor Later

These are safe future improvements to consider later:

1. Consolidate all candidate profile persistence into one module and one row-mapping strategy.
2. Consolidate all application reads/writes into one canonical service with typed return values.
3. Replace mock service implementations with real Supabase-backed implementations or explicit demo-only wrappers.
4. Remove duplicate ownership fallbacks once the live schema is stable.
5. Centralize job row mapping so search, dashboard, recruiter views, and related jobs use the same transformer.
6. Move all auth/profile/onboarding route state updates into one shared helper so `profiles` is the single source of truth.
7. Introduce a single error-display convention for toasts, inline validation, and banner errors.
8. Add a strict “authenticated users never see mock data” guard at the hook/service boundary.

