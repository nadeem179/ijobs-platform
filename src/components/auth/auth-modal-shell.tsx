"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function AuthModalShell({
  isOpen,
  onClose,
  children,
}: AuthModalShellProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative w-full sm:max-w-md bg-background shadow-xl",
          "sm:rounded-2xl sm:mx-4",
          "max-h-[90dvh] overflow-y-auto",
          "p-6"
        )}
      >
        {children}
      </div>
    </div>
  );
}