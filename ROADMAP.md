# Roadmap

This roadmap reflects the current implementation state of iJobs, not an aspirational rewrite.
It is organized around what is already working, what is partially working, and what should be stabilized next.

## 1. Current Product Stage

### Already built

- Candidate auth, onboarding, dashboard, profile, settings, saved jobs, applied jobs, and job discovery screens exist.
- Recruiter auth gating, recruiter dashboard, post-job flow, and applicant management screens exist.
- Supabase-backed persistence exists for profiles, candidate settings, applications, saved jobs, blocked companies, and recruiter jobs.
- Resume parsing exists through the OpenRouter-backed API route.
- Search, recommendation, and matching logic already exist in client-side form.
- Storage support exists for avatars and partial upload flows for resumes and portfolio images.

### Partially built

- Recruiter application management is functional but still thin on analytics and workflow depth.
- Candidate/recruiter matching is present, but still depends on client-side scoring and compatibility fields.
- Company visibility and blocking exist, but not every candidate surface is fully normalized yet.
- Resume upload is validated, but storage persistence is still not complete.
- Notification-style settings exist, but not all downstream delivery paths are implemented.

### Still unstable

- Auth restore and profile hydration can still lead to blank or stuck loading states if a profile fetch fails.
- Legacy schema compatibility still shapes several write paths.
- Search is still client-side and therefore sensitive to large job lists and stale local state.
- Apply/save flows still depend on fallback columns and duplicate-guard retries.
- Recruiter job posting is brittle because it retries multiple payload shapes to satisfy schema drift.

## 2. Short-Term Roadmap

### Next 1–2 weeks

#### Critical bug fixes

- Reduce blank-screen risk in auth restore and protected route flows.
- Make schema-cache and missing-column errors friendlier in the UI.
- Remove or isolate any remaining fake-success behavior for authenticated users.

#### Auth stability

- Tighten session restore so profile hydration failure does not behave like logout.
- Stabilize OAuth callback handling and local redirect behavior.
- Make onboarding state and role resolution less sensitive to stale profile rows.

#### Onboarding stability

- Keep candidate onboarding resilient to partial resume parsing failures.
- Keep recruiter onboarding resilient to missing company profile rows.
- Ensure save operations return clear inline errors and retry paths.

#### Apply/save flow stability

- Reduce duplicate-application and duplicate-save edge cases.
- Keep candidate-only guards consistent across every apply/save entry point.
- Make optimistic updates roll back cleanly on Supabase failure.

#### Dashboard real-data cleanup

- Minimize fallback/demo data for authenticated users.
- Make candidate dashboard loading states deterministic.
- Reduce repeated fetches and improve data consistency across dashboard sections.

#### Search UX polish

- Stabilize search query handling and URL param syncing.
- Keep recent searches and recently viewed jobs reliable without overriding live state.
- Make filter changes feel responsive without rerender thrash.

## 3. Medium-Term Roadmap

### Next 3–6 weeks

#### Recruiter application management

- Add fuller recruiter candidate workflows beyond shortlist/reject/hire.
- Improve timeline visibility for views, resume downloads, and status changes.
- Add better filtering and pagination for applicant lists.

#### Candidate/recruiter matching

- Normalize matching logic so search ranking and recommendation scoring align better.
- Make skills, tools, designation aliases, and work mode matching more consistent.
- Add clearer match explanations in candidate and recruiter views.

#### Company profiles

- Move company identity into a clearer, more consistent profile model.
- Reduce duplication between `company`, `company_name`, and related logo fields.
- Make company pages or profile surfaces more complete if needed.

#### Notifications

- Connect settings toggles to actual notification delivery paths.
- Add visible in-app notification states for applications, recruiter updates, and profile activity.

#### Resume parsing

- Stabilize the parsing result shape and validation.
- Make parsed resume data easier to review before saving.
- Reduce dependency on brittle raw model JSON.

#### Analytics basics

- Add simple recruiter analytics for views, applications, and status changes.
- Add candidate-side activity summaries beyond basic application history.

## 4. Long-Term Roadmap

### Later

- AI matching with more structured ranking and explanation layers.
- Subscription and payment system for premium candidate or recruiter tiers.
- Admin moderation and operational tooling.
- Recruiter verification and trust surfaces.
- Advanced recommendations with richer job/candidate signals.
- Messaging and interview scheduling.

## 5. Candidate Priorities

- Make auth restore and onboarding feel seamless.
- Keep profile editing reliable and quick to save.
- Make saved/applied jobs always reflect real data.
- Improve job search relevance and filter clarity.
- Strengthen candidate recommendations without overcomplicating the UI.
- Keep blocked-company behavior consistent across candidate-facing pages.

## 6. Recruiter Priorities

- Make posting a job reliable across all schema variants.
- Improve applicant management and timeline tracking.
- Add clearer candidate detail views and action handling.
- Improve recruiter dashboard stats and recent activity.
- Add trust signals and verification pathways later.
- Keep recruiter flow separate from candidate flow at all times.

## 7. Database Priorities

- Consolidate schema drift around profile and job ownership fields.
- Reduce duplicate identifiers:
  - `user_id` / `candidate_id`
  - `recruiter_id` / `recruiter_profile_id`
- Normalize company fields:
  - `company` / `company_name`
  - `company_logo` / `company_logo_url`
- Clean up jobs schema evolution around status, salary, and lifecycle fields.
- Clean up application timeline/status fields and legacy job identifiers.
- Keep additive migrations only and preserve backward compatibility until cleanup is safe.

## 8. UX Priorities

- Keep black/white minimal styling consistent across all pages.
- Improve dashboard readability without redesigning the whole system.
- Make search and filter interactions feel faster and more intentional.
- Improve empty, loading, success, and error states everywhere.
- Keep mobile navigation and recruiter/candidate shells stable.
- Avoid introducing unrelated visual changes while the data model is still stabilizing.

## 9. Technical Debt

- Schema drift is still present in multiple tables and write paths.
- Duplicate fields continue to exist as compatibility shims.
- Mock fallback risks remain for authenticated flows when Supabase is unavailable.
- Auth redirect and profile hydration logic can still create loops or blank screens.
- Search performance is still bounded by client-side ranking/filtering.
- Resume upload and storage are only partially wired end-to-end.
- Recruiter job posting still depends on payload retries to survive schema differences.

## 10. Release Readiness Checklist

### Auth

- [ ] Logged-out browsing works
- [ ] Login/register flow works
- [ ] Session restore works
- [ ] Logout works
- [ ] Expired session behavior is safe

### Onboarding

- [ ] Candidate onboarding completes reliably
- [ ] Recruiter onboarding completes reliably
- [ ] Resume parsing fallback works
- [ ] Profile creation does not stall

### Apply

- [ ] Candidate can apply once per job
- [ ] Daily apply limit is enforced
- [ ] Timeline/status updates are saved correctly

### Save

- [ ] Candidate can save and unsave jobs
- [ ] Saved jobs persist after refresh
- [ ] Blocked company state does not break save logic

### Recruiter Posting

- [ ] Recruiter can post a job
- [ ] Required fields validate cleanly
- [ ] Schema-compatible payload writes succeed

### Applications

- [ ] Recruiter can shortlist/reject/hire
- [ ] Recruiter can mark view/download events
- [ ] Applicant list loads correctly

### Search

- [ ] Query/search params work
- [ ] Filters behave consistently
- [ ] Search results stay relevant

### Dashboards

- [ ] Candidate dashboard loads real data
- [ ] Recruiter dashboard loads real data
- [ ] No blank state on partial fetch failure

### Settings

- [ ] Candidate settings save
- [ ] Block/unblock companies works
- [ ] Phone and preferences persist

### Mobile

- [ ] Candidate shell is responsive
- [ ] Recruiter shell is responsive
- [ ] Onboarding forms remain usable

### Supabase RLS

- [ ] Candidate ownership rules hold
- [ ] Recruiter ownership rules hold
- [ ] Blocked company and saved job access is correct

### Build / Lint

- [ ] Lint passes
- [ ] Build passes

