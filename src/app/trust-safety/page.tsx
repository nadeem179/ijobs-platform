import { MarketingPage } from "@/components/marketing/marketing-page";

export default function TrustSafetyPage() {
  return (
    <MarketingPage
      eyebrow="Trust & Safety"
      title="A hiring marketplace designed around verification."
      description="Diplotix reduces fake jobs, protects candidates, and improves recruiter quality through transparent marketplace signals."
      features={[
        { title: "Recruiter verification", text: "Public messaging emphasizes verified recruiters and accountable hiring teams." },
        { title: "Salary transparency", text: "Roles are positioned around clear compensation ranges before candidates apply." },
        { title: "Anti-spam systems", text: "Quality signals help reduce irrelevant applications and suspicious listing behavior." },
      ]}
      cards={[
        { title: "Fake-job prevention", text: "The marketplace is built to make authenticity visible and low-quality listings harder to trust." },
        { title: "Candidate protection", text: "Candidates get clearer context around salary, recruiter identity, and response expectations." },
      ]}
    />
  );
}
