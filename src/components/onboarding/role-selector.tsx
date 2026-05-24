import { LogoWordmark } from "@/branding";
import { BRAND } from "@/lib/branding";

interface RoleSelectorProps {
  selected: string | null;
  onSelect: (role: string) => void;
}

export function RoleSelector({
  selected,
  onSelect,
}: RoleSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mb-5 flex justify-center">
          <LogoWordmark priority />
        </div>
        <h1 className="text-3xl font-bold">
          How will you use {BRAND.appName}?
        </h1>

        <p className="text-muted-foreground mt-2">
          Choose your path. You can always update this later.
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onSelect("candidate")}
          className={`w-full rounded-2xl border p-6 text-left transition ${
            selected === "candidate"
              ? "border-black bg-black text-white"
              : "border-gray-200 hover:border-black"
          }`}
        >
          <div className="text-lg font-semibold">
            I am looking for a job
          </div>

          <p className="text-sm opacity-80 mt-1">
            Browse verified opportunities, apply with one click,
            and track your applications.
          </p>
        </button>

        <button
          onClick={() => onSelect("recruiter")}
          className={`w-full rounded-2xl border p-6 text-left transition ${
            selected === "recruiter"
              ? "border-black bg-black text-white"
              : "border-gray-200 hover:border-black"
          }`}
        >
          <div className="text-lg font-semibold">
            I am hiring talent
          </div>

          <p className="text-sm opacity-80 mt-1">
            Post jobs, review qualified candidates,
            and build your team.
          </p>
        </button>
      </div>
    </div>
  );
}
