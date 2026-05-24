# ENGINEERING PHILOSOPHY — iJobs

This document defines how iJobs should evolve technically and product-wise.

---

# CORE PRODUCT PHILOSOPHY

iJobs is NOT:
- a generic job board
- a clone marketplace
- a feature-heavy enterprise ATS

iJobs IS:
- an active hiring marketplace
- recruiter-accountability focused
- conversion-focused
- trust-focused
- candidate-first
- clean and fast

Every feature should improve:
- trust
- matching
- recruiter responsiveness
- candidate clarity
- hiring speed

If a feature does not improve those areas, avoid building it now.

---

# PRODUCT DIFFERENTIATION

LinkedIn:
- strong profiles
- weak active hiring intent

Naukri:
- strong hiring utility
- weak UX consistency

Upwork:
- strong search/filter UX
- strong marketplace flow

iJobs should combine:
- LinkedIn profile quality
- Naukri hiring practicality
- Upwork marketplace UX

while remaining:
- simpler
- cleaner
- more trustworthy

---

# UX PHILOSOPHY

The product should feel:
- lightweight
- responsive
- professional
- high-trust
- focused

Avoid:
- clutter
- excessive dashboards
- too many cards
- noisy metrics
- enterprise complexity
- unnecessary animations

Prefer:
- hierarchy clarity
- actionable information
- fewer better components
- compact professional layouts

---

# ENGINEERING PHILOSOPHY

Always prefer:
- stability over complexity
- consistency over novelty
- reusable systems over duplicate implementations
- additive migrations over destructive migrations
- real data over placeholders
- simple logic over premature AI

Avoid:
- overengineering
- giant refactors
- unnecessary abstractions
- introducing new libraries casually
- schema-breaking changes
- duplicate state systems

---

# AUTH PHILOSOPHY

Auth and onboarding continuity are the most sensitive systems.

Never break:
- login persistence
- onboarding resume
- role routing
- dashboard redirects
- apply/save flows

Blank screens are unacceptable.

Users should always:
- understand where they are
- understand what happened
- recover safely from errors

---

# DATABASE PHILOSOPHY

Supabase is the source of truth.

Rules:
- always use IF NOT EXISTS
- additive migrations preferred
- preserve compatibility
- avoid destructive changes
- do not assume schema parity
- protect RLS correctness

Schema drift must be minimized.

---

# SEARCH + MATCHING PHILOSOPHY

Search is central to iJobs.

The platform should feel:
- relevant
- fast
- personalized
- explainable

Avoid:
- black-box AI ranking
- irrelevant jobs
- noisy recommendations

Prefer:
- explainable match signals
- skill overlap
- designation fit
- recruiter activity
- active hiring relevance

---

# CANDIDATE EXPERIENCE PHILOSOPHY

Candidates should feel:
- guided
- valued
- discoverable
- in control

Important principles:
- easy apply
- modular profile editing
- transparent profile completion
- clear application tracking
- recruiter activity visibility

Candidates should never feel:
- lost
- spammed
- ignored
- forced into unnecessary forms repeatedly

---

# RECRUITER EXPERIENCE PHILOSOPHY

Recruiters should feel:
- efficient
- organized
- trusted

Recruiters should:
- post jobs quickly
- review candidates quickly
- understand candidate fit quickly
- take actions quickly

Avoid:
- ATS-level complexity
- unnecessary admin systems
- bloated workflows

---

# PROFILE PHILOSOPHY

Profiles should behave like:
- professional identity systems
- living resumes
- matching engines

Profiles should:
- improve discoverability
- improve trust
- improve recommendations

Profile completion should:
- guide users
- never feel gamified/noisy
- stay accurate and explainable

---

# DESIGN PHILOSOPHY

Visual direction:
- black/white minimal
- subtle gray hierarchy
- restrained accent usage
- modern SaaS feel

Avoid:
- random gradients
- excessive color usage
- oversized cards
- inconsistent spacing
- flashy interactions

---

# PERFORMANCE PHILOSOPHY

The app should feel:
- instant
- responsive
- lightweight

Prefer:
- smaller components
- efficient queries
- progressive enhancement
- minimal rerenders

Avoid:
- loading huge datasets
- unnecessary client filtering
- heavy animations
- premature infrastructure scaling

---

# AI PHILOSOPHY

AI should:
- reduce friction
- improve matching
- assist onboarding
- improve recruiter efficiency

AI should NOT:
- replace clarity
- hide logic
- make decisions impossible to understand

Prefer:
- explainable AI
- parsing assistance
- recommendation assistance
- ranking assistance

Avoid:
- magical black-box behavior
- fake intelligence
- unnecessary AI everywhere

---

# CODING PHILOSOPHY

Every implementation should:
- preserve unrelated systems
- minimize regressions
- stay modular
- stay readable
- avoid duplication

Before implementing:
1. identify affected systems
2. identify regression risks
3. identify schema risks
4. identify auth risks
5. identify UX side effects

---

# FINAL RULE

iJobs should evolve like a focused, trustworthy hiring product.

Not a bloated platform.

Every feature should make hiring:
- faster
- clearer
- more trustworthy
- more human