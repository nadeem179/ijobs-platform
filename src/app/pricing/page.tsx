import Link from "next/link";
import type { ElementType } from "react";
import {
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCTAButton } from "@/components/marketing/auth-cta-button";

const postJobHref = "/recruiter/post-job";
const getStartedHref = "/onboarding/select-role";

const recruiterPlans = [
  {
    name: "Starter",
    target: "For startups and small hiring teams.",
    price: "$49/month",
    note: "Launch pricing",
    features: [
      "3 active job posts",
      "Verified company profile",
      "AI candidate matching",
      "Candidate pipeline",
      "Basic applicant filtering",
      "Salary transparency tools",
      "Recruiter dashboard",
      "Email support",
    ],
    href: postJobHref,
    cta: "Start Hiring",
    featured: false,
  },
  {
    name: "Growth",
    target: "For growing teams hiring regularly.",
    price: "$149/month",
    note: "Most Popular",
    features: [
      "Everything in Starter",
      "Unlimited active jobs",
      "AI-ranked candidates",
      "Advanced filtering",
      "Recruiter analytics",
      "Candidate quality scoring",
      "Team collaboration",
      "Priority support",
    ],
    href: postJobHref,
    cta: "Choose Growth",
    featured: true,
  },
  {
    name: "Enterprise",
    target: "For larger organizations and custom hiring workflows.",
    price: "Custom",
    note: "Tailored solutions",
    features: [
      "Everything in Growth",
      "Custom hiring workflows",
      "Dedicated onboarding",
      "Enterprise analytics",
      "ATS integrations",
      "Recruiter seats",
      "API access",
      "Advanced permissions",
      "Dedicated success manager",
    ],
    href: "/contact",
    cta: "Contact Sales",
    featured: false,
  },
] as const;

const comparisonRows = [
  ["Active job posts", "3", "Unlimited", "Unlimited"],
  ["Verified company profile", "Yes", "Yes", "Yes"],
  ["AI candidate matching", "Yes", "Yes", "Yes"],
  ["AI-ranked applicants", "No", "Yes", "Yes"],
  ["Candidate quality scoring", "No", "Yes", "Yes"],
  ["Recruiter analytics", "Basic", "Advanced", "Enterprise"],
  ["Team collaboration", "No", "Yes", "Yes"],
  ["ATS integrations", "No", "No", "Yes"],
  ["API access", "No", "No", "Yes"],
  ["Priority support", "No", "Yes", "Yes"],
  ["Dedicated success manager", "No", "No", "Yes"],
] as const;

const recruiterBenefits = [
  ["Better Candidate Quality", "Verified profiles and AI ranking help recruiters focus on people who fit the role."],
  ["Reduced Spam Applications", "Quality signals and transparency reduce noise before review begins."],
  ["Faster Hiring Decisions", "Cleaner pipelines shorten the path from application to shortlist."],
  ["Transparent Hiring Experience", "Salary clarity and response visibility build trust with candidates."],
] as const;

const roiItems = {
  traditional: [
    "High spam",
    "Incomplete profiles",
    "Hidden salaries",
    "Heavy manual filtering",
    "Low response quality",
  ],
  Diplotix: [
    "Verified profiles",
    "AI-ranked relevance",
    "Salary transparency",
    "Spam-filtered applications",
    "Faster screening",
  ],
} as const;

const faqs = [
  ["Is candidate access free?", "Yes. Candidates can build profiles, discover verified jobs, and apply without paying."],
  ["Are recruiters verified?", "Yes. Recruiter verification is part of the platform's trust layer."],
  ["Do jobs require salary transparency?", "Diplotix is designed around transparent salary ranges whenever possible."],
  ["Can I cancel anytime?", "Recruiter plans are positioned as flexible hiring infrastructure and can be adjusted as needs change."],
  ["Do you support remote hiring?", "Yes. Remote, hybrid, and onsite workflows are supported through public job metadata."],
  ["Is there a free recruiter trial?", "This page uses launch pricing language; a free recruiter trial can be offered through sales or promotion flows if available."],
  ["Do you offer enterprise plans?", "Yes. Enterprise pricing and workflows are handled through the sales conversation."],
] as const;

const toggleStyle =
  "inline-flex items-center rounded-full border border-border/50 bg-background p-1 shadow-sm";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/40 bg-[linear-gradient(to_right,hsl(var(--border)/.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.18)_1px,transparent_1px)] bg-[size:36px_36px]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
          <div className="animate-marketing-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Pricing
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Flexible pricing for modern hiring.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Whether you&apos;re hiring your first employee or scaling a recruiting team, Diplotix provides cleaner hiring pipelines powered by trust, transparency, and AI-assisted matching.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className={toggleStyle}>
                <button className="rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background">
                  Monthly
                </button>
                <button className="rounded-full px-4 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground">
                  Annual
                </button>
              </div>
              <span className="text-xs text-muted-foreground">Visual toggle only for launch pricing.</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <AuthCTAButton
                mode="signup"
                roleIntent="recruiter"
                continueTo={postJobHref}
                authenticatedHref={postJobHref}
                className="h-12 rounded-full px-6 text-sm"
              >
                Start Hiring
                <ArrowRight className="ml-2 h-4 w-4" />
              </AuthCTAButton>
              <Button variant="outline" className="h-12 rounded-full px-6 text-sm" asChild>
                <Link href="/discover-jobs">Explore Jobs</Link>
              </Button>
            </div>
          </div>

          <PricingHeroCard />
        </div>
      </section>

      <section className="border-b border-border/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ["82%", "recruiter response rate"],
            ["5,000+", "verified candidates"],
            ["70%", "fewer spam applications"],
            ["2.4x", "higher profile quality"],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-semibold tracking-tight">{value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <PlanCard
            title="Candidates"
            price="Free"
            description="Build your profile, discover verified jobs, and apply smarter with AI-assisted matching."
            features={[
              "Verified job access",
              "AI-powered job matching",
              "Profile quality score",
              "Salary-transparent jobs",
              "Application tracking",
              "Saved jobs",
              "Recruiter response visibility",
            ]}
            href={getStartedHref}
            cta="Get Started"
            featured={false}
            span="lg:col-span-1"
          />
          {recruiterPlans.map((plan) => (
            <PlanCard
              key={plan.name}
              title={plan.name}
              price={plan.price}
              description={plan.target}
              features={plan.features}
              href={plan.href}
              cta={plan.cta}
              featured={plan.featured}
              badge={plan.note}
              span="lg:col-span-1"
            />
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader eyebrow="Compare plans" title="Compare plans." />
          <div className="mt-10 overflow-x-auto rounded-2xl border border-border/50 bg-background shadow-sm">
            <table className="min-w-[760px] w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  <th className="px-5 py-4 font-semibold">Feature</th>
                  <th className="px-5 py-4 font-semibold">Starter</th>
                  <th className="px-5 py-4 font-semibold">Growth</th>
                  <th className="px-5 py-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(([feature, starter, growth, enterprise]) => (
                  <tr key={feature} className="border-b border-border/30 last:border-b-0">
                    <td className="px-5 py-4 font-medium">{feature}</td>
                    <td className="px-5 py-4 text-muted-foreground">{starter}</td>
                    <td className="px-5 py-4 text-muted-foreground">{growth}</td>
                    <td className="px-5 py-4 text-muted-foreground">{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader
          eyebrow="Why recruiters pay"
          title="Pay for better hiring outcomes, not just job posts."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {recruiterBenefits.map(([title, text], index) => (
            <FeatureCard key={title} title={title} text={text} icon={featureIcons[index]} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-start lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="ROI"
            title="Cleaner pipelines. Less wasted screening."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <ComparisonCard title="Traditional Job Boards" items={roiItems.traditional} />
            <ComparisonCard title="Diplotix" items={roiItems.Diplotix} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader eyebrow="FAQ" title="Pricing questions." />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <article key={question} className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <h3 className="text-sm font-semibold">{question}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-foreground px-6 py-12 text-background shadow-sm sm:px-10">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Start hiring through cleaner pipelines.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
            Discover verified candidates, reduce spam applications, and improve hiring quality with Diplotix.
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
              Start Hiring
            </AuthCTAButton>
            <Button variant="outline" className="rounded-full border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}

function PlanCard({
  title,
  price,
  description,
  features,
  href,
  cta,
  featured,
  badge,
  span,
}: {
  title: string;
  price: string;
  description: string;
  features: readonly string[];
  href: string;
  cta: string;
  featured: boolean;
  badge?: string;
  span: string;
}) {
  return (
    <article
      className={`rounded-2xl border bg-background p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${span} ${featured ? "border-foreground/70 ring-1 ring-foreground/10" : "border-border/50"}`}
    >
      {badge && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-border/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          <span className={featured ? "h-1.5 w-1.5 rounded-full bg-emerald-500" : "h-1.5 w-1.5 rounded-full bg-muted-foreground"} />
          {badge}
        </div>
      )}
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <p className="mt-5 text-3xl font-semibold tracking-tight">{price}</p>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            {feature}
          </li>
        ))}
      </ul>
      {href === "/contact" ? (
        <Button className="mt-7 w-full rounded-full" variant={featured ? "default" : "outline"} asChild>
          <Link href={href}>{cta}</Link>
        </Button>
      ) : (
        <AuthCTAButton
          mode="signup"
          roleIntent={href === getStartedHref ? "candidate" : "recruiter"}
          continueTo={href === getStartedHref ? undefined : href}
          authenticatedHref={href === getStartedHref ? "/dashboard" : href}
          className="mt-7 w-full rounded-full"
          variant={featured ? "default" : "outline"}
        >
          {cta}
        </AuthCTAButton>
      )}
    </article>
  );
}

function FeatureCard({
  title,
  text,
  icon: Icon,
}: {
  title: string;
  text: string;
  icon: ElementType;
}) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Icon className="h-4 w-4" />
      <h3 className="mt-4 text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{text}</p>
    </article>
  );
}

function ComparisonCard({ title, items }: { title: string; items: readonly string[] }) {
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

function PricingHeroCard() {
  return (
    <div className="animate-marketing-in rounded-2xl border border-border/60 bg-background p-4 shadow-[0_22px_60px_rgba(0,0,0,0.10)] [animation-delay:120ms]">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Launch pricing
        </p>
        <span className="text-xs text-muted-foreground">Monthly / Annual</span>
      </div>
      <div className="mt-4 grid gap-3 rounded-2xl border border-border/50 p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <MiniStat label="Candidates" value="Free forever" />
          <MiniStat label="Starter" value="$49/month" />
          <MiniStat label="Growth" value="$149/month" />
          <MiniStat label="Enterprise" value="Custom" />
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

const featureIcons = [
  Users,
  Sparkles,
  BarChart3,
  ShieldCheck,
] as const;
