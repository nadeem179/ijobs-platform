"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Plus, ShieldOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";
import { LoadingState } from "@/components/ui/loading-state";
import { ProtectedLayout } from "@/components/navigation/protected-layout";
import { useAuth } from "@/context/auth";
import { CompanyLogoUploader } from "@/components/profile/company-logo-uploader";
import { RecruiterPhoneInput } from "@/components/profile/recruiter-phone-input";
import {
  CurrencySelect,
  LanguageSelector,
  MultiSelectCombobox,
  ProfileImageUploader,
} from "@/components/profile/onboarding-controls";
import {
  cities,
  getDesignationRecommendations,
  industries as industryOptions,
  jobTypeOptions,
  skillsList,
  toolsList,
  workModeOptions,
} from "@/lib/profile/options";
import {
  loadCurrentProfile,
  saveCandidateProfile,
  type LanguagePayload,
  saveRecruiterProfile,
  type CandidateProfileRow,
  type RecruiterProfileRow,
} from "@/lib/profile/persistence";
import { uploadService } from "@/services";
import { useBlockedCompanies } from "@/hooks/use-blocked-companies";
import {
  cleanStringList,
  commonSalaryRangeOptions,
  companySizeOptions,
  hiringLocationSuggestions,
  hiringModelOptions,
  hiringRoleSuggestions,
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
  buildRecruiterPhoneUpdate,
  buildRecruiterPhoneValue,
} from "@/lib/recruiter/phone";

function toStringArray(value: string[] | string | null | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function normalizeLanguages(value: CandidateProfileRow["languages"]): LanguagePayload[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) =>
    typeof item === "string"
      ? { language: item, fluency: "Professional working" }
      : item
  );
}

function formatBlockedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProfileEditPage() {
  const router = useRouter();
  const { role, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileRow | null>(null);
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("");
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [languages, setLanguages] = useState<LanguagePayload[]>([]);
  const [resumeUrl, setResumeUrl] = useState("");
  const [totalExperienceYears, setTotalExperienceYears] = useState(0);
  const [totalExperienceMonths, setTotalExperienceMonths] = useState(0);
  const [currentCompany, setCurrentCompany] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [currentSalaryCurrency, setCurrentSalaryCurrency] = useState("INR");
  const [currentSalaryAmount, setCurrentSalaryAmount] = useState("");
  const [expectedSalaryCurrency, setExpectedSalaryCurrency] = useState("INR");
  const [expectedSalaryAmount, setExpectedSalaryAmount] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [jobTypePreference, setJobTypePreference] = useState<string[]>([]);
  const [workModePreference, setWorkModePreference] = useState<string[]>([]);
  const [candidateIndustries, setCandidateIndustries] = useState<string[]>([]);
  const [functionalArea, setFunctionalArea] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companySize, setCompanySize] = useState("1-10");
  const [industry, setIndustry] = useState("Technology");
  const [hiringTitle, setHiringTitle] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [companyLogoSavedUrl, setCompanyLogoSavedUrl] = useState("");
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLocation, setCompanyLocation] = useState("");
  const [companyCountry, setCompanyCountry] = useState("");
  const [companyStateOrRegion, setCompanyStateOrRegion] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyStreetAddress, setCompanyStreetAddress] = useState("");
  const [companyPostalCode, setCompanyPostalCode] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [hiringRoles, setHiringRoles] = useState<string[]>([]);
  const [hiringModel, setHiringModel] = useState("");
  const [hiringLocations, setHiringLocations] = useState<string[]>([]);
  const [remotePolicy, setRemotePolicy] = useState("");
  const [monthlyHiringVolume, setMonthlyHiringVolume] = useState("");
  const [preferredExperienceLevels, setPreferredExperienceLevels] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [commonSalaryRange, setCommonSalaryRange] = useState("");
  const [urgentHiring, setUrgentHiring] = useState(false);
  const [companyLogoError, setCompanyLogoError] = useState<string | null>(null);
  const {
    blockedCompanies,
    loaded: blockedCompaniesLoaded,
    savingIds: blockedCompanySavingIds,
    unblockCompany,
  } = useBlockedCompanies();
  const recruiterCompanyLocationPreview = hasCompleteAddress({
    companyCountry,
    companyStateOrRegion,
    companyCity,
    companyStreetAddress,
    companyPostalCode,
  })
    ? formatCompanyLocation({
        companyCountry,
        companyStateOrRegion,
        companyCity,
        companyStreetAddress,
        companyPostalCode,
      })
    : companyLocation;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCurrentProfile()
        .then((data) => {
          if (!data) {
            router.replace("/auth/home");
            return;
          }

          const profile = data.profile;
          const recruiterProfile: RecruiterProfileRow = data.recruiterProfile ?? {};
          setFullName(recruiterProfile.recruiter_full_name || profile.name);
          setHeadline(profile.headline);
          const structuredCompanyLocation = formatCompanyLocation({
            companyCountry: recruiterProfile.company_country,
            companyStateOrRegion: recruiterProfile.company_state_or_region,
            companyCity: recruiterProfile.company_city,
            companyStreetAddress: recruiterProfile.company_street_address,
            companyPostalCode: recruiterProfile.company_postal_code,
          });
          setLocation(recruiterProfile.company_location || structuredCompanyLocation || recruiterProfile.location || profile.location);
          setEmail(profile.email);
          const recruiterPhone = buildRecruiterPhoneValue(
            recruiterProfile.phone_country || profile.phone_country,
            recruiterProfile.phone_country_code || profile.phone_country_code,
            recruiterProfile.phone_number ||
              profile.phone_number ||
              recruiterProfile.phone ||
              profile.phone ||
              ""
          );
          setPhone(recruiterProfile.phone || profile.phone || "");
          setPhoneCountry(recruiterPhone.phoneCountry);
          setPhoneCountryCode(recruiterPhone.phoneCountryCode);
          setPhoneNumber(recruiterPhone.phoneNumber);
          setAvatarUrl(profile.avatarUrl || "");
          setAbout(profile.about);
          setSkills(profile.skills);
          setCandidateProfile(data.candidateProfile);
          setTools(data.candidateProfile?.tools || []);
          setLanguages(normalizeLanguages(data.candidateProfile?.languages));
          setResumeUrl(data.candidateProfile?.resume_url || profile.resumeFile || "");
          setTotalExperienceYears(data.candidateProfile?.total_experience_years || 0);
          setTotalExperienceMonths(data.candidateProfile?.total_experience_months || 0);
          setCurrentCompany(data.candidateProfile?.current_company || "");
          setNoticePeriod(data.candidateProfile?.notice_period || "");
          setCurrentSalaryCurrency(data.candidateProfile?.current_salary_currency || "INR");
          setCurrentSalaryAmount(data.candidateProfile?.current_salary_amount ? String(data.candidateProfile.current_salary_amount) : "");
          setExpectedSalaryCurrency(data.candidateProfile?.expected_salary_currency || "INR");
          setExpectedSalaryAmount(data.candidateProfile?.expected_salary_amount ? String(data.candidateProfile.expected_salary_amount) : "");
          setPreferredLocations(data.candidateProfile?.preferred_locations || []);
          setJobTypePreference(toStringArray(data.candidateProfile?.job_type_preference));
          setWorkModePreference(toStringArray(data.candidateProfile?.work_mode_preference));
          setCandidateIndustries(data.candidateProfile?.industries || (data.candidateProfile?.industry ? [data.candidateProfile.industry] : []));
          setFunctionalArea(data.candidateProfile?.functional_area || "");
          setCompanyName(recruiterProfile.company_name || "");
          setCompanyWebsite(recruiterProfile.company_website || "");
          setCompanySize(recruiterProfile.company_size || "1-10");
          setIndustry(recruiterProfile.industry || "Technology");
          setHiringTitle(recruiterProfile.recruiter_title || recruiterProfile.hiring_title || "");
          setCompanyLogoUrl(recruiterProfile.company_logo_url || profile.company_logo_url || "");
          setCompanyLogoSavedUrl(recruiterProfile.company_logo_url || profile.company_logo_url || "");
          setCompanyLogoFile(null);
          setCompanyLogoError(null);
          setCompanyLocation(recruiterProfile.company_location || structuredCompanyLocation || recruiterProfile.location || profile.location || "");
          setCompanyCountry(recruiterProfile.company_country || "");
          setCompanyStateOrRegion(recruiterProfile.company_state_or_region || "");
          setCompanyCity(recruiterProfile.company_city || "");
          setCompanyStreetAddress(recruiterProfile.company_street_address || "");
          setCompanyPostalCode(recruiterProfile.company_postal_code || "");
          setCompanyDescription(recruiterProfile.company_description || "");
          setHiringRoles(recruiterProfile.hiring_roles || []);
          setHiringModel(recruiterProfile.hiring_model || "");
          setHiringLocations(recruiterProfile.hiring_locations || []);
          setRemotePolicy(recruiterProfile.remote_policy || "");
          setMonthlyHiringVolume(recruiterProfile.monthly_hiring_volume || "");
          setPreferredExperienceLevels(recruiterProfile.preferred_experience_levels || []);
          setPreferredSkills(recruiterProfile.preferred_skills || []);
          setCommonSalaryRange(recruiterProfile.common_salary_range || "");
          setUrgentHiring(Boolean(recruiterProfile.urgent_hiring));
        })
        .catch((err) => {
          console.error("[PROFILE EDIT] Load failed", err);
          setError(err instanceof Error ? err.message : "We could not load your profile.");
        })
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [router]);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (role === "recruiter") {
        const recruiterLocation = hasCompleteAddress({
          companyCountry,
          companyStateOrRegion,
          companyCity,
          companyStreetAddress,
          companyPostalCode,
        })
          ? formatCompanyLocation({
              companyCountry,
              companyStateOrRegion,
              companyCity,
              companyStreetAddress,
              companyPostalCode,
            })
          : companyLocation.trim();
        const phoneUpdate = buildRecruiterPhoneUpdate({
          phoneCountry,
          phoneCountryCode,
          phoneNumber,
        });
        let persistedCompanyLogoUrl = companyLogoUrl.startsWith("blob:")
          ? companyLogoSavedUrl
          : companyLogoUrl.trim();

        if (companyLogoFile) {
          try {
            const uploadResult = await uploadService.uploadCompanyLogo(companyLogoFile);
            if (uploadResult.error) {
              setCompanyLogoError(uploadResult.error.message);
              persistedCompanyLogoUrl = companyLogoSavedUrl || persistedCompanyLogoUrl;
            } else {
              persistedCompanyLogoUrl = uploadResult.data.url;
              setCompanyLogoUrl(persistedCompanyLogoUrl);
              setCompanyLogoSavedUrl(persistedCompanyLogoUrl);
              setCompanyLogoFile(null);
              setCompanyLogoError(null);
            }
          } catch (uploadError) {
            console.warn("[PROFILE EDIT] Company logo upload failed", uploadError);
            setCompanyLogoError(uploadError instanceof Error ? uploadError.message : "We could not upload the company logo.");
            persistedCompanyLogoUrl = companyLogoSavedUrl || persistedCompanyLogoUrl;
          }
        }

        await saveRecruiterProfile({
          fullName: fullName.trim(),
          phone: phoneUpdate.phone,
          phoneCountry: phoneUpdate.phoneCountry,
          phoneCountryCode: phoneUpdate.phoneCountryCode,
          phoneNumber: phoneUpdate.phoneNumber,
          location: recruiterLocation || location.trim(),
          recruiterTitle: hiringTitle.trim(),
          companyName: companyName.trim(),
          companyWebsite: normalizeWebsite(companyWebsite),
          companySize,
          industry,
          hiringTitle: hiringTitle.trim(),
          companyLogoUrl: companyLogoUrl.trim() === "" ? "" : persistedCompanyLogoUrl || undefined,
          companyCountry,
          companyStateOrRegion,
          companyCity,
          companyStreetAddress,
          companyPostalCode,
          companyLocation: recruiterLocation || location.trim(),
          companyDescription: companyDescription.trim(),
          hiringRoles: cleanStringList(hiringRoles),
          hiringModel,
          hiringLocations: cleanStringList(hiringLocations),
          remotePolicy,
          monthlyHiringVolume,
          preferredExperienceLevels: cleanStringList(preferredExperienceLevels),
          preferredSkills: cleanStringList(preferredSkills),
          commonSalaryRange,
          urgentHiring,
          onboardingCompleted: true,
          onboardingStep: 5,
        });
      } else {
        let persistedAvatarUrl = avatarUrl.startsWith("blob:") ? "" : avatarUrl;

        if (avatarFile) {
          const uploadResult = await uploadService.uploadAvatar(avatarFile);
          if (uploadResult.error) throw new Error(uploadResult.error.message);
          persistedAvatarUrl = uploadResult.data.url;
          setAvatarUrl(persistedAvatarUrl);
          setAvatarFile(null);
        }

        await saveCandidateProfile({
          fullName,
          headline,
          summary: about,
          location,
          phone,
          avatarUrl: persistedAvatarUrl,
          resumeUrl,
          totalExperience: `${totalExperienceYears} years ${totalExperienceMonths} months`,
          totalExperienceYears,
          totalExperienceMonths,
          experienceLevel: candidateProfile?.experience_level || "",
          currentTitle: headline,
          currentCompany,
          noticePeriod,
          currentSalary: currentSalaryAmount ? `${currentSalaryCurrency} ${currentSalaryAmount}` : "",
          currentSalaryCurrency,
          currentSalaryAmount,
          expectedSalary: expectedSalaryAmount ? `${expectedSalaryCurrency} ${expectedSalaryAmount}` : "",
          expectedSalaryCurrency,
          expectedSalaryAmount,
          preferredLocations,
          jobTypePreference,
          workModePreference,
          skills,
          tools,
          languages,
          industry: candidateIndustries[0] || "",
          industries: candidateIndustries,
          functionalArea,
          experiences: candidateProfile?.experiences || [],
          education: candidateProfile?.education ?? [],
          certifications: candidateProfile?.certifications || [],
          projects: candidateProfile?.projects || [],
        });
      }

      await refreshUser();
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error("[PROFILE EDIT] Save failed", err);
      setError(err instanceof Error ? err.message : "We could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState variant="spinner" />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <h1 className="text-xl font-semibold tracking-tight mb-6">
            Edit Profile
          </h1>

          <div className="space-y-6">
            {(error || success) && (
              <p
                role="alert"
                className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${
                  error
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                {error && <AlertCircle className="h-4 w-4" />}
                {error || success}
              </p>
            )}

            <section className="rounded-xl border border-border/30 bg-background p-5">
              <h2 className="text-sm font-semibold mb-4">Basic Information</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">
                    Full Name
                  </label>
                  <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-10 text-sm" />
                </div>
                {role !== "recruiter" && (
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">
                      Headline
                    </label>
                    <Input value={headline} onChange={(event) => setHeadline(event.target.value)} className="h-10 text-sm" />
                  </div>
                )}
                {role !== "recruiter" && (
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">
                      Location
                    </label>
                    <Input value={location} onChange={(event) => setLocation(event.target.value)} className="h-10 text-sm" />
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium mb-1.5 block">
                    Email
                  </label>
                  <Input value={email} disabled className="h-10 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">
                    Phone
                  </label>
                  {role === "recruiter" ? (
                    <RecruiterPhoneInput
                      value={buildRecruiterPhoneValue(phoneCountry, phoneCountryCode, phoneNumber)}
                      onChange={(value) => {
                        setPhoneCountry(value.phoneCountry);
                        setPhoneCountryCode(value.phoneCountryCode);
                        setPhoneNumber(value.phoneNumber);
                      }}
                    />
                  ) : (
                    <Input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-10 text-sm" />
                  )}
                </div>
                {role !== "recruiter" && (
                  <div>
                    <label className="text-xs font-medium mb-1.5 block">
                      Profile image URL
                    </label>
                    <Input value={avatarUrl} onChange={(event) => {
                      setAvatarFile(null);
                      setAvatarUrl(event.target.value);
                    }} className="h-10 text-sm" placeholder="https://..." />
                  </div>
                )}
              </div>
            </section>

            {role === "recruiter" ? (
              <>
                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">Recruiter Identity</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <SelectField label="Recruiter title" value={hiringTitle} options={recruiterTitleOptions} onChange={setHiringTitle} />
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Company location summary</label>
                      <Input value={recruiterCompanyLocationPreview} disabled className="h-10 text-sm" placeholder="Auto-filled from address fields" />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">Company Information</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Company name</label>
                      <Input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Company website</label>
                      <Input value={companyWebsite} onChange={(event) => setCompanyWebsite(event.target.value)} onBlur={() => setCompanyWebsite(normalizeWebsite(companyWebsite))} className="h-10 text-sm" />
                    </div>
                    <SelectField label="Company size" value={companySize} options={companySizeOptions} onChange={setCompanySize} />
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Industry</label>
                      <SearchableCombobox
                        value={industry}
                        options={recruiterIndustryOptions}
                        onChange={setIndustry}
                        placeholder="Search or select industry"
                        customLabelPrefix="Add custom industry: "
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <CompanyLogoUploader
                        previewUrl={companyLogoUrl}
                        fallbackLabel={(companyName || "iJ").slice(0, 2).toUpperCase()}
                        onChange={(value) => {
                          setCompanyLogoUrl(value);
                          setCompanyLogoError(null);
                        }}
                        onFileChange={(file) => setCompanyLogoFile(file)}
                        onRemove={async () => {
                          if (companyLogoSavedUrl) {
                            try {
                              const result = await uploadService.delete(companyLogoSavedUrl);
                              if (result.error) {
                                console.warn("[PROFILE EDIT] Company logo delete failed", result.error);
                              }
                            } catch (removeError) {
                              console.warn("[PROFILE EDIT] Company logo delete failed", removeError);
                            }
                          }
                          setCompanyLogoUrl("");
                          setCompanyLogoSavedUrl("");
                          setCompanyLogoFile(null);
                          setCompanyLogoError(null);
                        }}
                        onError={(message) => setCompanyLogoError(message)}
                      />
                      {companyLogoError ? <p className="mt-2 text-xs text-red-600">{companyLogoError}</p> : null}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium mb-1.5 block">Company description</label>
                      <textarea
                        value={companyDescription}
                        onChange={(event) => setCompanyDescription(event.target.value.slice(0, 500))}
                        className="w-full min-h-[110px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                        placeholder="A short candidate-facing description of your company."
                      />
                      <p className="mt-1.5 text-xs text-muted-foreground">{companyDescription.length}/500 characters</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">Company Address</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Country</label>
                      <SearchableCombobox
                        value={companyCountry}
                        options={countryOptions}
                        onChange={(value) => {
                          setCompanyCountry(value);
                          setCompanyStateOrRegion("");
                        }}
                        placeholder="Search or select country"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">State / region</label>
                      <SearchableCombobox
                        value={companyStateOrRegion}
                        options={companyCountry ? getStateRegionOptions(companyCountry) : []}
                        onChange={setCompanyStateOrRegion}
                        placeholder="Search or select state/region"
                        disabled={!companyCountry}
                        customLabelPrefix="Add custom state/region: "
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">City</label>
                      <Input value={companyCity} onChange={(event) => setCompanyCity(event.target.value)} className="h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Postal code</label>
                      <Input value={companyPostalCode} onChange={(event) => setCompanyPostalCode(event.target.value)} className="h-10 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium mb-1.5 block">Street address</label>
                      <Input value={companyStreetAddress} onChange={(event) => setCompanyStreetAddress(event.target.value)} className="h-10 text-sm" />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">Hiring Setup</h2>
                  <div className="space-y-5">
                    <TagEditor label="Hiring roles" value={hiringRoles} suggestions={hiringRoleSuggestions} onChange={setHiringRoles} placeholder="Add role and press Enter" />
                    <SelectField label="Hiring model" value={hiringModel} options={hiringModelOptions} onChange={setHiringModel} />
                    <TagEditor label="Hiring locations" value={hiringLocations} suggestions={hiringLocationSuggestions} onChange={setHiringLocations} placeholder="Add location and press Enter" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Remote policy" value={remotePolicy} options={remotePolicyOptions} onChange={setRemotePolicy} includeBlank />
                      <SelectField label="Monthly hiring volume" value={monthlyHiringVolume} options={monthlyHiringVolumeOptions} onChange={setMonthlyHiringVolume} includeBlank />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">AI Preferences</h2>
                  <div className="space-y-5">
                    <PillEditor label="Preferred experience levels" value={preferredExperienceLevels} options={preferredExperienceLevelOptions} onChange={setPreferredExperienceLevels} />
                    <TagEditor label="Preferred skills" value={preferredSkills} suggestions={preferredSkillSuggestions} onChange={setPreferredSkills} placeholder="Add skill and press Enter" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField label="Common salary range" value={commonSalaryRange} options={commonSalaryRangeOptions} onChange={setCommonSalaryRange} includeBlank />
                      <label className="flex items-center justify-between gap-4 rounded-xl border border-border/30 p-4">
                        <span>
                          <span className="block text-sm font-medium">Urgent hiring</span>
                          <span className="mt-1 block text-xs text-muted-foreground">Mark this profile as actively hiring.</span>
                        </span>
                        <input type="checkbox" checked={urgentHiring} onChange={(event) => setUrgentHiring(event.target.checked)} className="h-5 w-5" />
                      </label>
                    </div>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">About</h2>
                  <textarea
                    value={about}
                    onChange={(event) => setAbout(event.target.value)}
                    className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
                    placeholder="Write a short bio..."
                  />
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">Career Preferences</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Total experience years</label>
                      <Input type="number" min={0} value={totalExperienceYears} onChange={(event) => setTotalExperienceYears(Number(event.target.value))} className="h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Total experience months</label>
                      <Input type="number" min={0} max={11} value={totalExperienceMonths} onChange={(event) => setTotalExperienceMonths(Number(event.target.value))} className="h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Current company</label>
                      <Input value={currentCompany} onChange={(event) => setCurrentCompany(event.target.value)} className="h-10 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Notice period</label>
                      <Input value={noticePeriod} onChange={(event) => setNoticePeriod(event.target.value)} className="h-10 text-sm" />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <CurrencySelect value={currentSalaryCurrency} onChange={setCurrentSalaryCurrency} />
                      <Input value={currentSalaryAmount} onChange={(event) => setCurrentSalaryAmount(event.target.value)} className="h-10 text-sm" placeholder="Current salary" />
                    </div>
                    <div className="grid grid-cols-[120px_1fr] gap-2">
                      <CurrencySelect value={expectedSalaryCurrency} onChange={setExpectedSalaryCurrency} />
                      <Input value={expectedSalaryAmount} onChange={(event) => setExpectedSalaryAmount(event.target.value)} className="h-10 text-sm" placeholder="Expected salary" />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4">
                    <MultiSelectCombobox label="Preferred locations" options={cities} value={preferredLocations} onChange={setPreferredLocations} />
                    <MultiSelectCombobox label="Job type" options={jobTypeOptions} value={jobTypePreference} onChange={setJobTypePreference} />
                    <MultiSelectCombobox label="Work mode" options={workModeOptions} value={workModePreference} onChange={setWorkModePreference} />
                    <MultiSelectCombobox label="Industries" options={industryOptions} value={candidateIndustries} onChange={setCandidateIndustries} />
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Functional area</label>
                      <Input value={functionalArea} onChange={(event) => setFunctionalArea(event.target.value)} className="h-10 text-sm" />
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-3">Skills, Tools, and Languages</h2>
                  <div className="space-y-5">
                    <MultiSelectCombobox label="Skills" options={skillsList} value={skills} onChange={setSkills} suggestions={getDesignationRecommendations(headline).skills} placeholder="Search skills..." />
                    <MultiSelectCombobox label="Tools" options={toolsList} value={tools} onChange={setTools} suggestions={getDesignationRecommendations(headline).tools} placeholder="Search tools..." />
                    <LanguageSelector value={languages} onChange={setLanguages} />
                  </div>
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <h2 className="text-sm font-semibold mb-4">Profile Assets</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <ProfileImageUploader previewUrl={avatarUrl} initials={(fullName || email || "U").slice(0, 2).toUpperCase()} onChange={setAvatarUrl} onFileChange={setAvatarFile} onError={setError} />
                    <div>
                      <label className="text-xs font-medium mb-1.5 block">Resume URL</label>
                      <Input value={resumeUrl} onChange={(event) => setResumeUrl(event.target.value)} className="h-10 text-sm" placeholder="https://..." />
                      <p className="mt-2 text-xs text-muted-foreground">Upload support appears here when storage is configured.</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border/30 bg-background p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldOff className="h-4 w-4 text-muted-foreground" />
                    <h2 className="text-sm font-semibold">Blocked Companies</h2>
                  </div>
                  {!blockedCompaniesLoaded ? (
                    <p className="text-sm text-muted-foreground">Loading blocked companies...</p>
                  ) : blockedCompanies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No blocked companies yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {blockedCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border/30 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{company.companyName}</p>
                            <p className="text-xs text-muted-foreground">
                              Blocked {formatBlockedDate(company.createdAt)}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-xl"
                            disabled={blockedCompanySavingIds.has(company.id)}
                            onClick={() => void unblockCompany(company.id)}
                          >
                            {blockedCompanySavingIds.has(company.id) ? "Removing..." : "Unblock"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}

            <div className="flex items-center justify-between gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/profile">Cancel</Link>
              </Button>
              <Button size="sm" className="rounded-xl" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  includeBlank = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  includeBlank?: boolean;
}) {
  const datalistId = `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-options`;
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block">{label}</label>
      <Input
        value={value}
        list={datalistId}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 text-sm"
        placeholder={includeBlank ? "Optional" : undefined}
      />
      <datalist id={datalistId}>
        {includeBlank && <option value="" />}
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
}

function TagEditor({
  label,
  value,
  suggestions,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  suggestions: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = (raw: string) => {
    const next = raw.trim();
    if (!next || value.some((item) => item.toLowerCase() === next.toLowerCase())) return;
    onChange([...value, next]);
    setInput("");
  };

  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block">{label}</label>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {value.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium">
            {item}
            <button type="button" onClick={() => onChange(value.filter((selected) => selected !== item))} aria-label={`Remove ${item}`}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              add(input);
            }
          }}
          className="h-10 text-sm"
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={() => add(input)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {suggestions
          .filter((item) => !value.some((selected) => selected.toLowerCase() === item.toLowerCase()))
          .slice(0, 8)
          .map((item) => (
            <button key={item} type="button" onClick={() => add(item)} className="rounded-lg border border-border/30 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
              {item}
            </button>
          ))}
      </div>
    </div>
  );
}

function PillEditor({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string[];
  options: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(selected ? value.filter((item) => item !== option) : [...value, option])}
              className={`rounded-full border px-3 py-1.5 text-sm ${selected ? "border-foreground bg-foreground text-background" : "border-border/30 text-muted-foreground hover:text-foreground"}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
