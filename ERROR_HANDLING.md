# Error Handling

The app has a mix of strong and weak error handling:

- good logging discipline in Supabase-heavy service code
- several user-facing toasts and inline errors
- fallback/empty states on some screens
- but also a few direct `throw new Error(...)` paths that can still surface raw backend messages

## 1. Error Types

### Auth errors

- OAuth start failures in `src/components/auth/auth-modal.tsx`
- email OTP / magic-link failures in the same modal
- sign-out failures from `src/services/impl/auth.service.ts`
- invalid or missing auth session in `src/context/auth.tsx`

### Session restore errors

- `restoreSession()` failures in `src/context/auth.tsx`
- `refreshUser()` failures when Supabase session hydration or profile loading fails
- `src/app/auth/callback/page.tsx` can fail on code exchange or provider error

### Supabase schema/cache errors

- Missing columns or schema cache mismatch, especially:
  - `onboarding_step`
  - `recruiter_profile_id`
  - legacy compatibility columns in `jobs`, `applications`, `profiles`
- Recruiter service explicitly detects schema/cache failures and retries alternate payloads or alternate column names.

### RLS / permission errors

- Auth-required writes that fail because the user is not signed in
- role-gated actions such as:
  - candidate-only apply/save actions
  - recruiter-only job posting and application updates
- these often surface as generic Supabase errors unless converted to a friendlier message

### Network errors

- `src/lib/errors.ts` maps `TypeError("Failed to fetch")` to a `NETWORK_ERROR`
- many other network failures are still surfaced via generic error messages or raw Supabase responses

### Form validation errors

- onboarding validation
- profile section validation
- recruiter job-post validation
- settings form validation

### Upload errors

- invalid file type
- oversized file
- storage not configured
- auth missing for avatar upload
- Supabase Storage upload failures

### Job apply/save errors

- duplicate apply
- apply limit reached
- duplicate save
- save requires auth / candidate role / onboarding completion
- save/apply insert failures

### Blank screen / render errors

- protected-route loading states can look like a blank screen while auth restores
- auth callback errors render a plain error block
- some fallback paths silently return empty content instead of an explicit error

## 2. Current Error Handling Pattern

### Where errors are shown

- `src/app/dashboard/page.tsx`
  - uses `ErrorState` for candidate profile load failures
- `src/app/profile/edit/page.tsx`
  - inline alert block for load/save failures
- `src/app/settings/page.tsx`
  - toast-based load/save feedback
- `src/app/recruiter/post-job/page.tsx`
  - toast-based validation and publish errors
- `src/app/onboarding/candidate/page.tsx`
  - inline alert block for resume analysis and save failures
- `src/app/auth/callback/page.tsx`
  - inline error block when auth callback fails
- `src/components/jobs/job-detail.tsx`
  - toast-based apply/save/auth errors

### Where errors are only logged

- `src/context/auth.tsx`
  - profile hydration and session restore problems are logged to console, then the UI falls back to auth-safe routing
- `src/lib/profile/persistence.ts`
  - profile load/save errors are logged with Supabase details, then thrown upward
- `src/lib/settings/persistence.ts`
  - most errors are thrown upward, leaving the page to decide how to show them
- `src/services/impl/recruiter.service.ts`
  - logs rich Supabase error context before throwing `ServiceError`
- `src/hooks/use-applications.ts`
  - logs load/apply/daily-limit failures and returns an error string
- `src/hooks/use-saved-jobs.ts`
  - logs load/save failures and returns an error string

### Toast usage

- `src/components/ui/toast.tsx` provides the shared toast system.
- It supports:
  - `success`
  - `error`
  - `info`
- Toasts auto-dismiss after 3 seconds.
- The main toast-heavy screens are:
  - settings
  - recruiter post job
  - job detail apply/save
  - company block/unblock

### Inline errors

- Candidate onboarding
- Candidate profile edit
- Auth callback
- Dashboard profile load error
- Upload controls and form validation messages

### Fallback states

- Loading skeletons:
  - `src/components/ui/loading-state.tsx`
  - `src/components/jobs/skeleton-card.tsx`
  - `src/components/jobs/skeleton-detail.tsx`
- Empty states:
  - `src/components/jobs/empty-states.tsx`
  - dashboard empty sections
- Silent fallback to demo/static data exists in some unauthenticated paths

## 3. Required UX Rules

### Never show

- raw Supabase schema cache errors to end users
- blank white screens
- stuck loading forever
- silent failures

### Always show

- a readable message
- retry option where useful
- a safe fallback state

### Current compliance level

- Good:
  - dashboard profile load has retry
  - auth callback shows a readable error
  - onboarding and settings show readable messages
  - job detail gives toast feedback
- Weak:
  - some errors are still surfaced by `error.message` directly
  - some data loads silently fall back to empty/demo data instead of showing why
  - some loading states have no explicit timeout or recovery UI

## 4. Critical Flows

### Login / auth callback

- OAuth start issues are shown inline in the auth modal.
- Callback failures show a visible error page in `src/app/auth/callback/page.tsx`.
- PKCE issues are logged with a special tag, but the user still just sees the callback error message.

### Onboarding completion

- Validation and parse/save failures are shown inline.
- Resume analysis failure is recoverable and allows manual continuation.
- Save failures show a readable error and keep the user on the onboarding screen.

### Candidate profile save

- Profile editor load/save failures are shown inline.
- Upload failures from avatar selection are shown inline through the editor.
- Profile persistence logs Supabase details before throwing upward.

### Recruiter job post

- Required-field validation shows a toast.
- Publish/save failures show a toast and are also logged.
- The page keeps the form intact so the recruiter can correct and retry.

### Easy apply

- Duplicate apply is surfaced as a toast.
- Daily apply limit is surfaced as a user-readable error.
- Apply insert failures are shown as toast errors.
- Success gets a success toast.

### Save job

- Save is blocked for logged-out users, wrong role, and incomplete onboarding.
- Save failures return readable error strings and are shown as toast errors.
- Duplicate save is handled via `23505` and refreshed from the server.

### Dashboard data load

- Candidate dashboard profile load failures use `ErrorState` with a retry button.
- Job and other section loads fall back to empty states instead of a blank page.
- The dashboard does not currently have a dedicated timeout fallback for every async sub-load.

### Profile image / resume upload

- Avatar upload validates file type and size before attempting storage.
- Resume upload validates file type and size.
- Storage-not-configured errors are surfaced as readable messages.
- Upload preview is local-first, so a preview can appear before persistence succeeds.

## 5. Debugging Requirements

When logging developer errors, include:

- `error.message`
- `error.code`
- `error.details`
- `error.hint`
- affected table if known
- affected route or component if known

Good examples already used in the repo:

- `[AUTH] Profile ... failed`
- `[PROFILE] ... load failed`
- `[APPLICATIONS] ... failed`
- `[JOBS] ... failed`
- `[SETTINGS] Load failed`

## 6. Known Current Risks

- Schema cache errors can still bubble up through raw `error.message` in some save/load paths.
- Blank screen after login is possible if auth restore or callback routing stalls.
- Stale profile state can survive if the profile row write succeeds partially or the route state and table state diverge.
- Fake success toast risk exists when optimistic updates succeed locally but the server write or refetch later fails.
- Save/apply mismatch risk exists when local optimistic state updates but the backing row is not refreshed correctly.
- Upload preview not persisted is possible because avatar preview is local until the upload/save round-trip completes.

## 7. Recommended Future Fixes

### Shared error formatter

- Add one formatter that converts Supabase/auth/network errors into:
  - user message
  - developer log payload
  - retry hint

### Shared toast helper

- Standardize success/error toast calls so every page uses the same fallback message strategy.

### Route error boundaries

- Add route-level boundaries for:
  - auth callback
  - dashboard
  - profile edit
  - settings
  - recruiter post job

### Loading timeout fallback

- If restore/load exceeds a threshold, show a recovery card instead of an indefinite spinner.

### Retry components

- Standardize a retry panel for:
  - profile load
  - dashboard load
  - settings load
  - recruiter data load

### Additional safe improvements

1. Normalize all `throw new Error(error.message)` paths into typed service errors.
2. Hide raw Supabase schema/cache errors behind a common “we’re updating the app” message.
3. Refetch after every optimistic mutation that changes saved jobs, applications, or profile data.
4. Add explicit empty-state messaging for unauthenticated fallback data so demo mode is obvious.
5. Log route and table context alongside every Supabase error for faster debugging.

