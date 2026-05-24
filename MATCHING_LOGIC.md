# MATCHING LOGIC

This document describes how candidates and recruiters/jobs are connected in the current iJobs codebase, and where the matching model is still partial or planned.

## 1. Candidate Profile Fields Used for Matching

Current matching and recommendation code reads these candidate-side fields:
- `designation`
- `current_title`
- `headline`
- `skills`
- `preferred_locations`
- `work_mode_preference`
- `experience_level`

Also present in profile/onboarding data, but not strongly used in current scoring:
- `tools`
- `current_salary` / `current_salary_currency` / `current_salary_amount`
- `expected_salary` / `expected_salary_currency` / `expected_salary_amount`
- `industry` / `industries`
- `functional_area`

Notes:
- The search and recommendation layers favor `designation`, `headline`, `skills`, location preferences, work mode, and experience.
- `tools`, salary, industry, and functional area are captured in the profile model and onboarding flow, but they are not first-class inputs to the current scoring functions in the same way skills and title are.

## 2. Job Fields Used for Matching

Current job-side matching uses:
- `title`
- `company`
- `company_name`
- `skills`
- `description`
- `location`
- `location_type`
- `experience_level`
- `salary_min`
- `salary_max`
- `salary_range`
- `company_industry`
- `job_type`

Additional job fields that influence trust or visibility:
- `featured`
- `status`
- `response_rate`
- `salary_verified`
- `company_description`
- `company_size`

Notes:
- The current app does not have a dedicated job `tools` field. Tool matching is therefore not implemented as a real job-side signal yet.
- `company_industry` is used in search scoring and job display. Functional-area matching is not yet a strong job-field signal in the code.

## 3. Match Scoring

There are two active scoring paths.

### A. Search ranking score
Implemented in [`src/lib/jobs/candidate-search.ts`](C:/Job%20Portal%20Codex/src/lib/jobs/candidate-search.ts):
- Exact title match: +120
- Title starts with query: +80
- Title includes query: +60
- Exact company match: +70
- Company includes query: +50
- Exact skill match: +55
- Title term overlap: +18 per term
- Company term overlap: +16 per term
- Description term overlap: +8 per term
- Industry term overlap: +8 per term
- Skill-term overlap in job skills: +20 per matched skill
- Parsed location match: +24
- Parsed work mode match: +24
- Parsed experience match: +16
- Candidate title/headline/designation preference overlap: +10 per term
- Candidate skill overlap: +12 per matched skill
- Candidate preferred location match: +12
- Candidate work mode match: +10
- Candidate experience match: +10
- Featured job boost: +4
- Verified recruiter boost: +3
- Active hiring boost: +3

### B. Candidate dashboard recommendation score
Implemented in [`src/hooks/use-candidate-dashboard.ts`](C:/Job%20Portal%20Codex/src/hooks/use-candidate-dashboard.ts):
- Title overlap between candidate title/headline and job title: up to 40 points
- Skill overlap: up to 40 points
- Preferred location match: 10 points
- Work mode match: 5 points
- Experience level match: 5 points
- Featured tie-breaker when scores are equal

### Current status of extra boosts
- `recency` is not a first-class part of the candidate search score, but the dashboard and job feed still sort/filter by posted date through separate sort modes.
- `easy apply` is currently a UI and application-flow concept, not a distinct boost in the scoring functions.
- `verified recruiter` and `active hiring` are small positive boosts in the search score.

## 4. Recommended Jobs

Current behavior for candidate recommended jobs:
- Recommended jobs are computed on the candidate dashboard from active jobs only.
- Already-applied jobs are excluded.
- Blocked companies are excluded from the recommendation list where supported.
- Jobs are ranked by the recommendation score, then `featured` is used as a tie-breaker.
- The dashboard shows a short list of top matches rather than a full ranked catalog.

Intended behavior:
- Recommended jobs should become more personalized by adding stronger use of salary, industry, functional area, and tool signals.
- Recommendation quality should remain distinct from plain search ranking so a user can search broadly without losing personalization.

## 5. Recommended Candidates

Current status:
- Recruiter-side candidate recommendation is mostly placeholder/mock-based today.
- The recruiter dashboard shows hard-coded candidate cards with match percentages from mock data.
- Recruiter review pages show real candidate/application records, but there is no robust recruiter-side candidate recommender in production logic yet.

Intended later behavior:
- Candidate recommendations for recruiters should rank candidates by:
  - skill overlap with the job
  - tools overlap
  - title/designation fit
  - location fit
  - experience fit
  - salary fit where available
  - profile completion / trust signals
- Recruiter candidate recommendations should also respect company blocking and recruiter visibility rules.

## 6. Search Relationship

Search ranking and match score work together but are not the same thing.

Current relationship:
- Search ranking is query-driven.
- Match score is profile-driven personalization layered on top of the query result.
- The job feed computes `relevanceScore` from `scoreCandidateJobSearch(...)` and then sorts by `relevant`, `recent`, or `salary`.
- Candidate dashboard recommendations use a separate recommendation score and do not depend on the search query.

Practical rule:
- Search should answer “what matches what the user typed?”
- Match score should answer “how well does this job fit this candidate?”

## 7. Application Connection

Current flow:
- Candidate applies to a job.
- The application is written to `applications` with `status = "applied"`.
- Recruiter views the application in the recruiter candidates/applications page.
- Recruiter actions update application timeline fields:
  - `viewed_at`
  - `resume_downloaded_at`
  - `contacted_at`
  - `shortlisted_at`
  - `rejected_at`
  - `hired_at`

Candidate-facing effect:
- The applications page and dashboard surfaces read those timestamps back as status events.
- The candidate can see a timeline of what has happened to each application.

## 8. Blocking / Company Visibility

Current behavior:
- A blocked company is stored per candidate in `blocked_companies`.
- Candidate dashboard recommendations exclude blocked companies.
- Recruiter candidate loading filters out candidates who have blocked that recruiter’s company name.

Supported / intended behavior:
- A blocked company should not see the candidate profile where the visibility path supports it.
- A candidate should not receive recommendations from blocked companies where the data path supports filtering.

Current limitation:
- Blocking is not enforced uniformly across every job search surface yet.
- The main strong enforcement is on the candidate dashboard recommendation path and recruiter candidate visibility path.

## 9. Trust / Activity Logic

Current signals:
- Active recruiter boost exists in search scoring and recommendation relevance.
- Verified recruiter boost exists in search scoring and trust UI.
- Inactive jobs are downgraded or hidden in many candidate surfaces.

Job lifecycle signals:
- `active` jobs are visible to candidates.
- `inactive`, `paused`, `closed`, and `filled` jobs are treated as non-active in most candidate-facing listings.
- Recruiter activity timestamps and `recruiter_job_activities` support future confirmation and lifecycle handling.

Trust signals surfaced in the UI:
- Verified recruiter badge
- Response rate
- Salary verification badge or note
- Active hiring status

## 10. Known Gaps

Implemented:
- Query ranking for candidate job search
- Candidate dashboard recommendation scoring
- Application timeline/status propagation
- Blocked-company filtering in key candidate/recruiter paths
- Verified recruiter and active-hiring boosts

Partial:
- Tool matching is captured in profile data but not used as a strong job matching signal.
- Salary, industry, and functional-area matching are present in profile data and UI, but not deeply represented in ranking.
- Blocked-company logic is not uniform across every search/listing surface.
- Recruiter candidate recommendations are still mostly mock-driven.

Planned / desirable:
- Stronger salary fit scoring
- Better industry and functional-area matching
- Tool-to-job matching if jobs gain structured tool requirements
- Recruiter-side candidate recommendation scoring
- More explicit recency weighting in recommendation score
- Easy-apply awareness in ranking, if the product wants that as a first-class signal

