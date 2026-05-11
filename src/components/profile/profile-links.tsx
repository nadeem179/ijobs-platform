"use client";

import { SocialLink } from "@/types/profile";
import { Globe, ExternalLink } from "lucide-react";

const linkIcons: Record<string, string> = {
  linkedin: "in",
  github: "gh",
  dribbble: "db",
  website: "web",
};

interface ProfileLinksProps {
  links: SocialLink[];
}

export function ProfileLinks({ links }: ProfileLinksProps) {
  if (links.length === 0) return null;

  return (
    <section>
      <h2 className="text-sm font-semibold mb-3">Links</h2>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border/30 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors"
          >
            <Globe className="h-3 w-3" />
            {link.label}
            <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
          </a>
        ))}
      </div>
    </section>
  );
}