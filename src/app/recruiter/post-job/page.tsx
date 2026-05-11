"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { useRecruiterLimits } from "@/hooks/use-recruiter-limits";
import { UpgradeModal } from "@/components/recruiter/upgrade-modal";
import { useToast } from "@/components/ui/toast";

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

export default function PostJobPage() {
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const { jobsPosted, tryPublish, showUpgrade, setShowUpgrade } = useRecruiterLimits();
  const { showToast } = useToast();

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const filteredSkills = allSkills.filter(
    (s) =>
      !skills.includes(s) &&
      s.toLowerCase().includes(skillInput.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/recruiter"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <h1 className="text-xl font-semibold tracking-tight mb-6">
          Post a New Job
        </h1>

        <div className="space-y-6">
          {/* Basic Info */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium mb-1.5 block">
                  Job Title
                </label>
                <Input placeholder="e.g. Senior Frontend Engineer" className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Company</label>
                <Input defaultValue="iJobs" className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Location</label>
                <Input placeholder="e.g. San Francisco, CA" className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Remote Type</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>On-site</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Experience Level</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option>Entry</option>
                  <option>Mid</option>
                  <option>Senior</option>
                  <option>Staff</option>
                  <option>Lead</option>
                </select>
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-4">Compensation</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Min Salary</label>
                <Input type="number" placeholder="150000" className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Max Salary</label>
                <Input type="number" placeholder="250000" className="h-10 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Period</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option>Yearly</option>
                  <option>Hourly</option>
                </select>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-3">Skills Required</h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="relative">
              <Input
                placeholder="Search skills..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="h-10 text-sm"
              />
              {skillInput && filteredSkills.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-border/30 bg-background shadow-lg p-1.5 max-h-48 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {skill}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-4">Description</h2>
            <textarea
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="Describe the role, your company, and what you're looking for..."
            />
          </section>

          {/* Responsibilities */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-4">Responsibilities</h2>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="What will the candidate be doing? One per line."
            />
          </section>

          {/* Requirements */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-4">Requirements</h2>
            <textarea
              className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="What skills and experience are required? One per line."
            />
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/recruiter">Cancel</Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="rounded-xl">
                Save as Draft
              </Button>
              <Button
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  if (tryPublish()) {
                    showToast("Job published successfully!", "success");
                  }
                }}
              >
                Publish Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade modal */}
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        jobsPosted={jobsPosted}
      />
    </div>
  );
}
