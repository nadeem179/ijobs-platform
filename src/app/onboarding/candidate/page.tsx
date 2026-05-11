"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadZone } from "@/components/resume/upload-zone";
import { ParsingProgress } from "@/components/resume/parsing-progress";
import { ParsedReview } from "@/components/resume/parsed-review";
import { parseResume } from "@/services/impl/parsing.service";
import type { ParsedResume } from "@/services/impl/parsing.service";
import {
  ArrowRight,
  CheckCircle,
  SkipForward,
  AlertCircle,
} from "lucide-react";

type Step = "upload" | "parsing" | "review" | "manual" | "done";

export default function CandidateOnboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setStep("parsing");
    const result = await parseResume(file);
    if (result.success && result.data) {
      setParsed(result.data);
      setStep("review");
    } else {
      setParseError(result.error || "Parsing failed. Please enter details manually.");
      setStep("manual");
    }
  };

  const handleConfirmParsed = (data: ParsedResume) => {
    completeOnboarding();
    router.push("/jobs");
  };

  const handleSkip = () => {
    completeOnboarding();
    router.push("/jobs");
  };

  const handleManualComplete = () => {
    completeOnboarding();
    router.push("/jobs");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className={`h-2 flex-1 rounded-full ${
              step === "done" || step === "manual" ? "bg-primary" : "bg-muted"
            }`}
          />
          <div
            className={`h-2 flex-1 rounded-full ${
              step === "review" || step === "manual" || step === "done"
                ? "bg-primary"
                : "bg-muted"
            }`}
          />
          <div
            className={`h-2 flex-1 rounded-full ${
              step === "done" ? "bg-primary" : "bg-muted"
            }`}
          />
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight mb-2">
              Upload your resume
            </h1>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
              We'll extract your information and pre-fill your profile.
              You can review and edit everything before we save it.
            </p>
            <UploadZone onFileSelected={handleFileSelected} />
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              onClick={() => setStep("manual")}
            >
              <SkipForward className="h-3.5 w-3.5 mr-1.5" />
              Skip, I'll fill manually
            </Button>
          </div>
        )}

        {/* Step 2: Parsing */}
        {step === "parsing" && <ParsingProgress />}

        {/* Step 3: Review parsed data */}
        {step === "review" && parsed && (
          <ParsedReview
            parsed={parsed}
            onConfirm={handleConfirmParsed}
            onSkip={handleSkip}
          />
        )}

        {/* Step 4: Manual fallback */}
        {step === "manual" && (
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-1">
              Complete your profile
            </h1>
            <p className="text-sm text-muted-foreground mb-5">
              {parseError ? (
                <span className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {parseError}
                </span>
              ) : (
                "Add a few details to help recruiters find you."
              )}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Full Name
                </label>
                <Input
                  defaultValue={parsed?.name || ""}
                  placeholder="Your name"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Professional Headline
                </label>
                <Input
                  defaultValue={parsed?.headline || ""}
                  placeholder="e.g. Senior Product Designer"
                  className="h-10 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">
                  Location
                </label>
                <Input
                  defaultValue={parsed?.location || ""}
                  placeholder="e.g. San Francisco, CA"
                  className="h-10 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={handleSkip}>
                  Skip for now
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl ml-auto"
                  onClick={handleManualComplete}
                >
                  Complete profile
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Done */}
        {step === "done" && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950 mb-5">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">
              You're all set!
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              Start exploring verified opportunities tailored for you.
            </p>
            <Button size="lg" className="rounded-xl" onClick={handleSkip}>
              Browse Jobs
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}