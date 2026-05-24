# ROUTE MAP

This document lists the actual route structure currently present in the iJobs app and the main redirect / guard behavior attached to each route.

## 1. Public Routes

### Landing / home
- `/`
- File: `src/app/page.tsx`
- Purpose: public landing page.
- Behavior: if a user is already authenticated, it redirects them to their post-auth destination.

### Auth home
- `/auth/home`
- File: `src/app/auth/home/page.tsx`
- Purpose: public sign-in / sign-up entry point.
- Behavior: authenticated users are redirected to their post-auth destination.

### Auth callback
- `/auth/callback`
- File: `src/app/auth/callback/page.tsx`
- Purpose: Supabase OAuth / auth-code exchange callback.
- Behavior: exchanges `code` for a session, refreshes the user, then routes to either `next` or the post-auth destination.

### Public jobs
- `/jobs`
- File: `src/app/jobs/page.tsx`
- Purpose: discover jobs page.
- Behavior: accepts `q` as the search query parameter and passes it to the job feed.

### Job details
- `/jobs/[id]`
- File: `src/app/jobs/[id]/page.tsx`
- Purpose: public job detail page.
- Behavior: renders a job detail view for the requested job id.

### Company pages
- No standalone company route was found in `src/app`.
- Company data appears in modal/inline UI surfaces rather than a dedicated route.

### Other public content routes discovered
- `/about`
- `/blog`
- `/contact`
- `/cookies`
- `/press`
- `/pricing`
- `/privacy`
- `/terms`
- These are public static pages present in the app route tree, even though they are not part of the core job workflow.

## 2. Candidate Routes

### Dashboard
- `/dashboard`
- File: `src/app/dashboard/page.tsx`
- Guard: `ProtectedLayout allowedRoles={["candidate"]}`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Discover jobs
- `/jobs`
- File: `src/app/jobs/page.tsx`
- Guard: none at the route level
- Notes: candidate experience is enriched through the header search, saved jobs, and job-feed filters.

### Applications
- `/applications`
- File: `src/app/applications/page.tsx`
- Guard: `ProtectedLayout allowedRoles={["candidate"]}`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Saved jobs
- `/saved-jobs`
- File: `src/app/saved-jobs/page.tsx`
- Guard: `ProtectedLayout allowedRoles={["candidate"]}`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Profile
- `/profile`
- File: `src/app/profile/page.tsx`
- Guard: custom auth checks in the page itself, not a route wrapper
- Behavior:
  - logged out users are sent to `/`
  - recruiter users see the recruiter profile rendering inside the same route
  - candidate users see the candidate profile rendering inside the same route
- Important: this is a shared profile route, not candidate-only.

### Profile editing
- `/profile/edit`
- File: `src/app/profile/edit/page.tsx`
- Guard: `ProtectedLayout` with no role restriction
- Redirect when logged out: `/auth/home` via profile loading / auth handling
- Behavior: loads current profile data and saves candidate or recruiter edits depending on the current role.

### Settings
- `/settings`
- File: `src/app/settings/page.tsx`
- Guard: `ProtectedLayout allowedRoles={["candidate"]}`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### FAQs
- `/faqs`
- File: `src/app/faqs/page.tsx`
- Guard: `ProtectedLayout allowedRoles={["candidate"]}`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Onboarding
- `/onboarding`
- File: `src/app/onboarding/page.tsx`
- Behavior: immediately redirects to `/onboarding/select-role`

### Select role
- `/onboarding/select-role`
- File: `src/app/onboarding/select-role/page.tsx`
- Behavior:
  - logged out users are redirected to `/auth/home`
  - users who already have a role are redirected to their post-auth destination
  - otherwise the user chooses candidate or recruiter

### Candidate onboarding
- `/onboarding/candidate`
- File: `src/app/onboarding/candidate/page.tsx`
- Behavior:
  - logged out users are redirected to `/auth/home`
  - users who do not belong on this route are redirected to their post-auth destination
  - otherwise the multi-step candidate onboarding flow is shown

## 3. Recruiter Routes

### Recruiter dashboard
- `/recruiter`
- File: `src/app/recruiter/page.tsx`
- Guard: `RecruiterGuard`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Recruiter dashboard alias
- `/recruiter/dashboard`
- File: `src/app/recruiter/dashboard/page.tsx`
- Behavior: re-exports the `/recruiter` page.
- Notes: this is an alias, not a separate implementation.

### Post job
- `/recruiter/post-job`
- File: `src/app/recruiter/post-job/page.tsx`
- Guard: `RecruiterGuard`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Posted jobs / manage jobs
- `/recruiter/jobs`
- File: `src/app/recruiter/jobs/page.tsx`
- Guard: `RecruiterGuard`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Applicants / applications
- `/recruiter/candidates`
- File: `src/app/recruiter/candidates/page.tsx`
- Guard: `RecruiterGuard`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user

### Recruiter onboarding
- `/onboarding/recruiter`
- File: `src/app/onboarding/recruiter/page.tsx`
- Behavior:
  - logged out users are redirected to `/auth/home`
  - users who do not belong on this route are redirected to their post-auth destination
  - otherwise the recruiter onboarding form is shown

### Recruiter profile / settings
- No separate recruiter settings route was found.
- Recruiter profile data is edited through `/profile` and `/profile/edit`.

## 4. Admin Routes

### Admin dashboard / moderation
- `/admin`
- File: `src/app/admin/page.tsx`
- Guard: `ProtectedRoute allowedRoles={["admin"]}`
- Redirect when logged out: `/auth/home`
- Redirect when onboarding incomplete: onboarding route from auth state
- Redirect when wrong role: post-auth destination for that user
- Notes: this is a placeholder / MVP moderation surface in the current codebase.

## 5. Auth / Callback Routes

### Supabase callback
- `/auth/callback`
- Handles Supabase OAuth / PKCE / code-exchange callback.
- Query params used:
  - `code`
  - `next`
  - `error`
  - `error_description`

### Login redirects
- `src/app/page.tsx` and `src/app/auth/home/page.tsx` both redirect authenticated users to the post-auth destination returned by auth state.
- `src/app/onboarding/select-role/page.tsx` routes the user into the next onboarding step after role choice.
- `src/app/auth/callback/page.tsx` prefers `next` when it is safe and the user is a completed candidate; otherwise it uses the normal post-auth destination.

### Logout behavior
- Logout is handled by the auth context.
- It clears local auth state, calls sign-out, and routes back to `/`.

## 6. Route Guards

### `/dashboard`
- Allowed roles: candidate
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/applications`
- Allowed roles: candidate
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/saved-jobs`
- Allowed roles: candidate
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/settings`
- Allowed roles: candidate
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/faqs`
- Allowed roles: candidate
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/recruiter`
- Allowed roles: recruiter
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/recruiter/dashboard`
- Same behavior as `/recruiter` because it re-exports the same page.

### `/recruiter/jobs`
- Allowed roles: recruiter
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/recruiter/candidates`
- Allowed roles: recruiter
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/recruiter/post-job`
- Allowed roles: recruiter
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `/admin`
- Allowed roles: admin
- Logged out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### `profile` routes
- `/profile` is role-aware rather than role-restricted.
- `/profile/edit` is protected, but the save logic switches between candidate and recruiter profile persistence based on current role.

## 7. Logo / Navigation Behavior

### Candidate logo destination
- When authenticated as a completed candidate, the header logo links to `/dashboard`.

### Recruiter logo destination
- When authenticated as a completed recruiter, the header logo links to `/recruiter`.

### Logged-out logo destination
- When logged out, the header logo links to `/`.

### Admin logo destination
- When authenticated as admin, the header logo links to `/admin`.

### Navigation links
- Logged out: `/jobs` and `/recruiter`
- Candidate: `/dashboard`, `/jobs`, `/applications`, `/saved-jobs`, `/profile`
- Recruiter: `/recruiter`, `/recruiter/jobs`, `/recruiter/candidates`, `/recruiter/post-job`, `/profile`

## 8. Known Route Risks

### Blank screen risks
- Protected pages intentionally show loading spinners while auth is restoring, but if a page-level redirect depends on profile fetches, a temporary empty state can still appear.
- `profile` and `profile/edit` are more likely than other routes to show fallback states because they fetch data before rendering the final view.

### Redirect loop risks
- Auth routes and post-auth routes depend on `onboardingComplete` and `role` being current.
- If stale auth/profile state is cached locally, a user can be bounced between auth, onboarding, and their final landing route until refresh logic catches up.

### Stale onboarding state risks
- The route guards trust the auth/profile snapshot.
- If `onboardingComplete` or `role` are outdated, a user may temporarily see the wrong redirect target before the session is refreshed.

### Coverage gaps
- No standalone company route exists yet.
- No dedicated recruiter settings route exists yet.
- `/recruiter/dashboard` is an alias rather than a separate page implementation.

