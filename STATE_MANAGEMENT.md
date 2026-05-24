# State Management

This app uses a mixed state model:

- Supabase is the source of truth for authenticated business data.
- React state drives the active screen and transient form edits.
- `localStorage` is used only for lightweight UI persistence such as recent searches, search filters, recently viewed jobs, and recruiter job-post quota.

The biggest state risk in the repo is that some older/demo paths still return mock data when a real session is not available.

## 1. Auth State

### User / session state

- `src/context/auth.tsx` owns the main auth state.
- It stores:
  - `user`
  - `role`
  - `onboardingComplete`
  - `onboardingStep`
  - `isLoading`
- `user` is a derived auth user object, not the raw Supabase session.

### Profile hydration

- On mount, the provider calls `restoreSession()`.
- `refreshUser()` checks Supabase session first.
- `hydrateSupabaseUser()` ensures a `profiles` row exists and then maps Supabase user + profile row into app state.
- Missing or broken profile rows are created or repaired through `ensureProfile()` and `upsertProfileRouteState()`.

### Loading state

- `isLoading` stays true while session restore and auth hydration are in progress.
- Protected route components show a spinner while this is happening.
- This prevents flashing the wrong route, but it can also look like a stuck screen if profile hydration fails repeatedly.

### Role state

- Roles are normalized to:
  - `candidate`
  - `recruiter`
  - `admin`
  - `null`
- `role`, `onboardingComplete`, and `onboardingStep` all live in auth context and are mirrored into `profiles`.

### Onboarding state

- Onboarding state is stored in both auth context and `profiles`.
- `setRole()`, `setOnboardingStep()`, and `completeOnboarding()` update Supabase and then update local auth state.
- `getPostAuthRedirect()` uses profile state to route the user to the right destination.

## 2. Candidate State

### Profile data

- Main candidate profile state lives in `src/lib/profile/persistence.ts`.
- It reads from:
  - `profiles`
  - `candidate_profiles`
- It writes back to both tables for compatibility.
- Candidate profile sections are edited locally first, then persisted on save.

### Dashboard data

- `src/hooks/use-candidate-dashboard.ts` owns the candidate dashboard state.
- It loads:
  - profile
  - active jobs
  - applications
  - saved jobs
  - blocked companies
  - recently viewed jobs
- It also computes:
  - recommended jobs
  - application activity items
  - profile strength

### Applications

- `src/hooks/use-applications.ts` owns candidate application state.
- It loads from `applications` when authenticated.
- It falls back to demo applications only when there is no real authenticated Supabase session.
- It also enforces duplicate prevention and daily apply limits.

### Saved jobs

- `src/hooks/use-saved-jobs.ts` owns saved-job state.
- It loads from `saved_jobs` for authenticated candidates.
- It tracks:
  - `savedJobs`
  - `loaded`
  - `savingIds`
- It supports optimistic add/remove with refetch after writes.

### Recently viewed jobs

- `src/lib/jobs/recently-viewed.ts` stores recently viewed jobs in `localStorage`.
- This is intentionally local-only.
- It is not treated as authoritative business data.

### Settings / preferences

- `src/lib/settings/persistence.ts` owns candidate settings state.
- It loads and saves:
  - job search status
  - recommendation toggles
  - recruiter message preferences
  - profile visibility
  - account status
- Phone number edits also update candidate profile rows.

## 3. Recruiter State

### Recruiter profile

- Recruiter profile state is also persisted through `src/lib/profile/persistence.ts`.
- It uses:
  - `profiles`
  - `recruiter_profiles`

### Posted jobs

- `src/services/impl/recruiter.service.ts` owns recruiter job loading and post-job writes.
- `getJobs()` and `getStats()` query Supabase.
- `postJob()` inserts into `jobs` with schema compatibility fallbacks.

### Applicants

- `src/services/impl/recruiter.service.ts` also owns recruiter candidate/applicant loading.
- It reads recruiter-owned jobs first, then application rows, then joins candidate profile data.
- Application timeline fields are part of the recruiter view state.

### Job posting form state

- Recruiter post-job form state is local React state in the page/component layer.
- It is not persisted until submit.
- `src/hooks/use-recruiter-limits.ts` also uses `localStorage` to track the free-post quota placeholder.

## 4. Search State

### Query

- Search query lives in component state in the header and job feed.
- The `q` URL query parameter is used on `/jobs`.

### Filters

- Main job filters live in `src/components/jobs/job-feed.tsx`.
- Filter state includes:
  - query
  - designation
  - location
  - job type
  - experience level
  - skills
  - salary min/max
  - freshness
  - location type
  - easy apply
  - active only
  - sort

### Sorting

- Sort lives in filter state.
- Current options are:
  - relevant
  - recent
  - salary

### URL params

- Search input is reflected in the `q` query param.
- Back/refresh behavior restores the job feed from URL state plus localStorage filter state.

### Local persistence

- `src/components/jobs/job-feed.tsx`
  - stores the full filter state in `localStorage` under `ijobs.jobSearchState`
- `src/lib/jobs/candidate-search.ts`
  - stores recent searches in `ijobs.candidateRecentSearches`
- `src/lib/jobs/recently-viewed.ts`
  - stores recently viewed jobs in `ijobs.recent-viewed-jobs`

## 5. Form State

### Onboarding forms

- Onboarding is mostly local state until completion.
- `src/components/onboarding/*` and `src/app/onboarding/candidate/page.tsx` hold the form inputs.
- The onboarding state is then committed to Supabase through auth/profile persistence.

### Profile section editors

- `src/components/profile/candidate-section-editor.tsx` uses local draft state for each section.
- `src/components/profile/profile-links.tsx` uses modal-local state for a single social link editor.
- The profile edit page aggregates this state and only writes on save.

### Recruiter post-job form

- Recruiter job creation is local form state until submit.
- After submit, the form state is translated into a compatibility-rich payload for Supabase.

## 6. Persistence Rules

### Supabase source of truth

- Authenticated data must live in Supabase:
  - profile
  - onboarding
  - candidate settings
  - applications
  - saved jobs
  - recruiter jobs
  - recruiter candidates/applicants
  - blocked companies

### Allowed localStorage usage

- Lightweight UI state only:
  - recent searches
  - job filter persistence
  - recently viewed jobs
  - recruiter job-post quota placeholder

### Forbidden localStorage usage

- Authenticated business data must not depend on localStorage.
- LocalStorage must not be the authoritative source for:
  - profile data
  - applications
  - saved jobs
  - settings
  - recruiter job posts
  - applicant status

## 7. Known Risks

- Stale auth profile
  - `profiles.role`, `onboarding_complete`, and `onboarding_step` can drift from the real session if a save path fails.
- Blank screen / stuck loading
  - auth hydration and protected-route guards intentionally hold the UI during restore, so failures can look like a stuck page.
- Duplicate local/server state
  - job filters, recent searches, and recently viewed jobs all exist locally while the canonical data comes from Supabase.
- Optimistic update failures
  - saved jobs and applications both use optimistic or semi-optimistic updates that can briefly diverge from the DB.
- Fake data fallback risk
  - some hooks/services still return mock/demo data when auth is missing, which can leak into user experience if a real session fails to restore.

## 8. Recommended State Rules

### When to refetch

- After login, logout, or session refresh.
- After onboarding completion.
- After profile saves.
- After candidate settings save.
- After save/unsave job mutations.
- After applying to a job.
- After recruiter status updates.
- After recruiter job creation.

### When to optimistic update

- Saved jobs can optimistic update, but only if a refetch follows.
- Applications can optimistic update on successful insert, but the DB row should still be refetched.
- Small local-only UI lists like recent searches and recently viewed jobs can update immediately.

### When to invalidate local state

- Clear local auth-adjacent UI state on logout.
- Clear saved filter state only when the user explicitly resets filters.
- Clear stale form drafts after successful save or modal close.
- Reset local fallback/demo state when a real Supabase session becomes available.

### When to show fallback / empty state

- Show empty states when the user is authenticated but there is no matching data.
- Show demo or fallback data only for anonymous browsing or explicit non-auth demo paths.
- Do not use fake data to mask an authenticated data load failure.

