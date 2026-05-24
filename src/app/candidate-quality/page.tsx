import { MarketingPage } from "@/components/marketing/marketing-page";

export default function CandidateQualityPage() {
  return (
    <MarketingPage
      eyebrow="Candidate quality"
      title="Cleaner applicant pipelines start with better profile signals."
      description="Diplotix helps recruiters evaluate profile completion, verified skills, resume context, anti-spam signals, and ranked applicant fit."
      primaryCta={{ label: "Post a Job", href: "/recruiter/post-job" }}
      secondaryCta={{ label: "For Recruiters", href: "/for-recruiters" }}
      features={[
        { title: "Profile completion", text: "Complete profiles help recruiters understand role fit more quickly." },
        { title: "Verified skills", text: "Skills and resume context create stronger signals than generic applications." },
        { title: "Applicant ranking", text: "Ranking helps teams review higher-fit candidates before low-signal submissions." },
      ]}
      cards={[
        { title: "Anti-spam quality layer", text: "Marketplace quality improves when irrelevant inbound is reduced and candidate intent is clearer." },
        { title: "Resume parsing context", text: "Structured profile data supports faster review without changing dashboard data behavior." },
      ]}
    />
  );
}
