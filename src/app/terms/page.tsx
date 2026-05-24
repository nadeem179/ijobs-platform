import { LegalPage } from "@/components/marketing/marketing-page";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="Basic placeholder terms for the public Diplotix website. Final terms should be reviewed before production launch."
      sections={[
        { title: "Platform use", text: "Users agree to provide accurate information and use Diplotix for legitimate hiring and job search purposes." },
        { title: "Job listings", text: "Recruiters are expected to post truthful roles with accurate salary, company, and hiring process information." },
        { title: "Applications", text: "Candidates authorize relevant application information to be shared with recruiters when they apply to a role." },
        { title: "Prohibited activity", text: "Spam, impersonation, fraudulent listings, scraping, and misuse of candidate or recruiter information are not permitted." },
      ]}
    />
  );
}
