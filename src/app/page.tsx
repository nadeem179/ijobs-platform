"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ElementType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleDollarSign,
  FileCheck2,
  Gauge,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCTAButton } from "@/components/marketing/auth-cta-button";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

const postJobHref = "/recruiter/post-job";

const heroJobs = [
  {
    title: "Senior Product Designer",
    company: "Linear",
    salary: "$160k - $210k",
    mode: "Remote",
    location: "",
    match: "96",
    response: "94%",
  },
  {
    title: "Staff Backend Engineer",
    company: "Stripe",
    salary: "$220k - $285k",
    mode: "Hybrid - SF",
    location: "",
    match: "91",
    response: "88%",
  },
  {
    title: "Head of Growth",
    company: "Notion",
    salary: "$190k - $240k",
    mode: "Remote",
    location: "",
    match: "87",
    response: "82%",
  },
];

const metrics = [
  ["5,000+", "verified candidates"],
  ["1,200+", "active opportunities"],
  ["82%", "recruiter response rate"],
  ["100%", "spam-filtered applications"],
] as const;

const problems = [
  ["Fake jobs", "Listings that never existed or were filled months ago."],
  ["Hidden salaries", "Vague ranges that waste everyone's time."],
  ["Recruiter ghosting", "No reply, no rejection, no closure."],
  ["Spam applications", "Inboxes flooded with low-signal applies."],
] as const;

const candidateBenefits = [
  ["Verified opportunities", "Reviewed roles from real recruiters."],
  ["Salary transparency", "Clear ranges before you spend time applying."],
  ["AI-powered matching", "Signals from skills, preferences, and goals."],
  ["Response visibility", "Know recruiter response patterns upfront."],
  ["Application tracking", "Follow every application from one place."],
  ["Easy apply", "Apply quickly with a complete profile."],
  ["Profile strength score", "Improve the signals recruiters care about."],
  ["Smart recommendations", "Better-fit roles as your profile improves."],
] as const;

const recruiterBenefits = [
  ["Verified candidate profiles", "Structured profiles with stronger signal."],
  ["AI-ranked applicants", "Review best-fit candidates first."],
  ["Reduced spam applies", "Quality filters keep pipelines cleaner."],
  ["Candidate quality filtering", "Prioritize completion, skills, and fit."],
  ["Response analytics", "Track pipeline health and candidate experience."],
  ["Faster hiring pipeline", "Move from inbound to shortlist with less noise."],
] as const;

const featuredJobs = [
  ["Senior Product Designer", "Linear", "$160k - $210k", "Remote", ["Figma", "Systems", "B2B SaaS"], "96%", "94%"],
  ["Staff Backend Engineer", "Stripe", "$220k - $285k", "Hybrid - SF", ["Go", "Distributed", "Payments"], "91%", "88%"],
  ["Head of Growth", "Notion", "$190k - $240k", "Remote", ["B2B", "PLG", "Lifecycle"], "87%", "82%"],
  ["ML Research Engineer", "Vercel", "$200k - $260k", "Remote", ["LLMs", "Eval", "Python"], "93%", "90%"],
  ["Senior iOS Engineer", "Linear", "$170k - $215k", "Remote", ["Swift", "Performance"], "89%", "86%"],
  ["Product Manager, Platform", "Notion", "$180k - $230k", "Hybrid - NY", ["APIs", "Platform"], "84%", "79%"],
] as const;

const testimonials = [
  {
    quote:
      "Diplotix made real opportunities easier to spot. I could see salary, recruiter quality, and fit before applying.",
    person: "Maya R.",
    role: "Product Designer",
  },
  {
    quote:
      "The applicant list felt cleaner from day one. Ranked profiles helped our team spend time with serious candidates.",
    person: "Arjun S.",
    role: "Talent Lead",
  },
];

const benefitIcons = [
  BadgeCheck,
  CircleDollarSign,
  Sparkles,
  BarChart3,
  FileCheck2,
  ArrowRight,
  Gauge,
  SearchCheck,
];

export default function HomePage() {
  const { isAuthenticated, isLoading, user, getPostAuthRedirect } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    router.replace(getPostAuthRedirect(user));
  }, [getPostAuthRedirect, isAuthenticated, isLoading, router, user]);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/40 bg-[linear-gradient(to_right,hsl(var(--border)/.22)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.22)_1px,transparent_1px)] bg-[size:36px_36px]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-24 lg:min-h-[640px] lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8">
          <div className="animate-marketing-in">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Trusted by 5,000+ verified candidates
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.02] tracking-tight text-foreground sm:text-7xl">
              Find verified jobs from real recruiters.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Salary transparency, recruiter verification, and AI-powered matching built for modern hiring. Less spam, more signal.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="h-12 rounded-full px-6 text-sm" asChild>
                <Link href="/discover-jobs">
                  Explore jobs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <AuthCTAButton
                mode="signup"
                roleIntent="recruiter"
                continueTo={postJobHref}
                authenticatedHref={postJobHref}
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-6 text-sm"
              >
                Post a job
              </AuthCTAButton>
            </div>
            <div className="mt-10 flex flex-wrap gap-7 text-sm text-muted-foreground">
              {["Verified recruiters", "AI matching", "Response rates"].map((item, index) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  {index === 1 ? <Sparkles className="h-4 w-4" /> : index === 2 ? <BarChart3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="animate-marketing-in rounded-2xl border border-border/60 bg-background p-3 shadow-[0_22px_60px_rgba(0,0,0,0.12)] [animation-delay:120ms] lg:mt-6">
            <div className="mb-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Live - Featured opportunities
              </span>
              <span>Updated now</span>
            </div>
            <div className="space-y-2">
              {heroJobs.map((job) => (
                <JobPanelCard key={job.title} job={job} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {metrics.map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm capitalize text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">The market</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Hiring is broken.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Every job board promises matches. Few deliver trust. We rebuilt the marketplace around verification, transparency, and signal.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map(([title, text]) => (
            <FeatureCard key={title} title={title} text={text} icon={ShieldCheck} />
          ))}
        </div>
        <div className="mt-6 rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm font-medium">
          Diplotix was built to fix hiring quality.
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:py-24">
          <SectionIntro eyebrow="For candidates" title="Built for serious job seekers." text="Quality profiles, transparent roles, and fewer blind applications." />
          <div className="grid gap-8 lg:contents">
            <ProfileQualityCard className="lg:col-start-1" />
            <div className="grid gap-3 sm:grid-cols-2 lg:col-start-2 lg:row-start-1 lg:row-span-2">
              {candidateBenefits.map(([title, text], index) => (
                <FeatureCard key={title} title={title} text={text} icon={benefitIcons[index]} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
        <RecruiterPipelineCard />
        <div>
          <SectionIntro eyebrow="For recruiters" title="Hire better candidates faster." text="Spend time on the right people with AI-ranked profiles and cleaner inbound." />
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {recruiterBenefits.map(([title, text]) => (
              <FeatureCard key={title} title={title} text={text} icon={UserCheck} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Two sides. One quality bar.</h2>
          <div className="mt-8 grid gap-4 text-left md:grid-cols-2">
            <FlowCard title="For candidates" steps={["Build profile", "Get AI matches", "Apply smarter"]} />
            <FlowCard title="For recruiters" steps={["Post role", "Review ranked candidates", "Hire efficiently"]} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between gap-4">
          <SectionIntro eyebrow="Jobs" title="Verified jobs, hand-picked." />
          <Link href="/discover-jobs" className="hidden text-sm font-medium hover:underline sm:inline-flex">
            View all jobs
          </Link>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {featuredJobs.map(([title, company, salary, location, tags, match, reply]) => (
            <FeaturedJobCard key={title} title={title} company={company} salary={salary} location={location} tags={tags} match={match} reply={reply} />
          ))}
        </div>
        <Button className="mt-6 rounded-full sm:hidden" asChild>
          <Link href="/discover-jobs">View all jobs</Link>
        </Button>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <SectionIntro eyebrow="Quality system" title="Better profiles get better opportunities." text="Profiles are scored on completeness, verification, and signal. Higher-quality profiles unlock better matches and more recruiter replies." />
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              {["Stronger visibility in recruiter searches", "Higher AI-match scores on relevant roles", "Priority placement in shortlists", "Faster recruiter response times"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ScoreCard />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-20 sm:px-6 md:grid-cols-2 lg:px-8">
        {testimonials.map((item) => (
          <article key={item.person} className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
            <Star className="h-4 w-4 text-foreground" />
            <p className="mt-4 text-sm leading-6 text-muted-foreground">&ldquo;{item.quote}&rdquo;</p>
            <p className="mt-5 text-sm font-semibold">{item.person}</p>
            <p className="text-xs text-muted-foreground">{item.role}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-foreground px-6 py-12 text-background shadow-sm sm:px-10">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Ready to find your next opportunity?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
            Join thousands of verified professionals and recruiters building hiring on a higher quality bar.
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

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{text}</p>}
    </div>
  );
}

function FeatureCard({ title, text, icon: Icon }: { title: string; text: string; icon: ElementType }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Icon className="h-4 w-4 text-foreground" />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}

function JobPanelCard({ job }: { job: (typeof heroJobs)[number] }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-muted/20">
            <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{job.title}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              {job.company}
              <BadgeCheck className="h-3 w-3 text-foreground" />
            </p>
          </div>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-foreground text-xs font-semibold">{job.match}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{job.salary}</span>
        <span>{job.mode}</span>
        <span>Response {job.response}</span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-border/50 px-2 py-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Actively hiring
        </span>
      </div>
    </div>
  );
}

function ProfileQualityCard({ className }: { className?: string }) {
  const rows = [["Resume uploaded", "Done"], ["Skills verified", "Done"], ["Preferences set", "Updated"], ["Applications tracked", "Live"]];
  return (
    <div className={cn("rounded-2xl border border-border/50 bg-background p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Profile quality</span>
        <span>86%</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-muted">
        <div className="h-full w-[86%] rounded-full bg-foreground" />
      </div>
      <div className="mt-5 space-y-3">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-emerald-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecruiterPipelineCard() {
  const stages = ["New", "Shortlisted", "Contacted", "Hired"];
  const candidates = [["Maya R.", "Product design - 94% match"], ["Dev A.", "Frontend - 91% match"], ["Ira K.", "Growth - 88% match"]];
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Recruiter pipeline</p>
        <span className="text-xs text-muted-foreground">24 candidates</span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        {stages.map((stage) => (
          <div key={stage} className="rounded-lg border border-border/50 px-2 py-2 text-center text-xs font-medium">
            {stage}
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {candidates.map(([name, detail]) => (
          <div key={name} className="flex items-center gap-3 rounded-xl border border-border/40 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">{name[0]}</div>
            <div>
              <p className="text-sm font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowCard({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ol className="mt-5 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border/60 text-xs font-semibold text-foreground">{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FeaturedJobCard({ title, company, salary, location, tags, match, reply }: { title: string; company: string; salary: string; location: string; tags: readonly string[]; match: string; reply: string }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{company}</p>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-[11px] font-semibold">{match}</span>
      </div>
      <p className="mt-4 text-sm font-medium">{salary}</p>
      <p className="mt-1 text-xs text-muted-foreground">{location} Reply {reply}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full text-xs text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Actively hiring
        </span>
        {tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border/50 px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
        ))}
      </div>
      <Link href="/discover-jobs" className="mt-5 inline-flex text-xs font-semibold hover:underline">
        View role
      </Link>
    </article>
  );
}

function ScoreCard() {
  const bars = [["Role fit", "92%"], ["Skill match", "84%"], ["Preferences", "78%"], ["Trust signals", "90%"]];
  return (
    <div className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-8 border-foreground text-xl font-semibold">86</div>
        <div>
          <p className="text-sm font-semibold">Quality score</p>
          <p className="text-xs text-muted-foreground">Excellent profile signal</p>
        </div>
      </div>
      <div className="mt-6 space-y-4">
        {bars.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-muted-foreground">{label}</span>
              <span>{value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground" style={{ width: value }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        {["Verified", "Resume", "Skills", "Preferences"].map((tag) => (
          <span key={tag} className="rounded-full border border-border/50 px-2 py-1 text-muted-foreground">{tag}</span>
        ))}
      </div>
    </div>
  );
}
