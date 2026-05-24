import { MarketingPage } from "@/components/marketing/marketing-page";

export default function CareersPage() {
  return (
    <MarketingPage
      eyebrow="Careers"
      title="Help build the future of trusted hiring."
      description="Diplotix is building a marketplace where candidates and recruiters can rely on verification, transparency, and quality signals."
      primaryCta={{ label: "Contact Us", href: "/contact" }}
      secondaryCta={{ label: "About Diplotix", href: "/about" }}
      features={[
        { title: "Mission-led product", text: "We are focused on fixing hiring quality through better marketplace design." },
        { title: "Trust-first systems", text: "Our work centers on candidate protection, recruiter accountability, and transparency." },
        { title: "Thoughtful growth", text: "We value simple, durable product decisions over noisy growth loops." },
      ]}
    />
  );
}
