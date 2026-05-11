import { Building2, Users, Briefcase } from "lucide-react";
import { Job } from "@/types/job";
import { jobs } from "@/data/jobs";

interface CompanyCardProps {
  job: Job;
}

export function CompanyCard({ job }: CompanyCardProps) {
  const activeJobsCount = jobs.filter(
    (j) => j.company === job.company
  ).length;

  return (
    <div className="rounded-2xl border border-border/40 bg-background p-5 space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        About the Company
      </h3>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/70 text-sm font-bold text-muted-foreground">
          {job.companyLogo}
        </div>
        <div>
          <p className="text-sm font-semibold">{job.company}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {job.companyIndustry}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {job.companyDescription}
      </p>

      <div className="flex items-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          {job.companySize}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          {activeJobsCount} active job{activeJobsCount !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}