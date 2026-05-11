"use client";

/**
 * iJobs Brand System
 *
 * Central brand tokens for the iJobs platform.
 * Single source of truth for all brand references.
 */

export const BRAND = {
  name: "iJobs",
  tagline: "Trusted hiring for modern professionals",
} as const;

export function LogoIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold ${className}`}
    >
      iJ
    </div>
  );
}