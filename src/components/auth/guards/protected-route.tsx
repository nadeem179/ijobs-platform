"use client";

import { useAuth } from "@/context/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { Button } from "@/components/ui/button";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional custom message for the sign-in prompt */
  message?: string;
  /** Optional title for the sign-in prompt */
  title?: string;
}

/**
 * Reusable auth guard for protecting routes.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <ProfilePage />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  message = "Sign in to access this page.",
  title = "Authentication Required",
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
            <LockKeyhole className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight mb-2">{title}</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
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
        <AuthModal onClose={() => setModalOpen(false)} mode="signup" />
      </AuthModalShell>
    </>
  );
}
