"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Loader2,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { LoadingState } from "@/components/ui/loading-state";
import { CompanyLogoUploader } from "@/components/profile/company-logo-uploader";
import { RecruiterPhoneInput } from "@/components/profile/recruiter-phone-input";
import { getNextRouteForProfile } from "@/lib/auth/onboarding-route";
import { loadCurrentProfile, saveRecruiterProfile } from "@/lib/profile/persistence";
import { uploadService } from "@/services";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  cleanStringList,
  commonSalaryRangeOptions,
  companySizeOptions,
  hiringLocationSuggestions,
  hiringModelOptions,
  hiringRoleSuggestions,
  isValidDomainUrl,
  monthlyHiringVolumeOptions,
  normalizeWebsite,
  preferredExperienceLevelOptions,
  preferredSkillSuggestions,
  recruiterIndustryOptions,
  recruiterTitleOptions,
  remotePolicyOptions,
} from "@/lib/recruiter/profile-options";
import {
  countryOptions,
  formatCompanyLocation,
  getStateRegionOptions,
  hasCompleteAddress,
} from "@/lib/recruiter/address-options";
import {
  buildRecruiterPhoneValue,
  buildDefaultRecruiterPhoneValue,
  formatRecruiterPhone,
  validateRecruiterPhoneNumber,
} from "@/lib/recruiter/phone";

type RecruiterOnboardingDraft = {
  recruiterFullName: string;
  email: string;
  recruiterTitle: string;
  phoneCountry: string;
  phoneCountryCode: string;
  phoneNumber: string;
  companyName: string;
  companyWebsite: string;
  industry: string;
  companySize: string;
  companyLocation: string;
  companyCountry: string;
  companyStateOrRegion: string;
  companyCity: string;
  companyStreetAddress: string;
  companyPostalCode: string;
  companyLogoUrl: string;
  companyDescription: string;
  hiringRoles: string[];
  hiringModel: string;
  hiringLocations: string[];
  remotePolicy: string;
  monthlyHiringVolume: string;
  preferredExperienceLevels: string[];
  preferredSkills: string[];
  commonSalaryRange: string;
  urgentHiring: boolean;
};

const steps = ["Identity", "Company", "Hiring", "Preferences", "Logo"];

const emptyDraft: RecruiterOnboardingDraft = {
  recruiterFullName: "",
  email: "",
  recruiterTitle: "",
  phoneCountry: "",
  phoneCountryCode: "",
  phoneNumber: "",
  companyName: "",
  companyWebsite: "",
  industry: "",
  companySize: "",
  companyLocation: "",
  companyCountry: "",
  companyStateOrRegion: "",
  companyCity: "",
  companyStreetAddress: "",
  companyPostalCode: "",
  companyLogoUrl: "",
  companyDescription: "",
  hiringRoles: [],
  hiringModel: "",
  hiringLocations: [],
  remotePolicy: "",
  monthlyHiringVolume: "",
  preferredExperienceLevels: [],
  preferredSkills: [],
  commonSalaryRange: "",
  urgentHiring: false,
};

function trimDraft(draft: RecruiterOnboardingDraft): RecruiterOnboardingDraft {
  return {
    ...draft,
    recruiterFullName: draft.recruiterFullName.trim(),
    recruiterTitle: draft.recruiterTitle.trim(),
    phoneCountry: draft.phoneCountry.trim(),
    phoneCountryCode: draft.phoneCountryCode.trim(),
    phoneNumber: draft.phoneNumber.trim(),
    companyName: draft.companyName.trim(),
    companyWebsite: normalizeWebsite(draft.companyWebsite),
    industry: draft.industry.trim(),
    companyLocation: draft.companyLocation.trim(),
    companyCountry: draft.companyCountry.trim(),
    companyStateOrRegion: draft.companyStateOrRegion.trim(),
    companyCity: draft.companyCity.trim(),
    companyStreetAddress: draft.companyStreetAddress.trim(),
    companyPostalCode: draft.companyPostalCode.trim(),
    companyLogoUrl: draft.companyLogoUrl.trim(),
    companyDescription: draft.companyDescription.trim(),
  };
}

function resolveCompanyLocation(draft: RecruiterOnboardingDraft) {
  if (
    hasCompleteAddress({
      companyCountry: draft.companyCountry,
      companyStateOrRegion: draft.companyStateOrRegion,
      companyCity: draft.companyCity,
      companyStreetAddress: draft.companyStreetAddress,
      companyPostalCode: draft.companyPostalCode,
    })
  ) {
    return formatCompanyLocation({
      companyCountry: draft.companyCountry,
      companyStateOrRegion: draft.companyStateOrRegion,
      companyCity: draft.companyCity,
      companyStreetAddress: draft.companyStreetAddress,
      companyPostalCode: draft.companyPostalCode,
    });
  }
  return draft.companyLocation.trim();
}

function getRecruiterPhonePayload(draft: RecruiterOnboardingDraft) {
  const phoneCountry = draft.phoneCountry.trim();
  const phoneCountryCode = draft.phoneCountryCode.trim();
  const phoneNumber = draft.phoneNumber.trim();
  const hasPhoneSelection = Boolean(phoneCountry || phoneCountryCode);

  return {
    phoneCountry: hasPhoneSelection ? phoneCountry || "United States" : "",
    phoneCountryCode: hasPhoneSelection ? phoneCountryCode || "+1" : "",
    phoneNumber,
    phone: phoneNumber
      ? formatRecruiterPhone(phoneCountryCode || "+1", phoneNumber)
      : "",
  };
}

export default function RecruiterOnboarding() {
  const router = useRouter();
  const { user, isLoading, completeOnboarding, getPostAuthRedirect } = useAuth();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<RecruiterOnboardingDraft>(emptyDraft);
  const [companyLogoSavedUrl, setCompanyLogoSavedUrl] = useState("");
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoRemoved, setCompanyLogoRemoved] = useState(false);
  const [companyLogoError, setCompanyLogoError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);
  const [touchedSteps, setTouchedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/home");
      return;
    }
    const nextRoute = getPostAuthRedirect(user);
    if (nextRoute !== "/onboarding/recruiter") {
      router.replace(nextRoute);
    }
  }, [getPostAuthRedirect, isLoading, router, user]);

  useEffect(() => {
    if (!user?.id) return;
    const timer = window.setTimeout(() => {
      void loadCurrentProfile()
        .then((data) => {
          const recruiter = data?.recruiterProfile;
          const recruiterPhone = buildRecruiterPhoneValue(
            recruiter?.phone_country,
            recruiter?.phone_country_code,
            recruiter?.phone_number ||
              recruiter?.phone
          );
          const resolvedPhone =
            recruiterPhone.phoneCountry || recruiterPhone.phoneCountryCode
              ? recruiterPhone
              : buildDefaultRecruiterPhoneValue(recruiterPhone.phoneNumber);
          setDraft({
            recruiterFullName: recruiter?.recruiter_full_name || data?.profile.name || user.name || "",
            email: data?.profile.email || user.email || "",
            recruiterTitle: recruiter?.recruiter_title || recruiter?.hiring_title || "",
            phoneCountry: resolvedPhone.phoneCountry,
            phoneCountryCode: resolvedPhone.phoneCountryCode,
            phoneNumber: resolvedPhone.phoneNumber,
            companyName: recruiter?.company_name || "",
            companyWebsite: recruiter?.company_website || "",
            industry: recruiter?.industry || "",
            companySize: recruiter?.company_size || "",
            companyLocation:
              recruiter?.company_location ||
              formatCompanyLocation({
                companyCountry: recruiter?.company_country,
                companyStateOrRegion: recruiter?.company_state_or_region,
                companyCity: recruiter?.company_city,
                companyStreetAddress: recruiter?.company_street_address,
                companyPostalCode: recruiter?.company_postal_code,
              }) ||
              recruiter?.location ||
              "",
            companyCountry: recruiter?.company_country || "",
            companyStateOrRegion: recruiter?.company_state_or_region || "",
            companyCity: recruiter?.company_city || "",
            companyStreetAddress: recruiter?.company_street_address || "",
            companyPostalCode: recruiter?.company_postal_code || "",
            companyLogoUrl: recruiter?.company_logo_url || "",
            companyDescription: recruiter?.company_description || "",
            hiringRoles: recruiter?.hiring_roles || [],
            hiringModel: recruiter?.hiring_model || "",
            hiringLocations: recruiter?.hiring_locations || [],
            remotePolicy: recruiter?.remote_policy || "",
            monthlyHiringVolume: recruiter?.monthly_hiring_volume || "",
            preferredExperienceLevels: recruiter?.preferred_experience_levels || [],
            preferredSkills: recruiter?.preferred_skills || [],
            commonSalaryRange: recruiter?.common_salary_range || "",
            urgentHiring: Boolean(recruiter?.urgent_hiring),
          });
          setCompanyLogoSavedUrl(recruiter?.company_logo_url || "");
          setCompanyLogoFile(null);
          setCompanyLogoRemoved(false);
          setCompanyLogoError(null);
          setStep(Math.max(0, Math.min(4, (recruiter?.onboarding_step || 1) - 1)));
        })
        .catch((loadError) => {
          console.warn("[RECRUITER ONBOARDING] Restore failed", loadError);
          setDraft({
            ...emptyDraft,
            recruiterFullName: user.name || "",
            email: user.email || "",
            phoneCountry: buildDefaultRecruiterPhoneValue().phoneCountry,
            phoneCountryCode: buildDefaultRecruiterPhoneValue().phoneCountryCode,
          });
        })
        .finally(() => setLoaded(true));
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  const draftForValidation = useMemo(
    () => ({
      ...draft,
      email: draft.email || user?.email || "",
    }),
    [draft, user?.email]
  );
  const errors = useMemo(() => validateStep(draftForValidation, step), [draftForValidation, step]);
  const showErrors = touchedSteps.has(step);
  const canContinue = Object.keys(errors).length === 0;

  useEffect(() => {
    if (!loaded || !user?.id) return;
    const timer = window.setTimeout(() => {
      void saveDraft(draft, step + 1, {
        companyLogoUrl: companyLogoRemoved
          ? ""
          : draft.companyLogoUrl.startsWith("blob:")
            ? null
            : draft.companyLogoUrl,
      })
        .then(() => setSaveState("saved"))
        .catch((saveError) => {
          console.warn("[RECRUITER ONBOARDING] Draft save failed", saveError);
          setSaveState("idle");
        });
      setSaveState("saving");
    }, 900);
    return () => window.clearTimeout(timer);
  }, [companyLogoRemoved, draft, loaded, step, user?.id]);

  const updateDraft = <K extends keyof RecruiterOnboardingDraft>(key: K, value: RecruiterOnboardingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const continueStep = () => {
    setTouchedSteps((current) => new Set(current).add(step));
    if (!canContinue) return;
    const nextStep = Math.min(step + 1, steps.length - 1);
    setStep(nextStep);
    setSaveState("saving");
    void saveDraft(draftForValidation, nextStep + 1, {
      companyLogoUrl: companyLogoRemoved
        ? ""
        : draftForValidation.companyLogoUrl.startsWith("blob:")
          ? null
          : draftForValidation.companyLogoUrl,
    })
      .then(() => setSaveState("saved"))
      .catch((saveError) => {
        console.warn("[RECRUITER ONBOARDING] Step save failed", saveError);
        setSaveState("idle");
      });
  };

  const finish = async () => {
    const allErrors = steps.flatMap((_, index) => Object.keys(validateStep(draftForValidation, index)));
    setTouchedSteps(new Set(steps.map((_, index) => index)));
    if (allErrors.length > 0) {
      setStep(firstInvalidStep(draftForValidation));
      return;
    }

    setIsSaving(true);
    setError(null);
    setCompanyLogoError(null);
    try {
      const finalDraft = trimDraft(draft);
      const companyLocation = resolveCompanyLocation(finalDraft);
      const phonePayload = getRecruiterPhonePayload(finalDraft);
      let finalCompanyLogoUrl = companyLogoRemoved ? "" : companyLogoSavedUrl;

      if (companyLogoFile && !companyLogoRemoved) {
        const uploadResult = await uploadService.uploadCompanyLogo(companyLogoFile);
        if (uploadResult.error) {
          setCompanyLogoError(uploadResult.error.message);
        } else {
          finalCompanyLogoUrl = uploadResult.data.url;
          setCompanyLogoSavedUrl(finalCompanyLogoUrl);
          setCompanyLogoFile(null);
          setCompanyLogoError(null);
          setDraft((current) => ({ ...current, companyLogoUrl: finalCompanyLogoUrl }));
        }
      }

      await saveRecruiterProfile({
        fullName: finalDraft.recruiterFullName,
        phone: phonePayload.phone,
        phoneCountry: phonePayload.phoneCountry,
        phoneCountryCode: phonePayload.phoneCountryCode,
        phoneNumber: phonePayload.phoneNumber,
        location: companyLocation,
        recruiterTitle: finalDraft.recruiterTitle,
        companyName: finalDraft.companyName,
        companyWebsite: finalDraft.companyWebsite,
        companySize: finalDraft.companySize,
        industry: finalDraft.industry,
        hiringTitle: finalDraft.recruiterTitle,
        companyLogoUrl: companyLogoRemoved ? "" : finalCompanyLogoUrl || undefined,
        companyCountry: finalDraft.companyCountry,
        companyStateOrRegion: finalDraft.companyStateOrRegion,
        companyCity: finalDraft.companyCity,
        companyStreetAddress: finalDraft.companyStreetAddress,
        companyPostalCode: finalDraft.companyPostalCode,
        companyLocation,
        companyDescription: finalDraft.companyDescription,
        hiringRoles: cleanStringList(finalDraft.hiringRoles),
        hiringModel: finalDraft.hiringModel,
        hiringLocations: cleanStringList(finalDraft.hiringLocations),
        remotePolicy: finalDraft.remotePolicy,
        monthlyHiringVolume: finalDraft.monthlyHiringVolume,
        preferredExperienceLevels: cleanStringList(finalDraft.preferredExperienceLevels),
        preferredSkills: cleanStringList(finalDraft.preferredSkills),
        commonSalaryRange: finalDraft.commonSalaryRange,
        urgentHiring: finalDraft.urgentHiring,
        onboardingCompleted: true,
        onboardingStep: 4,
      });
      await completeOnboarding("recruiter", {
        full_name: finalDraft.recruiterFullName,
      });
      router.push(getNextRouteForProfile({ role: "recruiter", onboarding_complete: true }));
    } catch (finishError) {
      console.error("[RECRUITER ONBOARDING] Save failed", finishError);
      setError(finishError instanceof Error ? finishError.message : "We could not save your recruiter profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !user || !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <LoadingState variant="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Set up your recruiter profile</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Build the company and hiring profile candidates will see when they evaluate your roles.
            </p>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved" : "Draft"}
          </p>
        </div>

        <Stepper current={step} />

        {error && (
          <p role="alert" className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        )}

        <section className="rounded-xl border border-border/30 bg-background p-5 sm:p-6">
          {step === 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Recruiter full name" error={showErrors ? errors.recruiterFullName : undefined}>
                  <Input value={draft.recruiterFullName} onChange={(event) => updateDraft("recruiterFullName", event.target.value)} onBlur={() => markStepTouched(setTouchedSteps, step)} className="h-10 text-sm" />
                </Field>
                <Field label="Email">
                  <Input value={draft.email || user.email || ""} disabled className="h-10 text-sm" />
                </Field>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Field label="Recruiter title" error={showErrors ? errors.recruiterTitle : undefined}>
                  <ComboInput value={draft.recruiterTitle} suggestions={recruiterTitleOptions} onChange={(value) => updateDraft("recruiterTitle", value)} placeholder="Talent Acquisition Lead" />
                </Field>
                <Field label="Phone">
                  <RecruiterPhoneInput
                    value={buildRecruiterPhoneValue(draft.phoneCountry, draft.phoneCountryCode, draft.phoneNumber)}
                    disabled={isSaving}
                    error={showErrors ? errors.phone : undefined}
                    onChange={(value) => {
                      updateDraft("phoneCountry", value.phoneCountry);
                      updateDraft("phoneCountryCode", value.phoneCountryCode);
                      updateDraft("phoneNumber", value.phoneNumber);
                    }}
                    onBlur={() => markStepTouched(setTouchedSteps, step)}
                  />
                </Field>
              </div>
            </>
          )}

          {step === 1 && (
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Company name" error={showErrors ? errors.companyName : undefined}>
                  <Input value={draft.companyName} onChange={(event) => updateDraft("companyName", event.target.value)} onBlur={() => markStepTouched(setTouchedSteps, step)} className="h-10 text-sm" />
                </Field>
                <Field label="Company website" error={showErrors ? errors.companyWebsite : undefined}>
                  <Input value={draft.companyWebsite} onChange={(event) => updateDraft("companyWebsite", event.target.value)} onBlur={() => updateDraft("companyWebsite", normalizeWebsite(draft.companyWebsite))} className="h-10 text-sm" placeholder="company.com" />
                </Field>
                <Field label="Industry" error={showErrors ? errors.industry : undefined}>
                  <SearchableCombobox value={draft.industry} options={recruiterIndustryOptions} onChange={(value) => updateDraft("industry", value)} placeholder="Search or select industry" customLabelPrefix="Add custom industry: " onBlur={() => markStepTouched(setTouchedSteps, step)} />
                </Field>
                <Field label="Company size" error={showErrors ? errors.companySize : undefined}>
                  <CardSelect value={draft.companySize} options={companySizeOptions} onChange={(value) => updateDraft("companySize", value)} />
                </Field>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Country" error={showErrors ? errors.companyCountry : undefined}>
                  <SearchableCombobox value={draft.companyCountry} options={countryOptions} onChange={(value) => {
                    updateDraft("companyCountry", value);
                    updateDraft("companyStateOrRegion", "");
                  }} placeholder="Search or select country" onBlur={() => markStepTouched(setTouchedSteps, step)} />
                </Field>
                <Field label="State / region" error={showErrors ? errors.companyStateOrRegion : undefined}>
                  <SearchableCombobox
                    value={draft.companyStateOrRegion}
                    options={draft.companyCountry ? getStateRegionOptions(draft.companyCountry) : []}
                    onChange={(value) => updateDraft("companyStateOrRegion", value)}
                    placeholder="Search or select state/region"
                    disabled={!draft.companyCountry}
                    customLabelPrefix="Add custom state/region: "
                    onBlur={() => markStepTouched(setTouchedSteps, step)}
                  />
                </Field>
                <Field label="City" error={showErrors ? errors.companyCity : undefined}>
                  <Input value={draft.companyCity} onChange={(event) => updateDraft("companyCity", event.target.value)} onBlur={() => markStepTouched(setTouchedSteps, step)} className="h-10 text-sm" />
                </Field>
                <Field label="Postal code" error={showErrors ? errors.companyPostalCode : undefined}>
                  <Input value={draft.companyPostalCode} onChange={(event) => updateDraft("companyPostalCode", event.target.value)} onBlur={() => markStepTouched(setTouchedSteps, step)} className="h-10 text-sm" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Street address" error={showErrors ? errors.companyStreetAddress : undefined}>
                    <Input value={draft.companyStreetAddress} onChange={(event) => updateDraft("companyStreetAddress", event.target.value)} onBlur={() => markStepTouched(setTouchedSteps, step)} className="h-10 text-sm" />
                  </Field>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Company description" hint={`${draft.companyDescription.length}/500 characters`}>
                    <textarea value={draft.companyDescription} onChange={(event) => updateDraft("companyDescription", event.target.value.slice(0, 500))} className="min-h-28 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" placeholder="A short candidate-facing description of your company." />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-6">
              <Field label="Hiring roles" error={showErrors ? errors.hiringRoles : undefined}>
                <TagInput value={draft.hiringRoles} suggestions={hiringRoleSuggestions} onChange={(value) => updateDraft("hiringRoles", value)} placeholder="Add role and press Enter" />
              </Field>
              <Field label="Hiring model" error={showErrors ? errors.hiringModel : undefined}>
                <CardSelect value={draft.hiringModel} options={hiringModelOptions} onChange={(value) => updateDraft("hiringModel", value)} />
              </Field>
              <Field label="Hiring locations" error={showErrors ? errors.hiringLocations : undefined}>
                <TagInput value={draft.hiringLocations} suggestions={hiringLocationSuggestions} onChange={(value) => updateDraft("hiringLocations", value)} placeholder="Add location and press Enter" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Remote policy">
                  <SegmentedSelect value={draft.remotePolicy} options={remotePolicyOptions} onChange={(value) => updateDraft("remotePolicy", value)} />
                </Field>
                <Field label="Monthly hiring volume">
                  <CardSelect value={draft.monthlyHiringVolume} options={monthlyHiringVolumeOptions} onChange={(value) => updateDraft("monthlyHiringVolume", value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-6">
              <Field label="Preferred experience levels">
                <PillSelect value={draft.preferredExperienceLevels} options={preferredExperienceLevelOptions} onChange={(value) => updateDraft("preferredExperienceLevels", value)} />
              </Field>
              <Field label="Preferred skills">
                <TagInput value={draft.preferredSkills} suggestions={preferredSkillSuggestions} onChange={(value) => updateDraft("preferredSkills", value)} placeholder="Add skill and press Enter" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Common salary range">
                  <select value={draft.commonSalaryRange} onChange={(event) => updateDraft("commonSalaryRange", event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">Select a typical range</option>
                    {commonSalaryRangeOptions.map((range) => <option key={range}>{range}</option>)}
                  </select>
                </Field>
                <label className="flex items-center justify-between gap-4 rounded-xl border border-border/30 p-4">
                  <span>
                    <span className="block text-sm font-medium">Urgent hiring</span>
                    <span className="mt-1 block text-xs text-muted-foreground">Highlight roles that need faster candidate response.</span>
                  </span>
                  <input type="checkbox" checked={draft.urgentHiring} onChange={(event) => updateDraft("urgentHiring", event.target.checked)} className="h-5 w-5" />
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid gap-6">
              <CompanyLogoUploader
                previewUrl={draft.companyLogoUrl}
                fallbackLabel={(draft.companyName || "iJ").slice(0, 2).toUpperCase()}
                onChange={(value) => {
                  updateDraft("companyLogoUrl", value);
                  setCompanyLogoRemoved(false);
                  setCompanyLogoError(null);
                }}
                onFileChange={(file) => {
                  setCompanyLogoFile(file);
                  if (!file) {
                    setCompanyLogoSavedUrl("");
                    setCompanyLogoRemoved(true);
                  } else {
                    setCompanyLogoRemoved(false);
                  }
                }}
                onRemove={async () => {
                  if (companyLogoSavedUrl) {
                    try {
                      const result = await uploadService.delete(companyLogoSavedUrl);
                      if (result.error) {
                        console.warn("[RECRUITER ONBOARDING] Company logo delete failed", result.error);
                      }
                    } catch (removeError) {
                      console.warn("[RECRUITER ONBOARDING] Company logo delete failed", removeError);
                    }
                  }
                  setCompanyLogoSavedUrl("");
                  setCompanyLogoFile(null);
                  setCompanyLogoRemoved(true);
                  setCompanyLogoError(null);
                }}
                onError={(message) => {
                  setCompanyLogoError(message);
                }}
              />
              {companyLogoError ? (
                <p role="alert" className="text-xs text-red-600">
                  {companyLogoError}
                </p>
              ) : null}
            </div>
          )}
        </section>

        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" disabled={step === 0 || isSaving} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button size="sm" className="rounded-xl" disabled={!canContinue || isSaving} onClick={continueStep}>
              Continue
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="rounded-xl" disabled={isSaving} onClick={finish}>
              {isSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Go to Dashboard
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function validateStep(draft: RecruiterOnboardingDraft, step: number) {
  const normalized = trimDraft(draft);
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (normalized.recruiterFullName.length < 2) errors.recruiterFullName = "Enter at least 2 characters.";
    if (!normalized.email) errors.email = "Email is required.";
    if (!normalized.recruiterTitle) errors.recruiterTitle = "Recruiter title is required.";
    const phoneError = validateRecruiterPhoneNumber(normalized.phoneNumber);
    if (phoneError) errors.phone = phoneError;
  }
  if (step === 1) {
    if (!normalized.companyName) errors.companyName = "Company name is required.";
    if (!normalized.companyWebsite) errors.companyWebsite = "Company website is required.";
    else if (!isValidDomainUrl(normalized.companyWebsite)) errors.companyWebsite = "Enter a valid website or domain.";
    if (!normalized.industry) errors.industry = "Industry is required.";
    if (!normalized.companySize) errors.companySize = "Company size is required.";
    if (!normalized.companyCountry) errors.companyCountry = "Country is required.";
    if (!normalized.companyStateOrRegion) errors.companyStateOrRegion = "State / region is required.";
    if (!normalized.companyCity) errors.companyCity = "City is required.";
    if (!normalized.companyStreetAddress) errors.companyStreetAddress = "Street address is required.";
    if (!normalized.companyPostalCode) errors.companyPostalCode = "Postal code is required.";
  }
  if (step === 2) {
    if (normalized.hiringRoles.length === 0) errors.hiringRoles = "Add at least one hiring role.";
    if (!normalized.hiringModel) errors.hiringModel = "Choose a hiring model.";
    if (normalized.hiringLocations.length === 0) errors.hiringLocations = "Add at least one hiring location.";
  }
  return errors;
}

function firstInvalidStep(draft: RecruiterOnboardingDraft) {
  return steps.findIndex((_, index) => Object.keys(validateStep(draft, index)).length > 0);
}

async function saveDraft(
  draft: RecruiterOnboardingDraft,
  step: number,
  options: { companyLogoUrl?: string | null } = {}
) {
  const supabase = getSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = supabase ? await supabase.auth.getUser() : { data: { user: null }, error: null };
  if (userError) throw userError;
  if (!supabase || !user?.id) return;
  const normalized = trimDraft(draft);
  const companyLocation = resolveCompanyLocation(normalized);

  const companyLogoUrl =
    options.companyLogoUrl === null
      ? undefined
      : options.companyLogoUrl ?? normalized.companyLogoUrl;

  await saveRecruiterProfile({
    fullName: normalized.recruiterFullName || user.email?.split("@")[0] || "Recruiter",
    phone: getRecruiterPhonePayload(normalized).phone,
    phoneCountry: getRecruiterPhonePayload(normalized).phoneCountry,
    phoneCountryCode: getRecruiterPhonePayload(normalized).phoneCountryCode,
    phoneNumber: getRecruiterPhonePayload(normalized).phoneNumber,
    location: companyLocation,
    recruiterTitle: normalized.recruiterTitle,
    companyName: normalized.companyName,
    companyWebsite: normalized.companyWebsite,
    companySize: normalized.companySize,
    industry: normalized.industry,
    hiringTitle: normalized.recruiterTitle,
    companyLogoUrl,
    companyCountry: normalized.companyCountry,
    companyStateOrRegion: normalized.companyStateOrRegion,
    companyCity: normalized.companyCity,
    companyStreetAddress: normalized.companyStreetAddress,
    companyPostalCode: normalized.companyPostalCode,
    companyLocation,
    companyDescription: normalized.companyDescription,
    hiringRoles: cleanStringList(normalized.hiringRoles),
    hiringModel: normalized.hiringModel,
    hiringLocations: cleanStringList(normalized.hiringLocations),
    remotePolicy: normalized.remotePolicy,
    monthlyHiringVolume: normalized.monthlyHiringVolume,
    preferredExperienceLevels: cleanStringList(normalized.preferredExperienceLevels),
    preferredSkills: cleanStringList(normalized.preferredSkills),
    commonSalaryRange: normalized.commonSalaryRange,
    urgentHiring: normalized.urgentHiring,
    onboardingCompleted: false,
    onboardingStep: step,
  });
}

function markStepTouched(setTouchedSteps: React.Dispatch<React.SetStateAction<Set<number>>>, step: number) {
  setTouchedSteps((current) => new Set(current).add(step));
}

function Stepper({ current }: { current: number }) {
  return (
    <div className="mb-5 grid gap-2 sm:grid-cols-5">
      {steps.map((label, index) => (
        <div key={label} className="rounded-xl border border-border/30 bg-background p-3">
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${index <= current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {index < current ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span className="text-sm font-medium">{label}</span>
          </div>
          <div className="mt-3 h-1 rounded-full bg-muted">
            <div className="h-1 rounded-full bg-primary" style={{ width: index < current ? "100%" : index === current ? "65%" : "0%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function ComboInput({ value, suggestions, onChange, placeholder }: { value: string; suggestions: string[]; onChange: (value: string) => void; placeholder?: string }) {
  const [query, setQuery] = useState("");
  const filtered = suggestions.filter((item) => item.toLowerCase().includes((query || value).toLowerCase())).slice(0, 6);
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input value={value} onChange={(event) => { onChange(event.target.value); setQuery(event.target.value); }} className="h-10 pl-9 text-sm" placeholder={placeholder} />
      {query && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border/30 bg-background p-1.5 shadow-lg">
          {filtered.map((item) => (
            <button key={item} type="button" onClick={() => { onChange(item); setQuery(""); }} className="block w-full rounded-md px-2.5 py-1.5 text-left text-sm hover:bg-muted/50">
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CardSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${value === option ? "border-foreground bg-foreground text-background" : "border-border/30 hover:border-border"}`}>
          {option}
        </button>
      ))}
    </div>
  );
}

function SegmentedSelect({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-3 rounded-xl border border-border/30 p-1">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-lg px-3 py-2 text-sm ${value === option ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
          {option}
        </button>
      ))}
    </div>
  );
}

function PillSelect({ value, options, onChange }: { value: string[]; options: string[]; onChange: (value: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const selected = value.includes(option);
        return (
          <button key={option} type="button" onClick={() => onChange(selected ? value.filter((item) => item !== option) : [...value, option])} className={`rounded-full border px-3 py-1.5 text-sm ${selected ? "border-foreground bg-foreground text-background" : "border-border/30 text-muted-foreground hover:text-foreground"}`}>
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TagInput({ value, suggestions, onChange, placeholder }: { value: string[]; suggestions: string[]; onChange: (value: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = (raw: string) => {
    const next = raw.trim();
    if (!next || value.some((item) => item.toLowerCase() === next.toLowerCase())) return;
    onChange([...value, next]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {value.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium">
            {item}
            <button type="button" onClick={() => onChange(value.filter((selected) => selected !== item))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); add(input); } }} className="h-10 text-sm" placeholder={placeholder} />
        <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => add(input)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.filter((item) => !value.includes(item)).slice(0, 8).map((item) => (
          <button key={item} type="button" onClick={() => add(item)} className="rounded-lg border border-border/30 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
