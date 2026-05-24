"use client";

import { Briefcase, Building2, ShieldOff, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { jobs } from "@/data/jobs";
import { useBlockedCompanies } from "@/hooks/use-blocked-companies";
import { useToast } from "@/components/ui/toast";

export type CompanyProfileSummary = {
  name: string;
  logo?: string;
  industry?: string;
  size?: string;
  description?: string;
  activeJobs?: number;
  recruiterId?: string | null;
};

export function CompanyProfileModal({
  company,
  isOpen,
  onClose,
}: {
  company: CompanyProfileSummary | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const { blockCompany, blockedCompanies, isCompanyBlocked, savingIds, unblockCompany } = useBlockedCompanies();

  if (!isOpen || !company) return null;

  const fallbackActiveJobs = jobs.filter((job) => job.company === company.name && job.status !== "closed").length;
  const activeJobs = company.activeJobs ?? fallbackActiveJobs;
  const blockedCompany = blockedCompanies.find(
    (item) => item.companyName.toLowerCase() === company.name.toLowerCase()
  );
  const isBlocked = isCompanyBlocked(company.name);
  const saving = savingIds.has(company.name) || Boolean(blockedCompany && savingIds.has(blockedCompany.id));

  const handleBlockToggle = async () => {
    const result =
      isBlocked && blockedCompany
        ? await unblockCompany(blockedCompany.id)
        : await blockCompany(company.name, company.recruiterId);

    if (result.error) {
      showToast(result.error, "error");
      return;
    }

    showToast(isBlocked ? "Company unblocked." : "Company blocked.", "success");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-lg rounded-2xl border border-border/40 bg-background shadow-xl">
        <div className="flex items-center justify-between border-b border-border/30 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/70 text-sm font-bold text-muted-foreground">
              {company.logo || company.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-semibold">{company.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{company.industry || "Industry not set"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close company profile"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <CompanyFact icon={Building2} label="Industry" value={company.industry || "Not set"} />
            <CompanyFact icon={Users} label="Size" value={company.size || "Not set"} />
            <CompanyFact icon={Briefcase} label="Active jobs" value={String(activeJobs)} />
          </div>

          <div>
            <h3 className="text-sm font-semibold">About company</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {company.description || "No company description has been added yet."}
            </p>
          </div>

          <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{isBlocked ? "Company is blocked" : "Block this company"}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Blocking helps hide your candidate profile from this company where supported and keeps them in your
                  blocked companies list.
                </p>
              </div>
            </div>
            <Button
              variant={isBlocked ? "outline" : "default"}
              size="sm"
              className="mt-4 rounded-xl"
              onClick={() => void handleBlockToggle()}
              disabled={saving}
            >
              {saving ? "Saving..." : isBlocked ? "Unblock company" : "Block company"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompanyFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border/30 bg-background p-3">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <p className="mt-2 text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-xs font-medium">{value}</p>
    </div>
  );
}
