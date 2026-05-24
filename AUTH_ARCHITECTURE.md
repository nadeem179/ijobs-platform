# AUTH ARCHITECTURE

This document describes the current auth stack, session lifecycle, role resolution, onboarding routing, and route protection in iJobs.

## 1. Auth Provider

### Supabase auth setup
- Supabase client creation lives in [`src/lib/supabase/client.ts`](C:/Job%20Portal%20Codex/src/lib/supabase/client.ts).
- The client is browser-only and only initializes when:
  - `NEXT_PUBLIC_SUPABASE_URL` is set
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
  - the code is executing in the browser
- Client auth config:
  - `persistSession: true`
  - `autoRefreshToken: true`
  - `detectSessionInUrl: false`
  - `flowType: "pkce"`

### Google OAuth
- Google sign-in is started from the auth modal in [`src/components/auth/auth-modal.tsx`](C:/Job%20Portal%20Codex/src/components/auth/auth-modal.tsx).
- It uses `supabase.auth.signInWithOAuth({ provider: "google" })`.
- OAuth redirect URLs are built by [`getLocalAuthCallbackUrl`](C:/Job%20Portal%20Codex/src/lib/auth/redirect.ts), which points to `/auth/callback` and can append `next=...`.
- The modal normalizes `127.0.0.1:3003` to `localhost:3003` before starting OAuth to avoid origin mismatch issues.

### Email login / magic link
- Email sign-in is implemented as a magic-link flow with `supabase.auth.signInWithOtp`.
- The auth modal sends the user a link via email and then shows a "check your email" state.
- The service layer also exposes `signUp(...)`, but it uses the same OTP/magic-link style path instead of a password-based session.
- There is no separate password login flow in the current UI implementation.

### Required env variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` is used for metadata / origin-related app config but is not strictly required for auth client creation.

## 2. Session Flow

### Login start
- Login starts in the auth modal.
- Google sign-in:
  - validates Supabase client availability
  - normalizes the browser origin if needed
  - starts OAuth with a redirect back to `/auth/callback`
- Email sign-in:
  - sends a magic link to the entered email
  - redirects back to `/auth/callback` after the link is opened

### Callback
- The callback page is [`src/app/auth/callback/page.tsx`](C:/Job%20Portal%20Codex/src/app/auth/callback/page.tsx).
- It reads:
  - `code`
  - `next`
  - `error`
  - `error_description`
- If `code` is present, it exchanges the code for a Supabase session with `exchangeCodeForSession`.
- After exchange, it refreshes the user and routes them onward.
- If the user is missing after callback, it sends them to `/auth/home`.

### Session restore
- Auth restore happens in [`src/context/auth.tsx`](C:/Job%20Portal%20Codex/src/context/auth.tsx) as soon as the provider mounts.
- The restore path is:
  - try Supabase `auth.getSession()`
  - if no Supabase client is configured, fall back to the local auth service session
- The auth provider also listens to `supabase.auth.onAuthStateChange`.
- When a session arrives, the provider hydrates the profile from `profiles` and updates the in-memory auth user.

### Logout
- Logout clears local auth state, routes to `/`, then calls Supabase sign-out.
- This sequence is important because the UI transitions away before the sign-out request finishes.

### Refresh behavior
- `refreshUser()` is the main explicit refresh entry point.
- `restoreSession()` wraps `refreshUser()` and toggles the provider loading state.
- `onAuthStateChange` also rehydrates on sign-in events and clears the user on `SIGNED_OUT`.

## 3. Profile Creation

### When the profile row is created
- The first time a Supabase user is hydrated, `ensureProfile(user)` is called from the auth provider.
- If the profile row does not exist, the provider inserts one.
- A separate helper exists in [`src/lib/supabase/db.ts`](C:/Job%20Portal%20Codex/src/lib/supabase/db.ts) with the same idea, but the auth context is the primary path used by the app.

### Profiles table fields required
Visible fields used by the auth layer:
- `id`
- `email`
- `full_name`
- `avatar_url`
- `role`
- `onboarding_complete`
- `onboarding_step`

### Missing profile row handling
- If `profiles` is missing, the auth provider inserts a new row with:
  - `id`
  - `email`
  - `full_name`
  - `avatar_url`
  - `role: null`
  - `onboarding_complete: false`
  - `onboarding_step: "select_role"`
- If the database schema is missing `onboarding_step`, the code retries without that field.
- If the profile row is corrupt or has an invalid role, the provider attempts to reset route state back to a safe unassigned state.

## 4. Role Resolution

### Candidate
- `role`, `job_seeker` normalize to `candidate`.
- Candidate onboarding step defaults to `candidate_resume` until onboarding completes.
- A completed candidate routes to `/dashboard`.

### Recruiter
- `recruiter`, `employer` normalize to `recruiter`.
- Recruiter onboarding step defaults to `recruiter_profile` until onboarding completes.
- A completed recruiter routes to `/recruiter/dashboard`.

### Admin
- `admin` normalizes to `admin`.
- Admin bypasses the candidate/recruiter onboarding routes after completion and routes to `/admin`.

### Null role
- Any unknown or missing role normalizes to `null`.
- A null role routes to `/onboarding/select-role`.

## 5. Onboarding Routing

The route helper lives in [`src/lib/auth/onboarding-route.ts`](C:/Job%20Portal%20Codex/src/lib/auth/onboarding-route.ts).

### No role
- Route: `/onboarding/select-role`

### Candidate incomplete
- Route: `/onboarding/candidate`
- The helper uses candidate onboarding when the role is candidate and onboarding is incomplete.

### Recruiter incomplete
- Route: `/onboarding/recruiter`
- The helper uses recruiter onboarding when the role is recruiter or the step is recruiter-specific.

### Completed candidate
- Route: `/dashboard`

### Completed recruiter
- Route: `/recruiter/dashboard`

## 6. Protected Routes

Protection is handled by three route guards:
- [`src/components/navigation/protected-layout.tsx`](C:/Job%20Portal%20Codex/src/components/navigation/protected-layout.tsx)
- [`src/components/navigation/recruiter-guard.tsx`](C:/Job%20Portal%20Codex/src/components/navigation/recruiter-guard.tsx)
- [`src/components/auth/guards/protected-route.tsx`](C:/Job%20Portal%20Codex/src/components/auth/guards/protected-route.tsx)

### Candidate-only
- Typical allowed roles: `candidate`
- Logged-out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### Recruiter-only
- Typical allowed role: `recruiter`
- Logged-out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### Admin-only
- Allowed role: `admin`
- Logged-out redirect: `/auth/home`
- Incomplete onboarding redirect: onboarding route from auth state
- Wrong role redirect: post-auth destination for that user

### Logged-out behavior
- Protected pages render a loading spinner while auth state resolves.
- When the guard resolves to no authenticated user, the next route is `/auth/home`.

## 7. Known Auth Risks

### Blank screen after login
- Protected routes wait for session restoration and profile hydration before rendering the page content.
- If the profile query fails or never resolves, the UI can remain in a loading / redirect state instead of showing content.

### Redirect loops
- Redirect targets depend on `role`, `onboarding_complete`, and `onboarding_step`.
- If stale profile state is cached, the user can bounce between auth, onboarding, and dashboard routes until the session rehydrates.

### PKCE code verifier issues
- OAuth uses PKCE.
- The callback page logs PKCE-related errors and surfaces them as visible auth errors.
- A broken verifier or interrupted auth flow can cause callback failure before user hydration.

### Localhost vs 127.0.0.1 mismatch
- The auth modal explicitly normalizes `127.0.0.1:3003` to `localhost:3003`.
- This is a known compatibility guard for local OAuth redirects.

### Profile fetch failures
- If the profile row cannot be loaded or created, auth hydration fails and the user may be treated as signed out until the issue is resolved.
- Some routes also fall back to local/mock data, which can hide backend auth issues until a protected action is attempted.

### Schema cache issues
- The auth provider explicitly handles missing `onboarding_step`.
- If the backend schema is stale or incomplete, profile creation/upserts retry with a reduced payload.

## 8. Debugging Checklist

When auth breaks, check these in order:

1. Confirm `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are present.
2. Confirm the browser origin matches the OAuth redirect origin, especially on local dev.
3. Open `/auth/callback` and inspect the callback query params:
   - `code`
   - `next`
   - `error`
   - `error_description`
4. Check the browser console for:
   - `[AUTH] Profile ... failed`
   - `[AUTH_CALLBACK]`
   - `[SESSION_EXCHANGE_SUCCESS]`
   - `[PKCE_ERROR]`
   - `[OAUTH_START]`
5. Verify `profiles` contains a row for the current Supabase user id.
6. Verify the profile row has a valid `role`, `onboarding_complete`, and `onboarding_step`.
7. Check the route helper in [`src/lib/auth/onboarding-route.ts`](C:/Job%20Portal%20Codex/src/lib/auth/onboarding-route.ts).
8. Check the route guards:
   - [`src/components/navigation/protected-layout.tsx`](C:/Job%20Portal%20Codex/src/components/navigation/protected-layout.tsx)
   - [`src/components/navigation/recruiter-guard.tsx`](C:/Job%20Portal%20Codex/src/components/navigation/recruiter-guard.tsx)
   - [`src/components/auth/guards/protected-route.tsx`](C:/Job%20Portal%20Codex/src/components/auth/guards/protected-route.tsx)
9. If login succeeds but the UI is wrong, inspect the auth provider in [`src/context/auth.tsx`](C:/Job%20Portal%20Codex/src/context/auth.tsx) and the callback route in [`src/app/auth/callback/page.tsx`](C:/Job%20Portal%20Codex/src/app/auth/callback/page.tsx).
10. If the issue only happens locally, compare `localhost` and `127.0.0.1` usage.

## 9. Middleware / Proxy

- [`src/proxy.ts`](C:/Job%20Portal%20Codex/src/proxy.ts) currently returns `NextResponse.next()` for every request.
- Its matcher array is empty.
- In practice, there is no active edge middleware redirect layer enforcing auth in this repo.

