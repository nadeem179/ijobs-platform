"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className="flex items-center gap-2.5 cursor-pointer group"
      >
        <span className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-input bg-background transition-colors group-hover:border-foreground/30 has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="absolute inset-0 opacity-0 cursor-pointer"
            {...props}
          />
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none opacity-0 transition-opacity has-[:checked]:opacity-100 [input:checked+&]:opacity-100"
          >
            <path d="M2 5l2 2 4-4" />
          </svg>
        </span>
        {label && (
          <span className="text-sm text-muted-foreground select-none">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };