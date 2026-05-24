import { JobDetail } from "@/components/jobs/job-detail";
import { jobs } from "@/data/jobs";
import { BRAND } from "@/lib/branding";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const job = jobs.find((j) => j.id === id);
  if (!job) return { title: `Job Not Found - ${BRAND.appName}` };
  return {
    title: `${job.title} at ${job.company} - ${BRAND.appName}`,
    description: job.description,
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <JobDetail jobId={id} />;
}
