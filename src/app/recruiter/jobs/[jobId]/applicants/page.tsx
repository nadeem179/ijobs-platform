"use client";

import { useParams } from "next/navigation";
import { RecruiterApplicantsPage } from "@/components/recruiter/applicants-page";

export default function RecruiterJobApplicantsPage() {
  const params = useParams<{ jobId: string }>();

  return (
    <RecruiterApplicantsPage
      jobId={params.jobId}
      backHref="/recruiter/jobs"
      emptyMessage="No applicants yet for this job."
      showHeader={false}
      showFilters={false}
      showJobContext
    />
  );
}
