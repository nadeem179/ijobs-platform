import { MarketingPage } from "@/components/marketing/marketing-page";

export default function PressPage() {
  return (
    <MarketingPage
      eyebrow="Press"
      title="Diplotix is building trusted hiring infrastructure."
      description="Company boilerplate: Diplotix is an AI-assisted hiring marketplace focused on verified jobs, verified recruiters, salary transparency, and higher-quality applications."
      primaryCta={{ label: "Contact Press", href: "/contact" }}
      secondaryCta={{ label: "About Diplotix", href: "/about" }}
      features={[
        { title: "Company focus", text: "Trusted hiring marketplace for candidates and recruiters." },
        { title: "Product pillars", text: "Verification, transparency, AI matching, and candidate quality signals." },
        { title: "Media inquiries", text: "Use the contact page for press questions, interviews, and partnership requests." },
      ]}
    />
  );
}
