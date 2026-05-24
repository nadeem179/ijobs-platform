import type { ElementType } from "react";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { AuthCTAButton } from "@/components/marketing/auth-cta-button";

const postJobHref = "/recruiter/post-job";

const metrics = [
  ["82%", "recruiter response rate"],
  ["5,000+", "verified candidates"],
  ["70%", "fewer spam applications"],
  ["2.4x", "higher profile quality"],
] as const;

const features = [
  ["Verified Candidate Profiles", "See profiles built with completion, resume verification, and clearer hiring signals."],
  ["AI-Assisted Matching", "Surface better-fit candidates using role fit, skills, and preference alignment."],
  ["Reduced Spam Applications", "Spend less time sorting through low-intent or irrelevant inbound."],
  ["Response Tracking", "Understand how quickly candidates and recruiters move through the process."],
  ["Salary Transparency", "Work with clearer compensation ranges before the first screen."],
  ["Faster Hiring Pipeline", "Keep the process organized from review to interview to hire."],
] as const;

const steps = [
  "Create Your Company Profile",
  "Post Transparent Roles",
  "Review AI-Ranked Candidates",
  "Track Responses & Pipeline",
] as const;

const qualitySignals = [
  "Resume uploaded",
  "Skills verified",
  "Experience completed",
  "Work preferences set",
  "Portfolio links attached",
  "AI profile score",
  "Response history",
  "Availability signals",
] as const;

const dashboardFeatures = [
  "Applicant pipeline",
  "Shortlisted candidates",
  "AI match scoring",
  "Application review tracking",
  "Recruiter response analytics",
  "Saved candidate lists",
  "Hiring activity overview",
] as const;

const pipelineStages = ["New Applicants", "Reviewed", "Shortlisted", "Interviewing", "Hired"] as const;

const trustCards = [
  ["Recruiter verification", "Hiring teams are verified before they start reviewing candidate profiles."],
  ["Spam application filtering", "Reduce irrelevant inbound and keep the review queue cleaner."],
  ["Transparent salary ranges", "Clear compensation signals improve trust before the first conversation."],
  ["Candidate quality systems", "Profiles are scored for stronger hiring signal and better-fit applicants."],
  ["AI fraud/spam detection", "Marketplace safeguards help identify suspicious activity early."],
  ["Real hiring activity tracking", "See active role and response signals instead of static company pages."],
] as const;

const comparison = [
  {
    title: "Traditional Job Boards",
    items: ["Mass applications", "Incomplete profiles", "Low recruiter response", "Hidden salaries", "High spam volume"],
  },
  {
    title: "Diplotix",
    items: ["Verified profiles", "AI-ranked relevance", "Salary transparency", "Reduced spam applies", "Faster hiring decisions"],
  },
] as const;

const testimonials = [
  {
    quote: "We started receiving significantly more relevant applicants within the first week.",
    person: "Head of Talent, SaaS Startup",
  },
  {
    quote: "The profile quality and recruiter response tracking helped reduce wasted screening time.",
    person: "Senior Recruiter, Product Company",
  },
];

export default function ForRecruitersPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/40 bg-[linear-gradient(to_right,hsl(var(--border)/.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.18)_1px,transparent_1px)] bg-[size:36px_36px]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div className="animate-marketing-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              For recruiters
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Hire better candidates faster.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Reach verified, high-intent candidates through AI-assisted matching, profile quality systems, and spam-filtered applications.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AuthCTAButton
                mode="signup"
                roleIntent="recruiter"
                continueTo={postJobHref}
                authenticatedHref={postJobHref}
                className="h-12 rounded-full px-6 text-sm"
              >
                Post a Job
                <ArrowRight className="ml-2 h-4 w-4" />
              </AuthCTAButton>
              <AuthCTAButton
                mode="signin"
                roleIntent="recruiter"
                continueTo="/recruiter/dashboard"
                authenticatedHref="/recruiter/dashboard"
                variant="outline"
                className="h-12 rounded-full px-6 text-sm"
              >
                View Recruiter Dashboard
              </AuthCTAButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-7 text-sm text-muted-foreground">
              {["Verified candidate profiles", "AI-ranked applicants", "Reduced spam applications", "Faster response tracking"].map((item, index) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  {index === 0 ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : index === 1 ? <Sparkles className="h-4 w-4" /> : index === 2 ? <ShieldCheck className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  {item}
                </span>
              ))}
            </div>
          </div>

          <RecruiterDashboardPreview />
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {metrics.map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Why recruiters choose Diplotix"
          title="Built for quality hiring."
          text="Traditional job boards optimize for volume. Diplotix is designed for hiring quality, helping recruiters discover better-matched candidates with less noise and more signal."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([title, text], index) => (
            <FeatureCard key={title} title={title} text={text} icon={featureIcons[index]} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader eyebrow="How it works" title="A smarter recruiting workflow." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <article
                key={step}
                className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step {index + 1}</p>
                <h3 className="mt-4 text-sm font-semibold">{step}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Move from company profile setup to cleaner hiring decisions with less manual noise.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:px-8 lg:py-24">
        <CandidateQualityPanel />
        <div>
          <SectionHeader
            eyebrow="Verified candidate quality"
            title="Profiles designed for real hiring decisions."
            text="Diplotix encourages high-quality candidate profiles through profile completion systems, resume verification, and AI-powered skill extraction."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
            {qualitySignals.map((signal) => (
              <QualitySignalCard key={signal} label={signal} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader eyebrow="Recruiter dashboard preview" title="Manage hiring with less noise." />
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
            <RecruiterPipelineCard />
            <div className="grid gap-3 sm:grid-cols-2">
              {dashboardFeatures.map((item) => (
                <DashboardFeatureCard key={item} label={item} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader eyebrow="Compare" title="Better applications. Better outcomes." />
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {comparison.map((group) => (
            <article key={group.title} className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <ul className="mt-5 space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader eyebrow="Trust & safety" title="Built for trusted hiring." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustCards.map(([title, text]) => (
              <TrustCard key={title} title={title} text={text} />
            ))}
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
                  {item.person
                    .split(",")[0]
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <p className="text-sm font-medium">{item.person}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-foreground px-6 py-12 text-background shadow-sm sm:px-10">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Start hiring with higher-quality candidates.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
            Post transparent roles, discover verified talent, and build a cleaner hiring pipeline with Diplotix.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AuthCTAButton
              mode="signup"
              roleIntent="recruiter"
              continueTo={postJobHref}
              authenticatedHref={postJobHref}
              variant="secondary"
              className="rounded-full"
            >
              Post a Job
            </AuthCTAButton>
            <AuthCTAButton
              mode="signup"
              roleIntent="recruiter"
              continueTo="/onboarding/select-role"
              authenticatedHref="/recruiter/dashboard"
              variant="outline"
              className="rounded-full border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground"
            >
              Create Recruiter Account
            </AuthCTAButton>
          </div>
        </div>
      </section>
    </div>
  );
}

const featureIcons: ElementType[] = [Users, Sparkles, ShieldCheck, Clock3, BriefcaseBusiness, Layers3];

function SectionHeader({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{text}</p>}
    </div>
  );
}

function FeatureCard({ title, text, icon: Icon }: { title: string; text: string; icon: ElementType }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Icon className="h-4 w-4" />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </article>
  );
}

function QualitySignalCard({ label }: { label: string }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-sm font-medium">{label}</span>
      </div>
    </article>
  );
}

function DashboardFeatureCard({ label }: { label: string }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <h3 className="text-sm font-semibold">{label}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Supporting analytics and workflow visibility for cleaner hiring operations.
      </p>
    </article>
  );
}

function TrustCard({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <ShieldCheck className="h-4 w-4" />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </article>
  );
}

function RecruiterDashboardPreview() {
  return (
    <div className="animate-marketing-in rounded-2xl border border-border/60 bg-background p-4 shadow-[0_22px_60px_rgba(0,0,0,0.10)] [animation-delay:120ms]">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Recruiter dashboard preview
        </p>
        <span className="text-xs text-muted-foreground">Updated now</span>
      </div>
      <div className="mt-4 rounded-2xl border border-border/50 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <PreviewStat label="Active job posts" value="12" />
          <PreviewStat label="New applicants" value="46" />
          <PreviewStat label="AI match score" value="87%" />
          <PreviewStat label="Response analytics" value="82%" />
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2">
          {pipelineStages.map((stage) => (
            <span
              key={stage}
              className="rounded-xl border border-border/50 bg-muted/20 px-2 py-2 text-center text-[11px] font-medium text-muted-foreground"
            >
              {stage}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CandidateQualityPanel() {
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
      <p className="text-sm font-semibold">Candidate Quality Score: 87%</p>
      <div className="mt-5 space-y-4">
        {[
          ["Skills Match", "82%", "High"],
          ["Experience Relevance", "89%", "Strong"],
          ["Salary Alignment", "76%", "Good"],
          ["Remote Preference", "91%", "Match"],
        ].map(([label, value, state]) => (
          <div key={label as string}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span className="font-medium">{state}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{ width: value as string }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {["Verified", "Resume", "Skills", "Preferences"].map((tag) => (
          <span key={tag} className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
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

function RecruiterPipelineCard() {
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Applicant pipeline</p>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>
      <div className="mt-5 grid grid-cols-5 gap-2">
        {pipelineStages.map((stage, index) => (
          <div
            key={stage}
            className="rounded-xl border border-border/50 bg-muted/20 px-2 py-3 text-center text-[11px] font-medium text-muted-foreground"
          >
            <p>{stage}</p>
            <p className="mt-1 text-xs font-semibold text-foreground">{stageCounts[index]}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {candidateRows.map((row) => (
          <div key={row.name} className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-3">
            <div>
              <p className="text-sm font-medium">{row.name}</p>
              <p className="text-xs text-muted-foreground">{row.role}</p>
            </div>
            <span className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground">
              {row.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const stageCounts = ["24", "12", "8", "4", "2"] as const;
const candidateRows = [
  { name: "Maya R.", role: "Product Designer", score: "96%" },
  { name: "David S.", role: "Backend Engineer", score: "91%" },
  { name: "Ira K.", role: "Growth Lead", score: "87%" },
] as const;
