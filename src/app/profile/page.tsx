"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileExperience } from "@/components/profile/profile-experience";
import { ProfilePortfolio } from "@/components/profile/profile-portfolio";
import { ProfileLinks } from "@/components/profile/profile-links";
import { CandidateSectionEditor, type CandidateProfileSection } from "@/components/profile/candidate-section-editor";
import { ApplicationStatus } from "@/components/applications/application-status";
import { useApplications } from "@/hooks/use-applications";
import { useSavedJobs } from "@/hooks/use-saved-jobs";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import { loadCurrentProfile, type LoadedProfile } from "@/lib/profile/persistence";
import { normalizeExternalUrl } from "@/lib/profile/urls";
import { formatCompanyLocation } from "@/lib/recruiter/address-options";
import {
  formatRecruiterPhone,
  getRecruiterPhoneCountryDisplay,
} from "@/lib/recruiter/phone";
import type { Profile } from "@/types/profile";
import {
  ArrowRight,
  Briefcase,
  Building2,
  ExternalLink,
  Globe,
  Settings,
  Users,
} from "lucide-react";

const quickActions = [
  {
    label: "Browse Jobs",
    href: "/jobs",
    icon: Briefcase,
  },
];

export default function ProfileDashboard() {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<LoadedProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<CandidateProfileSection | null>(null);
  const { applications, loaded: applicationsLoaded } = useApplications();
  const { savedJobs, loaded: savedJobsLoaded } = useSavedJobs();
  const profile = profileData?.profile ?? null;
  const profileCompletion = useMemo(() => calculateProfileCompletion(profile), [profile]);
  const completionGroups = useMemo(() => {
    const groups = new Map<string, typeof profileCompletion.checks>();
    profileCompletion.checks.forEach((check) => {
      groups.set(check.group, [...(groups.get(check.group) ?? []), check]);
    });
    return Array.from(groups.entries());
  }, [profileCompletion.checks]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const data = await loadCurrentProfile();
      setProfileData(data);
    } catch (err) {
      console.error("[PROFILE] Load failed", err);
      setProfileData(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const timer = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isAuthenticated, isLoading, loadProfile]);

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState variant="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (role === "recruiter") {
    return <RecruiterProfile user={user} profileData={profileData} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold tracking-tight">Profile unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We could not load your profile data right now.
          </p>
          <Button className="mt-5 rounded-xl" asChild>
            <Link href="/profile/edit">Complete Profile</Link>
          </Button>
        </div>
      </div>
    );
  }

  const recentApps = applications.slice(0, 3);
  const recentSaved = savedJobs.slice(0, 3);
  const sidebarLoading = !applicationsLoaded || !savedJobsLoaded;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1fr_300px]">
          {/* Main */}
          <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <ProfileHeader profile={profile} />
              <Button size="sm" variant="outline" className="rounded-xl shrink-0" onClick={() => setActiveSection("image")}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Photo
              </Button>
            </div>

            <section className="rounded-xl border border-border/30 bg-background p-4">
              <SectionHeader title="Basic details" actionLabel="Edit" onEdit={() => setActiveSection("basic")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileDetail label="Email" value={profile.email} />
                <ProfileDetail label="Phone" value={profile.phone} />
                <ProfileDetail label="Location" value={profile.location} />
                <ProfileDetail label="Headline" value={profile.headline} />
              </div>
            </section>

            {/* About */}
            <section>
              <SectionHeader title="About" actionLabel={profile.about ? "Edit" : "Add"} onEdit={() => setActiveSection("about")} />
              <LinkifiedText text={profile.about || "Not set"} />
            </section>

            <section className="rounded-xl border border-border/30 bg-background p-4">
              <SectionHeader title="Resume" actionLabel={profile.resumeFile ? "Replace" : "Add"} onEdit={() => setActiveSection("resume")} />
              {profile.resumeFile ? (
                <a
                  href={profile.resumeFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground break-all"
                >
                  {profile.resumeFile}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">Not set</p>
              )}
            </section>

            <section className="rounded-xl border border-border/30 bg-background p-4">
              <SectionHeader title="Career preferences" actionLabel="Edit" onEdit={() => setActiveSection("career")} />
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileDetail label="Designation" value={profile.currentTitle || profile.headline} />
                <ProfileDetail label="Current company" value={profile.currentCompany} />
                <ProfileDetail label="Experience level" value={profile.experienceLevel} />
                <ProfileDetail label="Total experience" value={formatExperience(profile)} />
                <ProfileDetail label="Notice period" value={profile.noticePeriod} />
                <ProfileDetail label="Current salary" value={formatSalary(profile.currentSalaryCurrency, profile.currentSalaryAmount, profile.currentSalary)} />
                <ProfileDetail label="Expected salary" value={formatSalary(profile.expectedSalaryCurrency, profile.expectedSalaryAmount, profile.expectedSalary)} />
                <ProfileDetail label="Preferred locations" value={profile.preferredLocations?.join(", ")} />
                <ProfileDetail label="Work mode" value={profile.workModePreference} />
                <ProfileDetail label="Job type" value={profile.jobTypePreference} />
                <ProfileDetail label="Industry" value={profile.industry} />
                <ProfileDetail label="Functional area" value={profile.functionalArea} />
              </div>
            </section>

            <ChipSection title="Skills" items={profile.skills} onEdit={() => setActiveSection("skills")} />
            <ChipSection title="Tools" items={profile.tools || []} onEdit={() => setActiveSection("tools")} />
            <ChipSection title="Languages" items={profile.languages || []} onEdit={() => setActiveSection("languages")} />
            {profile.experience.length > 0 ? (
              <ProfileExperience experience={profile.experience} onEdit={() => setActiveSection("experience")} />
            ) : (
              <EmptyProfileSection title="Experience" onEdit={() => setActiveSection("experience")} />
            )}
            <ProfilePortfolio portfolio={profile.portfolio} onEdit={() => setActiveSection("projects")} />
            <ProfileLinks links={profile.links} onSaved={() => void loadProfile()} />

            {/* Education */}
            <section>
              <SectionHeader title="Education" actionLabel={profile.education.length > 0 ? "Edit" : "Add"} onEdit={() => setActiveSection("education")} />
              {profile.education.length > 0 ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">Not set</p>
              )}
            </section>

            {/* Certifications */}
            <section>
              <SectionHeader title="Certifications" actionLabel={profile.certifications.length > 0 ? "Edit" : "Add"} onEdit={() => setActiveSection("certifications")} />
              {profile.certifications.length > 0 ? (
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
              ) : (
                <p className="text-sm text-muted-foreground">Not set</p>
              )}
            </section>
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

            <div className="rounded-xl border border-border/30 bg-background p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Profile Completion</h3>
                <span className="text-xs font-medium text-muted-foreground">
                  {profileCompletion.percent}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted mb-4">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${profileCompletion.percent}%` }}
                />
              </div>
              <div className="space-y-4">
                {completionGroups.map(([group, checks]) => (
                  <div key={group}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {group}
                    </p>
                    <div className="space-y-1.5">
                      {checks.map((check) => (
                        <div key={check.label} className="flex items-center justify-between gap-3 text-xs">
                          <span
                            className={`inline-flex min-w-0 items-center gap-1.5 ${
                              check.done ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                check.done ? "bg-emerald-500" : "bg-muted-foreground/30"
                              }`}
                            />
                            <span className="truncate">{check.label}</span>
                          </span>
                          {!check.done && <span className="font-medium text-primary">+{check.points}%</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
                {sidebarLoading ? (
                  <p className="text-sm text-muted-foreground">Loading recent applications...</p>
                ) : recentApps.length > 0 ? (
                  recentApps.map((app) => (
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
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                )}
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
                {sidebarLoading ? (
                  <p className="text-sm text-muted-foreground">Loading saved jobs...</p>
                ) : recentSaved.length > 0 ? (
                  recentSaved.map((job) => (
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
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No saved jobs yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {activeSection && profileData && (
        <CandidateSectionEditor
          section={activeSection}
          data={profileData}
          onClose={() => setActiveSection(null)}
          onSaved={() => {
            setActiveSection(null);
            void loadProfile();
          }}
        />
      )}
    </div>
  );
}

function ProfileDetail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-medium">{value || "Not set"}</p>
    </div>
  );
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(\b(?:https?:\/\/|www\.)[^\s<]+|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<]*)?)/gi);
  return (
    <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
      {parts.map((part, index) => {
        const normalized = normalizeExternalUrl(part);
        if (!normalized) return <span key={index}>{part}</span>;
        return (
          <a key={index} href={normalized} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            {part}
          </a>
        );
      })}
    </p>
  );
}

function SectionHeader({ title, actionLabel, onEdit }: { title: string; actionLabel: string; onEdit: () => void }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={onEdit}>
        {actionLabel}
      </Button>
    </div>
  );
}

function ChipSection({ title, items, onEdit }: { title: string; items: string[]; onEdit: () => void }) {
  return (
    <section>
      <SectionHeader title={title} actionLabel={items.length > 0 ? "Edit" : "Add"} onEdit={onEdit} />
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not set</p>
      )}
    </section>
  );
}

function EmptyProfileSection({ title, onEdit }: { title: string; onEdit: () => void }) {
  return (
    <section>
      <SectionHeader title={title} actionLabel="Add" onEdit={onEdit} />
      <p className="text-sm text-muted-foreground">Not set</p>
    </section>
  );
}

function formatExperience(profile: Profile) {
  const parts = [];
  if (profile.totalExperienceYears) parts.push(`${profile.totalExperienceYears} years`);
  if (profile.totalExperienceMonths) parts.push(`${profile.totalExperienceMonths} months`);
  return parts.join(" ") || profile.totalExperience;
}

function formatSalary(currency?: string, amount?: string, fallback?: string) {
  if (currency && amount) return `${currency} ${amount}`;
  return fallback;
}

function RecruiterProfile({
  user,
  profileData,
}: {
  user: ReturnType<typeof useAuth>["user"];
  profileData: LoadedProfile | null;
}) {
  const recruiterProfile = profileData?.recruiterProfile;
  const profile = profileData?.profile;
  const recruiterName = recruiterProfile?.recruiter_full_name || profile?.name || user?.name || "Recruiter";
  const recruiterTitle = recruiterProfile?.recruiter_title || recruiterProfile?.hiring_title || "";
  const companyLocation =
    recruiterProfile?.company_location ||
    formatCompanyLocation({
      companyCountry: recruiterProfile?.company_country,
      companyStateOrRegion: recruiterProfile?.company_state_or_region,
      companyCity: recruiterProfile?.company_city,
      companyStreetAddress: recruiterProfile?.company_street_address,
      companyPostalCode: recruiterProfile?.company_postal_code,
    }) ||
    recruiterProfile?.location ||
    "";
  const recruiterPhoneCountry =
    recruiterProfile?.phone_country || profile?.phone_country || "";
  const recruiterPhoneCountryCode =
    recruiterProfile?.phone_country_code || profile?.phone_country_code || "";
  const recruiterPhoneNumber =
    recruiterProfile?.phone_number || profile?.phone_number || "";
  const recruiterPhoneSummary =
    recruiterPhoneCountryCode && recruiterPhoneNumber
      ? formatRecruiterPhone(recruiterPhoneCountryCode, recruiterPhoneNumber)
      : recruiterProfile?.phone || profile?.phone || "";
  const recruiterCompanyLogoUrl =
    recruiterProfile?.company_logo_url || profile?.company_logo_url || "";
  const companyDetails = [
    { label: "Company", value: recruiterProfile?.company_name },
    { label: "Website", value: recruiterProfile?.company_website },
    { label: "Industry", value: recruiterProfile?.industry },
    { label: "Company size", value: recruiterProfile?.company_size },
    { label: "Company location", value: companyLocation },
  ];
  const hiringDetails = [
    { label: "Recruiter title", value: recruiterTitle },
    { label: "Hiring model", value: recruiterProfile?.hiring_model },
    { label: "Remote policy", value: recruiterProfile?.remote_policy },
    { label: "Monthly hiring volume", value: recruiterProfile?.monthly_hiring_volume },
    { label: "Common salary range", value: recruiterProfile?.common_salary_range },
    { label: "Urgent hiring", value: recruiterProfile?.urgent_hiring ? "Yes" : "No" },
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
                {recruiterName} &middot; {profile?.email || user?.email}
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
                <Users className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Recruiter Identity</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileDetail label="Recruiter full name" value={recruiterName} />
                <ProfileDetail label="Email" value={profile?.email || user?.email} />
                <ProfileDetail label="Recruiter title" value={recruiterTitle} />
                <ProfileDetail
                  label="Phone country"
                  value={
                    recruiterPhoneCountry
                      ? getRecruiterPhoneCountryDisplay(recruiterPhoneCountry, recruiterPhoneCountryCode)
                      : "Not set"
                  }
                />
                <ProfileDetail label="Dialing code" value={recruiterPhoneCountryCode} />
                <ProfileDetail label="Phone number" value={recruiterPhoneNumber} />
                <ProfileDetail label="Phone" value={recruiterPhoneSummary} />
              </div>
            </section>

            <section className="rounded-xl border border-border/30 bg-background p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">Company Info</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {companyDetails.map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-sm font-medium">{item.value || "Not set"}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-1">Company description</p>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {recruiterProfile?.company_description || "Not set"}
                </p>
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Company logo</p>
                {recruiterCompanyLogoUrl ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border/30 bg-muted/20 p-3">
                    <img
                      src={recruiterCompanyLogoUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {recruiterProfile?.company_name || "Company logo"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {recruiterCompanyLogoUrl}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set</p>
                )}
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Structured address</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ProfileDetail label="Country" value={recruiterProfile?.company_country} />
                  <ProfileDetail label="State / region" value={recruiterProfile?.company_state_or_region} />
                  <ProfileDetail label="City" value={recruiterProfile?.company_city} />
                  <ProfileDetail label="Street address" value={recruiterProfile?.company_street_address} />
                  <ProfileDetail label="Postal code" value={recruiterProfile?.company_postal_code} />
                </div>
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
                    <p className="text-sm font-medium">{item.value || "Not set"}</p>
                  </div>
                ))}
              </div>
              <RecruiterChipList title="Hiring roles" items={recruiterProfile?.hiring_roles || []} />
              <RecruiterChipList title="Hiring locations" items={recruiterProfile?.hiring_locations || []} />
            </section>

            <section className="rounded-xl border border-border/30 bg-background p-5">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">AI Preferences</h2>
              </div>
              <RecruiterChipList title="Preferred experience levels" items={recruiterProfile?.preferred_experience_levels || []} />
              <RecruiterChipList title="Preferred skills" items={recruiterProfile?.preferred_skills || []} />
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-border/30 bg-background p-4">
              <div className="mb-4 flex items-center gap-3">
                {recruiterCompanyLogoUrl ? (
                  <img
                    src={recruiterCompanyLogoUrl}
                    alt=""
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-sm font-semibold text-primary">
                    {(recruiterProfile?.company_name || "iJ").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{recruiterProfile?.company_name || "Company not set"}</p>
                  <p className="truncate text-xs text-muted-foreground">{companyLocation || "Location not set"}</p>
                </div>
              </div>
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
                  href={recruiterProfile?.company_website || "#"}
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

function RecruiterChipList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span key={item} className="inline-flex items-center rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium">
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Not set</p>
      )}
    </div>
  );
}
