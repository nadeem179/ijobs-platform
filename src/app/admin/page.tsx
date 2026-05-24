"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Ban,
  Briefcase,
  CheckCircle2,
  FileWarning,
  History,
  ShieldCheck,
  Users,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/guards/protected-route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { jobs } from "@/data/jobs";
import { mockCandidates, mockRecruiterJobs } from "@/data/recruiter";

type ModerationStatus = "active" | "inactive" | "fake_closed";

interface AdminJob {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAt: string;
  verifiedRecruiter: boolean;
  status: ModerationStatus;
}

interface AdminActionLog {
  id: string;
  label: string;
  detail: string;
}

const initialAdminJobs: AdminJob[] = jobs.map((job) => ({
  id: job.id,
  title: job.title,
  company: job.company,
  location: job.location,
  postedAt: job.postedAt,
  verifiedRecruiter: job.verifiedRecruiter,
  status: job.activeHiring ? "active" : "inactive",
}));

const statusLabel: Record<ModerationStatus, string> = {
  active: "Active",
  inactive: "Inactive",
  fake_closed: "Closed as fake",
};

const statusVariant: Record<
  ModerationStatus,
  "success" | "secondary" | "destructive"
> = {
  active: "success",
  inactive: "secondary",
  fake_closed: "destructive",
};

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminModerationArea />
    </ProtectedRoute>
  );
}

function AdminModerationArea() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [adminJobs, setAdminJobs] = useState(initialAdminJobs);
  const [actionLog, setActionLog] = useState<AdminActionLog[]>([
    {
      id: "placeholder",
      label: "Action log placeholder",
      detail: "Moderation events will be stored here when admin APIs are connected.",
    },
  ]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const activeJobs = adminJobs.filter((job) => job.status === "active").length;
  const inactiveJobs = adminJobs.filter((job) => job.status === "inactive").length;
  const fakeClosedJobs = adminJobs.filter(
    (job) => job.status === "fake_closed"
  ).length;

  const recruiters = useMemo(
    () =>
      Array.from(new Set(mockRecruiterJobs.map((job) => job.company))).map(
        (company, index) => ({
          id: `recruiter-${index + 1}`,
          name: `${company} Recruiting`,
          email: `recruiting-${company.toLowerCase()}@example.com`,
          listings: mockRecruiterJobs.filter((job) => job.company === company).length,
        })
      ),
    []
  );

  function recordAction(label: string, detail: string) {
    setActionLog((current) => [
      {
        id: `${Date.now()}`,
        label,
        detail,
      },
      ...current.filter((item) => item.id !== "placeholder"),
    ]);
  }

  function updateJobStatus(jobId: string, status: ModerationStatus) {
    const job = adminJobs.find((item) => item.id === jobId);
    if (!job) return;

    setAdminJobs((current) =>
      current.map((item) => (item.id === jobId ? { ...item, status } : item))
    );
    recordAction(statusLabel[status], `${job.title} at ${job.company}`);
  }

  return (
    <div className="min-h-screen">
      <section className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border/50 bg-background px-3 py-1 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected route placeholder
              </div>
              <h1 className="text-page-title">Admin moderation</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Basic MVP controls for job and account review. Admin role checks can
                replace this placeholder guard when roles are added.
              </p>
            </div>
            <div className="rounded-xl border border-border/30 bg-background px-4 py-3 text-sm">
              <p className="font-medium">{user?.name ?? "Admin user"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {user?.email ?? "Signed-in session required"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminMetric
            icon={Briefcase}
            label="Total jobs"
            value={adminJobs.length}
            helper={`${activeJobs} active listings`}
          />
          <AdminMetric
            icon={Ban}
            label="Inactive jobs"
            value={inactiveJobs}
            helper="Marked inactive locally"
          />
          <AdminMetric
            icon={FileWarning}
            label="Fake jobs closed"
            value={fakeClosedJobs}
            helper="Placeholder moderation action"
          />
          <AdminMetric
            icon={Users}
            label="Users / recruiters"
            value={mockCandidates.length + recruiters.length}
            helper={`${recruiters.length} recruiter accounts`}
          />
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <main className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-section-title">Jobs</h2>
                <p className="text-xs text-muted-foreground">
                  Local state only for MVP review
                </p>
              </div>
              <div className="space-y-2.5">
                {adminJobs.map((job) => (
                  <div key={job.id} className="card-interactive">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-medium">{job.title}</h3>
                          <Badge
                            variant={statusVariant[job.status]}
                            className="px-1.5 py-0 text-[10px]"
                          >
                            {statusLabel[job.status]}
                          </Badge>
                          {job.verifiedRecruiter ? (
                            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                              Verified recruiter
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {job.company} &middot; {job.location} &middot; {job.postedAt}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-xl"
                          disabled={job.status === "inactive"}
                          onClick={() => updateJobStatus(job.id, "inactive")}
                        >
                          Mark inactive
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="rounded-xl"
                          disabled={job.status === "fake_closed"}
                          onClick={() => updateJobStatus(job.id, "fake_closed")}
                        >
                          Close fake job
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-section-title">Users and recruiters</h2>
                <p className="text-xs text-muted-foreground">Read-only MVP list</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {mockCandidates.slice(0, 4).map((candidate) => (
                  <AccountRow
                    key={candidate.id}
                    initials={candidate.avatarInitials}
                    name={candidate.name}
                    meta={candidate.headline}
                    badge="Candidate"
                  />
                ))}
                {recruiters.map((recruiter) => (
                  <AccountRow
                    key={recruiter.id}
                    initials="R"
                    name={recruiter.name}
                    meta={`${recruiter.email} · ${recruiter.listings} listings`}
                    badge="Recruiter"
                  />
                ))}
              </div>
            </section>
          </main>

          <aside className="space-y-8">
            <section>
              <div className="mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-section-title">Reported jobs</h2>
              </div>
              <div className="rounded-xl border border-dashed border-border/60 bg-background p-5">
                <p className="text-sm font-medium">Placeholder queue</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Reported jobs will appear here after reporting flows are connected.
                </p>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-section-title">Admin action log</h2>
              </div>
              <div className="card-base space-y-3">
                {actionLog.map((item) => (
                  <div key={item.id} className="rounded-lg bg-muted/40 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium">{item.label}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

interface AdminMetricProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  helper: string;
}

function AdminMetric({ icon: Icon, label, value, helper }: AdminMetricProps) {
  return (
    <section className="card-base">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold tracking-tight">{value.toLocaleString()}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </section>
  );
}

interface AccountRowProps {
  initials: string;
  name: string;
  meta: string;
  badge: "Candidate" | "Recruiter";
}

function AccountRow({ initials, name, meta, badge }: AccountRowProps) {
  return (
    <div className="card-base flex items-center gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-sm font-medium text-primary">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{name}</h3>
          <Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-[10px]">
            {badge}
          </Badge>
        </div>
        <p className="truncate text-xs text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}
