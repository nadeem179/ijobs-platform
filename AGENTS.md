# iJobs Engineering Rules

## Core Rules
- Never redesign unrelated sections
- Never change recruiter flow while fixing candidate flow
- Preserve existing UI unless explicitly requested
- Run build after every task
- Run eslint after every task

## Candidate UX
- LinkedIn inspired profile UX
- Upwork inspired discover jobs UX
- Naukri inspired settings UX

## Routing Rules
- Logged in candidate -> /dashboard
- Logged in recruiter -> /recruiter/dashboard
- Incomplete onboarding -> onboarding flow

## Database Rules
- Never assume columns exist
- Always use IF NOT EXISTS migrations
- Prefer additive migrations
- Never remove production columns

## Design Rules
- black/white minimal
- subtle shadows
- no bright colors except highlights
- maintain spacing consistency

## Testing Checklist
- auth restore
- onboarding
- save jobs
- apply jobs
- profile editing
- recruiter posting
- search filters
- responsive
