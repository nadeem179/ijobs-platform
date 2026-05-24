# Deployment Notes

These notes summarize the current deployment posture of iJobs and the practical risks to watch when shipping changes.

## 1. Hosting

### Vercel setup

- The app is a Next.js project and is compatible with Vercel deployment.
- The repository README explicitly points to Vercel as the easiest deployment path.
- There is no custom Vercel config file in the repo, so deployment is expected to use standard Next.js/Vercel defaults.
- Preview and production behavior should differ only by environment variables and linked Supabase project settings.

### Environments

- Local development uses:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3003`
- Production should provide the same public Supabase variables plus a production `NEXT_PUBLIC_APP_URL`.
- Storage is optional and controlled by `NEXT_PUBLIC_ENABLE_STORAGE`.

### Preview / prod behavior

- Supabase auth and storage are enabled only when the public env variables are present.
- OAuth redirect behavior depends on `NEXT_PUBLIC_APP_URL` and Supabase auth redirect allowlists.
- Preview deployments should use their own approved auth redirect URLs if auth is expected to work there.

## 2. Supabase Environments

### Dev / prod setup

- The repo does not define separate dev/prod Supabase projects in code.
- The code is written to work against whichever Supabase project is supplied through environment variables.
- Because the app depends on existing schema compatibility, dev and prod databases must stay aligned on the same migration history.

### Migration workflow

- Schema changes live in `supabase/migrations`.
- The codebase and docs assume additive migrations with backward compatibility.
- The repository also contains a few manual repair SQL files:
  - `supabase/onboarding-profile-fields.sql`
  - `supabase/fix-profiles-schema.sql`
  - `supabase/fix-profiles-rls.sql`
- Those files should be treated as repair artifacts, not the preferred long-term migration pattern.

### Env variable usage

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_ENABLE_STORAGE`
- `NEXT_PUBLIC_STORAGE_BUCKET_RESUMES`
- `NEXT_PUBLIC_STORAGE_BUCKET_AVATARS`
- `NEXT_PUBLIC_STORAGE_BUCKET_PORTFOLIO`
- `OPENROUTER_API_KEY`
- `OPENROUTER_SITE_URL`
- `OPENROUTER_SITE_NAME`
- `JOB_ACTIVITY_CRON_SECRET`

## 3. Build Process

### npm scripts

From [`package.json`](C:/Job%20Portal%20Codex/package.json):

- `npm run dev` - starts the Next.js dev server
- `npm run build` - builds the app for production
- `npm run start` - starts the production server
- `npm run lint` - runs ESLint

### Lint / build commands

- Lint: `npm run lint`
- Build: `npm run build`

### Deployment commands

- There is no custom deploy script in the repo.
- For Vercel, deployment is expected to happen through the platform’s Git integration or the standard Vercel CLI flow.

## 4. Release Risks

### Auth-sensitive changes

- PKCE/OAuth callback behavior can break login if redirect URLs or callback handling drift.
- Profile hydration failures can make authenticated users look logged out or leave them on loading states.
- Role and onboarding state live in `profiles`, so stale rows can affect routing immediately after sign-in.

### Migration-sensitive changes

- The app still relies on legacy compatibility fields in `profiles`, `candidate_profiles`, `recruiter_profiles`, `jobs`, `applications`, `saved_jobs`, and `blocked_companies`.
- Dropping or renaming columns too early will break the current app logic.
- Schema-cache errors are already handled with fallback queries, which is a sign the live schema is still not fully normalized.

### Onboarding-sensitive changes

- Candidate onboarding writes profile, candidate profile, upload, and resume-parse related fields in one flow.
- Recruiter onboarding writes both profile and company fields.
- Any schema mismatch in those writes can block the user from completing setup and then block route access afterward.

## 5. Rollback Guidance

### Migration rollback concerns

- Because migrations are additive and compatibility-heavy, rollback is not as simple as reverting the latest file.
- Removing columns can break older app code and existing records.
- Any rollback plan should be tested against the current production schema, not just against the latest migration file.

### Deployment rollback risks

- A deployment rollback without a matching database rollback can still fail if the reverted code expects older schema shapes.
- Auth-related releases are especially sensitive because callback logic, profile hydration, and route guards are tightly coupled.
- Storage or OpenRouter-related changes may fail independently of the main app if environment variables are missing.

## 6. Monitoring

### Current analytics / logging tools

- The repo does not show a dedicated analytics package or error-tracking service.
- Logging is primarily `console.error(...)` with structured error details in a few core services and hooks.
- Useful debug contexts currently include:
  - `[PROFILE]`
  - `[JOBS]`
  - `[APPLICATIONS]`
  - `[SAVED_JOBS]`
  - `[BLOCKED_COMPANIES]`
  - `[SETTINGS]`

### Missing tooling

- No dedicated error tracking service is wired in.
- No analytics pipeline is visible in the repo.
- No deployment health dashboard or synthetic monitoring is configured in code.

## 7. Recommended Future Setup

### Staging environment

- Add a dedicated staging Supabase project.
- Add a staging Vercel environment with its own auth redirect URLs.
- Run migration validation against staging before production.

### Error tracking

- Add a shared error tracking tool for auth, profile persistence, job posting, and application mutations.
- Capture Supabase error codes and schema-cache failures centrally.

### Analytics

- Add basic product analytics for:
  - auth completion
  - onboarding completion
  - apply/save conversion
  - recruiter posting completion
  - search usage
- Add lightweight operational metrics for failed profile loads, failed application writes, and upload failures.

### Deployment checklist

- [ ] Public env vars set
- [ ] Supabase auth redirect URLs approved
- [ ] Migrations applied to target database
- [ ] Storage buckets/policies present if storage is enabled
- [ ] Build passes
- [ ] Lint passes
- [ ] Auth restore tested
- [ ] Onboarding tested
- [ ] Apply/save tested
- [ ] Recruiter posting tested
- [ ] Search tested
- [ ] Dashboard load tested
- [ ] Mobile layout sanity checked

## Release Notes

- The repository README currently documents the job-activity cron flow using Netlify-style scheduling and a `/api/jobs/activity-status` POST request.
- If the app is deployed on Vercel, that cron/scheduler setup should be translated to Vercel Cron or another external scheduler so the route still runs on a schedule.
