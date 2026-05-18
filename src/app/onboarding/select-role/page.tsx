"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";

export default function SelectRolePage() {
  const router = useRouter();
  const { setRole } = useAuth();

  useEffect(() => {
    console.log("[SELECT-ROLE] Page rendered");
  }, []);

  const handleCandidate = () => {
    console.log("[SELECT-ROLE] Candidate clicked");
    setRole("candidate")
      .then(() => {
        console.log("[SELECT-ROLE] Role set to candidate, redirecting");
        router.push("/onboarding/candidate");
      })
      .catch((err: unknown) => {
        console.error("[SELECT-ROLE] setRole error:", err);
      });
  };

  const handleRecruiter = () => {
    console.log("[SELECT-ROLE] Recruiter clicked");
    setRole("recruiter")
      .then(() => {
        console.log("[SELECT-ROLE] Role set to recruiter, redirecting");
        router.push("/onboarding/recruiter");
      })
      .catch((err: unknown) => {
        console.error("[SELECT-ROLE] setRole error:", err);
      });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            How will you use iJobs?
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose your path. You can always update this later.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCandidate}
          className="block w-full rounded-2xl border p-6 text-left hover:border-black transition cursor-pointer"
        >
          <div className="text-xl font-semibold">
            I am looking for a job
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Browse verified opportunities, apply with one click,
            and track your applications.
          </p>
        </button>

        <button
          type="button"
          onClick={handleRecruiter}
          className="block w-full rounded-2xl border p-6 text-left hover:border-black transition cursor-pointer"
        >
          <div className="text-xl font-semibold">
            I am hiring talent
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Post jobs, review candidates, and build your team.
          </p>
        </button>
      </div>
    </div>
  );
}