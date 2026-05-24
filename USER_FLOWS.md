# USER FLOWS

This document captures the current and intended user flows in iJobs based on the routes, hooks, guards, and page components in the repository.

## 1. Global Auth

### Logged-out browsing
- Logged-out users can browse public surfaces that do not require protection, such as the auth home and marketing-style entry points.
- Protected candidate pages redirect logged-out users to `/auth/home`.
- Protected recruiter pages use the recruiter guard, which also prevents unauthenticated access and falls back to auth.

### Login / register
- The auth modal supports `signin`, `signup`, and `select` states.
- Email auth uses a magic-link / OTP style flow.
- Google sign-in uses Supabase OAuth and returns through `/auth/callback` with a `next` query param when provided.
- Role selection happens after sign-in when the user does not yet have a role.

### Session restore
- On app mount, auth context restores the current session from Supabase first, then falls back to the local/mock auth service when needed.
- While restoring, protected screens show loading states instead of blank content.

### Logout
- Logout clears local user state, navigates back to `/`, and then signs out through the auth service.

### Expired session
- If session restoration fails or no session exists, protected pages redirect to auth rather than rendering partial data.
- If a session expires while on a protected page, the app path falls back to auth/redirect handling on the next auth refresh or guard check.

## 2. Candidate Flows

### Onboarding
Current flow:
- Candidate onboarding begins after role selection or when post-auth routing resolves to the candidate onboarding path.
- The onboarding flow is multi-step: resume, basic details, preferences, skills, experience, education, certifications, projects, photo, and review.
- If a resume is uploaded, it can be parsed and used to prefill profile fields.
- The flow saves the candidate profile and then marks onboarding complete.
- After completion, the user is routed to `/dashboard`.

Intended flow:
- The onboarding experience is designed to create a strong candidate profile with enough structured data for search, matching, and recruiter visibility.

### Dashboard
Current flow:
- Candidate dashboard is the post-onboarding landing page.
- It surfaces recommended jobs, recent applications, saved jobs, and profile completion.
- The dashboard search box can route directly into `/jobs?q=...`.

Intended flow:
- The dashboard acts as a personalized home surface driven by profile data, recent activity, and job recommendations.

### Discover Jobs
Current flow:
- Discover jobs lives on `/jobs`.
- The page accepts `q` in the URL and uses it as the active search query.
- Jobs are fetched from Supabase when available, with local/mock fallback behavior if needed.
- Search results can be ranked and filtered client-side after fetch.

### Search / filter
Current flow:
- Search supports keywords across title, company, description, location, skills, and related profile preferences.
- Filters include work mode, experience, job type, salary range, date posted, easy apply, skills, location, and designation-related input.
- The search state is persisted in localStorage and restored on reload.
- Suggested and recent searches are used to speed up re-entry.

### Save jobs
Current flow:
- Candidates can save jobs from job cards and job detail surfaces.
- Saved jobs appear in the saved jobs page and in dashboard previews.
- Toggling a saved job removes it when already saved.

### Apply jobs
Current flow:
- Candidates apply from job detail or job surfaces.
- The application flow checks auth, role, onboarding, and daily apply limits before inserting the application.
- Duplicate applications are blocked.
- Application timeline fields are updated later by recruiter actions.

### Applied jobs
Current flow:
- The applications page shows application status tabs and event timelines.
- Status groups include all, applied, shortlisted, rejected, and hired.
- When real application data is unavailable, a demo fallback may be shown to preserve the UI.

### Profile
Current flow:
- Candidate profile displays the structured profile, experience, portfolio, links, education, certifications, and quick actions.
- If the profile cannot be loaded, the UI shows an explicit fallback state instead of a blank page.

### Profile section editing
Current flow:
- Profile editing is broken into sections and can be launched from the profile page.
- Candidate edits can update personal details, career preferences, skills, tools, languages, resume, avatar, experience, education, certifications, and projects.
- Saves refresh the current user profile state after completion.

### Settings
Current flow:
- Candidate settings include communication, account, preferences, and blocked companies.
- Users can adjust job recommendation frequency, recruiter messaging, profile visibility, and promotional email preferences.
- They can update mobile number, request password reset for email-auth accounts, and deactivate the account.

Intended flow:
- The settings page is designed to act as the control center for candidate privacy, discovery, and communication preferences.

### Blocked companies
Current flow:
- Candidates can block companies from the settings page.
- Blocked companies are stored per candidate and can be removed later.
- Some surfaces already filter blocked companies from candidate-facing recommendations, while other surfaces only document the preference for future visibility rules.

### FAQs
Current flow:
- FAQs are candidate-only.
- Users can search FAQ content locally and expand answers inline.

## 3. Recruiter Flows

### Onboarding
Current flow:
- Recruiter onboarding follows role selection and post-auth routing.
- The recruiter completes a short company profile with company name, site, size, industry, hiring title, location, and optional phone/logo.
- The onboarding flow saves recruiter profile data and marks onboarding complete.
- After completion, the user is routed to `/recruiter/dashboard` or the next recruiter landing route.

### Dashboard
Current flow:
- Recruiter dashboard aggregates posted jobs, application counts, shortlist previews, and hiring snapshot cards.
- Some dashboard metrics are still placeholders or mock-backed where the implementation is not finished.

Intended flow:
- The dashboard is meant to be the recruiter command center for posting, reviewing, and monitoring hiring activity.

### Post job
Current flow:
- Recruiter posting uses a structured form with required fields, skill chips, salary validation, and a status selector.
- The flow validates required fields before calling the recruiter service.
- Recruiter limits can block posting and show an upgrade prompt.
- A successful post returns the recruiter to the recruiter area.

### Manage jobs
Current flow:
- Recruiter job management shows active and inactive listings.
- Posted jobs can be reviewed from the recruiter jobs page and dashboard.

### View applicants
Current flow:
- Recruiter candidates/applications page loads applications for recruiter-owned jobs.
- Filters are available for newest, applied, shortlisted, rejected, and hired.
- Recruiters can view candidate details, open resumes, and review application events.

### Shortlist / reject / hire
Current flow:
- Recruiters can update application status to shortlisted, rejected, or hired.
- Each status change updates the corresponding timestamp field in the application record.

### Resume download
Current flow:
- Opening a candidate resume marks the resume as downloaded before the browser opens the file URL.

### Recruiter activity
Current flow:
- The codebase has recruiter activity logging utilities and placeholder dashboard metrics.
- Some activity surfaces are already wired for tracking, while the score summary still shows placeholder text in parts of the UI.

## 4. Candidate ↔ Recruiter Connection

### Job posting visibility
Current flow:
- Active recruiter jobs are visible to candidates.
- Inactive, paused, closed, or filled jobs are treated as not currently open.
- Candidate blocks can suppress visibility on supported surfaces.

### Skill matching
Current flow:
- Candidate profile skills feed job recommendation and search scoring.
- Job skills are also part of search matching and highlighting.

### Tools matching
Current flow:
- Candidate tools are stored in profile data and are used in onboarding/profile editing.
- Search/ranking utilities currently emphasize skills more than tools, but candidate tools are part of profile personalization data.

### Designation matching
Current flow:
- Candidate headline, current title, and designation-like fields influence recommendations and search scoring.
- Job search also parses designation-like phrases from user queries.

### Experience matching
Current flow:
- Candidate experience level and total experience are used in ranking and recommendation logic.
- Job experience fields influence both matching and filter behavior.

### Salary matching
Current flow:
- Candidate expected salary and job salary ranges are used as part of profile and search context.
- Salary can be displayed and filtered, but matching fidelity depends on the available job data.

### Application creation
Current flow:
- Candidate application creation checks auth, onboarding, duplicate apply, and daily apply limit rules.
- Applications can reference either internal job IDs or external job IDs depending on the source record.

### Application status updates
Current flow:
- Recruiter actions update application status and event timestamps.
- Candidate-facing pages read those timestamps back into the application timeline.

## 5. If / Else Routing Rules

### No user
- Protected candidate pages redirect to `/auth/home`.
- Recruiter guards also block access and return the user to auth.

### User no role
- The user is routed to `/onboarding/select-role`.

### Candidate incomplete
- Incomplete candidate profiles are routed to `/onboarding/candidate`.

### Candidate complete
- Completed candidate profiles route to `/dashboard`.

### Recruiter incomplete
- Incomplete recruiter profiles route to `/onboarding/recruiter`.

### Recruiter complete
- Completed recruiter profiles route to `/recruiter/dashboard`.

### Wrong role accessing route
- Candidate pages protected by role checks redirect to the correct post-auth route if a recruiter lands there.
- Recruiter pages protected by the recruiter guard redirect or block access when a candidate lands there.
- Admin routes follow their own protected-route logic and require the admin role.

## 6. Edge Cases

### Duplicate apply
- Duplicate applications are prevented by application logic and database duplicate handling.
- The user receives an explicit already-applied message.

### Daily apply limit
- Application creation checks the current-day application count and blocks new applies when the limit is reached.

### Already saved job
- Saved jobs toggle cleanly between saved and unsaved states.
- Duplicate save inserts are handled safely so the UI does not break.

### Blocked company
- Blocked companies are stored and surfaced in settings.
- Some candidate recommendation paths already respect the blocked list.
- Other parts of the product still treat blocking as an intent or future visibility rule rather than a complete hard filter.

### Missing profile row
- Profile restoration tries to create missing profile records instead of failing immediately.

### Schema / API failure
- Several screens and hooks have mock or local fallback data so the UI can still render if Supabase data is unavailable.
- Error states are surfaced through toast messages, inline alerts, or empty states rather than silent failures.

### Blank screen prevention
- Protected pages render loading spinners while auth/session state is resolving.
- Empty data states use skeletons, helper text, or placeholder cards instead of rendering nothing.

## 7. Notes on Intended Behavior

- Some recruiter analytics and activity surfaces are still partial or placeholder-backed.
- Some privacy and blocked-company behavior is implemented in settings and matching, but not yet enforced uniformly everywhere.
- The codebase is intentionally defensive around auth and profile restoration so users are routed before they hit a broken page.

