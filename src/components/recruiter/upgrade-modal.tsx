"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { Sparkles, ArrowRight } from "lucide-react";
import { getUpgradeMessage } from "@/hooks/use-recruiter-limits";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobsPosted: number;
}

export function UpgradeModal({ isOpen, onClose, jobsPosted }: UpgradeModalProps) {
  const msg = getUpgradeMessage(jobsPosted);

  return (
    <AuthModalShell isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight mb-2">
            {msg.title}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {msg.message}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button
            size="lg"
            className="rounded-xl w-full"
            asChild
          >
            <Link href="/pricing" onClick={onClose}>
              {msg.cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </AuthModalShell>
  );
}