"use client";

import { cn } from "@/lib/utils";

const roles = [
  "UI/UX Designer",
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
  "Product Designer",
  "Product Manager",
  "Data Scientist",
  "DevOps Engineer",
  "Mobile Developer",
  "Student",
  "Freelancer",
  "Other",
];

interface RoleSelectorProps {
  selected: string | null;
  onSelect: (role: string) => void;
}

export function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold tracking-tight">
          What describes you best?
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          This helps us tailor your job recommendations.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {roles.map((role) => (
          <button
            key={role}
            onClick={() => onSelect(role)}
            className={cn(
              "rounded-xl border px-3.5 py-3 text-sm font-medium transition-all text-left",
              selected === role
                ? "border-primary bg-primary/5 text-primary shadow-sm"
                : "border-border/40 bg-background text-muted-foreground hover:border-border/70 hover:text-foreground"
            )}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}