import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Globe2,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const filters = [
  ["Remote-friendly", "remote-friendly"],
  ["Startup", "startup"],
  ["Enterprise", "enterprise"],
  ["AI companies", "ai-companies"],
  ["Hiring now", "hiring-now"],
  ["Verified recruiters", "verified-recruiters"],
  ["Salary transparent", "salary-transparent"],
] as const;

const metrics = [
  ["2,500+", "Verified companies"],
  ["10,000+", "Active roles"],
  ["84%", "Recruiter response rate"],
  ["100%", "Salary-transparent jobs"],
] as const;

const companies = [
  {
    name: "Linear",
    slug: "linear",
    industry: "SaaS",
    description: "Product-led teams building planning tools for high-velocity software companies.",
    size: "150-300",
    location: "San Francisco / Remote",
    workPolicy: "Remote-friendly",
    activeJobs: 18,
    responseRate: "94%",
    velocity: "Fast",
    tags: ["Product", "Design", "Engineering"],
  },
  {
    name: "Stripe",
    slug: "stripe",
    industry: "Fintech",
    description: "Global payments infrastructure with transparent roles across engineering and operations.",
    size: "5,000+",
    location: "Global",
    workPolicy: "Hybrid",
    activeJobs: 42,
    responseRate: "88%",
    velocity: "High",
    tags: ["Backend", "Risk", "Platform"],
  },
  {
    name: "Notion",
    slug: "notion",
    industry: "Enterprise Software",
    description: "Workspace software company hiring across growth, product, and AI-assisted collaboration.",
    size: "500-1,000",
    location: "New York / Remote",
    workPolicy: "Hybrid",
    activeJobs: 27,
    responseRate: "82%",
    velocity: "Steady",
    tags: ["Growth", "AI", "Product"],
  },
  {
    name: "Vercel",
    slug: "vercel",
    industry: "Developer Tools",
    description: "Frontend cloud platform with remote roles for engineers, designers, and GTM teams.",
    size: "300-600",
    location: "Remote-first",
    workPolicy: "Remote-first",
    activeJobs: 31,
    responseRate: "90%",
    velocity: "Fast",
    tags: ["Infrastructure", "Design", "DevTools"],
  },
] as const;

const activityCards = [
  {
    title: "Reviewed applications this week",
    text: "Verified employers actively reviewing candidate profiles.",
    href: "/discover-jobs",
    cta: "View active jobs",
    icon: CheckCircle2,
  },
  {
    title: "Recently posted new roles",
    text: "Fresh salary-transparent opportunities from trusted teams.",
    href: "/discover-jobs",
    cta: "View active jobs",
    icon: BriefcaseBusiness,
  },
  {
    title: "Responds within 2-3 days",
    text: "Companies with strong recruiter response behavior.",
    href: "/companies?filter=fast-response",
    cta: "See fast responders",
    icon: Clock3,
  },
  {
    title: "Remote roles available",
    text: "Remote-friendly companies with active open roles.",
    href: "/discover-jobs?workMode=remote",
    cta: "Browse remote roles",
    icon: Globe2,
  },
] as const;

const categoryGroups = [
  {
    title: "Industries",
    param: "industry",
    values: ["AI", "SaaS", "Fintech", "Healthcare", "E-commerce", "Enterprise Software"],
  },
  {
    title: "Functions",
    param: "function",
    values: ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations"],
  },
  {
    title: "Work style",
    param: "workStyle",
    values: ["Remote-first", "Hybrid", "Onsite", "Startup", "Enterprise"],
  },
] as const;

const trustSignals = [
  ["Verified recruiters", "Hiring teams are reviewed before they build candidate pipelines."],
  ["Transparent salaries", "Roles emphasize compensation clarity before candidates apply."],
  ["Active response tracking", "Recruiter responsiveness is treated as a marketplace quality signal."],
  ["Spam-free listings", "Public pages prioritize active, useful roles over noisy inventory."],
  ["Real hiring activity", "Candidates can discover companies with recent role and review activity."],
  ["Clear company profiles", "Company context, work mode, and hiring categories are easy to scan."],
] as const;

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/40 bg-[linear-gradient(to_right,hsl(var(--border)/.18)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/.18)_1px,transparent_1px)] bg-[size:36px_36px]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:px-8 lg:py-24">
          <div className="animate-marketing-in">
            <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Verified companies
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Explore companies hiring with transparency.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              Discover verified employers, active recruiters, salary-transparent roles, and real hiring activity.
            </p>
            <form action="/companies" className="mt-8 max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="query"
                  placeholder="Search companies, industries, technologies"
                  className="h-12 w-full rounded-full border border-border/70 bg-background px-11 text-sm shadow-sm outline-none transition focus:border-foreground"
                />
                <Button className="absolute right-1.5 top-1.5 h-9 rounded-full px-4" type="submit">
                  Search
                </Button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap gap-2">
              {filters.map(([label, value]) => (
                <Link
                  key={value}
                  href={`/companies?filter=${value}`}
                  className="rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-md"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <FeaturedCompanyPreview />
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
          eyebrow="Featured"
          title="Featured verified companies."
          text="Browse employers with active roles, transparent salaries, and verified hiring teams."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {companies.map((company) => (
            <CompanyCard key={company.slug} company={company} />
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader
            eyebrow="Hiring activity"
            title="Actively hiring now."
            text="See which verified employers are posting roles, reviewing applications, and responding quickly."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {activityCards.map((item) => (
              <ActivityCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader eyebrow="Browse" title="Browse companies by category." />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {categoryGroups.map((group) => (
            <div key={group.title} className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm">
              <h3 className="text-sm font-semibold">{group.title}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.values.map((value) => (
                  <Link
                    key={value}
                    href={`/companies?${group.param}=${slugify(value)}`}
                    className="rounded-full border border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:-translate-y-0.5 hover:text-foreground hover:shadow-sm"
                  >
                    {value}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeader eyebrow="Trust signals" title="Why candidates trust companies on Diplotix." />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustSignals.map(([title, text]) => (
              <TrustCard key={title} title={title} text={text} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeader eyebrow="Spotlight" title="Company spotlight." />
        <div className="mt-10 rounded-2xl border border-border/50 bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:grid lg:grid-cols-[1fr_0.9fr] lg:gap-10 lg:p-8">
          <div>
            <div className="flex items-center gap-3">
              <LogoInitial name="Linear" />
              <div>
                <h3 className="text-xl font-semibold">Linear</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified hiring team
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
              Linear keeps hiring transparent with clear role scopes, published compensation ranges, and recruiters who actively respond to qualified applicants. Their current hiring focus is product-minded engineering, design systems, and B2B growth.
            </p>
            <Button className="mt-7 rounded-full" asChild>
              <Link href="/discover-jobs?company=linear">
                View open roles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:mt-0 lg:grid-cols-1">
            <SpotlightStat label="Active roles" value="18" />
            <SpotlightStat label="Average response" value="2 days" />
            <SpotlightStat label="Hiring categories" value="Product, Design, Engineering" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-foreground px-6 py-12 text-background shadow-sm sm:px-10">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Find companies worth applying to.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-background/70">
            Explore verified employers with active roles, transparent salaries, and real recruiter activity.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button variant="secondary" className="rounded-full" asChild>
              <Link href="/companies">Browse companies</Link>
            </Button>
            <Button variant="outline" className="rounded-full border-background/30 bg-transparent text-background hover:bg-background hover:text-foreground" asChild>
              <Link href="/discover-jobs">Explore jobs</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeaturedCompanyPreview() {
  return (
    <div className="animate-marketing-in rounded-2xl border border-border/60 bg-background p-5 shadow-[0_22px_60px_rgba(0,0,0,0.10)] [animation-delay:120ms]">
      <div className="flex items-center justify-between">
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Featured company
        </p>
        <span className="text-xs text-muted-foreground">Updated now</span>
      </div>
      <div className="mt-5 rounded-2xl border border-border/50 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <LogoInitial name="Linear" />
            <div>
              <h2 className="text-lg font-semibold">Linear</h2>
              <p className="inline-flex items-center gap-1 text-xs text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                Verified recruiters
              </p>
            </div>
          </div>
          <span className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium">Hiring now</span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
          <PreviewStat label="Active jobs" value="18" />
          <PreviewStat label="Response rate" value="94%" />
          <PreviewStat label="Work style" value="Remote-friendly" />
          <PreviewStat label="Team size" value="150-300" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Product", "Design", "Engineering"].map((tag) => (
            <span key={tag} className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>
        <Button className="mt-6 w-full rounded-full" asChild>
          <Link href="/discover-jobs?company=linear">View company</Link>
        </Button>
      </div>
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

function CompanyCard({ company }: { company: (typeof companies)[number] }) {
  const companyHref = `/discover-jobs?company=${company.slug}`;

  return (
    <article className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LogoInitial name={company.name} />
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Verified company
            </p>
          </div>
        </div>
        <span className="rounded-full border border-border/60 px-2.5 py-1 text-xs text-muted-foreground">{company.industry}</span>
      </div>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">{company.description}</p>
      <div className="mt-5 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
        <IconLine icon={Users} text={`${company.size} employees`} />
        <IconLine icon={MapPin} text={company.location} />
        <IconLine icon={Globe2} text={company.workPolicy} />
        <IconLine icon={BriefcaseBusiness} text={`${company.activeJobs} active jobs`} />
        <IconLine icon={BarChart3} text={`${company.responseRate} response rate`} />
        <IconLine icon={Sparkles} text={`${company.velocity} hiring velocity`} />
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {company.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-border/50 px-2.5 py-1 text-xs text-muted-foreground">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button className="rounded-full" asChild>
          <Link href={companyHref}>View company</Link>
        </Button>
        <Button variant="outline" className="rounded-full" asChild>
          <Link href={companyHref}>View open roles</Link>
        </Button>
      </div>
    </article>
  );
}

function ActivityCard({ item }: { item: (typeof activityCards)[number] }) {
  return (
    <article className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <item.icon className="h-4 w-4" />
      <h3 className="mt-4 text-sm font-semibold">{item.title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.text}</p>
      <Link href={item.href} className="mt-5 inline-flex items-center gap-1 text-xs font-semibold hover:underline">
        {item.cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
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

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SpotlightStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function IconLine({ icon: Icon, text }: { icon: typeof Users; text: string }) {
  return (
    <span className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      {text}
    </span>
  );
}

function LogoInitial({ name }: { name: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-muted/20 text-sm font-semibold">
      {name.charAt(0)}
    </div>
  );
}

function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/\s+/g, "-");
}
