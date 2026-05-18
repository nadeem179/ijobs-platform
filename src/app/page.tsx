import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Star,
} from "lucide-react";

const featuredJobs = [
  {
    title: "Senior Product Designer",
    company: "Linear",
    logo: "L",
    salary: "$180K — $250K",
    location: "San Francisco, CA (Hybrid)",
  },
  {
    title: "Staff Frontend Engineer",
    company: "Vercel",
    logo: "V",
    salary: "$200K — $290K",
    location: "Remote",
  },
  {
    title: "AI Product Designer",
    company: "Notion",
    logo: "N",
    salary: "$190K — $270K",
    location: "New York, NY (Hybrid)",
  },
];

const trustItems = [
  {
    category: "For job seekers",
    points: [
      "Every job listing is reviewed for authenticity",
      "Salary ranges disclosed — no hidden numbers",
      "Recruiter identity verified before posting",
      "No spam calls or unverified outreach",
    ],
  },
  {
    category: "For recruiters",
    points: [
      "Candidates arrive with verified skill profiles",
      "Spam applications filtered automatically",
      "Response tracking for cleaner pipeline",
      "Quality matches, not volume",
    ],
  },
];

const philosophyItems = [
  {
    title: "Proof-based hiring",
    desc: "Skills verified before applications reach recruiters.",
  },
  {
    title: "Salary transparency",
    desc: "Every listing includes a verified range. No guessing.",
  },
  {
    title: "Cleaner pipeline",
    desc: "Recruiters see relevant, pre-filtered applicants.",
  },
  {
    title: "Real response rates",
    desc: "Know how responsive a recruiter is before you apply.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* ===== HERO ===== */}
      <section className="border-b border-border/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-10 sm:py-14 lg:py-16">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
                Trusted hiring. No spam. No noise.
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05] mb-3">
                Find verified opportunities{" "}
                <span className="text-muted-foreground">faster</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-6 max-w-md">
                Every job includes salary transparency, recruiter verification,
                and real response rates. Built for quality, not quantity.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="xl" className="rounded-xl text-base h-12 px-8" asChild>
                  <Link href="/jobs">
                    Explore Jobs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="xl"
                  className="rounded-xl text-base h-12 px-8"
                  asChild
                >
                  <Link href="/recruiter">Post a Job</Link>
                </Button>
              </div>
            </div>

            {/* Right: Product Preview */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
                  <Star className="h-3 w-3 text-emerald-500" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  Featured opportunities — verified by our team
                </span>
              </div>
              {featuredJobs.map((job) => (
                <Link
                  key={job.title}
                  href="/jobs"
                  className="block rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-xs font-bold text-muted-foreground">
                      {job.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{job.title}</p>
                        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="text-primary"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {job.company} &middot; {job.location}
                      </p>
                      <div className="flex items-center gap-2.5 mt-2">
                        <span className="text-xs font-semibold">
                          {job.salary}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Actively hiring
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-3" />
                  </div>
                </Link>
              ))}
              <div className="pt-1">
                <Link
                  href="/jobs"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  View all opportunities
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST + SAFETY ===== */}
      <section className="border-b border-border/30 bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <ShieldCheck className="h-5 w-5 text-primary mx-auto mb-2" />
            <h2 className="text-lg font-semibold tracking-tight">
              Built for trusted hiring
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {trustItems.map((group) => (
              <div
                key={group.category}
                className="rounded-xl border border-border/30 bg-background p-5"
              >
                <h3 className="text-sm font-semibold mb-3">
                  {group.category}
                </h3>
                <ul className="space-y-2">
                  {group.points.map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed"
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PHILOSOPHY ===== */}
      <section className="border-b border-border/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-lg font-semibold tracking-tight mb-1">
              Less noise. Better matches.
            </h2>
            <p className="text-sm text-muted-foreground">
              Every feature reduces noise for both sides.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 max-w-4xl mx-auto">
            {philosophyItems.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border/30 bg-background p-4"
              >
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold tracking-tight mb-2">
            Ready to find your next opportunity?
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto leading-relaxed">
            Join thousands discovering vetted opportunities with salary
            transparency and verified recruiters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="rounded-xl text-sm h-11 px-8" asChild>
              <Link href="/jobs">
                Explore Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-xl text-sm h-11 px-8"
              asChild
            >
              <Link href="/recruiter">Post a Job</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
