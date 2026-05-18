"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { RoleSelector } from "@/components/onboarding/role-selector";

export default function SelectRolePage() {
  const router = useRouter();
  const { setRole } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = async (role: string) => {
    const normalizedRole =
      role === "I am hiring talent" ? "recruiter" : "candidate";

    await setRole(normalizedRole as "candidate" | "recruiter");

    if (normalizedRole === "recruiter") {
      router.push("/onboarding/recruiter");
    } else {
      router.push("/onboarding/candidate");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <RoleSelector
          selected={selected}
          onSelect={(role) => {
            setSelected(role);
            void handleSelect(role);
          }}
        />
      </div>
    </div>
  );
}