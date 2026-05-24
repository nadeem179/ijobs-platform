# Supabase Storage

The current storage setup is only partially implemented.

- Avatars have a real Supabase bucket and row-level storage policies.
- Resume and portfolio uploads have client-side validation and mock/future upload paths, but no bucket/policy implementation in this repo.
- Company logos now upload to Supabase Storage and persist as URL text fields.

## 1. Storage Buckets

### Buckets expected or referenced by the app

- `avatars`
  - Real bucket used by avatar uploads.
  - Configured in `supabase/migrations/018_avatar_storage_bucket.sql`.
- `resumes`
  - Referenced by `src/lib/config/env.ts` as the default `NEXT_PUBLIC_STORAGE_BUCKET_RESUMES`.
  - Not implemented in storage migrations yet.
- `portfolio`
  - Referenced by `src/lib/config/env.ts` as the default `NEXT_PUBLIC_STORAGE_BUCKET_PORTFOLIO`.
  - Not implemented in storage migrations yet.
- `company-logos`
  - Referenced by the runtime config and recruiter logo upload flow.
  - Company logos are stored as public storage objects and saved as URLs in the database.

### Portfolio / project files

- The app has portfolio/project data models and portfolio UI.
- There is no live storage bucket flow for project files yet.
- `portfolio_projects` exists as a database table for project metadata, not as a storage bucket.

## 2. File Types

### Profile images

- Allowed in UI and service code:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- Max size:
  - `500KB` in `ProfileImageUploader`
  - `512000` bytes in the avatars bucket migration

### Resumes

- Supported by the upload service and resume parsing flow:
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- The resume parser also accepts plain text internally for analysis, but the upload UI is aimed at PDF/DOC/DOCX.
- Max size:
  - `5MB` in upload helpers and parsing validation

### Company logos

- Recruiter onboarding and recruiter profile editing upload to the `company-logos` bucket.
- The database keeps the public URL in `recruiter_profiles.company_logo_url`.
- The upload flow uses a fixed per-user path so replace/remove stays simple:
  - `user-id/company-logo`
- Allowed file types:
  - JPG
  - PNG
  - WebP

## 3. Upload Flows

### Candidate profile image upload

- UI entry points:
  - `src/components/profile/onboarding-controls.tsx`
  - `src/components/profile/candidate-section-editor.tsx`
  - `src/app/onboarding/candidate/page.tsx`
  - `src/app/profile/edit/page.tsx`
- Flow:
  1. User selects an image.
  2. Client validates file type and size.
  3. The UI shows a local preview.
  4. On save, `uploadService.uploadAvatar()` uploads to Supabase when storage is enabled.
  5. The returned public URL is persisted to profile tables.

### Candidate resume upload

- UI entry points:
  - `src/components/resume/upload-zone.tsx`
  - `src/components/upload/file-uploader.tsx`
  - onboarding/profile edit screens that use resume URL fields
- Current behavior:
  1. User selects a resume file.
  2. Client validates type and size.
  3. Resume parsing can read the file locally for onboarding review.
  4. `uploadService.uploadResume()` currently returns a mock result unless a future storage implementation is added.
- Important:
  - The resume parser is real.
  - The storage persistence path for resumes is not real yet.

### Recruiter company logo upload

- There is no dedicated company-logo upload helper yet.
- Recruiter profile and post-job screens use:
  - `company_logo_url` in recruiter profile persistence
  - `company_logo` / `company_logo_url` in job records
- Current behavior:
  - recruiter logos are uploaded to storage
  - job logos still use text/derived values

### Project / portfolio uploads

- `src/components/upload/file-uploader.tsx` supports a `portfolio` mode.
- `uploadService.uploadPortfolioImage()` currently returns a mock upload result unless future storage support is added.
- Portfolio UI also supports external project URLs, which are persisted as text.

## 4. Persistence

### Where uploaded URLs are saved

- Candidate profile image:
  - `profiles.avatar_url`
  - `candidate_profiles.avatar_url`
  - `candidate_profiles.profile_image_url`
- Candidate resume:
  - `profiles.resume_url`
  - `candidate_profiles.resume_url`
- Recruiter company logo:
  - `recruiter_profiles.company_logo_url`
  - `jobs.company_logo`
- Project / portfolio:
  - `candidate_profiles.portfolio_url`
  - `portfolio_projects` metadata table for portfolio items

### Important nuance

- The app still accepts URL text fields for some of these values.
- A blob preview URL is never meant to be persisted.
- The final persisted URL should always be the Supabase public URL or a real external URL, not a `blob:` URL.

## 5. Security / Access

### Current strategy

- Avatars:
  - public bucket
  - public reads
  - authenticated user can upload/update/delete only their own folder
- Resumes:
  - not yet implemented in storage policy form
  - should ideally be private or signed-URL protected
- Portfolio / project files:
  - not yet implemented in storage policy form
  - can be public if that is the desired product decision

### Signed URL strategy

- No signed URL flow is implemented today.
- Avatar uploads use `getPublicUrl()`.
- Resume access should preferably use signed URLs if the bucket becomes private.

### Who can upload

- Avatar uploads:
  - signed-in users only
  - folder ownership is enforced by `auth.uid()`
- Resume uploads:
  - client-side flow expects a signed-in user, but storage persistence is not implemented yet
- Company logos:
  - currently no storage upload path

### Who can view/download resumes

- Not yet defined in storage policies.
- Recommended rule:
  - the candidate owns the file
  - the recruiter can view/download only through an authorized application flow

### Recruiter resume access rules

- Recruiter resume access is currently controlled by application data and UI flow, not by storage policies.
- If resumes move into Supabase Storage, recruiter access should be gated by:
  - application ownership
  - recruiter-owned job/application relationship
  - signed URL generation

## 6. Current Gaps

- Local preview only issues
  - avatar previews start as local blob URLs before upload
  - if upload fails, the preview can exist without persistence
- Missing persistence
  - resume storage is not wired to Supabase Storage yet
  - portfolio image storage is not wired to Supabase Storage yet
  - company logo uploads are not wired to Supabase Storage yet
- Missing bucket policies
  - no migrations for `resumes`
  - no migrations for `portfolio`
  - no migrations for `company-logos`
- Missing upload validation
  - upload helpers validate type and size, but the storage layer is incomplete for non-avatar uploads
- File size validation gaps
  - resume parsing and upload helpers both use 5MB, but only avatars are enforced at the storage bucket level

## 7. Setup Instructions

If you want storage to be production-ready, create the following in Supabase:

### Avatars

- Keep the existing `avatars` bucket.
- Keep it public if profile images should be directly viewable.
- Keep the ownership policies:
  - read public
  - insert/update/delete restricted to the user’s own `auth.uid()` folder

### Resumes

- Create a `resumes` bucket.
- Prefer `public = false`.
- Add policies so:
  - candidates can upload their own resume file
  - recruiters can only access a resume through application-linked authorization
- Use signed URLs if the file should not be public.

### Portfolio

- Create a `portfolio` bucket if portfolio images/files should be stored in Supabase.
- Decide whether objects should be public or private.
- If public, allow authenticated uploads and public reads.
- If private, gate reads through signed URLs.

### Company logos

- If company logos move into storage, create a `company-logos` bucket.
- Public read access is acceptable for logos.
- Writes should be restricted to authenticated recruiter accounts.

### Minimal policy model

1. Public avatars bucket with folder ownership policies.
2. Private resumes bucket with signed URL access.
3. Public or private portfolio bucket depending on product decision.
4. Optional company-logos bucket, usually public-read.

## 8. Future Rules

- Never persist `blob:` preview URLs.
- Always validate file size and type before upload.
- Protect resumes if possible.
- Profile images and company logos can be public if that matches product intent.
- Keep bucket names and env vars in sync.
- If storage is enabled, make sure upload code fails closed rather than silently returning mock data for authenticated users.
