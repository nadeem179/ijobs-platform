"use client";

import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Briefcase, Search } from "lucide-react";

export function RoleSelector() {
  const { user, isLoading, onboardingComplete, setRole, getPostAuthRedirect } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && user?.role && onboardingComplete) {
      router.push(getPostAuthRedirect(user));
    }
  }, [getPostAuthRedirect, isLoading, onboardingComplete, router, user]);

  const selectRole = async (role: "candidate" | "recruiter") => {
    setIsSaving(true);
    try {
      await setRole(role);

      if (role === "recruiter") {
        router.push("/onboarding/recruiter");
      } else {
        router.push("/onboarding/candidate");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <div className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground mb-5">
          Welcome to iJobs
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">
          How will you use iJobs?
        </h1>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
          Choose your path. You can always update this later.
        </p>

        <div className="grid gap-4">
          <button
            onClick={() => selectRole("candidate")}
            disabled={isSaving}
            className="rounded-xl border border-border/30 bg-background p-5 text-left transition-all hover:border-border/60 hover:shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  I am looking for a job
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse verified opportunities, apply with one click, and track
                  your applications. Free forever.
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => selectRole("recruiter")}
            disabled={isSaving}
            className="rounded-xl border border-border/30 bg-background p-5 text-left transition-all hover:border-border/60 hover:shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">
                  I am hiring talent
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Post jobs, review qualified candidates, and build your team.
                  Start with a free job listing.
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
