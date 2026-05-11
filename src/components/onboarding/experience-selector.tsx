"use client";

import { cn } from "@/lib/utils";

const levels = [
  { id: "fresher", label: "Fresher", description: "0–1 years of experience" },
  { id: "junior", label: "Junior", description: "1–3 years of experience" },
  { id: "mid", label: "Mid-level", description: "3–6 years of experience" },
  { id: "senior", label: "Senior", description: "6+ years of experience" },
];

interface ExperienceSelectorProps {
  selected: string | null;
  onSelect: (level: string) => void;
}

export function ExperienceSelector({ selected, onSelect }: ExperienceSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold tracking-tight">
          What's your experience level?
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          This helps match you with the right opportunities.
        </p>
      </div>
      <div className="space-y-2">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => onSelect(level.id)}
            className={cn(
              "w-full text-left rounded-xl border px-4 py-3.5 transition-all",
              selected === level.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border/40 hover:border-border/70"
            )}
          >
            <p
              className={cn(
                "text-sm font-medium",
                selected === level.id ? "text-primary" : "text-foreground"
              )}
            >
              {level.label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {level.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}