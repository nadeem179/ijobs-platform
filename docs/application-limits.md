# Application Limits

Candidate application limits are enforced in `src/services/impl/profile.service.ts` inside `profileService.apply()`.

The reusable rule helpers live in `src/lib/application-limits.ts`:

- Free candidates can create 5 applications per local day.
- Duplicate applications for the same job are blocked before the daily limit is checked.
- Premium candidates currently have a placeholder path in `getDailyApplicationLimit()` for future limits.

When the app moves from mock data to a backend, keep the final enforcement server-side in the apply endpoint and reuse the same rule shape for client messaging.
