import { MarketingPage } from "@/components/marketing/marketing-page";

export default function AboutPage() {
  return (
    <MarketingPage
      eyebrow="About Diplotix"
      title="Fix hiring quality through verification, transparency, and AI matching."
      description="Diplotix exists to make hiring feel clearer and more accountable for both sides of the marketplace."
      features={[
        { title: "Verification first", text: "Recruiter and job quality signals are central to the marketplace experience." },
        { title: "Transparent decisions", text: "Salary, fit, and response context help candidates apply with confidence." },
        { title: "Better signal", text: "Recruiters get more useful applicant context and fewer low-quality submissions." },
      ]}
      cards={[
        { title: "Our mission", text: "Build a trusted hiring marketplace where serious candidates and real recruiters can find each other faster." },
        { title: "Our product philosophy", text: "Keep the interface simple, the incentives aligned, and the hiring signal visible." },
      ]}
    />
  );
}
