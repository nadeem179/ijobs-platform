"use client";

import { Loader2 } from "lucide-react";

export function ParsingProgress() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 mb-5">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
      <h2 className="text-lg font-semibold tracking-tight mb-2">
        Reading your resume
      </h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        We're extracting your information. You'll be able to review
        and edit everything before we save it.
      </p>
      <div className="mx-auto mt-6 h-1.5 w-48 rounded-full bg-muted overflow-hidden">
        <div className="h-full w-2/3 rounded-full bg-primary animate-pulse" />
      </div>
    </div>
  );
}