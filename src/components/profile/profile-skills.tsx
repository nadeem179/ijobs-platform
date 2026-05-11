"use client";

import { SkillBadge } from "@/components/jobs/skill-badge";

interface ProfileSkillsProps {
  skills: string[];
}

export function ProfileSkills({ skills }: ProfileSkillsProps) {
  return (
    <section>
      <h2 className="text-sm font-semibold mb-3">Skills</h2>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <SkillBadge key={skill}>{skill}</SkillBadge>
        ))}
      </div>
    </section>
  );
}