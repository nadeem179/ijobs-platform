import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const tiers = [
  {
    name: "Job Seeker",
    price: "Free",
    description: "Access to all job listings and application tools.",
    features: [
      "Browse all job listings",
      "Apply with one click",
      "Save jobs for later",
      "Track application status",
      "Profile and portfolio",
    ],
    cta: "Get Started",
    href: "/jobs",
    featured: false,
  },
  {
    name: "Recruiter Starter",
    price: "$99",
    period: "/month",
    description: "For small teams starting their hiring journey.",
    features: [
      "Up to 3 active job listings",
      "Candidate review tools",
      "Basic analytics",
      "Email support",
      "Verified recruiter badge",
    ],
    cta: "Post a Job",
    href: "/recruiter",
    featured: true,
  },
  {
    name: "Recruiter Pro",
    price: "$249",
    period: "/month",
    description: "For growing teams with higher hiring volume.",
    features: [
      "Up to 10 active job listings",
      "Advanced candidate filtering",
      "Team collaboration",
      "Priority support",
      "Featured job listings",
      "Custom company page",
    ],
    cta: "Contact Sales",
    href: "/contact",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-4">
            Pricing
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-[1.1] mb-3">
            Simple, transparent pricing
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Job seekers always free. Recruiters pay only when they find quality candidates.
          </p>
        </div>

        <div className="grid gap-6 max-w-5xl mx-auto sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border ${
                tier.featured
                  ? "border-primary/30 bg-primary/[0.03] shadow-sm"
                  : "border-border/30 bg-background"
              } p-6 flex flex-col`}
            >
              <h2 className="text-lg font-semibold tracking-tight mb-1">{tier.name}</h2>
              <div className="mb-3">
                <span className="text-3xl font-bold">{tier.price}</span>
                {tier.period && (
                  <span className="text-sm text-muted-foreground ml-1">{tier.period}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-5">{tier.description}</p>
              <ul className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                variant={tier.featured ? "default" : "outline"}
                size="lg"
                className="rounded-xl w-full"
                asChild
              >
                <Link href={tier.href}>{tier.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}