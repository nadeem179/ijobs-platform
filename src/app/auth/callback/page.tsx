"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth";
import { getSupabaseClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser, getPostAuthRedirect } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const exchangedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (exchangedRef.current) return;
      exchangedRef.current = true;

      try {
        const supabase = getSupabaseClient();
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const next = params.get("next");
        const providerError = params.get("error_description") || params.get("error");

        console.info("[AUTH_CALLBACK]", {
          origin: window.location.origin,
          hasCode: Boolean(code),
          hasProviderError: Boolean(providerError),
        });

        if (providerError) {
          throw new Error(providerError);
        }

        if (!supabase) {
          throw new Error("Supabase authentication is not configured.");
        }

        if (code) {
          const { error: callbackError } = await supabase.auth.exchangeCodeForSession(code);
          if (callbackError) throw callbackError;
          console.info("[SESSION_EXCHANGE_SUCCESS]");

          window.history.replaceState(null, "", "/auth/callback");
        }

        const authUser = await refreshUser();

        if (!authUser) {
          router.replace("/auth/home");
          return;
        }

        const safeNext =
          next && next.startsWith("/") && !next.startsWith("//") ? next : null;
        const isRecruiterNext = safeNext?.startsWith("/recruiter") ?? false;

        if (safeNext && authUser.onboardingComplete) {
          if (authUser.role === "recruiter" && isRecruiterNext) {
            router.replace(safeNext);
            return;
          }

          if (authUser.role === "candidate" && !isRecruiterNext) {
            router.replace(safeNext);
            return;
          }
        }

        router.replace(getPostAuthRedirect(authUser));
      } catch (callbackError) {
        const message =
          callbackError instanceof Error
            ? callbackError.message
            : "We could not finish signing you in. Please try again.";

        if (message.toLowerCase().includes("pkce")) {
          console.error("[PKCE_ERROR]", callbackError);
        }

        console.error("Failed to complete auth callback:", callbackError);
        setError(message);
      }
    };

    void init();
  }, [getPostAuthRedirect, refreshUser, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingState variant="spinner" />
    </div>
  );
}
