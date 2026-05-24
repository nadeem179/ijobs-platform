# iJobs Project Status

## Stack
- Next.js
- Supabase
- Tailwind
- Candidate + Recruiter portals

---

# Completed Features

## Candidate
- onboarding
- profile completion
- discover jobs
- save jobs
- easy apply
- applications
- settings
- block companies
- dashboard redesign
- profile editing modular sections
- keyword highlighting
- etc

## Recruiter
- job posting
- dashboard
- applications
- etc

---

# Current Bugs
- blank screen after candidate login
- ...

---

# Pending Features
- resume parsing via OpenRouter
- recruiter analytics
- notifications
- etc

---

# Database Migrations Applied
- 010_remove_recruiters_dependency.sql
- ...
- 014_profiles_profile_fields_compat.sql

---

# Important Architecture Notes
- profiles = auth/identity
- candidate_profiles = candidate extended data
- recruiter_profiles = recruiter/company data

---

# Current Working Routes
- /dashboard
- /discover-jobs
- /profile
- /settings
- etc

---

# UX Rules
- Upwork inspired discover jobs
- LinkedIn style profile editing
- Naukri style settings
- etc