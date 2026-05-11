import { ShieldCheck, Clock, MessageSquare, Users, Building2, AlertTriangle } from "lucide-react";
import { Job } from "@/types/job";

interface TrustPanelProps {
  job: Job;
}

export function TrustPanel({ job }: TrustPanelProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background p-5 space-y-5">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Trust Signals
      </h3>

      {/* Verified recruiter */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">
            {job.verifiedRecruiter ? "Verified Recruiter" : "Unverified"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {job.verifiedRecruiter
              ? "Identity and company affiliation confirmed"
              : "Recruiter identity not yet verified"}
          </p>
        </div>
      </div>

      {/* Response rate */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{job.responseRate}% Response Rate</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {job.responseRate >= 80
              ? "Recruiter typically responds within 24 hours"
              : "Response times may vary"}
          </p>
        </div>
      </div>

      {/* Active status */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <Clock className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Hiring Status</p>
            {job.activeHiring && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {job.activeHiring
              ? "Recruiter is actively reviewing applications"
              : "Position may be filling soon"}
          </p>
        </div>
      </div>

      {/* Salary verified */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Salary Range Verified</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Salary data confirmed by company and cross-referenced with industry standards
          </p>
        </div>
      </div>

      {/* Company size */}
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/8">
          <Building2 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{job.companySize}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{job.companyIndustry}</p>
        </div>
      </div>

      {/* Scam protection */}
      <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-3.5">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
              Safety Reminder
            </p>
            <p className="text-[11px] text-amber-700/70 dark:text-amber-400/70 mt-1 leading-relaxed">
              iJobs will never ask for payment or sensitive personal
              information during the application process.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}