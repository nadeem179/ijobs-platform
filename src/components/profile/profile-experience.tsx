"use client";

import { Experience } from "@/types/profile";
import { SkillBadge } from "@/components/jobs/skill-badge";
import Link from "next/link";

interface ProfileExperienceProps {
  experience: Experience[];
  onEdit?: () => void;
}

export function ProfileExperience({ experience, onEdit }: ProfileExperienceProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Experience</h2>
        {onEdit ? (
          <button type="button" onClick={onEdit} className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Edit
          </button>
        ) : (
          <Link href="/profile/edit" className="text-xs font-medium text-muted-foreground hover:text-foreground">
            Edit
          </Link>
        )}
      </div>
      <div className="space-y-4">
        {experience.map((exp) => (
          <div
            key={exp.id}
            className="rounded-xl border border-border/30 bg-background p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div>
                <h3 className="text-sm font-medium">{exp.role}</h3>
                <p className="text-xs text-muted-foreground">{exp.company}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {exp.startDate} — {exp.endDate ?? "Present"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2.5">
              {exp.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {exp.skills.map((skill) => (
                <SkillBadge key={skill}>{skill}</SkillBadge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
