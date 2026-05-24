"use client";

import { useState } from "react";
import Link from "next/link";
import { ProtectedLayout } from "@/components/navigation/protected-layout";
import { ApplicationStatus } from "@/components/applications/application-status";
import { useApplications } from "@/hooks/use-applications";
import type { Application } from "@/types/profile";
import { CompanyProfileModal, type CompanyProfileSummary } from "@/components/jobs/company-profile-modal";
import { ArrowRight, MapPin, Clock, Briefcase, CheckCircle2, Circle, Building2 } from "lucide-react";

const tabs = [
  { id: "all", label: "All" },
  { id: "applied", label: "Applied" },
  { id: "shortlisted", label: "Shortlisted" },
  { id: "interviewing", label: "Interviewing" },
  { id: "rejected", label: "Rejected" },
  { id: "hired", label: "Hired" },
] as const;

const tabStatusMap: Record<string, Application["status"][]> = {
  applied: ["applied", "viewed", "resume_downloaded"],
  shortlisted: ["shortlisted"],
  interviewing: ["interviewing"],
  rejected: ["rejected"],
  hired: ["hired"],
};

function formatEventDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startToday - startDate) / 86400000);

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getApplicationEvents(app: Application) {
  const events = [
    { label: "Applied", date: app.createdAt, active: true, future: false },
    { label: "Application viewed", date: app.viewedAt, active: Boolean(app.viewedAt), future: true },
    {
      label: "Resume downloaded",
      date: app.resumeDownloadedAt,
      active: Boolean(app.resumeDownloadedAt),
      future: true,
    },
    {
      label: "Contacted by email/phone",
      date: app.contactedAt,
      active: Boolean(app.contactedAt),
      future: true,
    },
    {
      label: "Shortlisted",
      date: app.shortlistedAt,
      active: Boolean(app.shortlistedAt),
      future: true,
    },
    {
      label: "Rejected",
      date: app.rejectedAt,
      active: Boolean(app.rejectedAt),
      future: true,
    },
    {
      label: "Hired",
      date: app.hiredAt,
      active: Boolean(app.hiredAt),
      future: true,
    },
  ];

  return events;
}

function getCompanySummary(app: Application): CompanyProfileSummary {
  return {
    name: app.company,
    logo: app.companyLogo,
    industry: app.companyIndustry,
    size: app.companySize,
    description: app.companyDescription,
    recruiterId: app.recruiterId,
  };
}

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState<CompanyProfileSummary | null>(null);
  const { applications } = useApplications();
  const displayApplications: Array<Application & { demo?: boolean }> = applications;

  const filtered =
    activeTab === "all"
      ? displayApplications
      : displayApplications.filter((a) =>
          (tabStatusMap[activeTab] ?? [activeTab as Application["status"]]).includes(a.status)
        );

  return (
    <ProtectedLayout allowedRoles={["candidate"]}>
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
                displayApplications.filter((a) =>
                  (tabStatusMap[tab.id] ?? [tab.id as Application["status"]]).includes(a.status)
                ).length > 0 && (
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    (
                    {
                      displayApplications.filter((a) =>
                        (tabStatusMap[tab.id] ?? [tab.id as Application["status"]]).includes(a.status)
                      ).length
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
            {filtered.map((app) => {
              const events = getApplicationEvents(app);

              return (
              <article
                key={app.id}
                className="rounded-xl border border-border/30 bg-background p-4 transition-all hover:border-border/60 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-xs font-bold text-muted-foreground">
                    {app.companyLogo}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                      <Link href={`/jobs/${app.jobId}`} className="text-sm font-medium hover:text-primary">
                        {app.jobTitle}
                      </Link>
                      <ApplicationStatus status={app.status} />
                      {app.demo && (
                        <span className="w-fit rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Demo
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCompany(getCompanySummary(app))}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Building2 className="h-3 w-3" />
                      {app.company}
                    </button>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground/70">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {app.location}
                        {app.locationType ? ` (${app.locationType})` : ""}
                      </span>
                      <span>{app.salary}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Applied {app.appliedAt}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {events.map((event) => (
                        <div
                          key={event.label}
                          className={`rounded-xl border px-3 py-2 text-[11px] ${
                            event.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-border/30 bg-muted/20 text-muted-foreground/70"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {event.active ? (
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className="h-3 w-3 shrink-0" />
                            )}
                            <span className="font-medium">{event.label}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground/70">
                            {formatEventDate(event.date) || "Not yet"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link href={`/jobs/${app.jobId}`} aria-label={`Open ${app.jobTitle}`}>
                    <ArrowRight className="mt-3 h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
    <CompanyProfileModal
      company={selectedCompany}
      isOpen={Boolean(selectedCompany)}
      onClose={() => setSelectedCompany(null)}
    />
    </ProtectedLayout>
  );
}
