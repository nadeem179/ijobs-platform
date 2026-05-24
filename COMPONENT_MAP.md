# Component Map

This app’s component architecture is split between a small shared UI layer, a larger set of feature components, and several page-level compositions that are not yet abstracted into reusable “screen” components.

## 1. Global Component Structure

### Top-level folders

- `src/components/ui`
  - Core primitives: button, badge, input, checkbox, toast, empty state, error state, loading state.
- `src/components/auth`
  - Auth modal, modal shell, role selector, protected route guard.
- `src/components/navigation`
  - Global profile dropdown and route guards.
- `src/components/filters`
  - Job search bar and filter sidebar.
- `src/components/jobs`
  - Job card/detail/feed, company cards, trust panel, highlight utility, skeletons, empty states, skill badge.
- `src/components/profile`
  - Profile header, skills, links, portfolio, experience, profile strength, onboarding/profile editor shell.
- `src/components/onboarding`
  - Role selector, skill selector, experience selector, progress stepper, upload card, success state.
- `src/components/recruiter`
  - Recruiter header and upgrade modal.
- `src/components/applications`
  - Application status pill.
- `src/components/apply`
  - Apply modal wrapper.
- `src/components/resume`
  - Resume upload zone, parsed resume review, parsing progress.
- `src/components/upload`
  - Generic file uploader.
- Root-level layout pieces
  - `src/components/header.tsx`
  - `src/components/footer.tsx`

### Organization pattern

- Shared primitives are intentionally simple and Tailwind-driven.
- Feature components mostly compose those primitives rather than introducing a second design system.
- Several “shared” behaviors still live inside page components under `src/app`, especially in onboarding, settings, profile edit, recruiter candidates, and recruiter jobs.

## 2. Shared UI Components

### Primitives

- `Button` in `src/components/ui/button.tsx`
  - Variant-based, supports `asChild`.
- `Badge` in `src/components/ui/badge.tsx`
  - Used for pills, statuses, tags, and chips.
- `Input` in `src/components/ui/input.tsx`
  - The main text input primitive.
- `Checkbox` in `src/components/ui/checkbox.tsx`
  - Custom checkbox primitive used in filters and preference forms.
- `ToastProvider` / `useToast` in `src/components/ui/toast.tsx`
  - Global success/error/info toast system.
- `EmptyState` in `src/components/ui/empty-state.tsx`
  - Generic empty-state component.
- `ErrorState` in `src/components/ui/error-state.tsx`
  - Generic error renderer with retry.
- `LoadingState` in `src/components/ui/loading-state.tsx`
  - Spinner and skeleton loading renderer.

### What is missing as a dedicated primitive

- No dedicated `Tabs` component.
- No dedicated `Accordion` component.
- No dedicated `Drawer` primitive.
- No dedicated `Modal` primitive beyond composition with overlay shells.
- No dedicated `Select` primitive; most selects are native `<select>` elements or combobox-like custom components.

### Note

- `src/components/jobs/skill-badge.tsx` acts like a shared chip primitive for the product, even though it lives in the jobs folder.

## 3. Candidate Components

### Dashboard and jobs

- `src/components/jobs/job-feed.tsx`
  - Candidate discover jobs experience: search, filters, sort, saved-job toggle, empty states, recommendation fallback.
- `src/components/jobs/job-card.tsx`
  - Core job card used in discovery, recommendations, and related jobs.
- `src/components/jobs/job-detail.tsx`
  - Full job detail page composition.
- `src/components/jobs/company-card.tsx`
  - Company summary block in the job detail page.
- `src/components/jobs/trust-panel.tsx`
  - Trust and safety block in the job detail page.
- `src/components/jobs/highlighted-text.tsx`
  - Keyword highlighting for search results and job cards.
- `src/components/jobs/empty-states.tsx`
  - No-results and no-saved-jobs candidate empty states.
- `src/components/jobs/skeleton-card.tsx`
  - Job list loading skeleton.
- `src/components/jobs/skeleton-detail.tsx`
  - Job detail loading skeleton.

### Applications

- `src/components/applications/application-status.tsx`
  - Shared status pill for applied / shortlisted / rejected / hired.
- `src/components/apply/apply-modal.tsx`
  - Apply flow shell around auth and progress UI.

### Profile

- `src/components/profile/profile-header.tsx`
  - Candidate profile header block.
- `src/components/profile/profile-skills.tsx`
  - Skills section.
- `src/components/profile/profile-experience.tsx`
  - Experience section.
- `src/components/profile/profile-portfolio.tsx`
  - Portfolio section.
- `src/components/profile/profile-links.tsx`
  - Social links editor modal and link chips.
- `src/components/profile/profile-strength.tsx`
  - Profile completion summary widget.
- `src/components/profile/candidate-section-editor.tsx`
  - Large section editor modal for profile editing.
- `src/components/profile/onboarding-controls.tsx`
  - Shared profile editing controls used by onboarding, profile edit, and settings.

### Onboarding

- `src/components/onboarding/role-selector.tsx`
  - Candidate vs recruiter selection screen.
- `src/components/onboarding/skill-selector.tsx`
  - Standalone skill picker used in onboarding.
- `src/components/onboarding/experience-selector.tsx`
  - Experience level selector.
- `src/components/onboarding/progress-stepper.tsx`
  - Step progress indicator for onboarding and apply/auth shells.
- `src/components/onboarding/upload-card.tsx`
  - Generic upload/link card for onboarding assets.
- `src/components/onboarding/success-state.tsx`
  - Successful application/onboarding-style success panel.

### Settings

- There is no dedicated `src/components/settings` folder.
- Settings UI is assembled mostly in `src/app/settings/page.tsx` using shared profile onboarding controls and core primitives.

## 4. Recruiter Components

### Recruiter UI

- `src/components/recruiter/recruiter-header.tsx`
  - Recruiter dashboard hero/header.
- `src/components/recruiter/upgrade-modal.tsx`
  - Recruiter paywall / quota modal.
- `src/components/navigation/recruiter-guard.tsx`
  - Recruiter-only access gate.

### Recruiter-related reusable pieces elsewhere

- `src/components/jobs/job-card.tsx`
  - Also reused on recruiter-related pages when the app displays job summaries.
- `src/components/applications/application-status.tsx`
  - Used on recruiter candidate management pages and candidate views.
- `src/components/jobs/skill-badge.tsx`
  - Used for recruiter candidate skill display.

## 5. Search Components

### Navigation search

- `src/components/header.tsx`
  - Global search bar in the top nav.
  - Uses candidate search suggestions and recent searches.

### Discover jobs search/filter

- `src/components/filters/job-filters.tsx`
  - `JobSearchBar`
  - `JobFilters`
  - mobile overlay filters panel

### Highlighting and chips

- `src/components/jobs/highlighted-text.tsx`
  - Keyword highlighting in job cards and detail text.
- `src/components/jobs/skill-badge.tsx`
  - Chip-style badge used throughout jobs and profile views.
- `src/components/profile/onboarding-controls.tsx`
  - `Chip` and `SuggestionChip` helpers.

### Searchable dropdowns

- `src/components/profile/onboarding-controls.tsx`
  - `MultiSelectCombobox`
  - `SingleSelectCombobox`
- `src/components/filters/job-filters.tsx`
  - Native datalist-backed text inputs and skill entry chips.

## 6. Form Component Reuse

### Shared form building blocks

- `MultiSelectCombobox`
  - Used for skills, tools, preferred locations, industries, job type, and work mode.
- `SingleSelectCombobox`
  - Used for single-choice selection such as designation in onboarding/profile flows.
- `CurrencySelect`
  - Used in salary inputs for profile and onboarding editing.
- `LanguageSelector`
  - Used in profile and onboarding flows.
- `ProfileImageUploader`
  - Used in profile edit and onboarding flows.
- `UploadCard`
  - Used for general asset upload/link patterns.

### Where reuse currently exists

- Candidate onboarding page
- Profile edit page
- Settings page
- Candidate section editor modal

### Important duplication

- `SkillSelector` in onboarding duplicates some of the functionality already handled by `MultiSelectCombobox`.
- The candidate section editor and onboarding page each reimplement small versions of list-editing, tag entry, and asset upload UI.
- Salary, location, industry, designation, skills, and tools selectors are shared conceptually but not yet unified into one canonical “field” library.

## 7. Modal / Drawer System

### Modal shells

- `src/components/auth/auth-modal-shell.tsx`
  - Generic auth modal shell.
- `src/components/apply/apply-modal.tsx`
  - Apply flow modal wrapper.
- `src/components/jobs/company-profile-modal.tsx`
  - Company profile modal is a job-detail surface.
- `src/components/profile/candidate-section-editor.tsx`
  - Full-screen mobile / centered desktop modal editor.
- `src/components/profile/profile-links.tsx`
  - Link editor modal.
- `src/components/recruiter/upgrade-modal.tsx`
  - Recruiter upgrade/paywall modal.

### Drawer-like overlays

- `src/components/filters/job-filters.tsx`
  - Mobile filter drawer overlay.
- `src/components/header.tsx`
  - Mobile nav/search panel.

### Auth-related modal system

- `AuthModalShell` is the shared overlay shell.
- `AuthModal` is the reusable sign-in / sign-up content.
- `ApplyModal` and `UpgradeModal` both reuse `AuthModalShell`.

## 8. Component Risks

### Duplicated components

- Search dropdown behavior exists in more than one place:
  - header search suggestions
  - profile/onboarding comboboxes
  - job filter skill input
- Tag/chip behavior is duplicated:
  - `Badge`
  - `SkillBadge`
  - `Chip`
  - `SuggestionChip`
- Empty states are duplicated between generic UI and jobs-specific variants.
- Loading states are duplicated between generic loading state and jobs-specific skeletons.

### Inconsistent variants

- Buttons and badges are used consistently, but some feature components still hand-roll custom chip styles.
- `SkillSelector` uses its own card-grid style rather than the shared combobox style.
- Some modals use `AuthModalShell`, while others use custom overlay markup.

### Legacy components

- `SkillSelector` is a legacy-style onboarding component that overlaps with the newer combobox-based selectors.
- `UploadZone` and `FileUploader` overlap in the resume/upload space.
- `EmptyState` exists both generically and in the jobs folder with slightly different styling and action patterns.

### Tightly coupled components

- `JobCard` is tightly coupled to saved-job and application-status state.
- `CandidateSectionEditor` is a large monolith that knows about most candidate profile sections.
- `Header` owns navigation, search, auth entry, and suggestion state in one place.

## 9. Components That Should Never Be Duplicated

- Search dropdowns and candidate search suggestions.
- Profile completion logic and profile strength presentation.
- `JobCard`.
- `ApplicationStatus`.
- Skills selectors and tag-entry behavior.
- `MultiSelectCombobox`.
- `CurrencySelect`.
- `ProfileImageUploader`.
- `HighlightedText`.
- `AuthModalShell`.
- `LoadingState` and job skeleton patterns.

## 10. Components Needing Future Consolidation

1. Fold `SkillSelector` into the shared combobox/tag system.
2. Extract a canonical filter-chip component instead of mixing `Badge`, custom buttons, and ad hoc pills.
3. Consolidate `UploadZone`, `FileUploader`, and `ProfileImageUploader` into a single upload family with consistent validation and preview behavior.
4. Split `CandidateSectionEditor` into smaller section-specific editors or field groups.
5. Move job detail sub-panels like `CompanyCard` and `TrustPanel` into a more explicit reusable “job sidebar” module.
6. Consolidate empty-state and skeleton patterns across generic UI and jobs-specific views.
7. Extract a shared searchable combobox primitive for header suggestions, profile selectors, and filter inputs.
8. Break `Header` into smaller navigation, search, and auth subcomponents.
