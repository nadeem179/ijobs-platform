"use client";

import { SocialLink } from "@/types/profile";
import { useState } from "react";
import { AlertCircle, ExternalLink, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCandidateSocialLink } from "@/lib/profile/persistence";
import { normalizeExternalUrl } from "@/lib/profile/urls";

interface ProfileLinksProps {
  links: SocialLink[];
  onSaved?: () => void;
}

const platforms = [
  { id: "linkedin", label: "LinkedIn", host: "linkedin.com" },
  { id: "github", label: "GitHub", host: "github.com" },
  { id: "dribbble", label: "Dribbble", host: "dribbble.com" },
  { id: "portfolio", label: "Portfolio", host: "" },
] as const;

type Platform = (typeof platforms)[number]["id"];

function validatePlatformUrl(platform: Platform, value: string) {
  const normalized = normalizeExternalUrl(value);
  if (!normalized) return "";
  try {
    const host = new URL(normalized).hostname.replace(/^www\./, "");
    if (platform === "portfolio") return normalized;
    const expected = platforms.find((item) => item.id === platform)?.host;
    return expected && (host === expected || host.endsWith(`.${expected}`)) ? normalized : "";
  } catch {
    return "";
  }
}

export function ProfileLinks({ links, onSaved }: ProfileLinksProps) {
  const [editing, setEditing] = useState<Platform | null>(null);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openEditor = (platform: Platform) => {
    setEditing(platform);
    setError(null);
    setUrl(links.find((link) => link.id === platform)?.url || "");
  };

  const save = async (nextUrl: string) => {
    if (!editing || isSaving) return;
    const normalized = nextUrl ? validatePlatformUrl(editing, nextUrl) : "";
    if (nextUrl && !normalized) {
      const label = platforms.find((item) => item.id === editing)?.label || "Link";
      setError(`Enter a valid ${label} URL.`);
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await saveCandidateSocialLink(editing, normalized);
      setEditing(null);
      onSaved?.();
    } catch (err) {
      console.error("[PROFILE LINKS] Save failed", err);
      setError(err instanceof Error ? err.message : "We could not save this link.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section>
      <h2 className="text-sm font-semibold mb-3">Links</h2>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const link = links.find((item) => item.id === platform.id);
          const normalized = link?.url ? normalizeExternalUrl(link.url) : "";
          return (
            <span key={platform.id} className="inline-flex items-center overflow-hidden rounded-lg border border-border/30 bg-background text-xs font-medium text-muted-foreground transition-colors hover:border-border/60">
              <button
                type="button"
                onClick={() => openEditor(platform.id)}
                title={normalized ? `Edit ${platform.label}` : `Add ${platform.label}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 hover:text-foreground"
              >
                <Globe className="h-3 w-3" />
                {platform.label}
              </button>
              {normalized && (
                <a
                  href={normalized}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-l border-border/30 px-2 py-1.5 text-muted-foreground/70 hover:text-foreground"
                  aria-label={`Open ${platform.label}`}
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </span>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-2xl border border-border/30 bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border/20 px-5 py-4">
              <h3 className="text-base font-semibold">
                {platforms.find((item) => item.id === editing)?.label}
              </h3>
              <button type="button" onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground" aria-label="Close link editor">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {error && (
                <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium">URL</label>
                <Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://..." className="h-10 text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border/20 px-5 py-4">
              <Button type="button" variant="ghost" size="sm" onClick={() => void save("")} disabled={isSaving || !links.some((link) => link.id === editing)}>
                Remove link
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
                <Button type="button" size="sm" className="rounded-xl" onClick={() => void save(url)} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
