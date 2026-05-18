"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RecruiterHeader } from "@/components/recruiter/recruiter-header";
import { Badge } from "@/components/ui/badge";
import { RecruiterGuard } from "@/components/navigation/recruiter-guard";
import { mockCandidates } from "@/data/recruiter";
import { SkillBadge } from "@/components/jobs/skill-badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  MapPin,
} from "lucide-react";

const statusStyles: Record<string, string> = {
  new: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  reviewed: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  shortlisted:
    "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

export default function RecruiterCandidatesPage() {
  const [candidates, setCandidates] = useState(mockCandidates);

  const updateStatus = (id: string, status: "shortlisted" | "rejected") => {
    setCandidates(
      candidates.map((c) => (c.id === id ? { ...c, status } : c))
    );
  };

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

          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight mb-1">
              Candidates
            </h1>
            <p className="text-sm text-muted-foreground">
              {candidates.length} total applicants
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-sm font-medium text-primary">
                      {candidate.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium">{candidate.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {candidate.headline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {candidate.match}%
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {candidate.location}
                  </span>
                  <span>{candidate.experienceLevel}</span>
                  <span>{candidate.experience}y exp</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {candidate.skills.slice(0, 4).map((skill) => (
                    <SkillBadge key={skill}>{skill}</SkillBadge>
                  ))}
                  {candidate.skills.length > 4 && (
                    <SkillBadge>+{candidate.skills.length - 4}</SkillBadge>
                  )}
                </div>

                {/* Profile strength */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-1.5 rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500"
                      style={{ width: `${candidate.profileStrength}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {candidate.profileStrength}%
                  </span>
                </div>

                {/* Status + actions */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      statusStyles[candidate.status] || ""
                    }`}
                  >
                    {candidate.status.charAt(0).toUpperCase() +
                      candidate.status.slice(1)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {candidate.status !== "shortlisted" && (
                      <button
                        onClick={() => updateStatus(candidate.id, "shortlisted")}
                        className="rounded-md p-1.5 text-muted-foreground/50 hover:text-purple-500 transition-colors"
                        title="Shortlist"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {candidate.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus(candidate.id, "rejected")}
                        className="rounded-md p-1.5 text-muted-foreground/50 hover:text-red-500 transition-colors"
                        title="Reject"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* View profile */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-2 text-xs h-8 rounded-lg"
                  asChild
                >
                  <Link href="/profile">
                    View Full Profile
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RecruiterGuard>
  );
}