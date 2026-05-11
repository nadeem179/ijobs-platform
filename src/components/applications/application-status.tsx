"use client";

import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  applied: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  reviewing:
    "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  interview: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  hired: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
};

const statusLabels: Record<string, string> = {
  applied: "Applied",
  reviewing: "Reviewing",
  interview: "Interview",
  rejected: "Rejected",
  hired: "Hired",
};

interface ApplicationStatusProps {
  status: string;
}

export function ApplicationStatus({ status }: ApplicationStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        statusStyles[status] || "bg-muted text-muted-foreground"
      )}
    >
      {statusLabels[status] || status}
    </span>
  );
}