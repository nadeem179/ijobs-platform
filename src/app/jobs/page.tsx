import { JobFeed } from "@/components/jobs/job-feed";
import { BRAND } from "@/lib/branding";

export const metadata = {
  title: `Jobs - ${BRAND.appName}`,
  description: "Find your next role at the world's best companies.",
};

export default function JobsPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const query = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <JobFeed key={query} initialQuery={query} />
      </div>
    </div>
  );
}
