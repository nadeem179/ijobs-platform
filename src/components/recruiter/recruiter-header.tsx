"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function RecruiterHeader() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight mb-1">
          Recruiter Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your job listings, review applicants, and track hiring metrics.
        </p>
      </div>
      <Button size="lg" className="rounded-xl shrink-0" asChild>
        <Link href="/recruiter/post-job">
          <Plus className="h-4 w-4 mr-2" />
          Post a New Job
        </Link>
      </Button>
    </div>
  );
}