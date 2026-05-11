"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

const availableSkills = [
  "Figma", "React", "TypeScript", "JavaScript", "UI Design", "UX Research",
  "Prototyping", "Design Systems", "CSS", "HTML", "Node.js", "Python",
  "GraphQL", "REST APIs", "PostgreSQL", "MongoDB", "Docker", "Kubernetes",
  "AWS", "GCP", "Swift", "Kotlin", "React Native", "Flutter",
  "Product Strategy", "Data Analysis", "Machine Learning", "Agile",
  "Git", "CI/CD", "Next.js", "Tailwind CSS", "Animation", "Accessibility",
];

interface SkillSelectorProps {
  selected: string[];
  onToggle: (skill: string) => void;
}

export function SkillSelector({ selected, onToggle }: SkillSelectorProps) {
  const [query, setQuery] = useState("");

  const filtered = query
    ? availableSkills.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : availableSkills;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold tracking-tight">
          What are your skills?
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Select the skills that best represent your expertise.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          className="pl-9 h-10 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-lg bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium"
            >
              {skill}
              <button
                onClick={() => onToggle(skill)}
                className="hover:bg-primary/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Skill grid */}
      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
        {filtered.map((skill) => {
          const isSelected = selected.includes(skill);
          return (
            <button
              key={skill}
              onClick={() => onToggle(skill)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all",
                isSelected
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "border-border/40 text-muted-foreground hover:border-border/70 hover:text-foreground"
              )}
            >
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
}