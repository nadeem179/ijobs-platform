import { JobFeed } from "@/components/jobs/job-feed";
import { BRAND } from "@/lib/branding";

export const metadata = {
  title: `Discover Jobs - ${BRAND.appName}`,
  description: "Find verified jobs from real recruiters.",
};

export default function DiscoverJobsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <JobFeed key={query} initialQuery={query} />
      </div>
    </div>
  );
}
