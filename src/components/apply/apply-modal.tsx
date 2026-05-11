"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/auth-modal";
import { RoleSelector } from "@/components/onboarding/role-selector";
import { SkillSelector } from "@/components/onboarding/skill-selector";
import { ExperienceSelector } from "@/components/onboarding/experience-selector";
import { UploadCard } from "@/components/onboarding/upload-card";
import { SuccessState } from "@/components/onboarding/success-state";
import { ProgressStepper } from "@/components/onboarding/progress-stepper";
import { cn } from "@/lib/utils";
import { FileText, Globe } from "lucide-react";

const STEPS = ["Auth", "Role", "Skills", "Experience", "Profile", "Done"];

interface ApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  companyName?: string;
}

export function ApplyModal({
  isOpen,
  onClose,
  jobTitle,
  companyName,
}: ApplyModalProps) {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setRole(null);
      setSkills([]);
      setExperience(null);
      setClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 200);
  };

  const canProceedFromAuth = true; // Always can proceed (auth mock)
  const canProceedFromRole = role !== null;
  const canProceedFromSkills = skills.length > 0;
  const canProceedFromExperience = experience !== null;
  const canProceedFromProfile = true; // Optional

  const handleNext = () => {
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const getCanProceed = () => {
    switch (step) {
      case 0: return canProceedFromAuth;
      case 1: return canProceedFromRole;
      case 2: return canProceedFromSkills;
      case 3: return canProceedFromExperience;
      case 4: return canProceedFromProfile;
      default: return true;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-200",
          closing ? "opacity-0" : "opacity-100"
        )}
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div
        className={cn(
          "relative w-full sm:max-w-lg bg-background shadow-xl transition-all duration-200",
          // Mobile: full-screen bottom sheet
          "sm:rounded-2xl sm:mx-4 max-h-[100dvh] sm:max-h-[85vh] overflow-y-auto",
          // Desktop: centered card
          "flex flex-col",
          closing ? "translate-y-4 sm:scale-95 opacity-0" : "translate-y-0 sm:scale-100 opacity-100"
        )}
      >
        {/* Progress bar */}
        <div className="sticky top-0 z-10 bg-background border-b border-border/20 px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={handleClose}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors -ml-1.5"
            >
              <X className="h-5 w-5" />
            </button>
            <span className="text-xs text-muted-foreground">
              {step === STEPS.length - 1 ? "Complete" : `Step ${step + 1}`}
            </span>
          </div>
          <ProgressStepper steps={STEPS} currentIndex={step} />
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 overflow-y-auto">
          {step === 0 && (
            <AuthModal
              onComplete={handleNext}
              onClose={handleClose}
            />
          )}

          {step === 1 && (
            <RoleSelector selected={role} onSelect={(r) => { setRole(r); handleNext(); }} />
          )}

          {step === 2 && (
            <div className="space-y-4">
              <SkillSelector
                selected={skills}
                onToggle={(s) =>
                  setSkills((prev) =>
                    prev.includes(s)
                      ? prev.filter((x) => x !== s)
                      : [...prev, s]
                  )
                }
              />
            </div>
          )}

          {step === 3 && (
            <ExperienceSelector
              selected={experience}
              onSelect={(e) => { setExperience(e); handleNext(); }}
            />
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-semibold tracking-tight">
                  Optional: Enhance your application
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Add links or files to strengthen your application. Skip if you
                  prefer — you can always add them later.
                </p>
              </div>
              <UploadCard
                label="Resume / CV"
                placeholder="PDF, DOC, or image"
                icon={<FileText className="h-4 w-4" />}
              />
              <UploadCard
                label="Portfolio"
                placeholder="Link to your work"
                icon={<Globe className="h-4 w-4" />}
              />
              <UploadCard
                label="LinkedIn Profile"
                placeholder="linkedin.com/in/yourname"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                }
              />
              <UploadCard
                label="GitHub Profile"
                placeholder="github.com/yourname"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                }
              />

              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleNext}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <SuccessState
              onClose={handleClose}
              jobTitle={jobTitle}
              companyName={companyName}
            />
          )}
        </div>

        {/* Bottom actions (not shown for success or auth — auth has its own buttons) */}
        {step > 0 && step < STEPS.length - 1 && step !== 1 && step !== 3 && (
          <div className="sticky bottom-0 bg-background border-t border-border/20 px-5 py-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="lg"
              className="h-11 rounded-xl text-sm"
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              size="lg"
              className="flex-1 h-11 rounded-xl text-sm"
              onClick={handleNext}
              disabled={!getCanProceed()}
            >
              {step === 4 ? "Submit Application" : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}