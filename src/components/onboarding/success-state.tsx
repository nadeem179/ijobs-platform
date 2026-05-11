"use client";

import { CheckCircle, ArrowRight, TrendingUp, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface SuccessStateProps {
  onClose: () => void;
  jobTitle?: string;
  companyName?: string;
}

export function SuccessState({
  onClose,
  jobTitle = "the position",
  companyName = "the company",
}: SuccessStateProps) {
  return (
    <div className="space-y-6 text-center">
      {/* Success icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950">
        <CheckCircle className="h-8 w-8 text-emerald-500" />
      </div>

      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Application submitted
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Your application for <span className="font-medium text-foreground">{jobTitle}</span>{" "}
          at <span className="font-medium text-foreground">{companyName}</span>{" "}
          has been received. The team will review it shortly.
        </p>
      </div>

      {/* Tracker preview */}
      <div className="rounded-xl border border-border/40 bg-muted/20 p-4 text-left">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs font-medium text-muted-foreground">
            Application status
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Received</span>
          </div>
          <div className="h-px flex-1 bg-border/40" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <span className="text-[10px] text-muted-foreground">2</span>
            </div>
            <span className="text-xs text-muted-foreground">Review</span>
          </div>
          <div className="h-px flex-1 bg-border/40" />
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
              <span className="text-[10px] text-muted-foreground">3</span>
            </div>
            <span className="text-xs text-muted-foreground">Decision</span>
          </div>
        </div>
      </div>

      {/* Recommended actions */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-muted-foreground text-left">
          Recommended next steps
        </p>
        <Link
          href="/jobs"
          className="flex items-center gap-3 rounded-xl border border-border/40 p-3.5 transition-colors hover:border-border/70 text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Browse recommended jobs</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Based on your skills and experience
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-xl border border-border/40 p-3.5 transition-colors hover:border-border/70 text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/5">
            <Bookmark className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Complete your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              60% complete — add more details
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-11 rounded-xl text-sm"
          onClick={onClose}
        >
          Done
        </Button>
        <Button size="lg" className="flex-1 h-11 rounded-xl text-sm" asChild>
          <Link href="/jobs">Browse more jobs</Link>
        </Button>
      </div>
    </div>
  );
}