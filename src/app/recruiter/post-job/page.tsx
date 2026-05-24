"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecruiterHeader } from "@/components/recruiter/recruiter-header";
import { Input } from "@/components/ui/input";
import { useRecruiterLimits } from "@/hooks/use-recruiter-limits";
import { UpgradeModal } from "@/components/recruiter/upgrade-modal";
import { useToast } from "@/components/ui/toast";
import { recruiterService } from "@/services";
import type { PostJobData } from "@/services/types/service-types";
import { RecruiterGuard } from "@/components/navigation/recruiter-guard";
import {
  createScreeningQuestion,
  screeningTypeNeedsOptions,
  type ScreeningQuestion,
  type ScreeningQuestionType,
} from "@/types/screening";

const allSkills = [
  "React",
  "TypeScript",
  "Next.js",
  "JavaScript",
  "Python",
  "Go",
  "PostgreSQL",
  "MongoDB",
  "Docker",
  "Kubernetes",
  "AWS",
  "Figma",
  "Design Systems",
  "User Research",
  "Tailwind CSS",
  "GraphQL",
  "gRPC",
  "Node.js",
];

type JobStatus = "active" | "draft" | "inactive" | "closed";

interface JobFormState {
  title: string;
  company: string;
  companyLogo: string;
  companyDescription: string;
  companySize: string;
  companyIndustry: string;
  location: string;
  locationType: string;
  jobType: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  salaryPeriod: "year" | "hour";
  salaryVerified: boolean;
  experience: string;
  description: string;
  responsibilities: string;
  requirements: string;
  preferredQualifications: string;
  benefits: string;
  screeningQuestions: ScreeningQuestion[];
  status: JobStatus;
}

const initialForm: JobFormState = {
  title: "",
  company: "Diplotix",
  companyLogo: "",
  companyDescription: "",
  companySize: "",
  companyIndustry: "",
  location: "",
  locationType: "Remote",
  jobType: "Full-time",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "INR",
  salaryPeriod: "year",
  salaryVerified: false,
  experience: "Mid",
  description: "",
  responsibilities: "",
  requirements: "",
  preferredQualifications: "",
  benefits: "",
  screeningQuestions: [],
  status: "active",
};

const screeningTypeLabels: Record<ScreeningQuestionType, string> = {
  text: "Text",
  checkboxes: "Checkboxes",
  multiple_choice: "Multiple choice",
  single_choice: "Single choice",
};

const requiredFields: Array<keyof Pick<
  JobFormState,
  | "title"
  | "company"
  | "location"
  | "jobType"
  | "salaryMin"
  | "salaryMax"
  | "experience"
  | "description"
>> = [
  "title",
  "company",
  "location",
  "jobType",
  "salaryMin",
  "salaryMax",
  "experience",
  "description",
];

const fieldLabels: Record<string, string> = {
  title: "Job title",
  company: "Company",
  location: "Location",
  jobType: "Job type",
  salaryMin: "Minimum salary",
  salaryMax: "Maximum salary",
  experience: "Experience",
  description: "Description",
  skills: "Skills",
};

export default function PostJobPage() {
  const router = useRouter();
  const [form, setForm] = useState<JobFormState>(initialForm);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    jobsPosted,
    canPostJob,
    showUpgrade,
    setShowUpgrade,
    incrementJobsPosted,
  } = useRecruiterLimits();
  const { showToast } = useToast();

  const updateField = (field: keyof JobFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const updateBooleanField = (field: keyof JobFormState, value: boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const clearScreeningError = () => {
    setErrors((current) => {
      if (!current.screeningQuestions) return current;
      const next = { ...current };
      delete next.screeningQuestions;
      return next;
    });
  };

  const addScreeningQuestion = () => {
    setForm((current) => ({
      ...current,
      screeningQuestions: [...current.screeningQuestions, createScreeningQuestion()],
    }));
    clearScreeningError();
  };

  const updateScreeningQuestion = (
    id: string,
    update: Partial<ScreeningQuestion>
  ) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.map((question) => {
        if (question.id !== id) return question;
        const next = { ...question, ...update };
        if (update.type && !screeningTypeNeedsOptions(update.type)) {
          next.options = [];
        }
        return next;
      }),
    }));
    clearScreeningError();
  };

  const removeScreeningQuestion = (id: string) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.filter(
        (question) => question.id !== id
      ),
    }));
    clearScreeningError();
  };

  const moveScreeningQuestion = (id: string, direction: -1 | 1) => {
    setForm((current) => {
      const index = current.screeningQuestions.findIndex(
        (question) => question.id === id
      );
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.screeningQuestions.length) {
        return current;
      }

      const next = [...current.screeningQuestions];
      const [question] = next.splice(index, 1);
      next.splice(target, 0, question);
      return { ...current, screeningQuestions: next };
    });
  };

  const updateScreeningOption = (
    questionId: string,
    optionIndex: number,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.map((option, index) =>
                index === optionIndex ? value : option
              ),
            }
          : question
      ),
    }));
    clearScreeningError();
  };

  const addScreeningOption = (questionId: string) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.map((question) =>
        question.id === questionId
          ? { ...question, options: [...question.options, ""] }
          : question
      ),
    }));
    clearScreeningError();
  };

  const removeScreeningOption = (questionId: string, optionIndex: number) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              options: question.options.filter((_, index) => index !== optionIndex),
            }
          : question
      ),
    }));
    clearScreeningError();
  };

  const moveScreeningOption = (
    questionId: string,
    optionIndex: number,
    direction: -1 | 1
  ) => {
    setForm((current) => ({
      ...current,
      screeningQuestions: current.screeningQuestions.map((question) => {
        if (question.id !== questionId) return question;
        const target = optionIndex + direction;
        if (target < 0 || target >= question.options.length) return question;
        const options = [...question.options];
        const [option] = options.splice(optionIndex, 1);
        options.splice(target, 0, option);
        return { ...question, options };
      }),
    }));
  };

  const addSkill = (skill: string) => {
    const nextSkill = skill.trim();
    if (!nextSkill) return;
    if (!skills.includes(nextSkill)) {
      setSkills((current) => [...current, nextSkill]);
    }
    setSkillInput("");
    setErrors((current) => {
      if (!current.skills) return current;
      const next = { ...current };
      delete next.skills;
      return next;
    });
  };

  const removeSkill = (skill: string) => {
    setSkills((current) => current.filter((s) => s !== skill));
  };

  const filteredSkills = useMemo(
    () =>
      allSkills.filter(
        (s) =>
          !skills.includes(s) &&
          s.toLowerCase().includes(skillInput.toLowerCase())
      ),
    [skillInput, skills]
  );

  const validate = () => {
    const nextErrors: Partial<Record<string, string>> = {};

    requiredFields.forEach((field) => {
      if (!form[field].trim()) {
        nextErrors[field] = `${fieldLabels[field]} is required.`;
      }
    });

    const salaryMin = Number(form.salaryMin);
    const salaryMax = Number(form.salaryMax);

    if (form.salaryMin && (!Number.isFinite(salaryMin) || salaryMin <= 0)) {
      nextErrors.salaryMin = "Enter a valid minimum salary.";
    }

    if (form.salaryMax && (!Number.isFinite(salaryMax) || salaryMax <= 0)) {
      nextErrors.salaryMax = "Enter a valid maximum salary.";
    }

    if (salaryMin > 0 && salaryMax > 0 && salaryMin > salaryMax) {
      nextErrors.salaryMax = "Maximum salary must be greater than minimum salary.";
    }

    if (skills.length === 0) {
      nextErrors.skills = "Add at least one skill.";
    }

    const invalidQuestion = form.screeningQuestions.find((question) => {
      if (!question.question.trim()) return true;
      if (!screeningTypeNeedsOptions(question.type)) return false;
      return question.options.map((option) => option.trim()).filter(Boolean).length < 2;
    });

    if (invalidQuestion) {
      nextErrors.screeningQuestions =
        "Each screening question needs text. Option questions need at least two options.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPayload = (status: JobStatus): PostJobData => {
    const toList = (value: string) =>
      value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    const screeningQuestions = form.screeningQuestions.map((question) => ({
      ...question,
      question: question.question.trim(),
      options: screeningTypeNeedsOptions(question.type)
        ? question.options.map((option) => option.trim()).filter(Boolean)
        : [],
    }));

    return {
      title: form.title.trim(),
      company: form.company.trim(),
      companyLogo: form.companyLogo.trim(),
      companyDescription: form.companyDescription.trim(),
      companySize: form.companySize.trim(),
      companyIndustry: form.companyIndustry.trim(),
      location: form.location.trim(),
      jobType: form.jobType,
      locationType: form.locationType,
      salaryMin: Number(form.salaryMin),
      salaryMax: Number(form.salaryMax),
      currency: form.salaryCurrency,
      salaryPeriod: form.salaryPeriod,
      salaryVerified: form.salaryVerified,
      experience: form.experience,
      experienceLevel: form.experience,
      skills,
      description: form.description.trim(),
      screeningQuestions,
      status,
      responsibilities: toList(form.responsibilities),
      requirements: toList(form.requirements),
      preferredQualifications: toList(form.preferredQualifications),
      benefits: toList(form.benefits),
    };
  };

  const saveJob = async (status: JobStatus) => {
    if (!validate()) {
      showToast("Please complete the required job details.", "error");
      return;
    }

    if (!canPostJob) {
      setShowUpgrade(true);
      return;
    }

    setIsSubmitting(true);
    const result = await recruiterService.postJob(buildPayload(status));
    setIsSubmitting(false);

    if (result.error) {
      showToast(result.error.message || "Could not publish job.", "error");
      console.error("[JOBS] Save failed", result.error);
      return;
    }

    incrementJobsPosted();
    showToast(status === "draft" ? "Draft saved successfully!" : "Job published successfully!", "success");
    setForm(initialForm);
    setSkills([]);
    setErrors({});
    router.push("/recruiter");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveJob("active");
  };

  const errorFor = (field: string) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{errors[field]}</p>
    ) : null;
  const listFields = [
    { field: "responsibilities", label: "Responsibilities" },
    { field: "requirements", label: "Requirements" },
    { field: "preferredQualifications", label: "Nice to have" },
    { field: "benefits", label: "Benefits" },
  ] as const;

  return (
    <RecruiterGuard>
    <div className="min-h-screen">
      <section className="border-b border-border/40 bg-muted/20">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <RecruiterHeader />
        </div>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/recruiter"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-semibold tracking-tight">
            Post a New Job
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            First job post is free. Extra job posts use the ₹500 payment placeholder.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="mb-4 text-sm font-semibold">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium">
                  Job Title
                </label>
                <Input
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="h-10 text-sm"
                />
                {errorFor("title")}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Company
                </label>
                <Input
                  value={form.company}
                  onChange={(event) => updateField("company", event.target.value)}
                  className="h-10 text-sm"
                />
                {errorFor("company")}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Company Logo
                </label>
                <Input
                  value={form.companyLogo}
                  onChange={(event) => updateField("companyLogo", event.target.value)}
                  placeholder="Optional initials or logo URL"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Company Size
                </label>
                <Input
                  value={form.companySize}
                  onChange={(event) => updateField("companySize", event.target.value)}
                  placeholder="e.g. 50-100 employees"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Company Industry
                </label>
                <Input
                  value={form.companyIndustry}
                  onChange={(event) => updateField("companyIndustry", event.target.value)}
                  placeholder="e.g. SaaS, Fintech"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Location
                </label>
                <Input
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="e.g. Bengaluru, India"
                  className="h-10 text-sm"
                />
                {errorFor("location")}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Work Mode
                </label>
                <select
                  value={form.locationType}
                  onChange={(event) => updateField("locationType", event.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Job Type
                </label>
                <select
                  value={form.jobType}
                  onChange={(event) => updateField("jobType", event.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
                {errorFor("jobType")}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Experience
                </label>
                <select
                  value={form.experience}
                  onChange={(event) => updateField("experience", event.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option>Entry</option>
                  <option>Mid</option>
                  <option>Senior</option>
                  <option>Staff</option>
                  <option>Lead</option>
                </select>
                {errorFor("experience")}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium">
                  Company Description
                </label>
                <textarea
                  value={form.companyDescription}
                  onChange={(event) => updateField("companyDescription", event.target.value)}
                  className="min-h-[80px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Short company overview shown on job details."
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as JobStatus)
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="mb-4 text-sm font-semibold">Compensation</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Min Salary
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.salaryMin}
                  onChange={(event) => updateField("salaryMin", event.target.value)}
                  placeholder="500000"
                  className="h-10 text-sm"
                />
                {errorFor("salaryMin")}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Max Salary
                </label>
                <Input
                  type="number"
                  min="0"
                  value={form.salaryMax}
                  onChange={(event) => updateField("salaryMax", event.target.value)}
                  placeholder="1200000"
                  className="h-10 text-sm"
                />
                {errorFor("salaryMax")}
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Currency
                </label>
                <select
                  value={form.salaryCurrency}
                  onChange={(event) => updateField("salaryCurrency", event.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option>INR</option>
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium">
                  Salary Period
                </label>
                <select
                  value={form.salaryPeriod}
                  onChange={(event) =>
                    updateField("salaryPeriod", event.target.value as "year" | "hour")
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="year">Year</option>
                  <option value="hour">Hour</option>
                </select>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.salaryVerified}
                  onChange={(event) =>
                    updateBooleanField("salaryVerified", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-input"
                />
                Salary range verified
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="mb-3 text-sm font-semibold">Skills Required</h2>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Input
                placeholder="Search or add skills..."
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                className="h-10 text-sm"
              />
              {skillInput && filteredSkills.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border/30 bg-background p-1.5 shadow-lg">
                  {filteredSkills.map((skill) => (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      <Plus className="h-3 w-3" />
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errorFor("skills")}
          </section>

          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="mb-4 text-sm font-semibold">Description</h2>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="min-h-[120px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Describe the role, your company, and what you're looking for..."
            />
            {errorFor("description")}
          </section>

          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="mb-4 text-sm font-semibold">Job Detail Lists</h2>
            <div className="grid gap-4">
              {listFields.map(({ field, label }) => (
                <div key={field}>
                  <label className="mb-1.5 block text-xs font-medium">{label}</label>
                  <textarea
                    value={form[field]}
                    onChange={(event) =>
                      updateField(field, event.target.value)
                    }
                    className="min-h-[80px] w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Add one item per line."
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-border/30 bg-background p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Screening Questions</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Optional. Ask only what helps you review applicants faster.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-xl"
                onClick={addScreeningQuestion}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add question
              </Button>
            </div>

            {form.screeningQuestions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/40 bg-muted/20 px-4 py-5 text-sm text-muted-foreground">
                No screening questions yet. Jobs can still be published without questions.
              </div>
            ) : (
              <div className="space-y-4">
                {form.screeningQuestions.map((question, questionIndex) => (
                  <div
                    key={question.id}
                    className="rounded-xl border border-border/30 bg-background p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Question {questionIndex + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveScreeningQuestion(question.id, -1)}
                          disabled={questionIndex === 0}
                          className="rounded-md border border-border/40 px-2 py-1 text-xs text-muted-foreground disabled:opacity-40"
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveScreeningQuestion(question.id, 1)}
                          disabled={questionIndex === form.screeningQuestions.length - 1}
                          className="rounded-md border border-border/40 px-2 py-1 text-xs text-muted-foreground disabled:opacity-40"
                        >
                          Down
                        </button>
                        <button
                          type="button"
                          onClick={() => removeScreeningQuestion(question.id)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                          aria-label="Remove screening question"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-xs font-medium">
                          Question
                        </label>
                        <Input
                          value={question.question}
                          onChange={(event) =>
                            updateScreeningQuestion(question.id, {
                              question: event.target.value,
                            })
                          }
                          placeholder="e.g. What is your notice period?"
                          className="h-10 text-sm"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-medium">
                          Answer type
                        </label>
                        <select
                          value={question.type}
                          onChange={(event) =>
                            updateScreeningQuestion(question.id, {
                              type: event.target.value as ScreeningQuestionType,
                            })
                          }
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {Object.entries(screeningTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {question.type === "text"
                            ? "Free text answer."
                            : question.type === "single_choice"
                              ? "Candidate can select only one option."
                              : "Candidate can select multiple options."}
                        </p>
                      </div>

                      <label className="flex h-10 items-center gap-2 self-end text-xs font-medium">
                        <input
                          type="checkbox"
                          checked={question.required}
                          onChange={(event) =>
                            updateScreeningQuestion(question.id, {
                              required: event.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-input"
                        />
                        Required answer
                      </label>
                    </div>

                    {screeningTypeNeedsOptions(question.type) && (
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <label className="block text-xs font-medium">Options</label>
                          <button
                            type="button"
                            onClick={() => addScreeningOption(question.id)}
                            className="text-xs font-medium text-foreground underline-offset-4 hover:underline"
                          >
                            Add option
                          </button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(event) =>
                                  updateScreeningOption(
                                    question.id,
                                    optionIndex,
                                    event.target.value
                                  )
                                }
                                placeholder={`Option ${optionIndex + 1}`}
                                className="h-10 text-sm"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  moveScreeningOption(question.id, optionIndex, -1)
                                }
                                disabled={optionIndex === 0}
                                className="rounded-md border border-border/40 px-2 py-1 text-xs text-muted-foreground disabled:opacity-40"
                              >
                                Up
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  moveScreeningOption(question.id, optionIndex, 1)
                                }
                                disabled={optionIndex === question.options.length - 1}
                                className="rounded-md border border-border/40 px-2 py-1 text-xs text-muted-foreground disabled:opacity-40"
                              >
                                Down
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  removeScreeningOption(question.id, optionIndex)
                                }
                                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                                aria-label="Remove option"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          {question.options.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                              Add at least two options before publishing.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errorFor("screeningQuestions")}
          </section>

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/recruiter">Cancel</Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                disabled={isSubmitting}
                onClick={() => void saveJob("draft")}
              >
                {isSubmitting ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                type="submit"
                size="sm"
                className="rounded-xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Publishing..." : "Publish Job"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        jobsPosted={jobsPosted}
      />
    </div>
    </RecruiterGuard>
  );
}
