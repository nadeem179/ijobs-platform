import Link from "next/link";
import { ArrowRight } from "lucide-react";

const releases = [
  { title: "iJobs launches verified hiring platform", date: "March 2026", desc: "New platform connects verified recruiters with quality candidates through transparent job listings." },
  { title: "Salary transparency becomes default on iJobs", date: "February 2026", desc: "All job listings now require salary ranges, making iJobs one of the most transparent hiring platforms." },
  { title: "iJobs reaches 10,000 verified companies", date: "January 2026", desc: "The platform crosses a major milestone as more companies adopt verified hiring practices." },
];

export default function PressPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Press
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-3">Press & News</h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-8">Latest updates and announcements from iJobs.</p>

          <div className="space-y-4">
            {releases.map((item) => (
              <div key={item.title} className="rounded-xl border border-border/30 bg-background p-5">
                <span className="text-xs text-muted-foreground">{item.date}</span>
                <h3 className="text-sm font-semibold mt-1 mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-xl border border-border/30 bg-muted/10">
            <h2 className="text-sm font-semibold mb-2">Media inquiries</h2>
            <p className="text-sm text-muted-foreground mb-3">For press inquiries, please reach out to our team.</p>
            <Link href="/contact" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Contact us <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}