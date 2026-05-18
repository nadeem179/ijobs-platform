"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { LoadingState } from "@/components/ui/loading-state";

interface ProtectedLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingState variant="spinner" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
