# iJobs Search Logic

This document summarizes the current job search and discovery behavior based on:
- `src/app/jobs/page.tsx`
- `src/components/jobs/job-feed.tsx`
- `src/components/filters/job-filters.tsx`
- `src/components/header.tsx`
- `src/components/jobs/highlighted-text.tsx`
- `src/lib/jobs/candidate-search.ts`
- `src/hooks/use-candidate-dashboard.ts`
- `src/lib/jobs/recently-viewed.ts`
- `src/hooks/use-saved-jobs.ts`
- related job detail and company modal code

This is documentation only. No app code was modified.

## 1. Search Entry Points

### Navigation search bar
- Lives in `src/components/header.tsx`.
- For candidate navigation, it becomes an interactive search box with suggestions.
- For non-candidate navigation, the input is still rendered but the search/submit behavior is effectively candidate-only.
- Enter on the nav search routes to `/jobs?q=...`.
- Suggestions are shown only for candidate navigation.

Suggestion sources:
- Recent searches from `localStorage`.
- Popular roles from `src/lib/profile/options.ts`.
- Popular skills from `src/lib/profile/options.ts`.
- Popular locations from `src/lib/profile/options.ts`.
- Company names from the current active job list.

### Discover Jobs page search
- Main search page is `/jobs`.
- `src/app/jobs/page.tsx` reads `searchParams.q` and passes it into `JobFeed`.
- `src/components/jobs/job-feed.tsx` controls the search input and filter state.

### Filter sidebar
- Implemented in `src/components/filters/job-filters.tsx`.
- It is the main refinement surface for the Discover Jobs page.
- On mobile, it opens as a right-side overlay.

### Recommended jobs
- Candidate dashboard recommendations come from `src/hooks/use-candidate-dashboard.ts`.
- The jobs page also shows a `Recommended instead` block when the filtered result set is empty.

### Recently viewed jobs
- Not a search input, but it is a discovery surface on the candidate dashboard.
- Recently viewed jobs are stored in `localStorage` from the job detail page and displayed on the dashboard.

## 2. Searchable Fields

Current live search/ranking checks the following fields:

| Field | Used? | Notes |
| --- | --- | --- |
| `title` | Yes | Direct text match and ranking signal. |
| `company` / `company_name` | Yes | `company_name` is normalized into `company` when rows are mapped. |
| `skills` | Yes | Used in matching, ranking, suggestions, and highlighting. |
| `tools` | No | Not currently part of job search or ranking logic. |
| `description` | Yes | Used in ranking and highlighting. |
| `location` | Yes | Used in filter matching, query parsing, ranking, and highlighting. |
| `location_type` / work mode | Yes | Used as a parsed query token and filter. |
| `industry` | Yes, as `companyIndustry` | Search ranking checks `company_industry`, not a separate job industry column. |
| `experience level` | Yes | Filtered and ranked, with alias handling. |
| `salary fields` | Filtered/sorted, not text-searched | `salary_min`, `salary_max`, `salary_currency`, `salary_period`, `salary_range` are not part of the text query score. |

Additional notes:
- The helper `getJobSearchText()` also concatenates `title`, `company`, `skills`, `description`, `companyIndustry`, `location`, and `locationType`, but the live UI does not rely on that helper directly.
- Search suggestions use company names, roles, skills, and locations, but not tools or salary.

## 3. Filters

### Implemented in the Discover Jobs UI
- Work mode: `Remote`, `Hybrid`, `On-site`
- Experience level: `Intern`, `Fresher`, `Junior`, `Mid`, `Senior`, `Lead`, `Manager`, `Director`
- Job type: `Full-time`, `Part-time`, `Contract`, `Internship`, `Freelance`
- Salary range: min/max numeric inputs
- Date posted: `any`, `24h`, `3d`, `7d`, `30d`
- Easy Apply: checkbox
- Skills: multi-select chips + freeform add
- Location: text input with datalist suggestions
- Designation: text input with datalist suggestions

### Present in code but not currently surfaced in the sidebar
- `remoteOnly`
- `verifiedOnly`

These flags exist in the filter type and the mock filter helper, but the live filter sidebar does not expose them.

### Not present as a search filter
- Industry filter is not implemented in the current job search UI.

## 4. URL / State Persistence

### Query parameters
- Search query param: `q`
- Jobs page reads `searchParams.q` and passes it to `JobFeed`.
- Job detail also uses `apply=1` to continue the Easy Apply flow, but that is not part of search.

### LocalStorage usage
- `ijobs.jobSearchState`
  - Stores the Discover Jobs filter state.
  - Restored on mount in `JobFeed`.
  - The stored query is intentionally overwritten by the current URL query param.
- `ijobs.candidateRecentSearches`
  - Stores recent nav search submissions.
  - Used in header suggestions.
- `ijobs.recent-viewed-jobs`
  - Stores recently viewed jobs from the job detail page.
  - Used on the dashboard.

### Persistence behavior
- Filters are restored from `localStorage` after mount.
- The query term is URL-driven when `q` is present.
- If the page loads without `q`, the search query is reset to empty even if localStorage contains an older query.
- `JobFeed` is keyed by `query`, so changing `q` remounts the feed and replays initial state.
- The header reads `q` only on `/jobs`, so browser refresh/back navigation keeps the search term if the URL still has it.
- Toggling saved jobs does not affect URL state.

## 5. Ranking Logic

### Jobs page ranking
The jobs page uses `scoreCandidateJobSearch()` from `src/lib/jobs/candidate-search.ts` and then sorts by:
1. relevance score when `sort = "relevant"`
2. posted age when `sort = "recent"`
3. `salaryMax` when `sort = "salary"`

### Score breakdown
Base text/query scoring:
- Exact title match: `+120`
- Title starts with query: `+80`
- Title includes query: `+60`
- Exact company match: `+70`
- Company includes query: `+50`
- Exact skill match against query: `+55`
- Title terms matched: `+18` each
- Company terms matched: `+16` each
- Description terms matched: `+8` each
- Industry terms matched: `+8` each
- Skill terms matched inside job skills: `+20` each

Parsed query boosts:
- Parsed location match: `+24`
- Parsed work mode match: `+24`
- Parsed experience match: `+16`

Candidate profile personalization:
- Matching title/headline/designation terms: `+10` each
- Skill overlap with candidate skills: `+12` each
- Preferred location overlap: `+12`
- Work mode match against candidate preferences: `+10`
- Experience level match: `+10`

Other boosts:
- Featured job: `+4`
- Verified recruiter: `+3`
- Active hiring: `+3`

### Candidate dashboard ranking
`use-candidate-dashboard.ts` computes a separate recommendation score:
- Title token overlap
- Skill overlap
- Preferred location match
- Work mode preference match
- Experience level match
- Tie-break by `featured`

Important difference:
- The dashboard recommendation logic does not use the same scoring weights as the jobs page.
- It also excludes jobs already applied to and excludes blocked companies.

### Recent job boost
- There is no explicit recency boost inside `scoreCandidateJobSearch()`.
- Recency is handled only through the explicit `sort = "recent"` mode.

## 6. Keyword Highlighting

### Where highlighting appears
- Job cards in the jobs feed.
- Specifically on:
  - title
  - company
  - location
  - location type
  - description
  - skills

### How it works
- `HighlightedText` splits the search query into terms.
- Terms shorter than 2 characters are ignored.
- Duplicate terms are removed.
- Longer terms are matched first.
- Matching is case-insensitive.

### Highlight style
- Default mark style:
  - `rounded-[0.35rem]`
  - `bg-yellow-100`
  - `text-black`
  - dark mode: `dark:bg-yellow-200 dark:text-black`

### Multi-keyword handling
- Words are split on whitespace.
- The component builds a regex that matches any term.
- Every matched segment is wrapped individually.

### Search input preservation
- The search input itself is controlled by component state.
- On the jobs page, it is seeded from the URL query param.
- Submitting the query updates the URL and preserves the typed value through the feed remount.

## 7. Data Source

### Live source
- The jobs page and header suggestions query Supabase directly when it is available.
- There is no dedicated server-side search endpoint for jobs.
- Filtering/ranking happens on the client after the job rows are loaded.

### Supabase query usage
- Jobs page loads active jobs with:
  - `status = "active"`
  - a limit of 100 rows
- Header suggestions load active jobs with a limit of 50 rows.
- Candidate dashboard loads active jobs for recommendations.

### Mock/demo fallback rules
- If Supabase is unavailable or the query returns no data, the code falls back to the local `src/data/jobs.ts` dataset.
- Job cards, empty states, and recommendations continue to work against mock data.
- The service layer also contains a mock jobs API, but the jobs page does not use it as the primary source of truth.

### Authenticated vs logged-out behavior
- Candidate search suggestions and recommendation logic are effectively candidate-focused.
- Logged-out users can still type in the nav search, but the candidate-specific suggestion/search flow is not active.
- Saved-job functionality and personalized recommendations require authentication.

## 8. Candidate ↔ Job Matching

### How candidate fields affect recommendations
Candidate dashboard recommendations use:
- `currentTitle` / `headline`
- `skills`
- `preferredLocations`
- `workModePreference`
- `experienceLevel`

### How candidate fields affect jobs-page ranking
`scoreCandidateJobSearch()` also uses:
- `designation`
- `headline`
- `skills`
- `preferredLocations`
- `workModes`
- `experienceLevel`

### Match score / sort order
- Candidate dashboard calculates a `matchPercentage` from the recommendation score.
- Jobs page uses the relevance score as the default sort.
- When the user chooses `recent` or `salary`, that overrides relevance order.

### Filter interactions
- Candidate profile does not automatically change the explicit UI filters.
- It does influence ranking and recommendation ordering.
- Blocked companies are removed from candidate dashboard recommendations.

## 9. Known Search Bugs / Limitations

- `easyApply` is not a real filter in the jobs-page data model yet; the current check is `if (filters.easyApply && !job.id)`, which does not actually exclude jobs.
- `remoteOnly` and `verifiedOnly` exist in filter state types and the mock filter helper, but they are not wired into the live Discover Jobs filter sidebar.
- There is no industry filter UI.
- Salary is not part of the text query ranking, only the explicit salary filter/sort.
- Search is client-side against the fetched job list, so it is limited by the size and freshness of what was loaded into the browser.
- The jobs page loads a finite set of rows and does not implement true paginated search.
- Header suggestions depend on the current active jobs payload and localStorage recent searches.
- The search experience depends on columns like `company_name`, `company_industry`, `location_type`, and `skills`; missing columns trigger fallback behavior or reduced fidelity.
- Some code still references legacy candidate schema fields such as `designation`.
- `saved` mode in the jobs feed bypasses filtered results and shows saved jobs directly, which can make the search query feel ignored while that view is active.

## 10. Future Search Improvements

Safe upgrades to consider later:
- Better query parsing for phrases, quoted terms, and facet-aware search tokens.
- Normalized taxonomy for job type, work mode, industry, and experience level.
- Database-side search via Supabase/Postgres filtering for better scale.
- Postgres full-text search for titles, descriptions, company names, and skills.
- Separate relevance scoring by query intent versus candidate personalization.
- Optional industry filter in the sidebar.
- Stronger handling for `easyApply`, `verifiedOnly`, and `remoteOnly`.
- Persisting filter state in the URL for shareable search links.
- Search pagination or infinite loading to avoid pulling large result sets into the client.
