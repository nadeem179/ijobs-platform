"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ApplicationStatus } from "@/components/applications/application-status";
import { mockApplications } from "@/data/profile";
import { ArrowRight, MapPin, Clock, Briefcase } from "lucide-react";

const tabs = [
  { id: "all", label: "All" },
  { id: "applied", label: "Applied" },
  { id: "reviewing", label: "Reviewing" },
  { id: "interview", label: "Interview" },
  { id: "rejected", label: "Rejected" },
  { id: "hired", label: "Hired" },
] as const;

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? mockApplications
      : mockApplications.filter((a) => a.status === activeTab);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            Applications
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage your job applications.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 border-b border-border/30 pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.id !== "all" &&
                mockApplications.filter((a) => a.status === tab.id).length >
                  0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    (
                    {
                      mockApplications.filter((a) => a.status === tab.id)
                        .length
                    }
                    )
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No applications in this status.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((app) => (
              <Link
                key={app.id}
                href={`/jobs/${app.jobId}`}
                className="flex items-start gap-4 rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-xs font-bold text-muted-foreground">
                  {app.companyLogo}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 mb-1">
                    <h3 className="text-sm font-medium">{app.jobTitle}</h3>
                    <ApplicationStatus status={app.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {app.company}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5 text-xs text-muted-foreground/70">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {app.location}
                    </span>
                    <span>{app.salary}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Applied {app.appliedAt}
                    </span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-3" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}