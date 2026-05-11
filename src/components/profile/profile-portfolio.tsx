"use client";

import { PortfolioItem } from "@/types/profile";
import { ExternalLink } from "lucide-react";
import { SkillBadge } from "@/components/jobs/skill-badge";

interface ProfilePortfolioProps {
  portfolio: PortfolioItem[];
}

export function ProfilePortfolio({ portfolio }: ProfilePortfolioProps) {
  return (
    <section>
      <h2 className="text-sm font-semibold mb-3">Portfolio</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {portfolio.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border/30 bg-background p-4"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="text-sm font-medium">{item.title}</h3>
              {item.projectUrl && (
                <a
                  href={item.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
              {item.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {item.tools.map((tool) => (
                <SkillBadge key={tool}>{tool}</SkillBadge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}