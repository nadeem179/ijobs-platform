"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";

export default function SelectRolePage() {
  const router = useRouter();
  const { setRole } = useAuth();

  const handleCandidate = async () => {
    try {
      await setRole("candidate");
      router.push("/onboarding/candidate");
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecruiter = async () => {
    try {
      await setRole("recruiter");
      router.push("/onboarding/recruiter");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
          className="w-full rounded-2xl border p-6 text-left hover:border-black transition"
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
          className="w-full rounded-2xl border p-6 text-left hover:border-black transition"
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