"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth";
import { usePathname, useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ShieldCheck } from "lucide-react";
import { AUTH_HOME_PATH } from "@/lib/auth/redirect";

interface RecruiterGuardProps {
  children: React.ReactNode;
}

export function RecruiterGuard({ children }: RecruiterGuardProps) {
  const { isAuthenticated, isLoading, user, role, onboardingComplete, authError, restoreSession, getPostAuthRedirect } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [modalOpen, setModalOpen] = useState(false);
  const redirectTarget = useMemo(() => {
    if (isLoading) return null;
    if (authError) return null;
    if (!isAuthenticated) return AUTH_HOME_PATH;

    const nextRoute = getPostAuthRedirect(user);
    if (!onboardingComplete || nextRoute.startsWith("/onboarding")) {
      return nextRoute;
    }

    if (role !== "recruiter") {
      return nextRoute;
    }

    return null;
  }, [authError, getPostAuthRedirect, isAuthenticated, isLoading, onboardingComplete, role, user]);

  useEffect(() => {
    if (redirectTarget && redirectTarget !== pathname) {
      router.replace(redirectTarget);
    }
  }, [pathname, redirectTarget, router]);

  if (isLoading || redirectTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="px-4 text-center">
          <LoadingState variant="spinner" />
          <p className="mt-3 text-sm text-muted-foreground">
            Restoring your session and sending you to the right page...
          </p>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <p className="text-sm font-medium">We could not restore your session.</p>
          <p className="mt-2 text-sm text-muted-foreground">{authError}</p>
          <Button className="mt-4 rounded-xl" onClick={() => void restoreSession()}>
            Try again
          </Button>
        </div>
      </div>
    );
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
