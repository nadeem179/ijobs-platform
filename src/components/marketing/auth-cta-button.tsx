"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";
import { AuthModalShell } from "@/components/auth/auth-modal-shell";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

type AuthMode = "signin" | "signup";
type RoleIntent = "candidate" | "recruiter";

interface AuthCTAButtonProps {
  children: React.ReactNode;
  mode?: AuthMode;
  roleIntent?: RoleIntent;
  continueTo?: string;
  authenticatedHref?: string;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
}

function canUseSafePath(path: string | undefined) {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//"));
}

export function AuthCTAButton({
  children,
  mode = "signup",
  roleIntent = "candidate",
  continueTo,
  authenticatedHref,
  className,
  variant,
  size,
}: AuthCTAButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, role, onboardingComplete, getPostAuthRedirect } = useAuth();
  const [open, setOpen] = useState(false);

  const target = canUseSafePath(authenticatedHref) ? authenticatedHref : continueTo;

  const handleClick = () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setOpen(true);
      return;
    }

    if (!onboardingComplete) {
      router.push(getPostAuthRedirect(user));
      return;
    }

    if (roleIntent === "recruiter" && role !== "recruiter") {
      router.push(getPostAuthRedirect(user));
      return;
    }

    if (roleIntent === "candidate" && role !== "candidate" && mode === "signup") {
      router.push(getPostAuthRedirect(user));
      return;
    }

    const safeTarget = canUseSafePath(target) ? target : null;
    router.push(safeTarget ?? getPostAuthRedirect(user));
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={cn(className)}
        onClick={handleClick}
        disabled={isLoading}
      >
        {children}
      </Button>
      <AuthModalShell isOpen={open} onClose={() => setOpen(false)}>
        <AuthModal
          onClose={() => setOpen(false)}
          mode={mode}
          roleIntent={roleIntent}
          continueTo={continueTo}
        />
      </AuthModalShell>
    </>
  );
}
