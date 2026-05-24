"use client";

import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/auth-modal";

export default function SignInPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-border/50 bg-background p-6 shadow-sm">
        <AuthModal mode="signin" onClose={() => router.push("/")} />
      </div>
    </div>
  );
}
