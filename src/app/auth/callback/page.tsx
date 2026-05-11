"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase/client";
import { LoadingState } from "@/components/ui/loading-state";

/**
 * Auth callback page for handling OAuth redirects.
 *
 * After a user signs in with Google, Supabase redirects back here
 * with a session token in the URL. This page exchanges the token
 * for a session and redirects the user to the app.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabaseClient();

      if (supabase) {
        // Supabase handles the session exchange via URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(error.message);
          return;
        }

        if (data.session) {
          // Session established — redirect to home
          router.push("/");
          router.refresh();
          return;
        }
      }

      // No supabase client or no session — redirect to home
      router.push("/");
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400 mb-2">
            {error}
          </p>
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
      <LoadingState variant="spinner" />
    </div>
  );
}