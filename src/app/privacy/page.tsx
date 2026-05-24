import { LegalPage } from "@/components/marketing/marketing-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="A professional placeholder privacy policy for the public Diplotix website."
      sections={[
        { title: "Information we collect", text: "Diplotix may collect account, profile, resume, application, recruiter, and usage information needed to operate the hiring marketplace." },
        { title: "How information is used", text: "Information supports authentication, profile quality, job discovery, applications, recruiter review, platform safety, and product improvement." },
        { title: "Data sharing", text: "Candidate information is shared with recruiters when candidates apply or otherwise choose to engage. Diplotix does not present this placeholder as final legal advice." },
        { title: "Your choices", text: "Users should be able to manage profile and account information through product settings and contact support for privacy requests." },
      ]}
    />
  );
}
