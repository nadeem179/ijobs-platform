"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileStrength } from "@/components/profile/profile-strength";
import { ProfileSkills } from "@/components/profile/profile-skills";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { ProfilePortfolio } from "@/components/profile/profile-portfolio";
import { ProfileLinks } from "@/components/profile/profile-links";
import { ApplicationStatus } from "@/components/applications/application-status";
import { mockProfile, mockApplications, mockSavedJobs } from "@/data/profile";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ExternalLink,
  Globe,
  Settings,
  Upload,
  Users,
} from "lucide-react";

const quickActions = [
  {
    label: "Edit Profile",
    href: "/profile/edit",
    icon: Settings,
  },
  {
    label: "Upload Resume",
    href: "/profile/edit",
    icon: Upload,
  },
  {
    label: "Browse Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
];

export default function ProfileDashboard() {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [profile] = useState(mockProfile);
  const recentApps = mockApplications.slice(0, 3);
  const recentSaved = mockSavedJobs.slice(0, 3);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState variant="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (role === "recruiter") {
    return <RecruiterProfile user={user} />;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main */}
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <ProfileHeader profile={profile} />
              <Button size="sm" variant="outline" className="rounded-xl shrink-0" asChild>
                <Link href="/profile/edit">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            {/* About */}
            <section>
              <h2 className="text-sm font-semibold mb-2">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {profile.about}
              </p>
            </section>

            <ProfileSkills skills={profile.skills} />
            <ProfileExperience experience={profile.experience} />
            <ProfilePortfolio portfolio={profile.portfolio} />
            <ProfileLinks links={profile.links} />

            {/* Education */}
            {profile.education.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-3">Education</h2>
                <div className="space-y-3">
                  {profile.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="rounded-xl border border-border/30 bg-background p-4"
                    >
                      <h3 className="text-sm font-medium">
                        {edu.institution}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {edu.startYear} — {edu.endYear ?? "Present"}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {profile.certifications.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold mb-3">
                  Certifications
                </h2>
                <div className="space-y-2">
                  {profile.certifications.map((cert) => (
                    <div
                      key={cert.id}
                      className="rounded-xl border border-border/30 bg-background p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium">{cert.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {cert.issuer} &middot; {cert.year}
                          </p>
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl border border-border/30 bg-background p-4">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-1.5">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.label}
                    <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Profile Strength */}
            <ProfileStrength profile={profile} />

            {/* Recent Applications */}
            <div className="rounded-xl border border-border/30 bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Applications</h3>
                <Link
                  href="/applications"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-[10px] font-bold text-muted-foreground">
                      {app.companyLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {app.jobTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {app.company}
                      </p>
                    </div>
                    <ApplicationStatus status={app.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Jobs Preview */}
            <div className="rounded-xl border border-border/30 bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Saved Jobs</h3>
                <Link
                  href="/saved-jobs"
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2.5">
                {recentSaved.map((job) => (
                  <div key={job.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-[10px] font-bold text-muted-foreground">
                      {job.companyLogo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {job.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.company} &middot; {job.salary}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecruiterProfile({ user }: { user: ReturnType<typeof useAuth>["user"] }) {
  const companyDetails = [
    { label: "Company", value: "iJobs Hiring" },
    { label: "Website", value: "https://ijobs.example.com" },
    { label: "Industry", value: "Technology" },
    { label: "Company size", value: "51-200 employees" },
  ];

  const hiringDetails = [
    { label: "Open roles", value: "8 active listings" },
    { label: "Hiring focus", value: "Design, Engineering, Product" },
    { label: "Response rate", value: "92%" },
    { label: "Verification", value: "Company profile verified" },
  ];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight mb-1">
                Company Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage recruiter identity, company details, and hiring settings.
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {user?.name} &middot; {user?.email}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="rounded-xl shrink-0" asChild>
            <Link href="/profile/edit">
              <Settings className="h-4 w-4 mr-2" />
              Edit Settings
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-border/30 bg-background p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Company Info</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {companyDetails.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border/30 bg-background p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Hiring Details</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {hiringDetails.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-border/30 bg-background p-4">
              <h3 className="text-sm font-semibold mb-3">Recruiter Settings</h3>
              <div className="space-y-1.5">
                <Link
                  href="/recruiter/jobs"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Briefcase className="h-4 w-4" />
                  Manage Jobs
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Link>
                <Link
                  href="/recruiter/candidates"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Candidate Pipeline
                  <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                </Link>
                <a
                  href="https://ijobs.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  Company Website
                  <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
