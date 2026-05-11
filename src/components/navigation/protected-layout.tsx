"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ShieldCheck } from "lucide-react";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * Unified protected route wrapper.
 *
 * Handles three states:
 * 1. Loading → spinner (while auth session restores)
 * 2. Unauthenticated → sign-in prompt with auth modal
 * 3. Authenticated → renders children
 *
 * @example
 * // In any page.tsx:
 * <ProtectedLayout title="Applications" description="Track your applications.">
 *   <PageContent />
 * </ProtectedLayout>
 */
export function ProtectedLayout({
  children,
  title = "Sign in to continue",
  description = "This page is only available to verified accounts.",
}: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // 1. Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState variant="spinner" />
      </div>
    );
  }

  // 2. Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight mb-2">
              {title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
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

        <AuthModalShell isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <AuthModal onClose={() => setModalOpen(false)} mode="signin" />
        </AuthModalShell>
      </div>
    );
  }

  // 3. Authenticated
  return <>{children}</>;
}