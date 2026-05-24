import Link from "next/link";
import type { ElementType } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthCTAButton } from "@/components/marketing/auth-cta-button";

type Feature = {
  title: string;
  text: string;
};

export type MarketingPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
  features?: Feature[];
  cards?: Feature[];
};

const icons: ElementType[] = [
  ShieldCheck,
  Sparkles,
  BadgeCheck,
  BarChart3,
  BriefcaseBusiness,
  FileText,
];

export function MarketingPage({
  eyebrow,
  title,
  description,
  primaryCta = { label: "Explore Jobs", href: "/discover-jobs" },
  secondaryCta = { label: "Post a Job", href: "/recruiter/post-job" },
  features = [],
  cards = [],
}: MarketingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <MarketingCTA cta={primaryCta} />
            <MarketingCTA cta={secondaryCta} variant="outline" />
          </div>
        </div>
      </section>

      {features.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-3 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = icons[index % icons.length];
              return (
                <article
                  key={feature.title}
                  className="rounded-2xl border border-border/50 bg-background p-5 shadow-sm"
                >
                  <Icon className="h-4 w-4" />
                  <h2 className="mt-4 text-sm font-semibold">{feature.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{feature.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {cards.length > 0 && (
        <section className="border-y border-border/40 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-border/50 bg-background p-6 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <h2 className="text-sm font-semibold">{card.title}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function MarketingCTA({
  cta,
  variant,
}: {
  cta: { label: string; href: string };
  variant?: "outline";
}) {
  const isRecruiterAuth = cta.href === "/recruiter/post-job";
  const isCandidateAuth = cta.href === "/onboarding/select-role";

  if (isRecruiterAuth || isCandidateAuth) {
    return (
      <AuthCTAButton
        mode="signup"
        roleIntent={isRecruiterAuth ? "recruiter" : "candidate"}
        continueTo={isRecruiterAuth ? cta.href : undefined}
        authenticatedHref={isRecruiterAuth ? cta.href : "/dashboard"}
        variant={variant}
        className="rounded-full"
      >
        {cta.label}
        {!variant && <ArrowRight className="ml-2 h-4 w-4" />}
      </AuthCTAButton>
    );
  }

  return (
    <Button variant={variant} className="rounded-full" asChild>
      <Link href={cta.href}>
        {cta.label}
        {!variant && <ArrowRight className="ml-2 h-4 w-4" />}
      </Link>
    </Button>
  );
}

export function LegalPage({
  title,
  description,
  sections,
}: {
  title: string;
  description: string;
  sections: Feature[];
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Legal
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-10 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-semibold">{section.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 border-t border-border/40 pt-5 text-xs text-muted-foreground">
          Placeholder legal copy for product evaluation. Review with counsel before production use.
        </p>
      </div>
    </div>
  );
}
