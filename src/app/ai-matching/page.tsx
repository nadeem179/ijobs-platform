import { MarketingPage } from "@/components/marketing/marketing-page";

export default function AiMatchingPage() {
  return (
    <MarketingPage
      eyebrow="AI Matching"
      title="Match scores that make hiring easier to understand."
      description="Diplotix explains candidate-job fit through profile signals, skills, preferences, salary, location, and recruiter requirements."
      features={[
        { title: "Profile signals", text: "Completion, resume details, skills, and preferences contribute to stronger recommendations." },
        { title: "Role fit", text: "Candidates can evaluate whether a role fits before spending time on an application." },
        { title: "Recruiter fit", text: "Recruiters can review best-fit applicants earlier in the pipeline." },
      ]}
      cards={[
        { title: "Transparent inputs", text: "Match quality improves when candidates keep skills, location, salary, and experience details current." },
        { title: "Quality over volume", text: "The goal is fewer irrelevant applications and more thoughtful candidate-recruiter conversations." },
      ]}
    />
  );
}
