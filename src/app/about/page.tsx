import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, Search } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
              About iJobs
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-4">
              Building a trusted hiring ecosystem
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              We believe hiring should be transparent, efficient, and trustworthy.
              iJobs connects quality candidates with verified employers —
              without the noise, spam, and fake listings that plague traditional
              job platforms.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-12">
            {[
              { icon: ShieldCheck, title: "Verified hiring", desc: "Every job listing and recruiter is verified before going live." },
              { icon: Users, title: "Quality matches", desc: "Smart matching connects the right talent with the right roles." },
              { icon: Search, title: "Transparent process", desc: "Salary ranges, response rates, and company details are always visible." },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-border/30 bg-background p-4">
                <item.icon className="h-5 w-5 text-primary mb-2" />
                <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border/30 bg-muted/10 p-6 mb-8">
            <h2 className="text-lg font-semibold tracking-tight mb-3">Our mission</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              We started iJobs to fix a broken hiring experience. Job seekers deserve to know
              if a job is real, if the salary is accurate, and if the recruiter is legitimate.
              Employers deserve candidates who are serious, verified, and matched to their needs.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are building a platform where trust is the foundation — not an afterthought.
              Every feature is designed to reduce noise and increase signal for both sides of the
              hiring equation.
            </p>
          </div>

          <div className="text-center py-6">
            <h2 className="text-lg font-semibold tracking-tight mb-2">Ready to experience better hiring?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
              <Button size="lg" className="rounded-xl" asChild>
                <Link href="/jobs">Explore Jobs</Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" asChild>
                <Link href="/recruiter">Post a Job</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}