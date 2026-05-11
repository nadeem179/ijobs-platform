"use client";

import { Profile } from "@/types/profile";
import { CheckCircle, XCircle } from "lucide-react";

interface ProfileStrengthProps {
  profile: Profile;
}

export function ProfileStrength({ profile }: ProfileStrengthProps) {
  const checks = [
    { label: "Verified email", done: profile.verifiedEmail },
    { label: "Resume uploaded", done: !!profile.resumeFile },
    { label: "Skills added", done: profile.skills.length >= 5 },
    { label: "Portfolio added", done: profile.portfolio.length >= 1 },
    {
      label: "Experience filled",
      done: profile.experience.length >= 1,
    },
  ];

  const completed = checks.filter((c) => c.done).length;
  const percent = Math.round((completed / checks.length) * 100);

  return (
    <div className="rounded-xl border border-border/30 bg-background p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Profile strength</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {percent}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted mb-3">
        <div
          className="h-1.5 rounded-full bg-emerald-500 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {checks.map((check) => (
          <li
            key={check.label}
            className="flex items-center gap-2 text-xs text-muted-foreground"
          >
            {check.done ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
            )}
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}