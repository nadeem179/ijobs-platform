"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtectedLayout } from "@/components/navigation/protected-layout";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import {
  Bookmark,
  ArrowRight,
  MapPin,
  Clock,
  Trash2,
} from "lucide-react";

export default function SavedJobsPage() {
  const { savedJobs, toggleSavedJob } = useSavedJobs();

  return (
    <ProtectedLayout allowedRoles={["candidate"]}>
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold tracking-tight">
              Saved Jobs
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {savedJobs.length} job{savedJobs.length !== 1 ? "s" : ""} saved
            for later.
          </p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No saved jobs yet.
            </p>
            <Button size="sm" className="rounded-xl" asChild>
              <Link href="/jobs">
                Browse Jobs
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5 max-w-2xl">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-start gap-4 rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-xs font-bold text-muted-foreground">
                  {job.companyLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium">{job.title}</h3>
                    <button
                      onClick={() => void toggleSavedJob(job.jobId)}
                      className="text-muted-foreground/40 hover:text-red-500 transition-colors"
                      aria-label="Remove saved job"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.company}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground/70">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                    <span>{job.salary}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Saved {job.savedAt}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" className="text-xs h-8 px-4 rounded-xl" asChild>
                    <Link href={`/jobs/${job.jobId}`}>
                      Apply
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </ProtectedLayout>
  );
}
