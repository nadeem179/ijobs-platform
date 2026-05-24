# API Contracts

This document captures the current request/response and Supabase payload contracts used by iJobs.
It reflects the existing codebase, including legacy compatibility fields and fallback behavior.

## 1. API Routes

### `POST /api/ai/parse-resume`

- Purpose: Parse resume text into structured profile data using OpenRouter.
- Auth: No user auth required; server-side API key required.
- Request body:
  ```json
  { "resumeText": "..." }
  ```
- Validation:
  - `resumeText` is required.
- Success response:
  - Raw JSON object produced by the model, expected to contain:
    - `full_name`
    - `headline`
    - `about`
    - `phone`
    - `location`
    - `designation`
    - `current_title`
    - `current_company`
    - `total_experience_years`
    - `total_experience_months`
    - `skills`
    - `tools`
    - `languages`
    - `experiences`
    - `education`
    - `certifications`
    - `projects`
- Error response:
  ```json
  { "error": "Resume text is required" }
  ```
  ```json
  { "error": "OpenRouter request failed" }
  ```
  ```json
  { "error": "Failed to parse resume" }
  ```
- Notes:
  - On upstream failure, the route returns HTTP 500 and maps the OpenRouter error message when available.
  - The route logs `[OPENROUTER_RESUME_PARSE_ERROR]` on unexpected failures.

### `POST /api/jobs/activity-status`

- Purpose: Sync job lifecycle statuses based on recruiter activity and inactivity rules.
- Auth:
  - If `JOB_ACTIVITY_CRON_SECRET` is not set, the route is effectively open.
  - If `JOB_ACTIVITY_CRON_SECRET` is set, the request must include either:
    - `Authorization: Bearer <secret>`
    - `x-cron-secret: <secret>`
- Query params:
  - `dryRun=true` to compute updates without writing them.
- Request body:
  - None.
- Success response:
  ```json
  {
    "checked": 12,
    "markedInactive": 3,
    "confirmationRequested": 1,
    "closed": 0,
    "updates": [
      {
        "id": "job-id",
        "status": "inactive",
        "requires_confirmation": true,
        "confirmation_requested_at": "2026-05-22T12:00:00.000Z",
        "inactive_reason": "recruiter_inactive_5_days",
        "updated_at": "2026-05-22T12:00:00.000Z"
      }
    ],
    "dryRun": false
  }
  ```
- Error response:
  ```json
  { "error": "Unauthorized" }
  ```
  ```json
  { "error": "Failed to sync job activity status" }
  ```
- Notes:
  - The route delegates to `runJobActivityStatusSync`.
  - The sync logic only manages `jobs.status` values in `active` and `inactive`.

## 2. Supabase Payload Contracts

### Candidate profile save

Source: `saveCandidateProfile(update)` in [`src/lib/profile/persistence.ts`](C:/Job%20Portal%20Codex/src/lib/profile/persistence.ts)

- Auth: candidate only; signed-in user required.
- Tables written:
  - `profiles` via `update`
  - `candidate_profiles` via `upsert` on `user_id`
- `profiles` payload:
  - `full_name`
  - `name`
  - `headline`
  - `about`
  - `location`
  - `phone`
  - `avatar_url`
  - `resume_url`
  - `skills`
  - `experience_level` when provided
- `candidate_profiles` payload:
  - `user_id`
  - `resume_url`
  - `avatar_url`
  - `profile_image_url`
  - `headline`
  - `summary`
  - `phone`
  - `location`
  - `total_experience`
  - `total_experience_years`
  - `total_experience_months`
  - `current_title`
  - `current_company`
  - `notice_period`
  - `current_salary`
  - `current_salary_currency`
  - `current_salary_amount`
  - `expected_salary`
  - `expected_salary_currency`
  - `expected_salary_amount`
  - `preferred_locations`
  - `job_type_preference`
  - `work_mode_preference`
  - `skills`
  - `tools`
  - `languages`
  - `industry`
  - `industries`
  - `functional_area`
  - `experiences`
  - `education`
  - `certifications`
  - `projects`
  - `profile_completion` is hard-coded to `90`
  - `experience_level` when provided
  - `linkedin_url`, `github_url`, `dribbble_url`, `portfolio_url` when provided
- Legacy compatibility notes:
  - `current_title` falls back to `headline`.
  - `current_salary_amount` and `expected_salary_amount` are coerced with `Number(...)`.
  - `phone`, `avatar_url`, `resume_url`, and several salary fields may be `null`.

### Recruiter profile save

Source: `saveRecruiterProfile(update)` in [`src/lib/profile/persistence.ts`](C:/Job%20Portal%20Codex/src/lib/profile/persistence.ts)

- Auth: recruiter only; signed-in user required.
- Tables written:
  - `profiles` via `update`
  - `recruiter_profiles` via `upsert` on `user_id`
- `profiles` payload:
  - `full_name`
  - `name`
  - `phone`
  - `location`
- `recruiter_profiles` payload:
  - `user_id`
  - `company_name`
  - `company_website`
  - `company_size`
  - `industry`
  - `hiring_title`
  - `company_logo_url`
  - `location`
  - `phone`

### Job posting

Source: `recruiterService.postJob(data)` in [`src/services/impl/recruiter.service.ts`](C:/Job%20Portal%20Codex/src/services/impl/recruiter.service.ts)

- Auth: recruiter only.
- Table written: `jobs` via `insert`
- Primary payload fields:
  - `recruiter_id`
  - `recruiter_profile_id`
  - `title`
  - `company`
  - `company_name`
  - `company_logo`
  - `company_description`
  - `company_size`
  - `company_industry`
  - `location`
  - `location_type`
  - `job_type`
  - `salary_min`
  - `salary_max`
  - `salary_range`
  - `salary_currency`
  - `salary_period`
  - `salary_verified`
  - `experience_level`
  - `skills`
  - `description`
  - `responsibilities`
  - `screening_questions`
  - `requirements`
  - `preferred_qualifications`
  - `benefits`
  - `status`
- Compatibility behavior:
  - Multiple insert attempts are made.
  - Later retries omit schema-sensitive fields such as `recruiter_id`, `recruiter_profile_id`, `company_name`, `job_type`, `salary_range`, `screening_questions`, `responsibilities`, `requirements`, and `benefits` depending on the failure.
  - `location_type` is normalized to `Remote` unless explicitly `Hybrid` or `On-site`.

### Job update

- No dedicated user-facing update-job API exists in the current code.
- The only concrete job update contract is the cron sync in `/api/jobs/activity-status`.
- Fields updated there:
  - `status`
  - `requires_confirmation`
  - `confirmation_requested_at`
  - `inactive_reason`
  - `closed_at`
  - `updated_at`

### Application create

Source: `useApplications().applyToJob(jobId)` in [`src/hooks/use-applications.ts`](C:/Job%20Portal%20Codex/src/hooks/use-applications.ts)

- Auth: candidate only; signed-in user required.
- Table written: `applications` via `insert`
- Primary payload:
  - `job_id` when the job id is a UUID
  - otherwise `job_external_id`
  - `user_id`
  - `candidate_id`
  - `status: "applied"`
- Compatibility behavior:
  - The hook retries without `candidate_id` if the first insert fails.
  - Duplicate inserts are treated as `23505` conflicts and mapped to “already applied”.
  - Daily application limits are enforced in the client before insert.
- Notably absent from the insert contract:
  - `resume_url`
  - `cover_letter`
  - `answers`
  - timeline timestamps

### Application status update

Source: `recruiterService.updateApplicationStatus(...)` and `updateApplicationEvent(...)`

- Auth: recruiter only.
- Table written: `applications` via `update`
- Status update payloads:
  - `status`
  - `updated_at`
  - one of:
    - `shortlisted_at`
    - `rejected_at`
    - `hired_at`
- Event update payloads:
  - `viewed_at`
  - `resume_downloaded_at`
  - `updated_at`
- Allowed status values:
  - `shortlisted`
  - `rejected`
  - `hired`
- Allowed event values:
  - `viewed`
  - `resume_downloaded`

### Save / unsave job

Source: `useSavedJobs().toggleSavedJob(jobId)` in [`src/hooks/use-saved-jobs.ts`](C:/Job%20Portal%20Codex/src/hooks/use-saved-jobs.ts)

- Auth: candidate only.
- Table written: `saved_jobs`
- Save payload:
  - `candidate_id`
  - `user_id`
  - `job_id` or `job_external_id`
- Unsave contract:
  - Delete by `id` on the existing `saved_jobs` row.
- Compatibility behavior:
  - The hook reads saved rows using both `candidate_id` and `user_id`.
  - Duplicate inserts (`23505`) trigger a refetch and are treated as already saved.

### Settings save

Source: [`src/lib/settings/persistence.ts`](C:/Job%20Portal%20Codex/src/lib/settings/persistence.ts)

- Auth: candidate only.
- Table written: `candidate_settings` via `upsert`
- Payload:
  - `candidate_id`
  - `job_search_status`
  - `daily_job_recommendations`
  - `weekly_job_recommendations`
  - `job_status_updates`
  - `recruiter_messages`
  - `profile_views`
  - `promotional_emails`
  - `profile_visible_to_recruiters`
  - `account_status`
- `account_status` values normalized in code:
  - `active`
  - `deactivated`

### Block / unblock company

Source: `useBlockedCompanies()` in [`src/hooks/use-blocked-companies.ts`](C:/Job%20Portal%20Codex/src/hooks/use-blocked-companies.ts)

- Auth: candidate only.
- Table written: `blocked_companies`
- Block payload:
  - `candidate_id`
  - `company_name`
  - `recruiter_id`
- Upsert conflict target:
  - `candidate_id,company_name`
- Unblock contract:
  - Delete by `candidate_id` and `id`

## 3. Type Contracts

### `Profile`

Source: [`src/types/profile.ts`](C:/Job%20Portal%20Codex/src/types/profile.ts)

- Canonical UI profile shape.
- Key fields:
  - `id`, `name`, `headline`, `location`, `email`
  - `phone?`, `avatarInitials`, `avatarUrl?`
  - `experienceLevel`, `about`, `skills`
  - `experience`, `education`, `portfolio`, `certifications`, `links`
  - `resumeFile?`
  - `totalExperience?`, `totalExperienceYears?`, `totalExperienceMonths?`
  - `currentTitle?`, `currentCompany?`, `noticePeriod?`
  - `currentSalary?`, `currentSalaryCurrency?`, `currentSalaryAmount?`
  - `expectedSalary?`, `expectedSalaryCurrency?`, `expectedSalaryAmount?`
  - `preferredLocations?`, `jobTypePreference?`, `workModePreference?`
  - `tools?`, `languages?`, `industry?`, `functionalArea?`
  - `verifiedEmail`, `profileStrength`

### `CandidateProfile`

- There is no separate exported `CandidateProfile` interface.
- The database-facing contract is `CandidateProfileRow` in [`src/lib/profile/persistence.ts`](C:/Job%20Portal%20Codex/src/lib/profile/persistence.ts).
- Important fields:
  - `resume_url`, `avatar_url`, `profile_image_url`
  - `headline`, `summary`, `phone`, `location`
  - `total_experience`, `total_experience_years`, `total_experience_months`
  - `current_title`, `current_company`, `notice_period`
  - `current_salary`, `current_salary_currency`, `current_salary_amount`
  - `experience_level`, `skills`, `tools`, `languages`
  - `industry`, `industries`, `functional_area`
  - `education`, `expected_salary`, `expected_salary_currency`, `expected_salary_amount`
  - `preferred_locations`, `job_type_preference`, `work_mode_preference`
  - `job_preferences`, `experiences`, `certifications`, `projects`
  - `linkedin_url`, `github_url`, `dribbble_url`, `portfolio_url`

### `RecruiterProfile`

- There is no separate exported `RecruiterProfile` interface.
- The database-facing contract is `RecruiterProfileRow` in [`src/lib/profile/persistence.ts`](C:/Job%20Portal%20Codex/src/lib/profile/persistence.ts).
- Important fields:
  - `company_name`
  - `company_website`
  - `company_size`
  - `industry`
  - `hiring_title`
  - `company_logo_url`
  - `location`
  - `phone`

### `Job`

Source: [`src/types/job.ts`](C:/Job%20Portal%20Codex/src/types/job.ts)

- Key fields:
  - `id`, `title`, `company`, `companyLogo`
  - `companyDescription`, `companySize`, `companyIndustry`
  - `location`, `locationType`
  - `jobType`
  - `salaryMin`, `salaryMax`, `salaryCurrency`, `salaryPeriod`
  - `experienceLevel`
  - `skills`, `description`, `responsibilities`, `requirements`, `preferredQualifications`, `benefits`
  - `postedAt`, `verifiedRecruiter`, `activeHiring`, `responseRate`, `saved`, `featured`
  - optional `status`

### `Application`

Source: [`src/types/profile.ts`](C:/Job%20Portal%20Codex/src/types/profile.ts)

- Key fields:
  - `id`, `jobId`, `jobTitle`, `company`, `companyLogo`
  - `status`
  - `appliedAt`, `updatedAt`, `createdAt`
  - timeline timestamps:
    - `viewedAt`
    - `resumeDownloadedAt`
    - `contactedAt`
    - `shortlistedAt`
    - `rejectedAt`
    - `hiredAt`
  - `salary`, `location`, `locationType`
  - `companyDescription`, `companySize`, `companyIndustry`
  - `recruiterId?`

### `SavedJob`

Source: [`src/types/profile.ts`](C:/Job%20Portal%20Codex/src/types/profile.ts)

- Key fields:
  - `id`, `jobId`, `title`, `company`, `companyLogo`
  - `salary`, `location`, `savedAt`

### `CandidateSettings`

Source: [`src/lib/settings/persistence.ts`](C:/Job%20Portal%20Codex/src/lib/settings/persistence.ts)

- Key fields:
  - `candidateId`
  - `jobSearchStatus`
  - `dailyJobRecommendations`
  - `weeklyJobRecommendations`
  - `jobStatusUpdates`
  - `recruiterMessages`
  - `profileViews`
  - `promotionalEmails`
  - `profileVisibleToRecruiters`
  - `accountStatus`

### `BlockedCompany`

Source: [`src/hooks/use-blocked-companies.ts`](C:/Job%20Portal%20Codex/src/hooks/use-blocked-companies.ts)

- Key fields:
  - `id`
  - `companyName`
  - `recruiterId?`
  - `createdAt`

## 4. Validation Rules

### Resume parsing

- Request body must include `resumeText`.
- OpenRouter output is expected to be valid JSON.

### File validation

- Avatar:
  - JPG, PNG, WebP
  - max 500KB
- Resume:
  - PDF, DOC, DOCX
  - max 5MB
- Portfolio image:
  - JPEG, PNG, WebP, AVIF
  - max 5MB

### Salary / currency shape

- `PostJobData` uses:
  - `salaryMin: number`
  - `salaryMax: number`
  - `currency: string`
  - `salaryPeriod?: "year" | "hour"`
- Candidate profile salary fields are split into:
  - display strings
  - currency codes
  - numeric amount fields that are coerced with `Number(...)`

### Enums and allowed values

- Application status:
  - `applied`
  - `shortlisted`
  - `rejected`
  - `hired`
- Job status:
  - `active`
  - `draft`
  - `inactive`
  - `closed`
  - `paused`
  - `filled`
- Candidate settings job search status:
  - `immediately_looking`
  - `open_to_opportunities`
  - `not_looking`
- Profile role:
  - `candidate`
  - `recruiter`
  - `admin`
  - `null`
- Work mode:
  - `Remote`
  - `Hybrid`
  - `On-site`
  - `Flexible`
- Job type:
  - `Full-time`
  - `Part-time`
  - `Contract`
  - `Freelance`
  - `Internship`
  - `Temporary`

### Arrays / JSONB expectations

- Candidate profile arrays:
  - `skills`, `tools`, `preferred_locations`, `industries`
  - `experiences`, `education`, `certifications`, `projects`
  - `languages` may be stored as structured language objects or legacy strings
- Save handlers often accept empty arrays and `""` values, then normalize to `null` or array payloads before storage.

### URL validation

- The UI layers validate and collect URLs for:
  - avatar/profile image
  - resume
  - company logo
  - portfolio
  - LinkedIn
  - GitHub
  - Dribbble
- The persistence layer does not enforce a centralized URL schema yet.

## 5. Error Contracts

### API route errors

- `/api/ai/parse-resume`
  - HTTP 400 with `{ "error": "Resume text is required" }`
  - HTTP 500 with `{ "error": string }`
- `/api/jobs/activity-status`
  - HTTP 401 with `{ "error": "Unauthorized" }`
  - HTTP 500 with `{ "error": string }`

### Service-layer errors

- Service methods generally return `ApiResult<T>`:
  - `{ data: T, error: null }`
  - `{ data: null, error: { code, message, status?, details? } }`
- Shared error shape:
  - `code`
  - `message`
  - `status?`
  - `details?`

### Developer logging pattern

- Logged objects usually include:
  - `message`
  - `code`
  - `details`
  - `hint`
- Common prefixes:
  - `[PROFILE]`
  - `[JOBS]`
  - `[APPLICATIONS]`
  - `[SAVED_JOBS]`
  - `[BLOCKED_COMPANIES]`
  - `[SETTINGS]`

### Supabase error mapping

- Schema cache / missing-column failures are often retried with fallback column sets.
- Duplicate writes use `23505` handling in applications and saved jobs.
- Many persistence functions throw `new Error(error.message)` after logging the Supabase error details.

## 6. Auth Requirements

### Public / logged-out allowed

- `POST /api/ai/parse-resume`
- `POST /api/jobs/activity-status` only when `JOB_ACTIVITY_CRON_SECRET` is unset

### Candidate-only operations

- Candidate profile save
- Candidate settings save
- Save / unsave job
- Apply to job
- Block / unblock company
- Candidate phone/preferences persistence

### Recruiter-only operations

- Recruiter profile save
- Job posting
- Application status updates
- Application timeline event updates
- Recruiter job/candidate queries

### Admin-only operations

- No explicit admin-only API routes were found in `src/app/api`.

## 7. Known Contract Risks

- Dual ownership fields are still common:
  - `user_id` vs `candidate_id`
  - `recruiter_id` vs `recruiter_profile_id`
- Company naming is split:
  - `company` vs `company_name`
  - company logo is also split across `company_logo`, `company_logo_url`, and UI-only fallbacks
- Application and saved-job reads still support legacy `job_external_id`.
- `saveCandidateProfile()` writes `profile_completion: 90` regardless of actual completeness.
- `updateJobStatus()` in the recruiter service is currently a no-op mock, so there is no real user-facing job update contract there.
- The resume parser depends on OpenRouter returning valid JSON; malformed model output would break parsing.
- Settings and profile persistence still assume that `profiles`, `candidate_profiles`, `recruiter_profiles`, `candidate_settings`, `saved_jobs`, `applications`, and `blocked_companies` columns exist in the active database schema.
- Some fields are treated as strings in one place and numbers in another:
  - salary amount fields
  - `languages`
  - `job_type_preference`
  - `work_mode_preference`

## 8. Future Recommendations

- Add shared Zod or schema validation for all payloads.
- Centralize payload mappers for profiles, jobs, applications, settings, and storage uploads.
- Standardize a single error formatter for Supabase and API responses.
- Define typed request/response helpers for the two `app/api` routes.
- Remove legacy compatibility writes once the database schema is fully normalized.
