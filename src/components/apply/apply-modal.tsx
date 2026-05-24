"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { AuthModal } from "@/components/auth/auth-modal";
import { ProgressStepper } from "@/components/onboarding/progress-stepper";
import { cn } from "@/lib/utils";

const STEPS = ["Auth"];

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  continueTo?: string;
}

export function ApplyModal({ isOpen, onClose, continueTo }: ApplyModalProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      setClosing(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-200",
          closing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      <div
        className={cn(
          "relative flex max-h-[100dvh] w-full flex-col overflow-y-auto bg-background shadow-xl transition-all duration-200 sm:mx-4 sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl",
          closing
            ? "translate-y-4 opacity-0 sm:scale-95"
            : "translate-y-0 opacity-100 sm:scale-100"
        )}
      >
        <div className="sticky top-0 z-10 border-b border-border/20 bg-background px-5 pb-3 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={handleClose}
              className="-ml-1.5 rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-xs text-muted-foreground">Sign in</span>
          </div>
          <ProgressStepper steps={STEPS} currentIndex={0} />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <AuthModal onClose={handleClose} continueTo={continueTo} />
        </div>
      </div>
    </div>
  );
}
