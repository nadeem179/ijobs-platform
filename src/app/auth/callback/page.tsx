"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuth } from "@/context/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser, getPostAuthRedirect } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Supabase authentication is not configured.");
        return;
      }

      const url = new URL(window.location.href);
      const oauthError =
        url.searchParams.get("error_description") ||
        url.searchParams.get("error") ||
        new URLSearchParams(window.location.hash.slice(1)).get("error_description") ||
        new URLSearchParams(window.location.hash.slice(1)).get("error");

      if (oauthError) {
        setError(oauthError);
        return;
      }

      const code = url.searchParams.get("code");
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (!session?.user) {
        setError("We could not restore your Supabase session. Please try signing in again.");
        return;
      }

      const authUser = await refreshUser();
      if (!authUser) {
        setError("Your session was created, but your profile could not be loaded.");
        return;
      }

      setWelcomeName(authUser.name);
      window.history.replaceState({}, document.title, "/auth/callback");

      window.setTimeout(() => {
        router.replace(getPostAuthRedirect(authUser));
      }, 700);
    };

    void handleCallback();
  }, [getPostAuthRedirect, refreshUser, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 text-center">
        <LoadingState variant="spinner" />
        {welcomeName && (
          <p className="text-sm font-medium text-muted-foreground">
            Welcome, {welcomeName}
          </p>
        )}
      </div>
    </div>
  );
}
