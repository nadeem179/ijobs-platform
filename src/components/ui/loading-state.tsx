"use client";

import { LogoIcon } from "@/branding";

interface LoadingStateProps {
  variant?: "spinner" | "skeleton";
  rows?: number;
}

export function LoadingState({ variant = "spinner", rows = 3 }: LoadingStateProps) {
  if (variant === "spinner") {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border border-muted-foreground/20 border-t-muted-foreground/70" />
          <LogoIcon size={20} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-24 rounded-xl border border-border/30 bg-background p-4 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-muted/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-muted/60" />
              <div className="h-3 w-1/2 rounded bg-muted/40" />
              <div className="flex gap-2">
                <div className="h-5 w-16 rounded bg-muted/40" />
                <div className="h-5 w-20 rounded bg-muted/40" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
