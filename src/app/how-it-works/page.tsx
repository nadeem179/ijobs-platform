import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCTAButton } from "@/components/marketing/auth-cta-button";

const postJobHref = "/recruiter/post-job";

const problemCards = [
  ["Fake or inactive jobs", "Roles that look real but go nowhere create wasted time and distrust."],
  ["Hidden salary ranges", "Candidates should not have to guess compensation before applying."],
  ["Mass spam applications", "Recruiters need cleaner applicant queues, not more noise."],
  ["Low recruiter response rates", "Visibility into response behavior helps everyone act faster."],
] as const;

const candidateSteps = [
  {
    title: "Build Your Profile",
    bullets: ["experience", "skills", "resume", "salary expectations", "work preferences", "portfolio links"],
    note: "Higher-quality profiles unlock better visibility and stronger matches.",
  },
  {
    title: "Get AI-Matched Opportunities",
    bullets: ["skills", "experience", "work preferences", "salary expectations", "location preferences"],
    note: "AI Match %, Salary Match, Remote Match, Skill Match, and Recruiter Activity help you prioritize the right roles.",
  },
  {
    title: "Apply to Verified Jobs",
    bullets: ["verified recruiters", "salary transparency", "active hiring", "cleaner application quality"],
    note: "Easy apply, application tracking, response visibility, saved jobs, and smart recommendations keep the process focused.",
  },
  {
    title: "Track Your Applications",
    bullets: ["application status", "recruiter activity", "response updates", "interview progress"],
    note: "Applied, Reviewed, Shortlisted, Interviewing, and Offer give the workflow a clear shape.",
  },
] as const;

const recruiterSteps = [
  {
    title: "Create Your Company Profile",
    bullets: ["company information", "hiring categories", "work policies", "recruiting preferences"],
    note: "Verified employer badge, active recruiter status, and response tracking build trust from the start.",
  },
  {
    title: "Post Transparent Roles",
    bullets: ["salary ranges", "work mode", "required skills", "hiring expectations", "screening preferences"],
    note: "Transparent roles attract stronger and more relevant candidates.",
  },
  {
    title: "Review AI-Ranked Candidates",
    bullets: ["profile quality", "skill relevance", "experience alignment", "salary compatibility", "work preference matching"],
    note: "Verified skills, completed profiles, resume uploads, active availability, and response history surface the best-fit people first.",
  },
  {
    title: "Manage Hiring Pipeline",
    bullets: ["new applicants", "shortlisted candidates", "interviews", "recruiter response rates", "hiring analytics"],
    note: "New, Reviewed, Shortlisted, Interviewing, and Hired keep the pipeline organized.",
  },
] as const;

const qualityCards = [
  ["Verified Recruiters", "Employer trust signals visible before applicants invest time."],
  ["Profile Completion Scoring", "Stronger profiles rise to the top of the marketplace."],
  ["AI-Assisted Matching", "Role and candidate relevance are evaluated automatically."],
  ["Spam Detection", "Low-quality and suspicious applications are filtered."],
  ["Salary Transparency", "Compensation clarity improves trust and fit."],
] as const;

const trustCards = [
  ["Recruiter verification", "Hiring teams are reviewed before they engage candidates."],
  ["Salary transparency", "Clear pay ranges help candidates make better decisions."],
  ["Fake-job prevention", "Marketplace quality is designed around authenticity."],
  ["AI spam detection", "Signals help reduce low-quality or abusive behavior."],
  ["Application quality systems", "Profiles and application flows emphasize useful signal."],
  ["Recruiter response tracking", "Response behavior is visible, not hidden."],
] as const;

const candidateBenefits = [
  "verified opportunities",
  "clearer salary expectations",
  "reduced recruiter ghosting",
  "better role relevance",
  "cleaner application experience",
] as const;

const recruiterBenefits = [
  "stronger candidate quality",
  "fewer spam applications",
  "AI-ranked applicants",
  "faster filtering",
  "improved hiring efficiency",
] as const;

const testimonials = [
  {
    quote:
      "Diplotix felt significantly cleaner than traditional job boards. The salary transparency and recruiter activity indicators helped me focus on real opportunities.",
    person: "Product Designer",
  },
  {
    quote:
      "We received fewer applications overall, but the candidate quality was dramatically higher.",
    person: "Hiring Manager, SaaS Company",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/40 bg-[linear-gradient(to_right,hsl(var(--border)/.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.18)_1px,transparent_1px)] bg-[size:36px_36px]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="animate-marketing-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              How Diplotix works
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Built for better hiring outcomes.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Diplotix helps candidates discover verified opportunities and helps recruiters hire through cleaner, higher-quality pipelines powered by trust, transparency, and AI-assisted matching.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-full px-6 text-sm" asChild>
                <Link href="/discover-jobs">
                  Explore Jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <AuthCTAButton
                mode="signup"
                roleIntent="recruiter"
                continueTo={postJobHref}
                authenticatedHref={postJobHref}
                variant="outline"
                className="h-12 rounded-full px-6 text-sm"
              >
                Post a Job
              </AuthCTAButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-7 text-sm text-muted-foreground">
              {["Verified recruiters", "AI-assisted matching", "Salary transparency", "Reduced spam applications"].map((item, index) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  {index === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : index === 1 ? <Sparkles className="h-4 w-4" /> : index === 2 ? <BarChart3 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {item}
                </span>
              ))}
            </div>
          </div>

          <WorkflowPreviewCard />
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Hiring became noisy. We built Diplotix to reduce the noise.
          </h2>
          <p className="mt-4 max-w-4xl text-sm leading-6 text-muted-foreground">
            Traditional hiring platforms often optimize for volume instead of quality. Candidates waste time on fake jobs, hidden salaries, and recruiter ghosting. Recruiters waste time filtering low-quality applications. Diplotix was built around a different idea: better profiles, better matches, better hiring outcomes.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {problemCards.map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:px-8 lg:py-24">
        <div>
          <SectionHeader eyebrow="For candidates" title="Apply smarter, not harder." text="Diplotix helps job seekers discover verified opportunities with transparent salaries, active recruiters, and AI-powered relevance matching." />
          <div className="mt-8 rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
            <p className="text-sm font-semibold">Profile quality</p>
            <div className="mt-5 space-y-3">
              {["experience", "skills", "resume", "salary expectations", "work preferences", "portfolio links"].map((item, index) => (
                <div key={item}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item}</span>
                    <span className="font-medium text-emerald-700">done</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${95 - index * 6}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              Higher-quality profiles unlock better visibility and stronger matches.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {candidateSteps.map((step, index) => (
            <StepCard key={step.title} stepNumber={`0${index + 1}`} title={step.title} bullets={step.bullets} note={step.note} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-8 lg:py-24">
          <div className="grid gap-4 sm:grid-cols-2">
            {recruiterSteps.map((step, index) => (
              <StepCard key={step.title} stepNumber={`0${index + 1}`} title={step.title} bullets={step.bullets} note={step.note} />
            ))}
          </div>
          <div>
            <SectionHeader eyebrow="For recruiters" title="Hire through cleaner pipelines." text="Diplotix helps recruiters discover better-matched candidates while reducing spam and improving hiring efficiency." />
            <div className="mt-8 rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
              <p className="text-sm font-semibold">Pipeline</p>
              <div className="mt-5 grid grid-cols-5 gap-2">
                {["New", "Reviewed", "Shortlisted", "Interviewing", "Hired"].map((stage) => (
                  <span key={stage} className="rounded-xl border border-border/50 bg-muted/20 px-2 py-3 text-center text-[11px] font-medium text-muted-foreground">
                    {stage}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-2 text-xs text-muted-foreground">
                {["new applicants", "shortlisted candidates", "interviews", "recruiter response rates", "hiring analytics"].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-foreground" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:px-8 lg:py-24">
        <div>
          <SectionHeader eyebrow="Quality system" title="Quality over quantity." text="Diplotix focuses on reducing noise and improving marketplace trust through profile quality systems, recruiter verification, AI-assisted matching, and anti-spam intelligence." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {qualityCards.map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="Trust & safety" title="Built for trusted hiring." />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {trustCards.map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <ShieldCheck className="h-4 w-4" />
                <h3 className="mt-4 text-sm font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Diplotix is designed to create a healthier hiring marketplace for both candidates and recruiters.
          </p>
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader eyebrow="Marketplace benefits" title="A better experience for both sides." />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <BenefitPanel title="Candidates" items={candidateBenefits} />
            <BenefitPanel title="Recruiters" items={recruiterBenefits} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <article key={item.person} className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
              <p className="text-sm leading-6 text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-muted/20 text-xs font-semibold">
                  {item.person[0]}
                </div>
                <p className="text-sm font-medium">{item.person}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-foreground px-6 py-12 text-background shadow-sm sm:px-10">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Ready to experience better hiring?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
            Whether you&apos;re searching for your next opportunity or hiring your next teammate, Diplotix is built to reduce noise and improve hiring quality.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="rounded-full" asChild>
              <Link href="/discover-jobs">Explore Jobs</Link>
            </Button>
            <AuthCTAButton
              mode="signup"
              roleIntent="recruiter"
              continueTo={postJobHref}
              authenticatedHref={postJobHref}
              variant="outline"
              className="rounded-full border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
            >
              Post a Job
            </AuthCTAButton>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{text}</p>}
    </div>
  );
}

function StepCard({
  stepNumber,
  title,
  bullets,
  note,
}: {
  stepNumber: string;
  title: string;
  bullets: readonly string[];
  note: string;
}) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{stepNumber}</p>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {bullets.map((bullet) => (
          <span key={bullet} className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground">
            {bullet}
          </span>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">{note}</p>
    </article>
  );
}

function BenefitPanel({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}

function WorkflowPreviewCard() {
  return (
    <div className="animate-marketing-in rounded-2xl border border-border/60 bg-background p-4 shadow-[0_22px_60px_rgba(0,0,0,0.10)] [animation-delay:120ms]">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Workflow preview
        </p>
        <span className="text-xs text-muted-foreground">Updated now</span>
      </div>
      <div className="mt-4 grid gap-3 rounded-2xl border border-border/50 bg-muted/10 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewStat label="Candidate profile quality" value="87%" />
          <PreviewStat label="Recruiter pipeline stages" value="5 stages" />
          <PreviewStat label="AI match scoring" value="Live" />
          <PreviewStat label="Response tracking" value="Visible" />
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
