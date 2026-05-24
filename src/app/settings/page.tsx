"use client";

import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Bell,
  CircleHelp,
  Lock,
  Mail,
  MapPin,
  Shield,
  ShieldOff,
  Trash2,
  UserCog,
} from "lucide-react";
import { ProtectedLayout } from "@/components/navigation/protected-layout";
import { MultiSelectCombobox, CurrencySelect } from "@/components/profile/onboarding-controls";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { useToast } from "@/components/ui/toast";
import { useBlockedCompanies } from "@/hooks/use-blocked-companies";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  getJobSearchStatusPreset,
  loadCandidateSettingsPageData,
  saveCandidatePhone,
  saveCandidatePreferences,
  saveCandidateSettings,
  type CandidateSettings,
  type JobSearchStatus,
} from "@/lib/settings/persistence";
import {
  cities,
  industries,
  jobTypeOptions,
  workModeOptions,
} from "@/lib/profile/options";

type SettingsTab = "communication" | "account" | "preferences" | "blocked";

type CompanySuggestion = {
  name: string;
  recruiterId?: string | null;
};

const tabs: Array<{ id: SettingsTab; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "communication", label: "Communication and Privacy", icon: Bell },
  { id: "account", label: "Account", icon: UserCog },
  { id: "preferences", label: "Job Preferences", icon: MapPin },
  { id: "blocked", label: "Block Companies", icon: ShieldOff },
];

const statusOptions: Array<{
  value: JobSearchStatus;
  label: string;
  description: string;
}> = [
  {
    value: "immediately_looking",
    label: "Immediately looking for a job",
    description: "Keep recommendations frequent and stay visible to recruiters.",
  },
  {
    value: "open_to_opportunities",
    label: "Open to opportunities",
    description: "Stay discoverable while dialing recommendations back a bit.",
  },
  {
    value: "not_looking",
    label: "Not looking right now",
    description: "Reduce recruiter visibility and pause most outreach.",
  },
];

const experienceOptions = ["Intern", "Fresher", "Junior", "Mid", "Senior", "Lead", "Manager", "Director"];

export default function CandidateSettingsPage() {
  const { showToast } = useToast();
  const { blockedCompanies, loaded: blockedLoaded, savingIds, blockCompany, unblockCompany } = useBlockedCompanies();
  const [activeTab, setActiveTab] = useState<SettingsTab>("communication");
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<SettingsTab | null>(null);
  const [settings, setSettings] = useState<CandidateSettings | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [expectedSalary, setExpectedSalary] = useState("");
  const [salaryCurrency, setSalaryCurrency] = useState("INR");
  const [workMode, setWorkMode] = useState<string[]>([]);
  const [jobType, setJobType] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("");
  const [industry, setIndustry] = useState("");
  const [functionalArea, setFunctionalArea] = useState("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [companySuggestions, setCompanySuggestions] = useState<CompanySuggestion[]>([]);
  const [companyQuery, setCompanyQuery] = useState("");
  const [modalState, setModalState] = useState<null | "deactivate" | "delete">(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void (async () => {
        try {
          const [{ profileData, settings }, authResult] = await Promise.all([
            loadCandidateSettingsPageData(),
            getSupabaseClient()?.auth.getUser(),
          ]);

          const profile = profileData?.profile;
          if (profile) {
            setEmailAddress(profile.email);
            setMobileNumber(profile.phone || "");
            setPreferredLocations(profile.preferredLocations || []);
            setExpectedSalary(profile.expectedSalaryAmount || profile.expectedSalary || "");
            setSalaryCurrency(profile.expectedSalaryCurrency || "INR");
            setWorkMode(
              profile.workModePreference
                ? profile.workModePreference.split(",").map((item) => item.trim()).filter(Boolean)
                : []
            );
            setJobType(
              profile.jobTypePreference
                ? profile.jobTypePreference.split(",").map((item) => item.trim()).filter(Boolean)
                : []
            );
            setExperienceLevel(profile.experienceLevel || "");
            setIndustry(profile.industry || "");
            setFunctionalArea(profile.functionalArea || "");
          }

          setSettings(settings);
          setAuthUser(authResult?.data.user ?? null);
        } catch (error) {
          console.error("[SETTINGS] Load failed", error);
          showToast(error instanceof Error ? error.message : "We could not load your settings.", "error");
        } finally {
          setLoading(false);
        }
      })();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [showToast]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const timer = window.setTimeout(() => {
      void supabase
        .from("jobs")
        .select("company,company_name,recruiter_id")
        .eq("status", "active")
        .limit(100)
        .then(({ data, error }) => {
          if (error || !data) return;

          const uniqueCompanies = new Map<string, CompanySuggestion>();
          for (const row of data as Array<Record<string, unknown>>) {
            const name = String(row.company_name || row.company || "").trim();
            if (!name) continue;
            const key = name.toLowerCase();
            if (!uniqueCompanies.has(key)) {
              uniqueCompanies.set(key, {
                name,
                recruiterId: typeof row.recruiter_id === "string" ? row.recruiter_id : null,
              });
            }
          }
          setCompanySuggestions(Array.from(uniqueCompanies.values()).sort((left, right) => left.name.localeCompare(right.name)));
        });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const supportsPasswordReset = useMemo(
    () => authUser?.identities?.some((identity) => identity.provider === "email") ?? false,
    [authUser]
  );

  const filteredCompanySuggestions = useMemo(() => {
    const blockedNames = new Set(blockedCompanies.map((item) => item.companyName.toLowerCase()));
    return companySuggestions
      .filter((company) => !blockedNames.has(company.name.toLowerCase()))
      .filter((company) => company.name.toLowerCase().includes(companyQuery.trim().toLowerCase()))
      .slice(0, 6);
  }, [blockedCompanies, companyQuery, companySuggestions]);

  const saveCommunicationSettings = async () => {
    if (!settings) return;
    setSavingSection("communication");
    try {
      await saveCandidateSettings(settings);
      showToast("Communication and privacy settings saved.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We could not save your settings.", "error");
    } finally {
      setSavingSection(null);
    }
  };

  const saveAccountSettings = async () => {
    setSavingSection("account");
    try {
      await saveCandidatePhone(mobileNumber);
      showToast("Mobile number updated.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We could not update your mobile number.", "error");
    } finally {
      setSavingSection(null);
    }
  };

  const savePreferences = async () => {
    setSavingSection("preferences");
    try {
      await saveCandidatePreferences({
        preferredLocations,
        expectedSalaryAmount: expectedSalary,
        expectedSalaryCurrency: salaryCurrency,
        expectedSalary: expectedSalary ? `${salaryCurrency} ${expectedSalary}` : "",
        workModePreference: workMode,
        jobTypePreference: jobType,
        experienceLevel,
        industry,
        industries: industry ? [industry] : [],
        functionalArea,
      });
      showToast("Job preferences saved.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We could not save your job preferences.", "error");
    } finally {
      setSavingSection(null);
    }
  };

  const sendPasswordReset = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !emailAddress) return;
    if (!supportsPasswordReset) {
      showToast("Password change is available for email login accounts.", "info");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailAddress, {
        redirectTo: `${window.location.origin}/auth/home`,
      });
      if (error) throw error;
      showToast("Password reset email sent.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We could not send the reset email.", "error");
    }
  };

  const handleStatusChange = (status: JobSearchStatus) => {
    if (!settings) return;
    const preset = getJobSearchStatusPreset(status);
    setSettings({
      ...settings,
      jobSearchStatus: status,
      ...preset,
    });
  };

  const confirmDeactivate = async () => {
    if (!settings) return;
    try {
      const nextSettings = {
        ...settings,
        accountStatus: "deactivated" as const,
        profileVisibleToRecruiters: false,
      };
      await saveCandidateSettings(nextSettings);
      setSettings(nextSettings);
      showToast("Your account is now deactivated.", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "We could not deactivate your account.", "error");
    } finally {
      setModalState(null);
    }
  };

  const confirmDelete = () => {
    setModalState(null);
    showToast("Delete account is not fully automated yet. Please contact support to complete deletion safely.", "info");
  };

  const addBlockedCompany = async (suggestion?: CompanySuggestion) => {
    const name = (suggestion?.name || companyQuery).trim();
    if (!name) return;

    const result = await blockCompany(name, suggestion?.recruiterId);
    if (result.error) {
      showToast(result.error, "error");
      return;
    }

    setCompanyQuery("");
    showToast("Company blocked.", "success");
  };

  if (loading || !settings) {
    return (
      <ProtectedLayout allowedRoles={["candidate"]}>
        <div className="min-h-screen">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <LoadingState variant="spinner" />
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={["candidate"]}>
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage communication, privacy, account details, and candidate preferences.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
            <aside className="rounded-xl border border-border/30 bg-background p-2">
              <div className="flex flex-wrap gap-1.5 lg:flex-col">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                      activeTab === tab.id
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </aside>

            <div className="space-y-5">
              {activeTab === "communication" && (
                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold">Communication and Privacy</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Control how often Diplotix contacts you and how visible you are to recruiters.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleStatusChange(option.value)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                          settings.jobSearchStatus === option.value
                            ? "border-foreground bg-muted/40"
                            : "border-border/30 hover:border-border/60"
                        }`}
                      >
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <ToggleCard
                      label="Daily job recommendations"
                      checked={settings.dailyJobRecommendations}
                      onChange={(checked) => setSettings({ ...settings, dailyJobRecommendations: checked })}
                    />
                    <ToggleCard
                      label="Weekly job recommendations"
                      checked={settings.weeklyJobRecommendations}
                      onChange={(checked) => setSettings({ ...settings, weeklyJobRecommendations: checked })}
                    />
                    <ToggleCard
                      label="Job status updates"
                      checked={settings.jobStatusUpdates}
                      onChange={(checked) => setSettings({ ...settings, jobStatusUpdates: checked })}
                    />
                    <ToggleCard
                      label="Recruiter messages"
                      checked={settings.recruiterMessages}
                      onChange={(checked) => setSettings({ ...settings, recruiterMessages: checked })}
                    />
                    <ToggleCard
                      label="Who viewed my profile"
                      checked={settings.profileViews}
                      onChange={(checked) => setSettings({ ...settings, profileViews: checked })}
                    />
                    <ToggleCard
                      label="Promotional emails"
                      checked={settings.promotionalEmails}
                      onChange={(checked) => setSettings({ ...settings, promotionalEmails: checked })}
                    />
                    <ToggleCard
                      label="Profile visible to recruiters"
                      checked={settings.profileVisibleToRecruiters}
                      onChange={(checked) => setSettings({ ...settings, profileVisibleToRecruiters: checked })}
                    />
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="rounded-xl" onClick={() => void saveCommunicationSettings()} disabled={savingSection === "communication"}>
                      {savingSection === "communication" ? "Saving..." : "Save settings"}
                    </Button>
                  </div>
                </section>
              )}

              {activeTab === "account" && (
                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold">Account</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Manage sign-in details and account status.
                    </p>
                  </div>

                  <div className="grid gap-5">
                    <FieldGroup label="Email address" icon={Mail}>
                      <Input value={emailAddress} disabled className="h-10 text-sm bg-muted/30" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Email changes are managed by your authentication provider.
                      </p>
                    </FieldGroup>

                    <FieldGroup label="Mobile number" icon={UserCog}>
                      <Input value={mobileNumber} onChange={(event) => setMobileNumber(event.target.value)} className="h-10 text-sm" placeholder="+91 98765 43210" />
                    </FieldGroup>

                    <FieldGroup label="Password" icon={Lock}>
                      <div className="rounded-xl border border-border/30 bg-muted/20 p-4">
                        <p className="text-sm font-medium">
                          {supportsPasswordReset
                            ? "Send a password reset email for your email login account."
                            : "Password change is available for email login accounts."}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          OAuth accounts continue to manage passwords with their external provider.
                        </p>
                        <Button
                          variant="outline"
                          className="mt-4 rounded-xl"
                          onClick={() => void sendPasswordReset()}
                        >
                          Send reset email
                        </Button>
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Account management" icon={Shield}>
                      <div className="space-y-3 rounded-xl border border-border/30 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium">Deactivate account</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              This marks your account as deactivated and hides your recruiter visibility preference.
                            </p>
                          </div>
                          <Button variant="outline" className="rounded-xl" onClick={() => setModalState("deactivate")}>
                            Deactivate
                          </Button>
                        </div>

                        <div className="flex flex-col gap-3 border-t border-border/20 pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-medium">Delete account</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Safe deletion is not fully automated yet. We will guide you before anything destructive happens.
                            </p>
                          </div>
                          <Button variant="outline" className="rounded-xl" onClick={() => setModalState("delete")}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </FieldGroup>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="rounded-xl" onClick={() => void saveAccountSettings()} disabled={savingSection === "account"}>
                      {savingSection === "account" ? "Saving..." : "Save account"}
                    </Button>
                  </div>
                </section>
              )}

              {activeTab === "preferences" && (
                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold">Job Preferences</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Update the preferences that shape your profile and dashboard recommendations.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <MultiSelectCombobox label="Preferred work locations" options={cities} value={preferredLocations} onChange={setPreferredLocations} placeholder="Search locations" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium block">Expected salary</label>
                      <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                        <CurrencySelect value={salaryCurrency} onChange={setSalaryCurrency} />
                        <Input value={expectedSalary} onChange={(event) => setExpectedSalary(event.target.value)} className="h-10 text-sm" placeholder="1200000" />
                      </div>
                    </div>
                    <MultiSelectCombobox label="Work mode" options={workModeOptions} value={workMode} onChange={setWorkMode} placeholder="Search work modes" />
                    <MultiSelectCombobox label="Job type" options={jobTypeOptions} value={jobType} onChange={setJobType} placeholder="Search job types" />
                    <div className="space-y-2">
                      <label className="text-xs font-medium block">Experience level</label>
                      <select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                        <option value="">Select experience level</option>
                        {experienceOptions.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium block">Industry</label>
                      <select value={industry} onChange={(event) => setIndustry(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                        <option value="">Select industry</option>
                        {industries.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-medium block">Functional area</label>
                      <Input value={functionalArea} onChange={(event) => setFunctionalArea(event.target.value)} className="h-10 text-sm" placeholder="Design, Product, Engineering..." />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="rounded-xl" onClick={() => void savePreferences()} disabled={savingSection === "preferences"}>
                      {savingSection === "preferences" ? "Saving..." : "Save preferences"}
                    </Button>
                  </div>
                </section>
              )}

              {activeTab === "blocked" && (
                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold">Block Companies</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Keep specific companies out of your recruiter visibility preferences. This does not change job results yet.
                    </p>
                  </div>

                  <div className="relative">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={companyQuery}
                        onChange={(event) => setCompanyQuery(event.target.value)}
                        className="h-10 text-sm"
                        placeholder="Search company name"
                      />
                      <Button className="rounded-xl" onClick={() => void addBlockedCompany()}>
                        Block company
                      </Button>
                    </div>
                    {companyQuery.trim() && filteredCompanySuggestions.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-border/30 bg-background p-2 shadow-lg">
                        {filteredCompanySuggestions.map((company) => (
                          <button
                            key={company.name}
                            type="button"
                            onClick={() => void addBlockedCompany(company)}
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted/50"
                          >
                            {company.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-5 space-y-2">
                    {!blockedLoaded ? (
                      <p className="text-sm text-muted-foreground">Loading blocked companies...</p>
                    ) : blockedCompanies.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No blocked companies yet.</p>
                    ) : (
                      blockedCompanies.map((company) => (
                        <div key={company.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/30 px-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{company.companyName}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Blocked on {new Date(company.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={savingIds.has(company.id)}
                            onClick={() => void unblockCompany(company.id)}
                          >
                            {savingIds.has(company.id) ? "Removing..." : "Unblock"}
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {modalState && (
          <ConfirmationModal
            title={modalState === "deactivate" ? "Deactivate account?" : "Delete account?"}
            description={
              modalState === "deactivate"
                ? "Your account will stay in the system, but your settings will be marked as deactivated."
                : "Account deletion is not fully automated yet. Confirming will only show the safe next step."
            }
            confirmLabel={modalState === "deactivate" ? "Deactivate" : "Continue"}
            icon={modalState === "deactivate" ? ShieldOff : CircleHelp}
            onClose={() => setModalState(null)}
            onConfirm={() => void (modalState === "deactivate" ? confirmDeactivate() : confirmDelete())}
          />
        )}
      </div>
    </ProtectedLayout>
  );
}

function FieldGroup({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">{label}</h3>
      </div>
      {children}
    </div>
  );
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-border/30 px-3 py-3">
      <Checkbox
        id={label}
        label={label}
        checked={checked}
        onChange={(event) => onChange((event.target as HTMLInputElement).checked)}
      />
    </div>
  );
}

function ConfirmationModal({
  title,
  description,
  confirmLabel,
  icon: Icon,
  onClose,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  icon: ComponentType<{ className?: string }>;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-border/30 bg-background p-5 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/60">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" className="rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button className="rounded-xl" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
