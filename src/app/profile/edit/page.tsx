"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SkillBadge } from "@/components/jobs/skill-badge";
import { mockProfile } from "@/data/profile";
import { ArrowLeft, Plus, X } from "lucide-react";

const allSkills = [
  "Product Design",
  "Design Systems",
  "Figma",
  "User Research",
  "Prototyping",
  "UI/UX",
  "Interaction Design",
  "Design Strategy",
  "HTML/CSS",
  "React",
  "Storybook",
  "Design Tokens",
  "TypeScript",
  "Accessibility",
  "Motion Design",
  "Illustration",
];

export default function ProfileEditPage() {
  const [profile] = useState(mockProfile);
  const [skills, setSkills] = useState(profile.skills);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const filteredSkillOptions = allSkills.filter(
    (s) => !skills.includes(s) && s.toLowerCase().includes(skillInput.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
        {/* Back */}
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
          {/* Basic Info */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-4">Basic Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Full Name
                </label>
                <Input
                  defaultValue={profile.name}
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Headline
                </label>
                <Input
                  defaultValue={profile.headline}
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Location
                </label>
                <Input
                  defaultValue={profile.location}
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Email
                </label>
                <Input
                  defaultValue={profile.email}
                  className="h-10 text-sm"
                />
              </div>
            </div>
          </section>

          {/* About */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-4">About</h2>
            <textarea
              defaultValue={profile.about}
              className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="Write a short bio..."
            />
          </section>

          {/* Skills */}
          <section className="rounded-xl border border-border/30 bg-background p-5">
            <h2 className="text-sm font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-lg bg-muted/70 px-2.5 py-1 text-xs font-medium"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-muted-foreground hover:text-foreground"
                  >
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
              {skillInput && filteredSkillOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-border/30 bg-background shadow-lg p-1.5 max-h-48 overflow-y-auto">
                  {filteredSkillOptions.map((skill) => (
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

          {/* Save */}
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/profile">Cancel</Link>
            </Button>
            <Button size="sm" className="rounded-xl" asChild>
              <Link href="/profile">Save Changes</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}