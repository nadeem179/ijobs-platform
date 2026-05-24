This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3003](http://localhost:3003) with your browser to see the result.

## Auth Environment

Authentication uses Supabase with Google OAuth and email magic links. This project is configured for local development auth only:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-or-publishable-key
NEXT_PUBLIC_APP_URL=http://localhost:3003
```

In Supabase, add only these local app redirect URLs:

```text
http://localhost:3003/auth/callback
http://127.0.0.1:3003/auth/callback
```

Run the migrations in `supabase/migrations` so the `profiles.role` field supports `candidate` and `recruiter`.

## Job Activity Status Cron

Job lifecycle statuses are `active`, `inactive`, `paused`, `closed`, and `filled`.
Run `supabase/migrations/003_job_activity_status.sql` to add the activity fields,
activity log, and status constraint.

The reusable manual function is `runJobActivityStatusSync` in
`src/lib/jobs/activity-status-runner.ts`. It marks active jobs inactive after 5
days without recruiter activity, requests recruiter confirmation after 30 days,
and closes jobs that were already awaiting confirmation but still have no newer
confirmation.

Configure these server-only variables in Netlify:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JOB_ACTIVITY_CRON_SECRET=strong-shared-secret
```

Then schedule a daily cron request to:

```bash
POST https://your-site.netlify.app/api/jobs/activity-status
Authorization: Bearer $JOB_ACTIVITY_CRON_SECRET
```

Use `?dryRun=true` to preview changes without writing them.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
