"use client";

import { useState } from "react";
import { X, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSupabaseClient } from "@/lib/supabase/client";

interface AuthModalProps {
  onComplete?: () => void;
  onClose: () => void;
  mode?: "signin" | "signup" | "select";
}

export function AuthModal({
  onClose,
  mode: initialMode = "select",
}: AuthModalProps) {
  const [screen, setScreen] = useState<"select" | "email" | "check" | "loading">(
    "select"
  );
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const title = initialMode === "signup" ? "Create your account" : "Welcome back";

  const handleGoogleSignIn = async () => {
    setError(null);
    const supabase = getSupabaseClient();

    if (!supabase) {
      setError("Supabase authentication is not configured.");
      return;
    }

    setIsLoading(true);
    setScreen("loading");
    const { error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "openid email profile",
        queryParams: {
          prompt: "consent",
          access_type: "offline",
        },
      },
    });
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      setScreen("select");
    }
  };

  const sendEmailLink = async () => {
    setError(null);

    const normalizedEmail = email.trim();
    if (!normalizedEmail) return false;

    const supabase = getSupabaseClient();

    if (!supabase) {
      setError("Supabase authentication is not configured.");
      return false;
    }

    setIsLoading(true);
    const { error: linkError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          email: normalizedEmail,
        },
      },
    });
    setIsLoading(false);

    if (linkError) {
      setError(linkError.message);
      return false;
    }

    setScreen("check");
    return true;
  };

  const handleSendEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendEmailLink();
  };

  if (screen === "loading") {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center pt-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Redirecting to Google...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          {screen === "select" ? title : "Check your email"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">
        {screen === "select" &&
          "No password needed. Choose how you'd like to continue."}
        {screen === "email" &&
          "Enter your email and we'll send you a secure sign-in link."}
        {screen === "check" &&
          `We sent a secure sign-in link to ${email}. Open it from your inbox to continue.`}
      </p>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950 px-3 py-2 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {screen === "check" && (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          Check your inbox, then use the link in that email to finish signing in.
        </div>
      )}

      {screen === "select" && (
        <div className="space-y-3">
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-center gap-3 h-12 rounded-xl text-sm font-medium"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-center gap-3 h-12 rounded-xl text-sm font-medium"
            onClick={() => setScreen("email")}
          >
            <Mail className="h-4 w-4" />
            Continue with Email
          </Button>

          <p className="text-xs text-muted-foreground text-center pt-2 leading-relaxed">
            By continuing, you agree to our{" "}
            <button className="underline hover:text-foreground transition-colors">
              Terms
            </button>{" "}
            and{" "}
            <button className="underline hover:text-foreground transition-colors">
              Privacy Policy
            </button>
          </p>
        </div>
      )}

      {screen === "email" && (
        <form onSubmit={handleSendEmailLink} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Email address
            </label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 text-sm"
              autoFocus
              required
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-11 rounded-xl text-sm"
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Send sign-in link"
            )}
          </Button>
          <button
            type="button"
            onClick={() => setScreen("select")}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to sign in options
          </button>
        </form>
      )}

      {screen === "check" && (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full h-11 rounded-xl text-sm"
            disabled={isLoading}
            onClick={() => void sendEmailLink()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Resend email"
            )}
          </Button>
          <button
            type="button"
            onClick={() => setScreen("email")}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use a different email
          </button>
        </div>
      )}
    </div>
  );
}
