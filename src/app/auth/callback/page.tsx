"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const init = async () => {
      const authUser = await refreshUser();

      if (!authUser) {
        router.replace("/");
        return;
      }

      if (!authUser.role || !authUser.onboardingComplete) {
        router.replace("/onboarding/select-role");
        return;
      }

      if (authUser.role === "recruiter") {
        router.replace("/recruiter");
      } else {
        router.replace("/dashboard");
      }
    };

    void init();
  }, [refreshUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState variant="spinner" />
    </div>
  );
}