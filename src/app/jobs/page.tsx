import { JobFeed } from "@/components/jobs/job-feed";

export const metadata = {
  title: "Jobs — iJobs",
  description: "Find your next role at the world's best companies.",
};

export default function JobsPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <JobFeed />
      </div>
    </div>
  );
}