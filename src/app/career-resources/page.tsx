import { MarketingPage } from "@/components/marketing/marketing-page";

export default function CareerResourcesPage() {
  return (
    <MarketingPage
      eyebrow="Career resources"
      title="Practical guidance for serious job seekers."
      description="Resources for improving resumes, profile quality, salary conversations, and smarter applications."
      features={[
        { title: "Resume readiness", text: "Build a resume and profile that make your strongest signals easy to scan." },
        { title: "Salary transparency", text: "Learn how to evaluate ranges and align opportunities with expectations." },
        { title: "Application quality", text: "Apply selectively with stronger fit and clearer recruiter context." },
      ]}
      cards={[
        { title: "How to strengthen your profile", text: "Focus on completion, verified skills, preferences, and recent work examples." },
        { title: "How to use match scores", text: "Treat match scores as a decision aid, then read role details carefully." },
      ]}
    />
  );
}
