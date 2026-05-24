"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, ArrowRight } from "lucide-react";
import type { ParsedResume } from "@/services/impl/parsing.service";

interface ParsedReviewProps {
  parsed: ParsedResume;
  onConfirm: (data: ParsedResume) => void;
  onSkip: () => void;
}

export function ParsedReview({ parsed, onConfirm, onSkip }: ParsedReviewProps) {
  const [data, setData] = useState<ParsedResume>(parsed);
  const [skillInput, setSkillInput] = useState("");
  const skills = data.skills || [];

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setData({ ...data, skills: [...skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setData({ ...data, skills: skills.filter((s) => s !== skill) });
  };

  return (
    <div>
      <h1 className="text-xl font-bold tracking-tight mb-1">Review your information</h1>
      <p className="text-sm text-muted-foreground mb-5">
        We extracted these details from your resume. Edit anything that needs
        correcting.
      </p>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">Full Name</label>
          <Input
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="h-10 text-sm"
          />
        </div>

        {/* Headline */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">Professional Headline</label>
          <Input
            value={data.headline}
            onChange={(e) => setData({ ...data, headline: e.target.value })}
            className="h-10 text-sm"
          />
        </div>

        {/* Location */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">Location</label>
          <Input
            value={data.location}
            onChange={(e) => setData({ ...data, location: e.target.value })}
            className="h-10 text-sm"
          />
        </div>

        {/* Skills */}
        <div>
          <label className="text-xs font-medium mb-1.5 block">Skills</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
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
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              className="h-9 text-sm flex-1"
            />
            <Button variant="outline" size="sm" className="shrink-0" onClick={addSkill}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>
            Skip for now
          </Button>
          <Button size="sm" className="rounded-xl" onClick={() => onConfirm(data)}>
            Looks good
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
