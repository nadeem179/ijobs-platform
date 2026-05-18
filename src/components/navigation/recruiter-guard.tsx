"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ShieldCheck } from "lucide-react";

interface RecruiterGuardProps {
  children: React.ReactNode;
}

export function RecruiterGuard({ children }: RecruiterGuardProps) {
  const { isAuthenticated, isLoading, role, onboardingComplete } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/");
      return;
    }

    if (!onboardingComplete) {
      router.replace("/onboarding/select-role");
      return;
    }

    if (role !== "recruiter") {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, onboardingComplete, role, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState variant="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isAuthenticated && !onboardingComplete) {
    return null;
  }

  if (isAuthenticated && role !== "recruiter") {
    return null;
  }

  if (isAuthenticated && role === "recruiter") {
    return <>{children}</>;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight mb-2">
              Sign in to access the Recruiter Dashboard
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The recruiter dashboard is only available to verified accounts.
              Sign in to post jobs, review applicants, and track hiring metrics.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              size="lg"
              className="rounded-xl text-sm h-11 px-8 w-full sm:w-auto"
              onClick={() => setModalOpen(true)}
            >
              Sign In to Continue
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            No password required — continue with Google or Email.
          </p>
        </div>
      </div>

      <AuthModalShell isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <AuthModal
          onClose={() => setModalOpen(false)}
          mode="signup"
        />
      </AuthModalShell>
    </>
  );
}
