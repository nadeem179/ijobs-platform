"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertCircle, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CurrencySelect,
  LanguageSelector,
  MultiSelectCombobox,
  ProfileImageUploader,
} from "@/components/profile/onboarding-controls";
import {
  cities,
  getDesignationRecommendations,
  industries,
  jobTypeOptions,
  skillsList,
  toolsList,
  workModeOptions,
} from "@/lib/profile/options";
import {
  saveCandidateProfile,
  type CandidateProfileRow,
  type CertificationPayload,
  type EducationPayload,
  type ExperiencePayload,
  type LanguagePayload,
  type LoadedProfile,
  type ProjectPayload,
} from "@/lib/profile/persistence";
import { uploadService } from "@/services";

export type CandidateProfileSection =
  | "basic"
  | "about"
  | "resume"
  | "career"
  | "skills"
  | "tools"
  | "languages"
  | "experience"
  | "education"
  | "certifications"
  | "projects"
  | "image";

const titles: Record<CandidateProfileSection, string> = {
  basic: "Basic details",
  about: "About",
  resume: "Resume",
  career: "Career preferences",
  skills: "Skills",
  tools: "Tools",
  languages: "Languages",
  experience: "Experience",
  education: "Education",
  certifications: "Certifications",
  projects: "Projects",
  image: "Profile image",
};

const experienceLevelOptions = ["Fresher", "Intern", "Junior", "Mid", "Senior", "Lead", "Manager", "Director", "Executive"];

const emptyExperience = (): ExperiencePayload => ({
  title: "",
  company: "",
  employment_type: "",
  location: "",
  start_date: "",
  end_date: "",
  currently_working: false,
  description: "",
  achievements: "",
  skills_used: [],
});

const emptyEducation = (): EducationPayload => ({
  degree: "",
  institution: "",
  field_of_study: "",
  start_year: "",
  end_year: "",
  grade: "",
  description: "",
});

const emptyCertification = (): CertificationPayload => ({
  name: "",
  issuer: "",
  issue_date: "",
  expiry_date: "",
  credential_id: "",
  credential_url: "",
});

const emptyProject = (): ProjectPayload => ({
  name: "",
  role: "",
  description: "",
  tech_stack: [],
  project_url: "",
  start_date: "",
  end_date: "",
});

function asStringArray(value: string[] | string | null | undefined) {
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

function buildBaseUpdate(data: LoadedProfile) {
  const profile = data.profile;
  const candidate = data.candidateProfile;

  return {
    fullName: profile.name,
    headline: candidate?.headline || candidate?.current_title || profile.headline || "",
    summary: candidate?.summary || profile.about || "",
    location: candidate?.location || profile.location || "",
    phone: candidate?.phone || profile.phone || "",
    avatarUrl: candidate?.profile_image_url || candidate?.avatar_url || profile.avatarUrl || "",
    resumeUrl: candidate?.resume_url || profile.resumeFile || "",
    totalExperience: candidate?.total_experience || "",
    totalExperienceYears: candidate?.total_experience_years || 0,
    totalExperienceMonths: candidate?.total_experience_months || 0,
    experienceLevel: candidate?.experience_level || profile.experienceLevel || "",
    currentTitle: candidate?.current_title || candidate?.headline || profile.headline || "",
    currentCompany: candidate?.current_company || "",
    noticePeriod: candidate?.notice_period || "",
    currentSalary: candidate?.current_salary || "",
    currentSalaryCurrency: candidate?.current_salary_currency || "INR",
    currentSalaryAmount: candidate?.current_salary_amount ? String(candidate.current_salary_amount) : "",
    expectedSalary: candidate?.expected_salary || "",
    expectedSalaryCurrency: candidate?.expected_salary_currency || "INR",
    expectedSalaryAmount: candidate?.expected_salary_amount ? String(candidate.expected_salary_amount) : "",
    preferredLocations: candidate?.preferred_locations || [],
    jobTypePreference: asStringArray(candidate?.job_type_preference),
    workModePreference: asStringArray(candidate?.work_mode_preference),
    skills: candidate?.skills || profile.skills || [],
    tools: candidate?.tools || [],
    languages: normalizeLanguages(candidate?.languages),
    industry: candidate?.industry || "",
    industries: candidate?.industries || [],
    functionalArea: candidate?.functional_area || "",
    experiences: candidate?.experiences || [],
    education: candidate?.education || [],
    certifications: candidate?.certifications || [],
    projects: candidate?.projects || [],
    linkedinUrl: candidate?.linkedin_url || "",
    githubUrl: candidate?.github_url || "",
    dribbbleUrl: candidate?.dribbble_url || "",
    portfolioUrl: candidate?.portfolio_url || "",
  };
}

export function CandidateSectionEditor({
  section,
  data,
  onClose,
  onSaved,
}: {
  section: CandidateProfileSection;
  data: LoadedProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const base = useMemo(() => buildBaseUpdate(data), [data]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [fullName, setFullName] = useState(base.fullName);
  const [headline, setHeadline] = useState(base.headline);
  const [location, setLocation] = useState(base.location);
  const [phone, setPhone] = useState(base.phone);
  const [summary, setSummary] = useState(base.summary);
  const [avatarUrl, setAvatarUrl] = useState(base.avatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState(base.resumeUrl);
  const [years, setYears] = useState(base.totalExperienceYears);
  const [months, setMonths] = useState(base.totalExperienceMonths);
  const [experienceLevel, setExperienceLevel] = useState(base.experienceLevel);
  const [currentCompany, setCurrentCompany] = useState(base.currentCompany);
  const [noticePeriod, setNoticePeriod] = useState(base.noticePeriod);
  const [currentSalaryCurrency, setCurrentSalaryCurrency] = useState(base.currentSalaryCurrency);
  const [currentSalaryAmount, setCurrentSalaryAmount] = useState(base.currentSalaryAmount);
  const [expectedSalaryCurrency, setExpectedSalaryCurrency] = useState(base.expectedSalaryCurrency);
  const [expectedSalaryAmount, setExpectedSalaryAmount] = useState(base.expectedSalaryAmount);
  const [preferredLocations, setPreferredLocations] = useState(base.preferredLocations);
  const [jobTypes, setJobTypes] = useState(base.jobTypePreference);
  const [workModes, setWorkModes] = useState(base.workModePreference);
  const [industryValues, setIndustryValues] = useState(base.industries.length ? base.industries : base.industry ? [base.industry] : []);
  const [functionalArea, setFunctionalArea] = useState(base.functionalArea);
  const [skills, setSkills] = useState(base.skills);
  const [tools, setTools] = useState(base.tools);
  const [languagesValue, setLanguagesValue] = useState(base.languages);
  const [experiences, setExperiences] = useState(base.experiences);
  const [education, setEducation] = useState(base.education);
  const [certifications, setCertifications] = useState(base.certifications);
  const [projects, setProjects] = useState(base.projects);

  const save = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      let persistedAvatarUrl = avatarUrl.startsWith("blob:") ? "" : avatarUrl;

      if (avatarFile) {
        const uploadResult = await uploadService.uploadAvatar(avatarFile);
        if (uploadResult.error) throw new Error(uploadResult.error.message);
        persistedAvatarUrl = uploadResult.data.url;
        setAvatarUrl(persistedAvatarUrl);
        setAvatarFile(null);
      }

      await saveCandidateProfile({
        ...base,
        fullName,
        headline,
        summary,
        location,
        phone,
        avatarUrl: persistedAvatarUrl,
        resumeUrl,
        totalExperience: `${years} years ${months} months`,
        totalExperienceYears: years,
        totalExperienceMonths: months,
        experienceLevel,
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
        jobTypePreference: jobTypes,
        workModePreference: workModes,
        skills,
        tools,
        languages: languagesValue,
        industry: industryValues[0] || "",
        industries: industryValues,
        functionalArea,
        experiences,
        education,
        certifications,
        projects,
      });
      onSaved();
    } catch (err) {
      console.error("[PROFILE SECTION] Save failed", err);
      setError(err instanceof Error ? err.message : "We could not save this section.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border/30 bg-background shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border/20 bg-background px-5 py-4">
          <h2 className="text-base font-semibold">{titles[section]}</h2>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close editor">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {error && (
            <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          )}
          {section === "basic" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" value={fullName} onChange={setFullName} />
              <Field label="Headline / designation" value={headline} onChange={setHeadline} />
              <Field label="Phone" value={phone} onChange={setPhone} />
              <Field label="Location" value={location} onChange={setLocation} />
              <div>
                <label className="mb-1.5 block text-xs font-medium">Email</label>
                <Input value={data.profile.email} disabled className="h-10 text-sm" />
              </div>
            </div>
          )}
          {section === "about" && (
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} className="min-h-[160px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          )}
          {section === "resume" && (
            <div>
              <Field label="Resume URL" value={resumeUrl} onChange={setResumeUrl} placeholder="https://..." />
              <p className="mt-2 text-xs text-muted-foreground">Upload support appears here when storage is configured.</p>
            </div>
          )}
          {section === "image" && (
            <ProfileImageUploader previewUrl={avatarUrl} initials={(fullName || data.profile.email || "U").slice(0, 2).toUpperCase()} onChange={setAvatarUrl} onFileChange={setAvatarFile} onError={setError} />
          )}
          {section === "career" && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <NumberField label="Experience years" value={years} onChange={setYears} />
                <NumberField label="Experience months" value={months} onChange={setMonths} />
                <div>
                  <label className="mb-1.5 block text-xs font-medium">Experience level</label>
                  <select value={experienceLevel} onChange={(event) => setExperienceLevel(event.target.value)} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                    <option value="">Select level</option>
                    {experienceLevelOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <Field label="Current company" value={currentCompany} onChange={setCurrentCompany} />
                <Field label="Notice period" value={noticePeriod} onChange={setNoticePeriod} />
                <SalaryField label="Current salary" currency={currentSalaryCurrency} amount={currentSalaryAmount} onCurrency={setCurrentSalaryCurrency} onAmount={setCurrentSalaryAmount} />
                <SalaryField label="Expected salary" currency={expectedSalaryCurrency} amount={expectedSalaryAmount} onCurrency={setExpectedSalaryCurrency} onAmount={setExpectedSalaryAmount} />
              </div>
              <MultiSelectCombobox label="Preferred locations" options={cities} value={preferredLocations} onChange={setPreferredLocations} />
              <MultiSelectCombobox label="Job type" options={jobTypeOptions} value={jobTypes} onChange={setJobTypes} />
              <MultiSelectCombobox label="Work mode" options={workModeOptions} value={workModes} onChange={setWorkModes} />
              <MultiSelectCombobox label="Industries" options={industries} value={industryValues} onChange={setIndustryValues} />
              <Field label="Functional area" value={functionalArea} onChange={setFunctionalArea} />
            </div>
          )}
          {section === "skills" && <MultiSelectCombobox label="Skills" options={skillsList} value={skills} onChange={setSkills} suggestions={getDesignationRecommendations(headline).skills} />}
          {section === "tools" && <MultiSelectCombobox label="Tools" options={toolsList} value={tools} onChange={setTools} suggestions={getDesignationRecommendations(headline).tools} />}
          {section === "languages" && <LanguageSelector value={languagesValue} onChange={setLanguagesValue} />}
          {section === "experience" && <ExperienceEditor value={experiences} onChange={setExperiences} />}
          {section === "education" && <EducationEditor value={education} onChange={setEducation} />}
          {section === "certifications" && <CertificationEditor value={certifications} onChange={setCertifications} />}
          {section === "projects" && <ProjectEditor value={projects} onChange={setProjects} />}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border/20 bg-background px-5 py-4">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button type="button" size="sm" className="rounded-xl" onClick={save} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">{label}</label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 text-sm" placeholder={placeholder} />
    </div>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <Field label={label} value={String(value)} onChange={(next) => onChange(Number(next) || 0)} />;
}

function SalaryField({ label, currency, amount, onCurrency, onAmount }: { label: string; currency: string; amount: string; onCurrency: (value: string) => void; onAmount: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium">{label}</label>
      <div className="grid grid-cols-[120px_1fr] gap-2">
        <CurrencySelect value={currency} onChange={onCurrency} />
        <Input value={amount} onChange={(event) => onAmount(event.target.value)} className="h-10 text-sm" />
      </div>
    </div>
  );
}

function EntryList<T>({ value, onChange, create, render, form }: { value: T[]; onChange: (value: T[]) => void; create: () => T; render: (item: T) => string; form: (item: T, setItem: (item: T) => void) => ReactNode }) {
  const [editingIndex, setEditingIndex] = useState<number | null>(value.length ? 0 : null);
  const [draft, setDraft] = useState<T>(value[0] || create());
  const startNew = () => {
    setEditingIndex(-1);
    setDraft(create());
  };
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setDraft(value[index]);
  };
  const saveDraft = () => {
    onChange(editingIndex === -1 ? [...value, draft] : value.map((item, index) => (index === editingIndex ? draft : item)));
    setEditingIndex(null);
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-center justify-between gap-3 rounded-xl border border-border/30 p-3">
            <p className="text-sm font-medium">{render(item) || "Not set"}</p>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(index)}>Edit</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={startNew}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add
      </Button>
      {editingIndex !== null && (
        <div className="space-y-4 rounded-xl border border-border/30 p-4">
          {form(draft, setDraft)}
          <Button type="button" size="sm" className="rounded-xl" onClick={saveDraft}>Save entry</Button>
        </div>
      )}
    </div>
  );
}

function ExperienceEditor({ value, onChange }: { value: ExperiencePayload[]; onChange: (value: ExperiencePayload[]) => void }) {
  return (
    <EntryList
      value={value}
      onChange={onChange}
      create={emptyExperience}
      render={(item) => `${item.title || "Role"} at ${item.company || "Company"}`}
      form={(item, setItem) => (
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title" value={item.title} onChange={(title) => setItem({ ...item, title })} />
          <Field label="Company" value={item.company} onChange={(company) => setItem({ ...item, company })} />
          <Field label="Employment type" value={item.employment_type} onChange={(employment_type) => setItem({ ...item, employment_type })} />
          <Field label="Location" value={item.location} onChange={(location) => setItem({ ...item, location })} />
          <Field label="Start date" value={item.start_date} onChange={(start_date) => setItem({ ...item, start_date })} />
          <Field label="End date" value={item.end_date} onChange={(end_date) => setItem({ ...item, end_date })} />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-xs font-medium">Description</label>
            <textarea value={item.description} onChange={(event) => setItem({ ...item, description: event.target.value })} className="min-h-[90px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <MultiSelectCombobox label="Skills used" options={skillsList} value={item.skills_used} onChange={(skills_used) => setItem({ ...item, skills_used })} suggestions={skillsList.slice(0, 8)} />
          </div>
        </div>
      )}
    />
  );
}

function EducationEditor({ value, onChange }: { value: EducationPayload[]; onChange: (value: EducationPayload[]) => void }) {
  return (
    <EntryList value={value} onChange={onChange} create={emptyEducation} render={(item) => `${item.degree || "Degree"} at ${item.institution || "Institution"}`} form={(item, setItem) => (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Degree" value={item.degree} onChange={(degree) => setItem({ ...item, degree })} />
        <Field label="Institution" value={item.institution} onChange={(institution) => setItem({ ...item, institution })} />
        <Field label="Field of study" value={item.field_of_study} onChange={(field_of_study) => setItem({ ...item, field_of_study })} />
        <Field label="Grade" value={item.grade} onChange={(grade) => setItem({ ...item, grade })} />
        <Field label="Start year" value={item.start_year} onChange={(start_year) => setItem({ ...item, start_year })} />
        <Field label="End year" value={item.end_year} onChange={(end_year) => setItem({ ...item, end_year })} />
      </div>
    )} />
  );
}

function CertificationEditor({ value, onChange }: { value: CertificationPayload[]; onChange: (value: CertificationPayload[]) => void }) {
  return (
    <EntryList value={value} onChange={onChange} create={emptyCertification} render={(item) => `${item.name || "Certification"} by ${item.issuer || "Issuer"}`} form={(item, setItem) => (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" value={item.name} onChange={(name) => setItem({ ...item, name })} />
        <Field label="Issuer" value={item.issuer} onChange={(issuer) => setItem({ ...item, issuer })} />
        <Field label="Issue date" value={item.issue_date} onChange={(issue_date) => setItem({ ...item, issue_date })} />
        <Field label="Expiry date" value={item.expiry_date} onChange={(expiry_date) => setItem({ ...item, expiry_date })} />
        <Field label="Credential ID" value={item.credential_id} onChange={(credential_id) => setItem({ ...item, credential_id })} />
        <Field label="Credential URL" value={item.credential_url} onChange={(credential_url) => setItem({ ...item, credential_url })} />
      </div>
    )} />
  );
}

function ProjectEditor({ value, onChange }: { value: ProjectPayload[]; onChange: (value: ProjectPayload[]) => void }) {
  return (
    <EntryList value={value} onChange={onChange} create={emptyProject} render={(item) => item.name || "Project"} form={(item, setItem) => (
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Name" value={item.name} onChange={(name) => setItem({ ...item, name })} />
        <Field label="Role" value={item.role} onChange={(role) => setItem({ ...item, role })} />
        <Field label="Project URL" value={item.project_url} onChange={(project_url) => setItem({ ...item, project_url })} />
        <Field label="Start date" value={item.start_date} onChange={(start_date) => setItem({ ...item, start_date })} />
        <Field label="End date" value={item.end_date} onChange={(end_date) => setItem({ ...item, end_date })} />
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium">Description</label>
          <textarea value={item.description} onChange={(event) => setItem({ ...item, description: event.target.value })} className="min-h-[90px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div className="sm:col-span-2">
          <MultiSelectCombobox label="Tech stack" options={toolsList} value={item.tech_stack} onChange={(tech_stack) => setItem({ ...item, tech_stack })} suggestions={toolsList.slice(0, 8)} />
        </div>
      </div>
    )} />
  );
}
