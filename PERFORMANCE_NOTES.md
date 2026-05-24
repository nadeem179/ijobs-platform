# Performance Notes

This document highlights the parts of iJobs that are most likely to feel slow or rerender-heavy today, and the safest optimizations to apply later.

## 1. Current Performance-Sensitive Areas

- Discover Jobs search and filter flows are client-side and score/filter large local job arrays in memory.
- Job list rendering can get heavy because cards include badges, skill chips, highlights, and multiple conditional states.
- Candidate dashboard data loading fans out into several reads:
  - profile
  - active jobs
  - applications
  - saved jobs
  - recently viewed jobs
- Profile completion is recalculated repeatedly from the full profile object.
- Onboarding forms are large and multi-step, with many controlled inputs, comboboxes, and upload actions.
- Recruiter applications lists render candidate cards with status filters and timeline metadata.
- Saved/applied state checks are repeatedly computed with set membership and list scans.

## 2. Search Performance

- Filtering is primarily client-side.
  - Candidate search ranking is implemented in [`src/lib/jobs/candidate-search.ts`](C:/Job%20Portal%20Codex/src/lib/jobs/candidate-search.ts).
  - Job feed filtering in the service layer also happens in memory over already-loaded jobs.
- Debounce usage is limited.
  - Some form interactions are deferred with `setTimeout(..., 0)`, but there is no broad debounced search-input pipeline.
- URL param updates are lightweight but still cause rerenders when the query changes.
  - The dashboard search box pushes `/jobs?q=...`.
- Keyword highlighting can become expensive if applied across many cards, because it depends on repeated token checks and render-time string work.
- Filter state rerender risk is high when many controls are controlled together:
  - query
  - designation
  - location
  - job type
  - experience
  - skills
  - salary
  - freshness
  - work mode
  - verification / easy apply toggles

## 3. Supabase Query Performance

### Heavy queries

- Candidate dashboard loads jobs with a long select list and active-status filter.
- Candidate applications load nested `jobs(...)` joins and timeline timestamps.
- Saved jobs also load nested `jobs(...)` data.
- Recruiter candidates load:
  - recruiter-owned jobs
  - all applications for those jobs
  - blocked companies
  - candidate `profiles`
  - candidate `candidate_profiles`
- Profile hydration performs multiple reads across `profiles`, `candidate_profiles`, and `recruiter_profiles`.

### Repeated queries

- Auth/profile state can trigger repeated reloads during restore and route transitions.
- Candidate dashboard and settings both load profile data separately.
- Applications and saved jobs each refetch on mount and after mutation/duplicate conflict recovery.

### Missing indexes likely needed

Likely helpful indexes for the current access patterns:

- `jobs.status`
- `jobs.created_at`
- `jobs.recruiter_id`
- `jobs.recruiter_profile_id`
- `applications.user_id`
- `applications.candidate_id`
- `applications.job_id`
- `applications.created_at`
- `saved_jobs.candidate_id`
- `saved_jobs.user_id`
- `saved_jobs.job_id`
- `blocked_companies.candidate_id`
- `blocked_companies.company_name`
- `candidate_settings.candidate_id`
- `candidate_profiles.user_id`
- `recruiter_profiles.user_id`

### Joins / nested selects

- Applications and saved jobs both use nested `jobs(...)` selects.
- Recruiter candidate views stitch together:
  - job ids
  - application rows
  - profile rows
  - candidate profile rows

### Dashboard query risks

- The candidate dashboard loads several data sets independently instead of batching them.
- Any one failing query can leave a section empty or force a fallback state.
- Because the dashboard also computes recommendations locally, the data load cost and the render cost stack together.

## 4. UI Rendering Risks

- Large option lists:
  - skills
  - tools
  - designations
  - industries
  - locations
  - languages
- Dropdown lists and comboboxes can get expensive when they re-render on every keystroke.
- Chip selectors can produce large DOM trees, especially on onboarding and profile edit screens.
- Long job cards combine title, metadata, chips, skills, and actions in dense layouts.
- Profile sections are heavy because they include completion checks, nested experience/education/project lists, and preview uploads.
- Application timelines can become verbose when many status timestamps are present.

## 5. Caching / State

- Good candidates for local caching:
  - recent searches
  - recently viewed jobs
  - recruiter free-post quota
  - UI-only dropdown/filter state
- Data that should always refetch from Supabase:
  - profile data
  - applications
  - saved jobs
  - recruiter applications
  - recruiter posted jobs
  - settings
- Optimistic updates are safest when:
  - the mutation is idempotent
  - the UI can recover by refetching
  - the failure path is clear
- Optimistic updates are riskier for:
  - profile saves
  - job posting
  - application status changes
  - storage uploads

## 6. Recommended Safe Optimizations

- Debounce search input before scoring/filtering.
- Memoize filtered and ranked job lists.
- Paginate or virtualize large job and recruiter lists.
- Avoid fake fallback data for authenticated users when real data fails.
- Batch dashboard queries where possible.
- Add indexes for the most common filter and ownership fields.
- Keep recomputation boundaries tight around:
  - search parsing
  - profile completion
  - recommendation scoring
  - saved/applied lookups

## 7. Do Not Overbuild

Avoid jumping straight to:

- Elasticsearch
- vector databases
- complex distributed caching layers
- premature server infrastructure for search

The current bottleneck is mostly client-side rendering and repeated Supabase reads, not search infrastructure scale.

## 8. Future Performance Checklist

### Search

- [ ] Debounce input changes
- [ ] Memoize parsed query and ranked results
- [ ] Limit list size on initial render
- [ ] Keep highlight logic cheap

### Dashboards

- [ ] Reduce repeated profile/job fetches
- [ ] Batch independent queries where practical
- [ ] Avoid rerendering the whole dashboard on minor state updates

### Applications

- [ ] Keep duplicate checks O(1) with `Set` lookups
- [ ] Avoid refetch loops after duplicate conflicts
- [ ] Keep timeline formatting memoized when possible

### Recruiter Jobs

- [ ] Paginate long application lists
- [ ] Avoid repeated nested selects if a flatter query will do
- [ ] Defer expensive candidate detail hydration until needed

### Profile Editing

- [ ] Recompute completion only when profile data changes
- [ ] Reduce rerenders from large form state objects
- [ ] Keep upload previews local until persistence succeeds
