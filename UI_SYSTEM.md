# UI SYSTEM

This document describes the current UI system in iJobs: its visual direction, reusable primitives, layout patterns, interaction rules, and the surfaces that should stay visually stable.

## 1. Design Direction

### Current direction
- Black/white minimal base with light borders, subtle shadows, rounded corners, and restrained surface contrast.
- Clean SaaS feel with card-based content, clear hierarchy, and generous whitespace.
- Product inspiration is closest to:
  - LinkedIn for structured profile sections and professional credibility
  - Naukri for settings density and job-search utilities
  - Upwork for discover jobs, filters, and “find the right role” scanning behavior

### What to copy
- Structured cards with compact metadata rows.
- Sectioned profile layouts with clear edit affordances.
- Left-sidebar / sticky-filter job discovery patterns.
- Trust/status chips for verified, active, applied, saved, and profile-completion states.
- Minimal icon usage with small, functional labels.

### What not to copy
- Loud gradient-heavy marketing pages.
- Overdecorated glassmorphism or colorful dashboard chrome.
- Large hero banners inside authenticated product surfaces.
- Dense enterprise panels with too many separators or chart-heavy chrome.

### Color rules observed in the app
- Neutrals drive most of the UI.
- Emerald is reserved for success / active / verified signals.
- Red is reserved for errors and destructive actions.
- Amber appears sparingly for warnings and safety notes.
- Blue appears mainly in informational states.

## 2. Layout Patterns

### Dashboard layout
- Candidate dashboard uses a two-column grid with main content on the left and a supporting sidebar on the right.
- Recruiter dashboard uses a metrics-first layout with summary cards across the top, then split sections below.
- Dashboard cards use rounded containers, compact padding, and consistent spacing between sections.

### Profile layout
- Candidate profile is a large single-page summary with:
  - header section
  - editable section blocks
  - right-side profile completion / sidebar summaries where applicable
- Edit flows open in section editors or modal-style overlays rather than navigating the user away.

### Discover jobs layout
- Job discovery uses a three-part composition:
  - search bar at top
  - sticky left filter rail on desktop
  - results feed in the main column
- Mobile replaces the filter rail with a full-height overlay panel.

### Recruiter layout
- Recruiter pages favor a crisp admin-style shell with:
  - top dashboard summary cards
  - action-oriented sections
  - job and applicant lists in stacked cards
- Recruiter guards keep the experience intentionally separate from candidate navigation.

### Settings layout
- Settings uses a left-side tab rail and a large content panel on the right.
- On mobile, tabs compress into a wrapped row rather than a separate app shell.
- Each settings section is a standalone rounded card with save actions anchored at the bottom.

### Mobile responsiveness
- Mobile uses stacked cards, full-width inputs, and overlay panels for filters/modals.
- Desktop uses sticky sidebars, wider content width, and inline affordances.
- Key patterns are preserved between breakpoints, only compressed rather than redesigned.

## 3. Reusable Components

### Buttons
- [`Button`](C:/Job%20Portal%20Codex/src/components/ui/button.tsx)
- Variants: default, destructive, outline, secondary, ghost, link
- Sizes: default, sm, lg, xl, icon
- Usage pattern: rounded, low-friction CTAs with disabled states and subtle shadows.

### Cards
- Most cards are built with simple `rounded-xl` / `rounded-2xl` containers using `border-border/30` and `bg-background`.
- Common card styles:
  - `card-base`
  - `card-interactive`
  - bordered rounded sections

### Inputs
- [`Input`](C:/Job%20Portal%20Codex/src/components/ui/input.tsx)
- Standard height is `h-9` or `h-10`.
- Inputs are small, calm, and not overly stylized.

### Dropdowns / selects
- Native `<select>` is used in many places for simple option sets.
- Searchable combobox behavior is implemented in onboarding and profile editing through custom input + suggestion lists.

### Modals
- Auth modal uses a full-screen overlay with a centered shell.
- Company profile modal uses a centered overlay with a compact content card.
- Section editors use a modal-like bottom-sheet on mobile and centered dialog on desktop.

### Drawers / overlays
- Job filters on mobile behave like a right-side drawer overlay.
- The drawer is implemented with a full-screen fixed container rather than a separate UI library.

### Chips
- Chips are used heavily for skills, locations, job types, and language values.
- There are two chip modes:
  - selected chips with remove actions
  - suggestion chips with add actions

### Badges
- [`Badge`](C:/Job%20Portal%20Codex/src/components/ui/badge.tsx)
- Used for statuses, trust markers, counts, and low-emphasis metadata.

### Progress bars
- Profile completion and profile strength use a thin horizontal bar with green fill.
- Progress is always concise and paired with text labels.

### Skeletons / loaders
- [`LoadingState`](C:/Job%20Portal%20Codex/src/components/ui/loading-state.tsx)
- [`SkeletonCard`](C:/Job%20Portal%20Codex/src/components/jobs/skeleton-card.tsx)
- [`SkeletonDetail`](C:/Job%20Portal%20Codex/src/components/jobs/skeleton-detail.tsx)
- Loading is represented with pulse blocks or a centered spinner carrying the brand mark.

### Toasts
- [`ToastProvider`](C:/Job%20Portal%20Codex/src/components/ui/toast.tsx)
- Toasts appear bottom-right, auto-dismiss, and support success/error/info variants.

## 4. Form UX Rules

### Searchable dropdowns
- Used for skill selection, language selection, currencies, locations, and designations.
- Dropdowns are query-filtered and show only a short list of matches.

### Chip selectors
- Multi-select fields render current values as removable chips.
- Suggestions appear underneath as addable chips.

### Add / edit section editors
- Candidate profile editing uses section-specific editors rather than one giant form.
- Editors are modal-like, scrollable, and have a sticky header/footer for close/save actions.

### Validation messages
- Validation appears inline near the relevant field or section.
- Errors use red text and usually appear directly beneath the field or in a compact alert row.

### Disabled email fields
- Email is read-only wherever account identity is managed by the auth provider.
- Disabled email fields are shown with muted styling and explanatory helper text.

### Upload components
- Avatar and resume upload flows use custom upload controls.
- File validation is explicit: file type, file size, and immediate preview behavior are enforced in the UI.

## 5. Navigation Rules

### Candidate nav
- Candidate navigation includes:
  - Dashboard
  - Discover Jobs
  - Applications
  - Saved
  - Profile
  - Settings
  - FAQs
- Candidate nav is shown via the top header and profile dropdown.

### Recruiter nav
- Recruiter navigation includes:
  - Dashboard
  - Jobs
  - Candidates
  - Post Job
  - Company/Profile
- Recruiter navigation is separated from candidate navigation and is role-aware.

### Profile dropdown
- The profile dropdown is the main account menu for authenticated users.
- It shows user identity at the top, then role-specific links, then logout.

### Logo behavior
- Logged out: logo goes to `/`.
- Candidate: logo goes to `/dashboard`.
- Recruiter: logo goes to `/recruiter`.
- Admin: logo goes to `/admin`.

## 6. Status / State UI

### Empty states
- Empty states are explicit and readable, not hidden.
- They often include:
  - a small icon
  - one sentence of guidance
  - a clear next action

### Loading states
- Protected pages show a spinner while auth/session state restores.
- Job lists and detail pages use skeleton blocks rather than a blank canvas.

### Error states
- Error states are shown inline when a form or data fetch fails.
- Candidate dashboard uses an error card when the profile cannot be loaded.

### Success toasts
- Success is typically confirmed via a compact toast in the bottom-right corner.

### Applied / saved states
- Applied jobs are visibly disabled or marked as applied.
- Saved jobs show bookmark state changes and can be removed from saved lists.

### Profile completion states
- Profile completion is shown as a percentage plus a progress bar and checklist items.
- The UI favors “what’s missing next” over abstract completion scores.

## 7. Page-Specific UI Rules

### Candidate dashboard
- Keep the greeting + search bar prominent.
- Recommended jobs and recently viewed jobs should stay card-driven and scannable.
- Profile completion belongs in a compact right sidebar or an expandable panel.

### Discover jobs
- Search and filters must remain the primary controls.
- Results should feel sortable, skimmable, and trust-heavy.
- The list should keep bookmark and apply actions immediately visible.

### Job detail
- The hero section should remain the primary focal point.
- Trust panel, company profile, related jobs, and apply actions are supporting blocks.
- Avoid turning the page into a marketing landing page.

### Profile
- Preserve the sectioned LinkedIn-style information architecture.
- Editing should stay accessible from each section without requiring a full page redesign.

### Applications
- Tabs for status views should remain simple and legible.
- The timeline/event cards are the core UI and should not be overdesigned.

### Settings
- Settings should remain a dense utility surface with grouped controls and clear save actions.
- Do not convert it into a marketing or wizard-style page.

### Recruiter dashboard
- Preserve the metrics-first composition.
- Keep candidate review cards and job lists compact, with clear review actions.

### Post job form
- The job post form should remain a structured editor with grouped sections, validation, and chips.
- Salary, location, experience, and skills are the main decision points and should remain visually obvious.

## 8. Things To Avoid

- Unrelated redesigns of already-stable surfaces.
- New color systems or theme directions.
- Heavy UI libraries that replace the current minimal component set.
- Fake/demo data on authenticated pages where real data is available.
- Inconsistent spacing between cards, section headers, and controls.
- Duplicate components that reimplement existing button/input/badge/modal patterns.
- Overly decorative shadows, gradients, or glass effects.

## 9. Visual Regression Risks

Areas that should not be casually redesigned:
- Header and profile dropdown
- Candidate dashboard card grid
- Discover jobs search + filter rail
- Job card and job detail hero
- Candidate profile header and section editor modal
- Settings tab rail and save sections
- Recruiter dashboard metrics and applicant cards
- Toast positioning and styling
- Skeleton loaders and empty states
- Auth modal shell and recruiter guard fallback screen

## 10. Practical UI Rules

- Keep borders soft and spacing consistent.
- Prefer small, readable labels over giant control surfaces.
- Use subtle emphasis rather than saturated UI color.
- Make actions obvious, but do not crowd every card with buttons.
- Preserve the app’s professional, understated look.

