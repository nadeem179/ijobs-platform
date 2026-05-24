"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { LoadingState } from "@/components/ui/loading-state";
import { LogoWordmark } from "@/branding";
import { BRAND } from "@/lib/branding";
import { getNextRouteForProfile, getStepForRole } from "@/lib/auth/onboarding-route";

export default function SelectRolePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, setRole, getPostAuthRedirect } = useAuth();
  const [savingRole, setSavingRole] = useState<"candidate" | "recruiter" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSaving = savingRole !== null;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth/home");
      return;
    }

    if (!isLoading && user?.role) {
      router.replace(getPostAuthRedirect(user));
    }
  }, [getPostAuthRedirect, isAuthenticated, isLoading, router, user]);

  const selectRole = async (role: "candidate" | "recruiter") => {
    if (isSaving) return;

    setError(null);
    setSavingRole(role);

    try {
      await setRole(role);
      router.push(
        getNextRouteForProfile({
          role,
          onboarding_complete: false,
          onboarding_step: getStepForRole(role),
        })
      );
    } catch (err) {
      console.error("[SELECT-ROLE] Role save error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "We could not save your role. Please try again."
      );
    } finally {
      setSavingRole(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <LoadingState variant="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="mb-5 flex justify-center">
            <LogoWordmark priority />
          </div>
          <h1 className="text-4xl font-bold">
            How will you use {BRAND.appName}?
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose your path. You can always update this later.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void selectRole("candidate")}
          disabled={isSaving}
          className="block w-full rounded-2xl border p-6 text-left hover:border-black transition cursor-pointer"
          aria-busy={savingRole === "candidate"}
        >
          <div className="text-xl font-semibold">
            {savingRole === "candidate" ? "Saving..." : "I am looking for a job"}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Browse verified opportunities, apply with one click,
            and track your applications.
          </p>
        </button>

        <button
          type="button"
          onClick={() => void selectRole("recruiter")}
          disabled={isSaving}
          className="block w-full rounded-2xl border p-6 text-left hover:border-black transition cursor-pointer"
          aria-busy={savingRole === "recruiter"}
        >
          <div className="text-xl font-semibold">
            {savingRole === "recruiter" ? "Saving..." : "I am hiring talent"}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Post jobs, review candidates, and build your team.
          </p>
        </button>
      </div>
    </div>
  );
}
