# MIGRATION HISTORY

Chronological migration log for the iJobs database. The repo contains duplicate numeric prefixes (`003` and `018`), so the exact intra-prefix order is best-effort based on filename sequence and migration intent.

## 001_initial_schema.sql
- Purpose: create the first full schema for profiles, recruiters, jobs, applications, saved jobs, content tables, triggers, indexes, and baseline RLS.
- Tables changed: `profiles`, `experiences`, `education`, `portfolio_projects`, `certifications`, `social_links`, `recruiters`, `jobs`, `applications`, `saved_jobs`.
- Columns added/removed: `profiles` (`name`, `email`, `headline`, `about`, `location`, `phone`, `avatar_url`, `resume_url`, `role`, `onboarding_complete`, `onboarding_step`, `experience_level`, `skills`, timestamps); `jobs` (`recruiter_id`, company fields, location fields, salary fields, `experience_level`, `skills`, content arrays, `status`, `featured`, `applicants_count`, timestamps); `applications` (`job_id`, `user_id`, `status`, `cover_letter`, `resume_url`, timestamps); `saved_jobs` (`user_id`, `job_id`, timestamps); content tables all introduced with owner foreign keys and basic content columns. Removed: none.
- RLS changes: enabled RLS on all main tables and created the first policy set for public read / owner write patterns.
- Indexes added: jobs status/created/recruiter/skills, applications user/job/status, saved jobs user, experiences profile, portfolio profile, recruiters user.
- Compatibility notes: this is the original recruiter-table-centered model; `jobs.recruiter_id` points at `recruiters.id`, and applications/saved jobs only use `user_id`.
- Migration risks: high if run against a populated DB because it defines the base schema without `IF NOT EXISTS` on tables and establishes the old recruiter dependency model.
- Safety: partially risky.

## 002_auth_profile_fields.sql
- Purpose: make `profiles` compatible with auth onboarding by adding the auth-facing identity fields.
- Tables changed: `profiles`.
- Columns added/removed: `email`, `role`, `onboarding_complete`. Removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: aligns `profiles` with the auth provider’s expectation that profiles can be created before a role is chosen.
- Migration risks: low-to-medium; it widens `profiles`, but it still alters existing constraints.
- Safety: partially risky.

## 003_application_statuses.sql
- Purpose: align application status values with the candidate application flow.
- Tables changed: `applications`.
- Columns added/removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: remaps legacy `reviewing` and `interview` statuses to `shortlisted`, then tightens the status check to `applied`, `shortlisted`, `rejected`, `hired`.
- Migration risks: medium; it rewrites live data values.
- Safety: partially risky.

## 003_job_activity_status.sql
- Purpose: extend jobs for lifecycle tracking and recruiter activity logging.
- Tables changed: `jobs`, `recruiter_job_activities`.
- Columns added/removed: `jobs` gained `last_recruiter_activity_at`, `confirmation_due_at`, `confirmation_requested_at`, `confirmed_at`, `requires_confirmation`, `inactive_reason`, `closed_at`, `filled_at`; no removals.
- RLS changes: enabled RLS on `recruiter_job_activities`, added recruiter-only select/insert policies.
- Indexes added: jobs `last_recruiter_activity_at`, `confirmation_due_at`, `requires_confirmation`; recruiter job activity indexes on job and recruiter.
- Compatibility notes: `status` expanded to include `inactive` and `filled`; `draft` rows are normalized to `paused`; recruiter activity now drives job state transitions.
- Migration risks: medium-to-high because it updates existing rows and changes job status semantics.
- Safety: partially risky.

## 004_onboarding_profile_schema.sql
- Purpose: align the database with onboarding, profile editing, and Supabase auth hydration.
- Tables changed: `profiles`, `candidate_profiles`, `recruiter_profiles`.
- Columns added/removed: `profiles` gained `email`, `full_name`, `avatar_url`, `role`, `onboarding_complete`, `onboarding_step`, `phone`, `location`, timestamps; `candidate_profiles` gained `id`, `user_id`, `resume_url`, `current_title`, `experience_level`, `skills`, `education`, `expected_salary`, `job_preferences`, `profile_completion`, timestamps; `recruiter_profiles` gained `id`, `user_id`, `company_name`, `company_website`, `company_size`, `industry`, `hiring_title`, `company_logo_url`, `location`, `phone`, timestamps. Removed: none.
- RLS changes: enabled RLS on `profiles`, `candidate_profiles`, and `recruiter_profiles`; created owner-only policies for select/insert/update.
- Indexes added: unique indexes on `candidate_profiles.user_id` and `recruiter_profiles.user_id`.
- Compatibility notes: this is the first major split between the generic `profiles` row and the role-specific profile tables.
- Migration risks: high; it includes type/constraint normalization, foreign-key reshaping, and potential conflict with older onboarding scripts.
- Safety: partially risky.

## 005_onboarding_step.sql
- Purpose: explicitly track onboarding route state in `profiles`.
- Tables changed: `profiles`.
- Columns added/removed: `onboarding_step` (added if missing; no removals).
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: fills `onboarding_step` from role and completion state, then tightens the allowed value list.
- Migration risks: medium; it updates existing `profiles` rows and normalizes route-state semantics.
- Safety: partially risky.

## 006_profiles_role_nullable.sql
- Purpose: allow brand-new OAuth users to create a profile before choosing a role.
- Tables changed: `profiles`.
- Columns added/removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: drops any role default/NOT NULL requirement and resets role-less users to `select_role`.
- Migration risks: medium; it relaxes constraints and changes onboarding behavior.
- Safety: partially risky.

## 007_candidate_resume_step.sql
- Purpose: add an explicit resume step before the candidate profile form.
- Tables changed: `profiles`.
- Columns added/removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: candidate users in incomplete onboarding are moved to `candidate_resume` when appropriate.
- Migration risks: low-to-medium; it rewrites onboarding-step values for in-progress users.
- Safety: partially risky.

## 008_live_jobs_applications.sql
- Purpose: add live job/application compatibility fields for authenticated Supabase flows.
- Tables changed: `jobs`, `applications`.
- Columns added/removed: `jobs` gained `company_name`, `job_type`, `salary_range`, `recruiter_profile_id`; `applications` gained `candidate_id`. Removed: none.
- RLS changes: replaced the old public-jobs/application policies with candidate and recruiter policies based on active jobs and owned jobs.
- Indexes added: `jobs.recruiter_profile_id`, `applications.candidate_id`, unique `applications(job_id, candidate_id)` partial key.
- Compatibility notes: introduces the first `candidate_id` path while preserving the legacy `user_id` path; `company_name` and `salary_range` are compatibility columns.
- Migration risks: high; this is a major schema compatibility patch that overlaps older recruiter ownership rules.
- Safety: partially risky.

## 009_job_posting_draft_status.sql
- Purpose: align the job posting UI with the database by allowing draft jobs.
- Tables changed: `jobs`.
- Columns added/removed: `screening_questions`.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: widens the job status check to include `draft` and adds a question list for recruiter posting flows.
- Migration risks: low-to-medium; mostly additive, but it still alters a live check constraint.
- Safety: partially risky.

## 010_remove_recruiters_dependency.sql
- Purpose: move job ownership and RLS away from the removed `public.recruiters` table.
- Tables changed: `jobs`, `applications`, `recruiter_job_activities` if present.
- Columns added/removed: `jobs` gained `recruiter_profile_id` and a nullable `recruiter_id`; no direct removals.
- RLS changes: removed old recruiter-table-based policies and recreated policies keyed off `profiles.id` plus the `recruiter_profile_id` / `recruiter_id` fallback.
- Indexes added: `jobs.recruiter_profile_id`, `jobs.recruiter_id`.
- Compatibility notes: this is the main recruiter-table-removal compatibility migration. It deliberately does not recreate `public.recruiters`, and it preserves old rows by copying ownership into `recruiter_profile_id` where possible.
- Migration risks: very high; ownership semantics change, policies are rewritten, and the old FK model is intentionally abandoned.
- Safety: partially risky.

## 011_complete_jobs_columns.sql
- Purpose: normalize the jobs table for recruiter posting, dashboards, applications, and activity checks.
- Tables changed: `jobs`.
- Columns added/removed: `recruiter_id`, `recruiter_profile_id`, `title`, `company`, `company_name`, `company_logo`, `company_description`, `company_size`, `company_industry`, `location`, `location_type`, `job_type`, `salary_min`, `salary_max`, `salary_range`, `salary_currency`, `salary_period`, `experience_level`, `skills`, `description`, `responsibilities`, `requirements`, `preferred_qualifications`, `benefits`, `screening_questions`, `status`, `featured`, `applicants_count`, activity timestamps, confirmation fields, `inactive_reason`, `closed_at`, `filled_at`, timestamps. Removed: none, but several columns become nullable.
- RLS changes: none.
- Indexes added: jobs recruiter/profile/status/created/skills indexes.
- Compatibility notes: this is the main jobs-schema evolution step. It adds both `company` and `company_name`, both `recruiter_id` and `recruiter_profile_id`, and both structured salary numbers and a string `salary_range`.
- Migration risks: very high; it alters many nullability defaults, updates live rows, and reinforces compatibility columns.
- Safety: partially risky.

## 012_candidate_profile_expansion.sql
- Purpose: expand candidate profiles with onboarding fields and richer portfolio data.
- Tables changed: `candidate_profiles`.
- Columns added/removed: `avatar_url`, `profile_image_url`, `headline`, `summary`, `phone`, `location`, `total_experience`, `current_company`, `notice_period`, `current_salary`, `preferred_locations`, `job_type_preference`, `work_mode_preference`, `tools`, `languages`, `industry`, `functional_area`, `experiences`, `education`, `certifications`, `projects`. Removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: converts `education` and other multi-value fields toward JSONB-based profile sections.
- Migration risks: medium-to-high; it introduces JSONB conversion logic and broadens the profile shape significantly.
- Safety: partially risky.

## 013_candidate_profile_preference_fields.sql
- Purpose: add structured preference, salary, and experience fields to candidate profiles.
- Tables changed: `candidate_profiles`.
- Columns added/removed: `total_experience_years`, `total_experience_months`, `current_salary_currency`, `current_salary_amount`, `expected_salary_currency`, `expected_salary_amount`, `preferred_locations`, `job_type_preference`, `work_mode_preference`, `industries`, `skills`, `tools`, `languages`, `experiences`, `profile_image_url`, `resume_url`. Removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: converts `job_type_preference`, `work_mode_preference`, and `languages` into array/JSONB-compatible shapes for the live app.
- Migration risks: medium-to-high; it performs type conversions on existing preference columns.
- Safety: partially risky.

## 014_profiles_profile_fields_compat.sql
- Purpose: add compatibility fields directly to `profiles` so the auth/profile layer can work across older and newer schema variants.
- Tables changed: `profiles`.
- Columns added/removed: `name`, `full_name`, `email`, `headline`, `about`, `phone`, `location`, `avatar_url`, `resume_url`, `skills`, `experience_level`, `role`, `onboarding_complete`, `onboarding_step`, timestamps. Removed: none.
- RLS changes: keeps the existing profile policies but rebuilds the onboarding-step check.
- Indexes added: none.
- Compatibility notes: this migration is the clearest compatibility patch for `profiles` vs `candidate_profiles`, and it allows the app to read/write either older or newer profile shapes.
- Migration risks: medium; it rewrites existing profile rows and resets constraints.
- Safety: partially risky.

## 015_candidate_profiles_education_jsonb.sql
- Purpose: convert candidate education into JSONB.
- Tables changed: `candidate_profiles`.
- Columns added/removed: `education` stays present but changes type/behavior to JSONB. Removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: normalizes blank text education rows into `[]` JSONB and notifies PostgREST to reload its schema cache.
- Migration risks: medium; type conversion can fail or reshape older text rows.
- Safety: partially risky.

## 016_candidate_profile_links_experience_level.sql
- Purpose: add social/profile link fields and align experience level on candidate and profile records.
- Tables changed: `candidate_profiles`, `profiles`.
- Columns added/removed: `candidate_profiles` gained `experience_level`, `linkedin_url`, `github_url`, `dribbble_url`, `portfolio_url`; `profiles` gained `experience_level`. Removed: none.
- RLS changes: none.
- Indexes added: none.
- Compatibility notes: this is a light additive patch compared with earlier schema rewrites.
- Migration risks: low-to-medium; mostly additive, but it still broadens the schema that the app reads from.
- Safety: mostly safe, but still partially risky because of live-schema dependencies.

## 017_applications_easy_apply_events.sql
- Purpose: support Easy Apply persistence, external job IDs, and application timeline events.
- Tables changed: `applications`.
- Columns added/removed: `job_external_id`, `candidate_id`, `viewed_at`, `resume_downloaded_at`, `shortlisted_at`, `rejected_at`, `hired_at`; `job_id` becomes nullable; `user_id` remains for backward compatibility. Removed: none.
- RLS changes: replaces the older application policies with candidate and recruiter policies keyed off `candidate_id`, `user_id`, and owned jobs.
- Indexes added: applications candidate/job/created_at indexes, unique candidate/job and external-job candidate indexes.
- Compatibility notes: this is the main applications-schema evolution step. It preserves the old `user_id` flow while introducing `candidate_id` and `job_external_id`.
- Migration risks: high; it changes application identity, uniqueness, and RLS in one patch.
- Safety: partially risky.

## 018_avatar_storage_bucket.sql
- Purpose: configure persistent avatar uploads.
- Tables changed: storage bucket and `storage.objects` policies.
- Columns added/removed: none.
- RLS changes: storage object policies for avatar read/upload/update/delete.
- Indexes added: none.
- Compatibility notes: the app stores public avatar URLs in the `avatars` bucket.
- Migration risks: low; this is mostly storage configuration, but it assumes Storage is enabled.
- Safety: mostly safe.

## 018_saved_jobs_and_job_detail_fields.sql
- Purpose: persist saved jobs and add missing job detail fields used by the UI.
- Tables changed: `saved_jobs`, `jobs`.
- Columns added/removed: `saved_jobs` gained `candidate_id`, `user_id`, `job_external_id`, `created_at`, and `job_id` becomes nullable; `jobs` gained `company_logo`, `company_description`, `company_size`, `company_industry`, `salary_verified`, `response_rate`. Removed: none.
- RLS changes: enables RLS on `saved_jobs` and adds candidate-only select/insert/delete policies.
- Indexes added: unique saved-job indexes for internal and external job identity plus candidate indexes.
- Compatibility notes: saved jobs now support both legacy `user_id` and newer `candidate_id`, and job cards can render richer company metadata.
- Migration risks: medium; it changes identity rules for saved jobs and backfills compatibility fields used by the UI.
- Safety: partially risky.

## 019_blocked_companies_and_contacted_at.sql
- Purpose: add recruiter outreach visibility and candidate company blocking.
- Tables changed: `applications`, `blocked_companies`.
- Columns added/removed: `applications.contacted_at`; `blocked_companies` (`id`, `candidate_id`, `company_id`, `company_name`, `recruiter_id`, `created_at`). Removed: none.
- RLS changes: enables RLS on `blocked_companies` and adds candidate-only select/insert/delete policies.
- Indexes added: unique candidate/company key, candidate index, company-name index.
- Compatibility notes: this is the blocking/visibility foundation used by settings and recruiter-facing candidate filtering.
- Migration risks: low-to-medium; mostly additive, but it introduces a new table that higher-level logic may not fully enforce everywhere.
- Safety: partially safe.

## 020_candidate_settings.sql
- Purpose: persist candidate communication, privacy, and account preferences.
- Tables changed: `candidate_settings`.
- Columns added/removed: `candidate_id`, `job_search_status`, `daily_job_recommendations`, `weekly_job_recommendations`, `job_status_updates`, `recruiter_messages`, `profile_views`, `promotional_emails`, `profile_visible_to_recruiters`, `account_status`, timestamps. Removed: none.
- RLS changes: enables RLS and adds candidate-only select/insert/update policies.
- Indexes added: unique candidate settings key on `candidate_id`.
- Compatibility notes: this is the settings-schema endpoint that backs the candidate settings UI and account-status toggles.
- Migration risks: low-to-medium; additive, but it becomes auth-sensitive because it is keyed directly to the profile id.
- Safety: mostly safe, but still partially risky because it is tied to auth and profile ownership.

## Non-versioned compatibility patches

### `supabase/onboarding-profile-fields.sql`
- Purpose: early compatibility patch for profile onboarding and the split profile tables.
- Tables changed: `profiles`, `candidate_profiles`, `recruiter_profiles`.
- Columns added/removed: a smaller early shape of `profiles` plus `candidate_profiles.user_id`, `job_preferences`, `profile_completion`, and recruiter-company fields. Removed: none.
- RLS changes: adds owner-only profile policies for the three tables.
- Indexes added: none.
- Compatibility notes: this looks like an early manual schema repair before the numbered migrations fully stabilized the model.
- Migration risks: high if applied after later migrations because it overlaps and partially duplicates the numbered history.
- Safety: partially risky.

### `supabase/fix-profiles-schema.sql`
- Purpose: repair `profiles` schema drift and policy state.
- Tables changed: `profiles`.
- Columns added/removed: `name`, `email`, `avatar_url`, `role`, `onboarding_complete`, timestamps. Removed: none.
- RLS changes: creates or alters existing profile policies to enforce `auth.uid() = id`.
- Indexes added: none.
- Compatibility notes: this is a schema-cache / policy repair script rather than a canonical versioned migration.
- Migration risks: medium; it assumes policy names already exist or need to be recreated in place.
- Safety: partially risky.

### `supabase/fix-profiles-rls.sql`
- Purpose: repair profile RLS after schema changes.
- Tables changed: `profiles`.
- Columns added/removed: `email`, `full_name`, `avatar_url`, `role`, `onboarding_complete`, `phone`, `location`, timestamps. Removed: none.
- RLS changes: re-creates the standard self-select / self-insert / self-update policies.
- Indexes added: none.
- Compatibility notes: this overlaps later numbered onboarding/profile compatibility patches and is best treated as a manual repair script.
- Migration risks: medium; it is policy-sensitive and assumes the table already exists with a compatible shape.
- Safety: partially risky.

## Known Schema Drift
- `profiles` and `candidate_profiles` overlap heavily for candidate data, and the app reads from both.
- `recruiters` was the original ownership table, but later migrations moved ownership toward `profiles.id` via `recruiter_profile_id`.
- `company` and `company_name` both exist on jobs; current code still probes both.
- `recruiter_id` and `recruiter_profile_id` coexist on jobs and applications-related logic.
- `current_salary` exists as a legacy string field, while newer data also uses currency/amount split fields.
- `avatar_url` and `profile_image_url` both appear in different profile layers.
- `job_id` and `job_external_id` are both supported on applications and saved jobs.
- `user_id` and `candidate_id` both remain in applications and saved jobs for backward compatibility.
- `education` moved from text to JSONB, and `languages` / preference fields also changed type over time.
- `profiles.onboarding_step` has been patched multiple times, including schema-cache recovery paths.

## Known Failed Migrations
- No explicit failure journal was found in the repo, so this section is inferred from repair scripts and schema-cache reloads rather than a formal migration log.
- Likely failed or partial development-time fixes include `supabase/onboarding-profile-fields.sql`, `supabase/fix-profiles-schema.sql`, and `supabase/fix-profiles-rls.sql`.
- Repeated `NOTIFY pgrst, 'reload schema'` statements in later migrations suggest PostgREST schema cache issues were common during development.
- The most obvious partial-fix patterns are `onboarding_step` compatibility, profile RLS rewrites, and the recruiter-table removal migration.

## Safe Migration Rules
- Always use `IF NOT EXISTS` for additive schema changes.
- Prefer additive migrations over rewrites.
- Avoid destructive `ALTER TABLE ... DROP` unless the app has a verified replacement path.
- Never assume a column exists.
- Preserve backward compatibility for `profiles`, `jobs`, `applications`, and saved-job identity fields.
- When changing types, preserve the old shape long enough for app and API code to read both versions.
- If the schema changes in a way that PostgREST caches, include a schema reload strategy.

## Current DB Risks
- Auth-sensitive tables: `profiles`, `candidate_profiles`, `recruiter_profiles`, `candidate_settings`.
- Onboarding-sensitive fields: `role`, `onboarding_complete`, `onboarding_step`, and role-specific profile rows.
- Search-sensitive fields: `jobs.title`, `company`, `company_name`, `skills`, `location`, `location_type`, `job_type`, `experience_level`, `salary_min`, `salary_max`, `salary_range`, `salary_verified`, `response_rate`.
- Application-sensitive fields: `status`, `viewed_at`, `resume_downloaded_at`, `contacted_at`, `shortlisted_at`, `rejected_at`, `hired_at`, `candidate_id`, `job_external_id`.
- Identity-sensitive fields: `recruiter_id`, `recruiter_profile_id`, `user_id`, `candidate_id`, and `job_id` / `job_external_id` hybrid references.
- Drift-sensitive tables: `saved_jobs` and `blocked_companies`, because they rely on mixed legacy and current identifiers.
- Storage-sensitive areas: avatar storage is configured; resumes, portfolio assets, and company-logo storage do not have matching migration-backed buckets in this repo.

