"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Edit3, Plus, Sparkles, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { UploadZone } from "@/components/resume/upload-zone";
import {
  CurrencySelect,
  LanguageSelector,
  MultiSelectCombobox,
  ProfileImageUploader,
  SingleSelectCombobox,
  type LanguageValue,
} from "@/components/profile/onboarding-controls";
import {
  cities,
  designations,
  getDesignationRecommendations,
  industries,
  jobTypeOptions,
  skillsList,
  toolsList,
  workModeOptions,
} from "@/lib/profile/options";
import {
  saveCandidateProfile,
  type CertificationPayload,
  type EducationPayload,
  type ExperiencePayload,
  type ProjectPayload,
} from "@/lib/profile/persistence";
import { parseResume, type ParsedResume } from "@/services/impl/parsing.service";
import { uploadService } from "@/services";

const steps = ["Resume", "Basic", "Preferences", "Skills", "Experience", "Education", "Certifications", "Projects", "Photo", "Review"];
const years = Array.from({ length: 41 }, (_, index) => index);
const months = Array.from({ length: 12 }, (_, index) => index);

const emptyExperience = (): ExperiencePayload => ({
  title: "",
  company: "",
  employment_type: "Full-time",
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

export default function CandidateOnboarding() {
  const router = useRouter();
  const { user, isLoading, completeOnboarding, getPostAuthRedirect, setOnboardingStep } = useAuth();
  const [step, setStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [fullName, setFullName] = useState(user?.name || "");
  const [headline, setHeadline] = useState("");
  const [designation, setDesignation] = useState("");
  const [summary, setSummary] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [experienceYears, setExperienceYears] = useState(0);
  const [experienceMonths, setExperienceMonths] = useState(0);
  const [currentCompany, setCurrentCompany] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [currentSalaryCurrency, setCurrentSalaryCurrency] = useState("INR");
  const [currentSalaryAmount, setCurrentSalaryAmount] = useState("");
  const [expectedSalaryCurrency, setExpectedSalaryCurrency] = useState("INR");
  const [expectedSalaryAmount, setExpectedSalaryAmount] = useState("");
  const [preferredLocations, setPreferredLocations] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [workModes, setWorkModes] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [functionalArea, setFunctionalArea] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [languages, setLanguages] = useState<LanguageValue[]>([]);
  const [experiences, setExperiences] = useState<ExperiencePayload[]>([emptyExperience()]);
  const [education, setEducation] = useState<EducationPayload[]>([emptyEducation()]);
  const [certifications, setCertifications] = useState<CertificationPayload[]>([]);
  const [projects, setProjects] = useState<ProjectPayload[]>([]);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const recommendations = getDesignationRecommendations(designation);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/home");
      return;
    }
    const nextRoute = getPostAuthRedirect(user);
    if (nextRoute !== "/onboarding/candidate") {
      const timer = window.setTimeout(() => {
        setIsRedirecting(true);
        router.replace(nextRoute);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      if (user.onboardingStep === "candidate_profile") setStep(1);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [getPostAuthRedirect, isLoading, router, user]);

  useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      setFullName((value) => value || user.name);
      setAvatarUrl((value) => value || user.avatarUrl || "");
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  const applyParsedResume = (parsed: ParsedResume) => {
    setFullName((value) => value || parsed.full_name || user?.name || "");
    setHeadline((value) => value || parsed.headline || parsed.current_title || "");
    setDesignation((value) => value || parsed.designation || parsed.headline || "");
    setSummary((value) => value || parsed.about || "");
    setPhone((value) => value || parsed.phone || "");
    setLocation((value) => value || parsed.location || "");
    setExperienceYears((value) => value || parsed.total_experience_years || 0);
    setExperienceMonths((value) => value || parsed.total_experience_months || 0);
    setCurrentCompany((value) => value || parsed.current_company || "");
    setSkills((value) => (value.length ? value : parsed.skills || []));
    setTools((value) => (value.length ? value : parsed.tools || []));
    setLanguages((value) => (value.length ? value : normalizeParsedLanguages(parsed.languages)));
    setExperiences((value) => (value.some((item) => item.title || item.company) ? value : normalizeParsedExperiences(parsed.experiences)));
    setEducation((value) => (value.some((item) => item.degree || item.institution) ? value : normalizeParsedEducation(parsed.education)));
    setCertifications((value) => (value.length ? value : normalizeParsedCertifications(parsed.certifications)));
    setProjects((value) => (value.length ? value : normalizeParsedProjects(parsed.projects)));
  };

  const goNext = async () => {
    setError(null);
    if (step === 0) await setOnboardingStep("candidate_profile");
    setStep((value) => Math.min(value + 1, steps.length - 1));
  };

  const analyzeResume = async () => {
    if (!resumeFile || isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await parseResume(resumeFile);
      if (result.success && result.data) applyParsedResume(result.data);
      if (result.error) setError(result.error);
      await goNext();
    } catch (err) {
      console.error("[CANDIDATE ONBOARDING] Resume analysis failed", err);
      setError("We could not analyze this resume. You can continue manually.");
      await goNext();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveCandidate = async () => {
    if (isSaving || isRedirecting) return;
    setIsSaving(true);
    setIsRedirecting(false);
    setError(null);
    try {
      if (!user?.id) throw new Error("You must be signed in to finish onboarding.");
      const totalExperience = `${experienceYears} years ${experienceMonths} months`;
      const currentSalary = currentSalaryAmount ? `${currentSalaryCurrency} ${currentSalaryAmount}` : "";
      const expectedSalary = expectedSalaryAmount ? `${expectedSalaryCurrency} ${expectedSalaryAmount}` : "";
      let persistedAvatarUrl = avatarUrl.startsWith("blob:") ? "" : avatarUrl;

      if (avatarFile) {
        const uploadResult = await uploadService.uploadAvatar(avatarFile);
        if (uploadResult.error) throw new Error(uploadResult.error.message);
        persistedAvatarUrl = uploadResult.data.url;
        setAvatarUrl(persistedAvatarUrl);
        setAvatarFile(null);
      }

      await saveCandidateProfile({
        fullName: fullName || user.name,
        headline: headline || designation,
        summary,
        location,
        phone,
        avatarUrl: persistedAvatarUrl,
        resumeUrl,
        totalExperience,
        totalExperienceYears: experienceYears,
        totalExperienceMonths: experienceMonths,
        currentCompany,
        noticePeriod,
        currentSalary,
        currentSalaryCurrency,
        currentSalaryAmount,
        expectedSalary,
        expectedSalaryCurrency,
        expectedSalaryAmount,
        preferredLocations,
        jobTypePreference: jobTypes,
        workModePreference: workModes,
        skills,
        tools,
        languages,
        industry: selectedIndustries.join(", "),
        industries: selectedIndustries,
        functionalArea,
        experiences,
        education,
        certifications,
        projects,
      });

      await completeOnboarding("candidate", {
        full_name: fullName || user.name,
        phone,
        location,
        avatar_url: persistedAvatarUrl,
        headline: headline || designation,
      });
      setIsRedirecting(true);
      router.replace("/dashboard");
    } catch (err) {
      console.error("[CANDIDATE ONBOARDING] Save failed", err);
      setIsRedirecting(false);
      setError(err instanceof Error ? err.message : "We could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateExperience = (index: number, patch: Partial<ExperiencePayload>) => {
    setExperiences((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const updateEducation = (index: number, patch: Partial<EducationPayload>) => {
    setEducation((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const updateCertification = (index: number, patch: Partial<CertificationPayload>) => {
    setCertifications((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };
  const updateProject = (index: number, patch: Partial<ProjectPayload>) => {
    setProjects((items) => items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  function normalizeParsedLanguages(values: ParsedResume["languages"]) {
    if (!Array.isArray(values)) return [];
    return values.map((item) =>
      typeof item === "string"
        ? { language: item, fluency: "Professional working" }
        : { language: item.language || "", fluency: item.fluency || "Professional working" }
    ).filter((item) => item.language);
  }

  function normalizeParsedExperiences(values: ParsedResume["experiences"]) {
    if (!Array.isArray(values)) return [emptyExperience()];
    return values.map((item) => ({
      ...emptyExperience(),
      title: typeof item.title === "string" ? item.title : "",
      company: typeof item.company === "string" ? item.company : "",
      employment_type: typeof item.employment_type === "string" ? item.employment_type : "Full-time",
      location: typeof item.location === "string" ? item.location : "",
      start_date: typeof item.start_date === "string" ? item.start_date : "",
      end_date: typeof item.end_date === "string" ? item.end_date : "",
      currently_working: Boolean(item.currently_working),
      description: typeof item.description === "string" ? item.description : "",
      achievements: typeof item.achievements === "string" ? item.achievements : "",
      skills_used: Array.isArray(item.skills_used) ? item.skills_used.filter((skill): skill is string => typeof skill === "string") : [],
    }));
  }

  function normalizeParsedEducation(values: ParsedResume["education"]) {
    if (!Array.isArray(values)) return [emptyEducation()];
    return values.map((item) => {
      if (typeof item === "string") {
        return { ...emptyEducation(), degree: item };
      }
      return {
        ...emptyEducation(),
        degree: typeof item.degree === "string" ? item.degree : "",
        institution: typeof item.institution === "string" ? item.institution : "",
        field_of_study: typeof item.field_of_study === "string" ? item.field_of_study : "",
        start_year: typeof item.start_year === "string" ? item.start_year : "",
        end_year: typeof item.end_year === "string" ? item.end_year : "",
        grade: typeof item.grade === "string" ? item.grade : "",
        description: typeof item.description === "string" ? item.description : "",
      };
    });
  }

  function normalizeParsedCertifications(values: ParsedResume["certifications"]) {
    if (!Array.isArray(values)) return [];
    return values.map((item) => ({
      ...emptyCertification(),
      name: typeof item.name === "string" ? item.name : "",
      issuer: typeof item.issuer === "string" ? item.issuer : "",
      issue_date: typeof item.issue_date === "string" ? item.issue_date : "",
      expiry_date: typeof item.expiry_date === "string" ? item.expiry_date : "",
      credential_id: typeof item.credential_id === "string" ? item.credential_id : "",
      credential_url: typeof item.credential_url === "string" ? item.credential_url : "",
    }));
  }

  function normalizeParsedProjects(values: ParsedResume["projects"]) {
    if (!Array.isArray(values)) return [];
    return values.map((item) => ({
      ...emptyProject(),
      name: typeof item.name === "string" ? item.name : "",
      role: typeof item.role === "string" ? item.role : "",
      description: typeof item.description === "string" ? item.description : "",
      tech_stack: Array.isArray(item.tech_stack) ? item.tech_stack.filter((tool): tool is string => typeof tool === "string") : [],
      project_url: typeof item.project_url === "string" ? item.project_url : "",
      start_date: typeof item.start_date === "string" ? item.start_date : "",
      end_date: typeof item.end_date === "string" ? item.end_date : "",
    }));
  }

  const initials = (fullName || user?.name || user?.email || "User")
    .split(/[ @._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (isLoading || !user || isRedirecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <LoadingState variant="spinner" />
        {isRedirecting && <p className="text-sm text-muted-foreground">Taking you to your dashboard...</p>}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="max-w-3xl w-full">
        <div className="mb-8">
          <p className="text-xs font-medium text-muted-foreground mb-2">Step {step + 1} of {steps.length}: {steps[step]}</p>
          <div className="grid grid-cols-10 gap-1.5">
            {steps.map((item, index) => <div key={item} className={`h-2 rounded-full ${index <= step ? "bg-primary" : "bg-muted"}`} />)}
          </div>
        </div>

        {error && <p role="alert" className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"><AlertCircle className="h-4 w-4" />{error}</p>}

        <div className="space-y-5">
          {step === 0 && (
            <>
              <StepTitle title="Upload your resume" description="We extract text from the file, send it to OpenRouter, and you can edit everything before saving." />
              <Field label="Signed-in email" value={user.email} onChange={() => undefined} disabled />
              <UploadZone onFileSelected={(file) => { setResumeFile(file); setResumeUrl(file.name); setError(null); }} disabled={isAnalyzing} />
              {resumeUrl && <p className="text-xs text-muted-foreground">Selected: {resumeUrl}</p>}
            </>
          )}

          {step === 1 && (
            <>
              <StepTitle title="Basic details" description="Add the details recruiters see first." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Signed-in email" value={user.email} onChange={() => undefined} disabled />
                <Field label="Full name" value={fullName} onChange={setFullName} />
                <SingleSelectCombobox
                  label="Designation"
                  options={designations}
                  value={designation}
                  onChange={(value) => {
                    setDesignation(value);
                    setHeadline((current) => current || value);
                  }}
                  placeholder="Select your current designation"
                />
                <Field label="Headline" value={headline} onChange={setHeadline} />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field label="Location" value={location} onChange={setLocation} />
                <Field label="Current company" value={currentCompany} onChange={setCurrentCompany} />
              </div>
              <TextArea label="Summary" value={summary} onChange={setSummary} />
            </>
          )}

          {step === 2 && (
            <>
              <StepTitle title="Career preferences" description="Use structured preferences to improve matching." />
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectNumber label="Years" value={experienceYears} onChange={setExperienceYears} options={years} />
                <SelectNumber label="Months" value={experienceMonths} onChange={setExperienceMonths} options={months} />
                <SalaryInput label="Current salary" currency={currentSalaryCurrency} amount={currentSalaryAmount} onCurrency={setCurrentSalaryCurrency} onAmount={setCurrentSalaryAmount} />
                <SalaryInput label="Expected salary" currency={expectedSalaryCurrency} amount={expectedSalaryAmount} onCurrency={setExpectedSalaryCurrency} onAmount={setExpectedSalaryAmount} />
                <Field label="Notice period" value={noticePeriod} onChange={setNoticePeriod} />
                <Field label="Functional area" value={functionalArea} onChange={setFunctionalArea} />
              </div>
              <MultiSelectCombobox label="Preferred locations" options={cities} value={preferredLocations} onChange={setPreferredLocations} suggestions={cities.slice(0, 10)} />
              <MultiSelectCombobox label="Job type" options={jobTypeOptions} value={jobTypes} onChange={setJobTypes} suggestions={jobTypeOptions} />
              <MultiSelectCombobox label="Work mode" options={workModeOptions} value={workModes} onChange={setWorkModes} suggestions={workModeOptions} />
              <MultiSelectCombobox label="Industries" options={industries} value={selectedIndustries} onChange={setSelectedIndustries} suggestions={industries.slice(0, 10)} />
            </>
          )}

          {step === 3 && (
            <>
              <StepTitle title="Skills" description="Search, select, and remove chips as needed." />
              <MultiSelectCombobox label="Skills" options={skillsList} value={skills} onChange={setSkills} suggestions={recommendations.skills} />
              <MultiSelectCombobox label="Tools" options={toolsList} value={tools} onChange={setTools} suggestions={recommendations.tools} />
              <LanguageSelector value={languages} onChange={setLanguages} />
            </>
          )}

          {step === 4 && (
            <Repeater title="Experience" onAdd={() => setExperiences((items) => [...items, emptyExperience()])}>
              {experiences.map((item, index) => (
                <EntryCard key={index} onRemove={() => setExperiences((items) => items.filter((_, i) => i !== index))}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Title" value={item.title} onChange={(value) => updateExperience(index, { title: value })} />
                    <Field label="Company" value={item.company} onChange={(value) => updateExperience(index, { company: value })} />
                    <Field label="Employment type" value={item.employment_type} onChange={(value) => updateExperience(index, { employment_type: value })} />
                    <Field label="Location" value={item.location} onChange={(value) => updateExperience(index, { location: value })} />
                    <Field label="Start date" value={item.start_date} onChange={(value) => updateExperience(index, { start_date: value })} />
                    <Field label="End date" value={item.end_date} onChange={(value) => updateExperience(index, { end_date: value })} />
                  </div>
                  <TextArea label="Description" value={item.description} onChange={(value) => updateExperience(index, { description: value })} />
                  <TextArea label="Achievements" value={item.achievements} onChange={(value) => updateExperience(index, { achievements: value })} />
                  <MultiSelectCombobox label="Skills used" options={skillsList} value={item.skills_used} onChange={(value) => updateExperience(index, { skills_used: value })} suggestions={skillsList.slice(0, 10)} />
                </EntryCard>
              ))}
            </Repeater>
          )}

          {step === 5 && (
            <Repeater title="Education" onAdd={() => setEducation((items) => [...items, emptyEducation()])}>
              {education.map((item, index) => (
                <EntryCard key={index} onRemove={() => setEducation((items) => items.filter((_, i) => i !== index))}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Degree" value={item.degree} onChange={(value) => updateEducation(index, { degree: value })} />
                    <Field label="Institution" value={item.institution} onChange={(value) => updateEducation(index, { institution: value })} />
                    <Field label="Field of study" value={item.field_of_study} onChange={(value) => updateEducation(index, { field_of_study: value })} />
                    <Field label="Grade" value={item.grade} onChange={(value) => updateEducation(index, { grade: value })} />
                    <Field label="Start year" value={item.start_year} onChange={(value) => updateEducation(index, { start_year: value })} />
                    <Field label="End year" value={item.end_year} onChange={(value) => updateEducation(index, { end_year: value })} />
                  </div>
                  <TextArea label="Description" value={item.description} onChange={(value) => updateEducation(index, { description: value })} />
                </EntryCard>
              ))}
            </Repeater>
          )}

          {step === 6 && (
            <Repeater title="Certifications" onAdd={() => setCertifications((items) => [...items, emptyCertification()])}>
              {certifications.length === 0 && <p className="text-sm text-muted-foreground">Add certifications if you have them, or continue.</p>}
              {certifications.map((item, index) => (
                <EntryCard key={index} onRemove={() => setCertifications((items) => items.filter((_, i) => i !== index))}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" value={item.name} onChange={(value) => updateCertification(index, { name: value })} />
                    <Field label="Issuer" value={item.issuer} onChange={(value) => updateCertification(index, { issuer: value })} />
                    <Field label="Issue date" value={item.issue_date} onChange={(value) => updateCertification(index, { issue_date: value })} />
                    <Field label="Expiry date" value={item.expiry_date} onChange={(value) => updateCertification(index, { expiry_date: value })} />
                    <Field label="Credential ID" value={item.credential_id} onChange={(value) => updateCertification(index, { credential_id: value })} />
                    <Field label="Credential URL" value={item.credential_url} onChange={(value) => updateCertification(index, { credential_url: value })} />
                  </div>
                </EntryCard>
              ))}
            </Repeater>
          )}

          {step === 7 && (
            <Repeater title="Projects" onAdd={() => setProjects((items) => [...items, emptyProject()])}>
              {projects.length === 0 && <p className="text-sm text-muted-foreground">Add portfolio or work projects if relevant, or continue.</p>}
              {projects.map((item, index) => (
                <EntryCard key={index} onRemove={() => setProjects((items) => items.filter((_, i) => i !== index))}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Project name" value={item.name} onChange={(value) => updateProject(index, { name: value })} />
                    <Field label="Your role" value={item.role} onChange={(value) => updateProject(index, { role: value })} />
                    <Field label="Project URL" value={item.project_url} onChange={(value) => updateProject(index, { project_url: value })} />
                    <Field label="Start date" value={item.start_date} onChange={(value) => updateProject(index, { start_date: value })} />
                    <Field label="End date" value={item.end_date} onChange={(value) => updateProject(index, { end_date: value })} />
                  </div>
                  <MultiSelectCombobox label="Tech stack" options={skillsList.concat(toolsList)} value={item.tech_stack} onChange={(value) => updateProject(index, { tech_stack: value })} suggestions={toolsList.slice(0, 10)} />
                  <TextArea label="Description" value={item.description} onChange={(value) => updateProject(index, { description: value })} />
                </EntryCard>
              ))}
            </Repeater>
          )}

          {step === 8 && (
            <>
              <StepTitle title="Profile image" description="Choose a JPG, PNG, or WebP image up to 500KB." />
              <ProfileImageUploader previewUrl={avatarUrl} initials={initials} onChange={setAvatarUrl} onFileChange={setAvatarFile} onError={setError} />
            </>
          )}

          {step === 9 && (
            <>
              <StepTitle title="Review and complete" description="Every section is visible here. Jump back to add or edit details." />
              <ReviewSection title="Resume" step={0} filled={Boolean(resumeUrl)} onJump={setStep} rows={[["Resume", resumeUrl]]} />
              <ReviewSection title="Basic info" step={1} filled={Boolean(fullName || designation || headline || phone || location || summary)} onJump={setStep} rows={[["Name", fullName], ["Email", user.email], ["Designation", designation], ["Headline", headline], ["Phone", phone], ["Location", location], ["Summary", summary]]} />
              <ReviewSection title="Career preferences" step={2} filled={preferredLocations.length > 0 || jobTypes.length > 0 || workModes.length > 0} onJump={setStep} rows={[["Experience", `${experienceYears} years ${experienceMonths} months`], ["Current salary", `${currentSalaryCurrency} ${currentSalaryAmount}`], ["Expected salary", `${expectedSalaryCurrency} ${expectedSalaryAmount}`], ["Preferred locations", preferredLocations.join(", ")], ["Job types", jobTypes.join(", ")], ["Work modes", workModes.join(", ")], ["Industries", selectedIndustries.join(", ")], ["Functional area", functionalArea]]} />
              <ReviewSection title="Skills" step={3} filled={skills.length > 0 || tools.length > 0 || languages.length > 0} onJump={setStep} rows={[["Skills", skills.join(", ")], ["Tools", tools.join(", ")], ["Languages", languages.map((item) => `${item.language} - ${item.fluency}`).join(", ")]]} />
              <ReviewSection title="Experience" step={4} filled={experiences.some((item) => item.title || item.company)} onJump={setStep} rows={experiences.map((item, index) => [`Experience ${index + 1}`, `${item.title || "Untitled"} at ${item.company || "Company not set"}`])} />
              <ReviewSection title="Education" step={5} filled={education.some((item) => item.degree || item.institution)} onJump={setStep} rows={education.map((item, index) => [`Education ${index + 1}`, `${item.degree || "Degree not set"} - ${item.institution || "Institution not set"}`])} />
              <ReviewSection title="Certifications" step={6} filled={certifications.length > 0} onJump={setStep} rows={certifications.length ? certifications.map((item, index) => [`Certification ${index + 1}`, `${item.name || "Name not set"} - ${item.issuer || "Issuer not set"}`]) : [["Certifications", "Not added"]]} />
              <ReviewSection title="Projects" step={7} filled={projects.length > 0} onJump={setStep} rows={projects.length ? projects.map((item, index) => [`Project ${index + 1}`, `${item.name || "Name not set"} - ${item.role || "Role not set"}`]) : [["Projects", "Not added"]]} />
              <ReviewSection title="Profile image" step={8} filled={Boolean(avatarUrl)} onJump={setStep} rows={[["Profile image", avatarUrl ? "Added" : "Not added"]]} />
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step > 0 && <Button variant="ghost" size="sm" onClick={() => setStep((value) => Math.max(value - 1, 0))} disabled={isSaving || isAnalyzing || isRedirecting}><ArrowLeft className="h-3.5 w-3.5 mr-1.5" />Back</Button>}
            {step === 0 && <Button variant="ghost" size="sm" onClick={goNext} disabled={isAnalyzing || isRedirecting}>Skip and fill manually</Button>}
            {step === 0 ? (
              <Button size="sm" className="rounded-xl ml-auto" onClick={analyzeResume} disabled={!resumeFile || isAnalyzing || isRedirecting}><Sparkles className="h-3.5 w-3.5 mr-1.5" />{isAnalyzing ? "Analyzing..." : "Analyze resume"}</Button>
            ) : step < steps.length - 1 ? (
              <Button size="sm" className="rounded-xl ml-auto" onClick={goNext} disabled={isSaving || isRedirecting}>Continue<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
            ) : (
              <Button size="sm" className="rounded-xl ml-auto" onClick={saveCandidate} disabled={isSaving || isRedirecting}>{isSaving ? "Saving..." : "Complete profile"}<ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StepTitle({ title, description }: { title: string; description: string }) {
  return <div><h1 className="text-xl font-bold tracking-tight mb-1">{title}</h1><p className="text-sm text-muted-foreground">{description}</p></div>;
}

function Field({ label, value, onChange, placeholder, disabled }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return <div><label className="text-xs font-medium mb-1.5 block">{label}</label><Input value={value} onChange={(event) => onChange(event.target.value)} className="h-10 text-sm" placeholder={placeholder} disabled={disabled} /></div>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div><label className="text-xs font-medium mb-1.5 block">{label}</label><textarea value={value} onChange={(event) => onChange(event.target.value)} className="min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" /></div>;
}

function SelectNumber({ label, value, onChange, options }: { label: string; value: number; onChange: (value: number) => void; options: number[] }) {
  return <div><label className="text-xs font-medium mb-1.5 block">{label}</label><select value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>;
}

function SalaryInput({ label, currency, amount, onCurrency, onAmount }: { label: string; currency: string; amount: string; onCurrency: (value: string) => void; onAmount: (value: string) => void }) {
  return <div><label className="text-xs font-medium mb-1.5 block">{label}</label><div className="grid grid-cols-[150px_1fr] gap-2"><CurrencySelect value={currency} onChange={onCurrency} /><Input value={amount} onChange={(event) => onAmount(event.target.value)} className="h-10 text-sm" placeholder="Amount" inputMode="numeric" /></div></div>;
}

function Repeater({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) {
  return <div className="space-y-4"><div className="flex items-center justify-between gap-3"><StepTitle title={title} description="Add as many entries as you need. You can edit everything later." /><Button type="button" variant="outline" size="sm" className="rounded-xl shrink-0" onClick={onAdd}><Plus className="h-3.5 w-3.5 mr-1.5" />Add</Button></div>{children}</div>;
}

function EntryCard({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return <div className="space-y-4 rounded-xl border border-border/30 bg-background p-4"><div className="flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={onRemove}><Trash2 className="h-3.5 w-3.5 mr-1.5" />Remove</Button></div>{children}</div>;
}

function ReviewSection({ title, step, filled, rows, onJump }: { title: string; step: number; filled: boolean; rows: [string, string][]; onJump: (step: number) => void }) {
  return <section className="rounded-xl border border-border/30 bg-background p-4"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">{title}</h2><Button type="button" variant="ghost" size="sm" onClick={() => onJump(step)}>{filled ? <Edit3 className="h-3.5 w-3.5 mr-1.5" /> : <Plus className="h-3.5 w-3.5 mr-1.5" />}{filled ? "Edit" : "Add"}</Button></div><div className="grid gap-3 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label}><p className="text-xs text-muted-foreground mb-1">{label}</p><p className="text-sm font-medium break-words">{value || "Not set"}</p></div>)}</div></section>;
}
