"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecruiterGuard } from "@/components/navigation/recruiter-guard";
import { RecruiterHeader } from "@/components/recruiter/recruiter-header";
import { mockStats, mockRecruiterJobs, mockCandidates } from "@/data/recruiter";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  TrendingUp,
  Users,
  Clock,
  Plus,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react";

const stats = [
  {
    label: "Active Listings",
    value: mockStats.activeListings,
    change: "+2 this week",
    icon: BriefcaseIcon,
  },
  {
    label: "Total Applicants",
    value: mockStats.totalApplicants,
    change: "+28% vs last month",
    icon: Users,
  },
  {
    label: "Interviews Scheduled",
    value: mockStats.interviewsScheduled,
    change: "5 this week",
    icon: Clock,
  },
  {
    label: "Profile Views",
    value: mockStats.profileViews,
    change: "+12% vs last month",
    icon: Eye,
  },
];

const activeJobs = mockRecruiterJobs.filter((j) => j.status === "active");
const recentCandidates = mockCandidates.slice(0, 4);

function BriefcaseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

export default function RecruiterDashboard() {
  return (
    <RecruiterGuard>
      <div className="min-h-screen">
        {/* Dashboard Header */}
        <section className="border-b border-border/40 bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <RecruiterHeader />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border/40 bg-background p-5"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">
                      {stat.label}
                    </span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.change}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Active Listings */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Active Listings</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/recruiter/jobs">View All</Link>
                </Button>
              </div>
              <div className="space-y-2">
                {activeJobs.slice(0, 3).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-border/40 bg-background p-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium text-sm">{job.title}</h3>
                        <Badge
                          variant="success"
                          className="text-[10px] px-1.5 py-0"
                        >
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {job.applicants} applicants ({job.newApplicants} new) &middot;{" "}
                        {job.postedAt}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" asChild>
                      <Link href="/recruiter/jobs">
                        <MoreHorizontal className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl text-xs"
                  asChild
                >
                  <Link href="/recruiter/post-job">
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    Post a New Job
                  </Link>
                </Button>
              </div>
            </section>

            {/* Recent Applicants */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Recent Applicants</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/recruiter/candidates">View All</Link>
                </Button>
              </div>
              <div className="space-y-2">
                {recentCandidates.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href="/recruiter/candidates"
                    className="flex items-center gap-4 rounded-xl border border-border/40 bg-background p-4 transition-all hover:border-border/60"
                  >
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-primary">
                        {candidate.avatarInitials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm">{candidate.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {candidate.headline} &middot; {candidate.experience}y exp
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {candidate.match}%
                        </span>
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {candidate.appliedAt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </RecruiterGuard>
  );
}