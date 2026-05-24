"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/context/auth";
import { LoadingState } from "@/components/ui/loading-state";
import { Button } from "@/components/ui/button";
import { AUTH_HOME_PATH } from "@/lib/auth/redirect";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  allowedRoles?: Exclude<UserRole, null>[];
  title?: string;
  description?: string;
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading, user, role, onboardingComplete, authError, restoreSession, getPostAuthRedirect } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const roleAllowed = !allowedRoles || (role ? allowedRoles.includes(role) : false);
  const redirectTarget = useMemo(() => {
    if (isLoading) return null;
    if (authError) return null;
    if (!isAuthenticated) return AUTH_HOME_PATH;

    const nextRoute = getPostAuthRedirect(user);
    if (!onboardingComplete || nextRoute.startsWith("/onboarding")) {
      return nextRoute;
    }

    if (!roleAllowed) {
      return nextRoute;
    }

    return null;
  }, [authError, getPostAuthRedirect, isAuthenticated, isLoading, onboardingComplete, roleAllowed, user]);

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

  if (!isAuthenticated || !onboardingComplete || !role || !roleAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="px-4 text-center">
          <LoadingState variant="spinner" />
          <p className="mt-3 text-sm text-muted-foreground">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
