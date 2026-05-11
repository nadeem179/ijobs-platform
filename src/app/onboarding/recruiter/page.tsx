"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, ArrowRight, CheckCircle } from "lucide-react";

export default function RecruiterOnboarding() {
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [step, setStep] = useState<"company" | "profile" | "done">("company");

  const handleCompanyDone = () => setStep("profile");
  const handleComplete = () => {
    completeOnboarding();
    router.push("/recruiter");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="flex items-center gap-2 mb-8">
          <div className={`h-2 flex-1 rounded-full ${step !== "company" ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 flex-1 rounded-full ${step === "done" ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-2 flex-1 rounded-full ${step === "done" ? "bg-primary" : "bg-muted"}`} />
        </div>

        {step === "company" && (
          <div>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 mb-5">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-1">Tell us about your company</h1>
            <p className="text-sm text-muted-foreground mb-5">Help us verify your organization.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Company Name</label>
                <Input className="h-10 text-sm" placeholder="Your company" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Industry</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Education</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Company Size</label>
                <select className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
                  <option>1-10 employees</option>
                  <option>11-50 employees</option>
                  <option>51-200 employees</option>
                  <option>201-1000 employees</option>
                  <option>1000+ employees</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Work Email</label>
                <Input type="email" className="h-10 text-sm" placeholder="you@company.com" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={handleComplete}>Skip for now</Button>
                <Button size="sm" className="rounded-xl ml-auto" onClick={handleCompanyDone}>
                  Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "profile" && (
          <div>
            <h1 className="text-xl font-bold tracking-tight mb-1">Set up your recruiter profile</h1>
            <p className="text-sm text-muted-foreground mb-5">Let candidates know who they're applying to.</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block">Your Name</label>
                <Input className="h-10 text-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Your Role</label>
                <Input className="h-10 text-sm" placeholder="e.g. Talent Acquisition Lead" />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">Phone (optional)</label>
                <Input type="tel" className="h-10 text-sm" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" size="sm" onClick={handleComplete}>Skip for now</Button>
                <Button size="sm" className="rounded-xl ml-auto" onClick={() => setStep("done")}>
                  Complete setup <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950 mb-5">
              <CheckCircle className="h-6 w-6 text-emerald-500" />
            </div>
            <h1 className="text-xl font-bold tracking-tight mb-2">Your recruiter account is ready</h1>
            <p className="text-sm text-muted-foreground mb-6">Start posting jobs and finding quality candidates.</p>
            <Button size="lg" className="rounded-xl" onClick={handleComplete}>
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}