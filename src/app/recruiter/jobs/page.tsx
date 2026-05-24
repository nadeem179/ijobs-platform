"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RecruiterHeader } from "@/components/recruiter/recruiter-header";
import { Badge } from "@/components/ui/badge";
import { RecruiterGuard } from "@/components/navigation/recruiter-guard";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { recruiterService } from "@/services";
import type { RecruiterJobItem } from "@/services";
import { ArrowLeft, Plus, MoreHorizontal, MapPin, Users } from "lucide-react";

const statusColors: Record<string, "success" | "secondary" | "outline" | "destructive"> = {
  active: "success",
  draft: "secondary",
  inactive: "secondary",
  paused: "outline",
  closed: "destructive",
  filled: "success",
};

export default function RecruiterJobsPage() {
  const [jobs, setJobs] = useState<RecruiterJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void recruiterService.getJobs().then((result) => {
      if (!mounted) return;
      setJobs(result.data ?? []);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RecruiterGuard>
      <div className="min-h-screen">

  <section className="border-b border-border/40 bg-muted/20">
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <RecruiterHeader />
    </div>
  </section>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back */}
          <Link
            href="/recruiter"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight mb-1">
                My Job Listings
              </h1>
              <p className="text-sm text-muted-foreground">
                {loading ? "Loading listings..." : `${jobs.length} total listings`}
              </p>
            </div>
            <Button size="sm" className="rounded-xl" asChild>
              <Link href="/recruiter/post-job">
                <Plus className="h-4 w-4 mr-1.5" />
                Post a Job
              </Link>
            </Button>
          </div>

          <div className="space-y-2.5">
            {!loading && jobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
                No job listings yet.
              </div>
            ) : jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-border/30 bg-background p-5 transition-all hover:border-border/60 hover:shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium">{job.title}</h3>
                      <Badge
                        variant={statusColors[job.status] || "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mb-2.5">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location || "Location not set"}
                      </span>
                      <span>{job.locationType || "Remote"}</span>
                      <span>
                        {job.salaryCurrency || "$"}
                        {((job.salaryMin ?? 0) / 1000).toFixed(0)}K &mdash; {job.salaryCurrency || "$"}
                        {((job.salaryMax ?? 0) / 1000).toFixed(0)}K/{job.salaryPeriod === "hour" ? "hr" : "yr"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job.applicants} applicants
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(job.skills ?? []).map((skill) => (
                        <SkillBadge key={skill}>{skill}</SkillBadge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl" asChild>
                      <Link href={`/recruiter/jobs/${job.id}/applicants`}>
                        View Applicants
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RecruiterGuard>
  );
}
