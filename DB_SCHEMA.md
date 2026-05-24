# iJobs Database Schema

This document summarizes the current database architecture based on:
- `supabase/migrations`
- additional SQL repair scripts in `supabase/`
- auth/profile/job/application/settings/storage persistence code in `src/`

It is a schema architecture note, not a live database dump. Where migrations and app code diverge, the drift is called out explicitly.

## 1. Tables

### `profiles`
Purpose: primary auth-linked profile row for every signed-in user.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `auth.users(id)` FK | Primary key; cascades on auth user delete. |
| `name` | `text` | legacy strict / compat-optional | `''` in initial schema | Still used by app as a fallback display name. |
| `full_name` | `text` | nullable | none | Preferred display name in newer code. |
| `email` | `text` | nullable | `''` in initial schema | App treats this as optional when restoring legacy rows. |
| `headline` | `text` | legacy strict / compat-optional | `''` in initial schema | Used for profile completion and candidate cards. |
| `about` | `text` | legacy strict / compat-optional | `''` in initial schema | Used as summary/bio. |
| `location` | `text` | legacy strict / compat-optional | `''` in initial schema | Used in search, profile, and completion. |
| `phone` | `text` | nullable | none | Shared by candidate and recruiter profiles. |
| `avatar_url` | `text` | nullable | none | Public avatar URL. |
| `resume_url` | `text` | nullable | none | Candidate resume link. |
| `skills` | `text[]` | `NOT NULL` | `{}` | Used by job matching and profile completion. |
| `experience_level` | `text` | nullable | none | Compatibility field; app uses it for search/completion. |
| `role` | `text` | nullable | none | Current compat field; app normalizes `candidate`, `recruiter`, `admin`, plus legacy `job_seeker`/`employer`. |
| `onboarding_complete` | `boolean` | `NOT NULL` | `false` | Drives onboarding routing. |
| `onboarding_step` | `text` | nullable / checked | `select_role` | Check allows `select_role`, `candidate_resume`, `candidate_profile`, `recruiter_profile`, `completed`. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Updated by trigger. |
| `updated_at` | `timestamptz` | `NOT NULL` | `now()` | Updated by trigger. |

Constraints and indexes:
- Primary key on `id`.
- FK to `auth.users(id)` with `ON DELETE CASCADE`.
- `profiles_onboarding_step_check` on `onboarding_step`.
- `profiles_updated_at` trigger.
- No dedicated secondary index found in current migrations.

Relationships:
- One-to-one auth profile row for `auth.users`.
- Parent record for candidate/recruiter profile tables and legacy normalized profile tables.

### `candidate_profiles`
Purpose: candidate-specific profile and preference store.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | nullable / unique | none | FK to `profiles(id)`; app upserts by this column. |
| `resume_url` | `text` | nullable | none | Resume link. |
| `avatar_url` | `text` | nullable | none | Legacy avatar field. |
| `profile_image_url` | `text` | nullable | none | Current avatar field used by app fallbacks. |
| `headline` | `text` | nullable | none | Candidate headline. |
| `summary` | `text` | nullable | none | Candidate bio/summary. |
| `phone` | `text` | nullable | none | Candidate phone. |
| `location` | `text` | nullable | none | Candidate location. |
| `total_experience` | `text` | nullable | none | Human-readable experience string. |
| `total_experience_years` | `integer` | nullable | none | Numeric experience. |
| `total_experience_months` | `integer` | nullable | none | Numeric experience. |
| `current_title` | `text` | nullable | none | Used with `headline` for matching and completion. |
| `current_company` | `text` | nullable | none | Current employer. |
| `notice_period` | `text` | nullable | none | Candidate availability. |
| `current_salary` | `text` | nullable | none | Human-readable salary. |
| `current_salary_currency` | `text` | nullable | none | Currency for current salary. |
| `current_salary_amount` | `numeric` | nullable | none | Numeric current salary. |
| `experience_level` | `text` | nullable | none | Candidate experience level. |
| `skills` | `text[]` | array/nullable in compat | `{}` | Candidate skills. |
| `tools` | `text[]` | array/nullable in compat | `{}` | Tools/stack. |
| `languages` | `jsonb` | nullable/compat | `[]` | Later migrations convert earlier array/text shapes to JSONB. |
| `industry` | `text` | nullable | none | Legacy single-industry field. |
| `industries` | `text[]` | nullable | `{}` | Preferred/multi-industry field. |
| `functional_area` | `text` | nullable | none | Candidate specialization. |
| `education` | `jsonb` | nullable/compat | `[]` | Converted from legacy text and later from normalized forms. |
| `expected_salary` | `text` | nullable | none | Human-readable expectation. |
| `expected_salary_currency` | `text` | nullable | none | Currency for expectations. |
| `expected_salary_amount` | `numeric` | nullable | none | Numeric expectation. |
| `preferred_locations` | `text[]` | nullable | `{}` | Preferred locations. |
| `job_type_preference` | `text[]` | nullable | `{}` | Was text in older migrations; now array. |
| `work_mode_preference` | `text[]` | nullable | `{}` | Was text in older migrations; now array. |
| `job_preferences` | `jsonb` | nullable | none | Legacy compatibility blob for older profile flows. |
| `experiences` | `jsonb` | nullable | `[]` | Embedded experience list. |
| `certifications` | `jsonb` | nullable | `[]` | Embedded certification list. |
| `projects` | `jsonb` | nullable | `[]` | Embedded portfolio/projects list. |
| `linkedin_url` | `text` | nullable | none | Social link compatibility field. |
| `github_url` | `text` | nullable | none | Social link compatibility field. |
| `dribbble_url` | `text` | nullable | none | Social link compatibility field. |
| `portfolio_url` | `text` | nullable | none | Social link compatibility field. |
| `profile_completion` | `integer` | nullable / defaulted | `0` | Stored completion value, but the UI calculates completion at runtime. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |
| `updated_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |

Constraints and indexes:
- Primary key on `id`.
- Unique `user_id` index/constraint.
- FK `user_id -> profiles(id)` with `ON DELETE CASCADE`.
- `candidate_profiles_updated_at` trigger.

Relationships:
- One-to-one candidate extension of `profiles`.
- Source of candidate search, settings, and recruiter candidate cards.

### `recruiter_profiles`
Purpose: recruiter/company-specific profile store.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | Primary key. |
| `user_id` | `uuid` | nullable / unique | none | FK to `profiles(id)`; app upserts by this column. |
| `company_name` | `text` | nullable | none | Primary company display name. |
| `company_website` | `text` | nullable | none | Optional website. |
| `company_size` | `text` | nullable | none | Company size label. |
| `industry` | `text` | nullable | none | Company industry. |
| `hiring_title` | `text` | nullable | none | Recruiting contact/title. |
| `company_logo_url` | `text` | nullable | none | Company logo URL. |
| `location` | `text` | nullable | none | Recruiter/company location. |
| `phone` | `text` | nullable | none | Contact phone. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |
| `updated_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |

Constraints and indexes:
- Primary key on `id`.
- Unique `user_id` index/constraint.
- FK `user_id -> profiles(id)` with `ON DELETE CASCADE`.
- `recruiter_profiles_updated_at` trigger.

Relationships:
- One-to-one recruiter extension of `profiles`.
- Used when posting jobs and rendering recruiter dashboards.

### `jobs`
Purpose: job postings and job detail records.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` / `uuid_generate_v4()` | Primary key. |
| `recruiter_id` | `uuid` | nullable / legacy | none | Legacy ownership column; older schema referenced `recruiters(id)`. |
| `recruiter_profile_id` | `uuid` | nullable | none | Current ownership column; app writes `profiles(id)` here. |
| `title` | `text` | nullable | none | Job title. |
| `company` | `text` | nullable | none | Company name used by feed/search. |
| `company_name` | `text` | nullable | none | Compatibility duplicate of `company`. |
| `company_logo` | `text` | nullable | `''` | Short logo/initials fallback. |
| `company_description` | `text` | nullable | `''` | Company overview. |
| `company_size` | `text` | nullable | `''` | Company size label. |
| `company_industry` | `text` | nullable | `''` | Company industry label. |
| `location` | `text` | nullable | none | Job location. |
| `location_type` | `text` | checked | `Remote` | Check allows `Remote`, `Hybrid`, `On-site`. |
| `job_type` | `text` | nullable | none | Full-time/contract/etc. |
| `salary_min` | `integer` | nullable | none | Min salary. |
| `salary_max` | `integer` | nullable | none | Max salary. |
| `salary_range` | `text` | nullable | none | Compatibility display string. |
| `salary_currency` | `text` | nullable | `$` | Currency symbol/code string. |
| `salary_period` | `text` | checked | `year` | Check allows `year`, `hour`. |
| `experience_level` | `text` | checked | `Mid` | Check allows `Entry`, `Mid`, `Senior`, `Lead`, `Staff`. |
| `skills` | `text[]` | `NOT NULL` / compat-defaulted | `{}` | Indexed with GIN. |
| `description` | `text` | nullable | `''` | Main job description. |
| `responsibilities` | `text[]` | `NOT NULL` / compat-defaulted | `{}` | Job responsibilities. |
| `requirements` | `text[]` | `NOT NULL` / compat-defaulted | `{}` | Job requirements. |
| `preferred_qualifications` | `text[]` | `NOT NULL` / compat-defaulted | `{}` | Preferred qualifications. |
| `benefits` | `text[]` | `NOT NULL` / compat-defaulted | `{}` | Benefits list. |
| `screening_questions` | `text[]` | `NOT NULL` / compat-defaulted | `{}` | Added for posting/apply flows. |
| `status` | `text` | checked | `active` | Check allows `draft`, `active`, `inactive`, `paused`, `closed`, `filled`. |
| `featured` | `boolean` | `NOT NULL` / defaulted | `false` | Boosts ranking in search. |
| `applicants_count` | `integer` | `NOT NULL` / defaulted | `0` | Dashboard count. |
| `salary_verified` | `boolean` | nullable / compat | `false` | Added for job detail and trust UX. |
| `response_rate` | `integer` | nullable | none | Used in candidate surfaces as a recruiter/company signal. |
| `last_recruiter_activity_at` | `timestamptz` | `NOT NULL` | `now()` | Updated by recruiter activity sync/trigger. |
| `confirmation_due_at` | `timestamptz` | `NOT NULL` | `now() + 30 days` | 30-day confirmation window. |
| `confirmation_requested_at` | `timestamptz` | nullable | none | Set when confirmation is requested. |
| `confirmed_at` | `timestamptz` | nullable | none | Set when recruiter confirms the job. |
| `requires_confirmation` | `boolean` | `NOT NULL` | `false` | Flag used by activity sync. |
| `inactive_reason` | `text` | nullable | none | Example value from sync: `recruiter_inactive_5_days`. |
| `closed_at` | `timestamptz` | nullable | none | Auto-close timestamp. |
| `filled_at` | `timestamptz` | nullable | none | Filled job timestamp. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |
| `updated_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |

Constraints and indexes:
- Primary key on `id`.
- `jobs_status_check`, `jobs_location_type_check`, `jobs_salary_period_check`, `jobs_experience_level_check`.
- Indexes on `status`, `created_at DESC`, `recruiter_id`, `recruiter_profile_id`, `skills` GIN, `last_recruiter_activity_at`, `confirmation_due_at`, and partial `requires_confirmation`.
- `jobs_updated_at` trigger.

Relationships:
- `recruiter_profile_id` points to `profiles(id)` in current flows.
- `recruiter_id` is legacy ownership support.
- Parent table for `applications`, `saved_jobs`, and `recruiter_job_activities`.

### `applications`
Purpose: candidate applications and recruiter application timeline state.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | Primary key. |
| `job_id` | `uuid` | nullable | none | FK to `jobs(id)`; some older rows use external job ids instead. |
| `job_external_id` | `text` | nullable | none | Compatibility key for demo/external jobs. |
| `candidate_id` | `uuid` | nullable | none | FK to `profiles(id)`; preferred candidate identifier in newer flows. |
| `user_id` | `uuid` | nullable | none | Legacy auth user identifier. |
| `status` | `text` | `NOT NULL` | `applied` | Check allows `applied`, `shortlisted`, `rejected`, `hired`. |
| `cover_letter` | `text` | nullable | none | Present in the initial schema. |
| `resume_url` | `text` | nullable | none | Uploaded resume reference. |
| `viewed_at` | `timestamptz` | nullable | none | Recruiter viewed event. |
| `resume_downloaded_at` | `timestamptz` | nullable | none | Recruiter downloaded resume event. |
| `contacted_at` | `timestamptz` | nullable | none | Contact event field; present in schema and read by UI. |
| `shortlisted_at` | `timestamptz` | nullable | none | Shortlist timestamp. |
| `rejected_at` | `timestamptz` | nullable | none | Reject timestamp. |
| `hired_at` | `timestamptz` | nullable | none | Hire timestamp. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |
| `updated_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |

Constraints and indexes:
- Unique `(job_id, candidate_id)` partial index where `candidate_id IS NOT NULL`.
- Unique `(job_external_id, candidate_id)` partial index where `job_id IS NULL` and `candidate_id IS NOT NULL`.
- Indexes on `candidate_id`, `job_id`, `status`, `created_at DESC`.
- `applications_updated_at` trigger.

Relationships:
- Candidate owns the row via `candidate_id` or `user_id`.
- Recruiters can read/update applications for jobs they own.
- Application timeline is stored on the row itself, with a separate recruiter activity table for job-level events.

### `saved_jobs`
Purpose: candidate saved jobs list.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | Primary key. |
| `candidate_id` | `uuid` | nullable | none | FK to `profiles(id)`; preferred identifier in newer flows. |
| `user_id` | `uuid` | nullable | none | Legacy auth user identifier. |
| `job_id` | `uuid` | nullable | none | FK to `jobs(id)`. |
| `job_external_id` | `text` | nullable | none | Compatibility key for non-UUID jobs. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Save timestamp. |

Constraints and indexes:
- Unique `(candidate_id, job_id)` partial index.
- Unique `(candidate_id, job_external_id)` partial index.
- Index on `candidate_id`.
- No update trigger.

Relationships:
- Candidate owns the row via `candidate_id` or `user_id`.
- Job reference can be either a UUID job or an external/demo id.

### `candidate_settings`
Purpose: candidate notification, search preference, and account status settings.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | Primary key. |
| `candidate_id` | `uuid` | nullable / unique | none | FK to `profiles(id)`; app upserts by this column. |
| `job_search_status` | `text` | nullable | none | App accepts `immediately_looking`, `open_to_opportunities`, `not_looking`. |
| `daily_job_recommendations` | `boolean` | `NOT NULL` | `true` | Notification toggle. |
| `weekly_job_recommendations` | `boolean` | `NOT NULL` | `false` | Notification toggle. |
| `job_status_updates` | `boolean` | `NOT NULL` | `true` | Notification toggle. |
| `recruiter_messages` | `boolean` | `NOT NULL` | `true` | Notification toggle. |
| `profile_views` | `boolean` | `NOT NULL` | `true` | Notification toggle. |
| `promotional_emails` | `boolean` | `NOT NULL` | `false` | Notification toggle. |
| `profile_visible_to_recruiters` | `boolean` | `NOT NULL` | `true` | Visibility toggle. |
| `account_status` | `text` | `NOT NULL` | `active` | App maps `deactivated` vs `active`. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |
| `updated_at` | `timestamptz` | `NOT NULL` | `now()` | Trigger-managed. |

Constraints and indexes:
- Unique `candidate_id` partial index.
- `candidate_settings_updated_at` trigger.

Relationships:
- One row per candidate.
- No direct recruiter relation.

### `blocked_companies`
Purpose: candidate-managed company block list.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | Primary key. |
| `candidate_id` | `uuid` | nullable | none | FK to `profiles(id)`. |
| `company_id` | `uuid` | nullable | none | Opaque compatibility field; no FK is defined. |
| `company_name` | `text` | `NOT NULL` / compat | none | Main uniqueness target in app. |
| `recruiter_id` | `uuid` | nullable | none | Optional recruiter pointer. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Save timestamp. |

Constraints and indexes:
- Unique `(candidate_id, company_name)` partial index.
- Index on `candidate_id`.
- Index on `company_name`.
- No update trigger.

Relationships:
- Candidate owns the row.
- `company_id` and `recruiter_id` are optional compatibility columns only.

### `recruiter_job_activities`
Purpose: recruiter activity/timeline table for job lifecycle events.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `gen_random_uuid()` | Primary key. |
| `recruiter_id` | `uuid` | `NOT NULL` | none | FK to `recruiters(id)`. |
| `job_id` | `uuid` | `NOT NULL` | none | FK to `jobs(id)`. |
| `activity_type` | `text` | `NOT NULL` | none | Check allows `job_created`, `job_updated`, `application_reviewed`, `candidate_contacted`, `job_confirmed`. |
| `metadata` | `jsonb` | `NOT NULL` | `{}` | Arbitrary event payload. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Event timestamp. |

Constraints and indexes:
- Index on `(job_id, created_at DESC)`.
- Index on `(recruiter_id, created_at DESC)`.
- RLS enabled.
- Trigger updates `jobs.last_recruiter_activity_at` and confirmation fields when inserted.

Relationships:
- Event log for recruiter-owned jobs.
- Connects to legacy `recruiters` ownership table.

### `recruiters`  (legacy/company table)
Purpose: original recruiter ownership table from the first schema.

Columns:
| Column | Type | Nullability | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | `NOT NULL` | `uuid_generate_v4()` | Primary key. |
| `user_id` | `uuid` | `NOT NULL` / unique | none | FK to `auth.users(id)`. |
| `company` | `text` | `NOT NULL` | none | Legacy company name. |
| `verified` | `boolean` | `NOT NULL` | `false` | Recruiter verification flag. |
| `response_rate` | `integer` | `NOT NULL` | `0` | Legacy recruiter signal. |
| `created_at` | `timestamptz` | `NOT NULL` | `now()` | Row timestamp. |

Constraints and indexes:
- Unique `user_id`.
- Index on `user_id`.
- RLS public read, own-row manage.

Relationships:
- Legacy job ownership table referenced by the oldest `jobs` schema and the recruiter activity table.
- Newer code mostly uses `profiles` + `recruiter_profiles` instead.

### Legacy normalized profile tables
These tables still exist in the initial schema and are protected by RLS, but current app persistence mostly stores the same information inside `candidate_profiles` JSON/array fields.

#### `experiences`
- Columns: `id`, `profile_id`, `company`, `role`, `start_date`, `end_date`, `current`, `description`, `skills`, `sort_order`, `created_at`.
- FK: `profile_id -> profiles(id)` with `ON DELETE CASCADE`.
- Index: `idx_experiences_profile`.
- RLS: readable by everyone; profile owner manages all rows.

#### `education`
- Columns: `id`, `profile_id`, `institution`, `degree`, `field`, `start_year`, `end_year`, `created_at`.
- FK: `profile_id -> profiles(id)` with `ON DELETE CASCADE`.
- Index: `idx_education` is not present in the initial migration; no secondary index found.
- RLS: readable by everyone; profile owner manages all rows.

#### `portfolio_projects`
- Columns: `id`, `profile_id`, `title`, `description`, `image_url`, `project_url`, `tools`, `created_at`.
- FK: `profile_id -> profiles(id)` with `ON DELETE CASCADE`.
- Index: `idx_portfolio_profile`.
- RLS: readable by everyone; profile owner manages all rows.

#### `certifications`
- Columns: `id`, `profile_id`, `name`, `issuer`, `year`, `credential_url`, `created_at`.
- FK: `profile_id -> profiles(id)` with `ON DELETE CASCADE`.
- No secondary index found.
- RLS: readable by everyone; profile owner manages all rows.

#### `social_links`
- Columns: `id`, `profile_id`, `label`, `url`, `icon`, `created_at`.
- FK: `profile_id -> profiles(id)` with `ON DELETE CASCADE`.
- No secondary index found.
- RLS: readable by everyone; profile owner manages all rows.

## 2. Auth / Role Fields

### `profiles.role`
- Current code treats roles as `candidate`, `recruiter`, `admin`, plus legacy `job_seeker` and `employer` during normalization.
- Initial schema had a check constraint limited to `candidate` and `recruiter`.
- Later compatibility migration `014_profiles_profile_fields_compat.sql` drops the role check, so the live database may contain older or wider values.

### `profiles.onboarding_complete`
- Boolean gate used by auth routing and action guards.
- `true` sends users to the completed destinations:
- candidate -> `/dashboard`
- recruiter -> `/recruiter/dashboard`
- `false` keeps users in onboarding.

### `profiles.onboarding_step`
- Current accepted values in code and migrations:
- `select_role`
- `candidate_resume`
- `candidate_profile`
- `recruiter_profile`
- `completed`
- Routing logic uses this field when deciding candidate vs recruiter onboarding.
- The code contains a fallback path if the column is missing, which is a strong hint that some Supabase schema-cache or partially migrated environments still lacked it at some point.

### Account status
- The only explicit account-status column in the repo is `candidate_settings.account_status`.
- Current app maps it as `active` or `deactivated`.
- There is no comparable recruiter account-status column in the inspected schema.

## 3. Applications

### Status values
- `applied`
- `shortlisted`
- `rejected`
- `hired`

### Timeline / event fields
- `viewed_at`
- `resume_downloaded_at`
- `contacted_at`
- `shortlisted_at`
- `rejected_at`
- `hired_at`

### Handling
- Candidate-side flows can create applications using either `job_id` or `job_external_id`.
- Candidate ownership can be expressed with either `candidate_id` or the legacy `user_id`.
- Recruiter-side flows update the status plus the matching timestamp field:
- `shortlisted_at`
- `rejected_at`
- `hired_at`
- Recruiter UI currently exposes `viewed` and `resume_downloaded` events directly.
- `contacted_at` exists in the schema and is loaded by the app, but there is no direct setter in the inspected recruiter service.
- `recruiter_job_activities` provides a second, job-level timeline for recruiter actions.

## 4. Jobs

### Status values
- DB check currently allows:
- `draft`
- `active`
- `inactive`
- `paused`
- `closed`
- `filled`
- Some app entry points still only post `active`, `draft`, `inactive`, or `closed`.

### Activity / active-inactive lifecycle
- `last_recruiter_activity_at` tracks the latest recruiter action.
- `confirmation_due_at` is defaulted to 30 days after creation or confirmation.
- `requires_confirmation` marks jobs that need recruiter confirmation.
- `confirmation_requested_at` records when confirmation was requested.
- `confirmed_at` records the confirmation timestamp.
- `inactive_reason` stores why a job was made inactive.
- `closed_at` and `filled_at` capture end states.
- App-side cron logic manages transitions from `active` to `inactive` and eventual `closed` states.

### Recruiter ownership fields
- `recruiter_profile_id` is the current ownership field used by the app.
- `recruiter_id` is a legacy ownership field that older migrations and fallback queries still understand.
- App posting logic writes both when possible and falls back if one column is missing.

### Company fields
- `company`
- `company_name`
- `company_logo`
- `company_description`
- `company_size`
- `company_industry`
- `response_rate`
- `salary_verified`

### Matching fields
- Skills: `skills`
- Tools: the job table does not store tools directly; candidate matching uses `skills` and `description`/`requirements` style text.
- Location: `location`, `location_type`
- Work mode: `location_type`
- Experience: `experience_level`
- Salary: `salary_min`, `salary_max`, `salary_currency`, `salary_period`, `salary_range`
- Industry: `company_industry`

## 5. Profile Completion Fields

The visible completion calculation is not based on `candidate_profiles.profile_completion`. The UI computes completion from the mapped profile object at runtime.

Fields checked by `calculateProfileCompletion()`:
- `profile.name`
- `profile.email`
- `profile.phone`
- `profile.location`
- `profile.headline` or `profile.currentTitle`
- `profile.about`
- `profile.avatarUrl`
- `profile.resumeFile`
- `profile.totalExperience` or `profile.totalExperienceYears` or `profile.totalExperienceMonths`
- `profile.currentTitle` or `profile.headline`
- `profile.expectedSalary` or `profile.expectedSalaryAmount` or `profile.currentSalary` or `profile.currentSalaryAmount`
- `profile.preferredLocations`
- `profile.jobTypePreference` or `profile.workModePreference` or `profile.industry`
- `profile.skills`
- `profile.tools`
- `profile.languages`
- `profile.experience`
- `profile.education`
- `profile.certifications` or `profile.portfolio` or `profile.links`

Notes:
- The runtime score is capped at `100`.
- `saveCandidateProfile()` currently writes `candidate_profiles.profile_completion = 90`, but the dashboard display uses the runtime calculation, not the stored value.

## 6. RLS Policies

### `profiles`
- `SELECT`: own row only.
- `INSERT`: own row only.
- `UPDATE`: own row only.

### `candidate_profiles`
- `SELECT`: own row only.
- `INSERT`: own row only.
- `UPDATE`: own row only.

### `recruiter_profiles`
- `SELECT`: own row only.
- `INSERT`: own row only.
- `UPDATE`: own row only.

### `jobs`
- `SELECT`: active jobs are public; recruiters can also see their own jobs.
- `INSERT`: recruiter role required, own job only.
- `UPDATE`: own job only.

### `applications`
- `SELECT`: candidates can see their own applications; recruiters can see applications for jobs they own.
- `INSERT`: own candidate/application only.
- `UPDATE`: recruiters can update applications for jobs they own.

### `saved_jobs`
- `SELECT`: own saved jobs only.
- `INSERT`: own saved jobs only.
- `DELETE`: own saved jobs only.

### `candidate_settings`
- `SELECT`: own settings only.
- `INSERT`: own settings only.
- `UPDATE`: own settings only.

### `blocked_companies`
- `SELECT`: own blocked companies only.
- `INSERT`: own blocked companies only.
- `DELETE`: own blocked companies only.

### `recruiter_job_activities`
- `SELECT`: own recruiter job activities only.
- `INSERT`: own recruiter/job pair only.

## 7. Storage

### Bucket with explicit migration support
- `avatars`
- Public bucket.
- Size limit: `512000` bytes in the migration.
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
- Policies:
- public read
- own-folder insert/update/delete, where folder prefix must match `auth.uid()`

### Declared in config, but no bucket migration found
- `resumes`
- `portfolio`

Notes:
- `src/lib/config/env.ts` exposes `resumesBucket`, `avatarsBucket`, and `portfolioBucket`.
- The upload helper currently implements real Supabase Storage upload only for avatars.
- Resume and portfolio uploads are still mock/future placeholders in the inspected code.

## 8. Known Schema Drift / Compatibility Notes

- Duplicate profile fields exist across generations: `name` and `full_name`, `headline` and `summary`/`about`, `company` and `company_name`, `job_id` and `job_external_id`, `candidate_id` and `user_id`.
- `profiles.role` originally had a strict check but later compatibility migrations dropped it; app code still normalizes older role values like `job_seeker` and `employer`.
- `profiles.onboarding_step` was added later and has a fallback path in auth code for environments where the column is missing.
- `candidate_profiles` was expanded from a small onboarding table to a broad JSON/array-backed profile store.
- `candidate_profiles.education` changed from text to JSONB; `languages`, `job_type_preference`, and `work_mode_preference` also changed shape over time.
- `candidate_profiles.job_preferences` is a legacy compatibility blob.
- `recruiter_profiles` and `candidate_profiles` moved from `user_id`-primary-key style tables to `id` primary key plus unique `user_id`.
- `jobs` has both legacy ownership (`recruiter_id`, `recruiters`) and current ownership (`recruiter_profile_id`, `profiles`) paths.
- `jobs` also carries both compact and denormalized company/salary fields for compatibility and display.
- `applications` and `saved_jobs` both support old `user_id` paths and newer `candidate_id` paths.
- `blocked_companies.company_id` is currently an opaque compatibility field, not a foreign key.
- `recruiter_job_activities` is the explicit job timeline table; `applications` also stores timeline timestamps directly.
- The app still probes for a legacy `designation` field in some `candidate_profiles` reads, but the migrations in this repo do not define it.
- `contacted_at` exists in `applications`, but the inspected recruiter service does not currently write it directly.
- `salary_verified` and `response_rate` exist for jobs, but not all app paths populate them.
- The numbered migration history includes duplicate prefixes (`003`, `018`), so filename order matters more than the numeric prefix alone.

## 9. Migration History

1. `001_initial_schema.sql` - creates the first full schema: profiles, recruiters, jobs, applications, saved jobs, normalized profile tables, indexes, triggers, and baseline RLS.
2. `002_auth_profile_fields.sql` - adds profile auth/onboarding compatibility fields such as `email`, `role`, and `onboarding_complete`.
3. `003_application_statuses.sql` - normalizes application statuses to `applied`, `shortlisted`, `rejected`, and `hired`.
4. `003_job_activity_status.sql` - adds job lifecycle handling, confirmation timing, recruiter job activity tracking, and related RLS/indexes.
5. `004_onboarding_profile_schema.sql` - expands `profiles`, adds `candidate_profiles` and `recruiter_profiles`, backfills data, and rewrites RLS for onboarding flows.
6. `005_onboarding_step.sql` - adds explicit onboarding-step tracking and backfills route state from role/completion.
7. `006_profiles_role_nullable.sql` - makes `profiles.role` nullable for OAuth/profile creation flow.
8. `007_candidate_resume_step.sql` - inserts the `candidate_resume` onboarding step and backfills existing candidate rows.
9. `008_live_jobs_applications.sql` - adds `recruiter_profile_id`, `candidate_id`, and compatibility policies/indexes for live Supabase flows.
10. `009_job_posting_draft_status.sql` - aligns job status with draft/publish posting UI and adds screening questions.
11. `010_remove_recruiters_dependency.sql` - moves job/application ownership away from the removed `recruiters` dependency and rewrites RLS around `profiles`.
12. `011_complete_jobs_columns.sql` - normalizes the `jobs` table with the full posting/dashboard field set and adds job indexes/constraints.
13. `012_candidate_profile_expansion.sql` - expands `candidate_profiles` with richer candidate profile fields, arrays, JSONB blobs, and resume/avatar compatibility columns.
14. `013_candidate_profile_preference_fields.sql` - adds numeric salary/preference fields and converts some legacy preference columns to arrays/JSONB.
15. `014_profiles_profile_fields_compat.sql` - compatibility cleanup for `profiles`, `candidate_profiles`, and `recruiter_profiles`; drops the `profiles.role` check and hardens RLS.
16. `015_candidate_profiles_education_jsonb.sql` - converts `candidate_profiles.education` to JSONB and reloads schema cache.
17. `016_candidate_profile_links_experience_level.sql` - adds social link columns and another `experience_level` compatibility field.
18. `017_applications_easy_apply_events.sql` - adds application timeline timestamps, external job support, recruiter-visible policies, and application indexes.
19. `018_avatar_storage_bucket.sql` - creates the public `avatars` bucket and its object policies.
20. `018_saved_jobs_and_job_detail_fields.sql` - adds saved-job compatibility fields plus denormalized job detail columns such as `company_name` and `salary_range`.
21. `019_blocked_companies_and_contacted_at.sql` - adds `contacted_at` to applications and creates the `blocked_companies` table and policies.
22. `020_candidate_settings.sql` - creates candidate notification/settings storage with account status and RLS.

## 10. Additional SQL Files Outside the Numbered Migration List

- `supabase/fix-profiles-rls.sql` - older profile/RLS repair script.
- `supabase/fix-profiles-schema.sql` - older profile schema repair script.
- `supabase/onboarding-profile-fields.sql` - older onboarding/profile compatibility script.

These are useful for understanding drift, but they are not part of the numbered migration history above.
