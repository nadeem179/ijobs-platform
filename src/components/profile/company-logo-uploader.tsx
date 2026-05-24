"use client";

import { useRef } from "react";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type CompanyLogoUploaderProps = {
  previewUrl: string;
  fallbackLabel: string;
  onChange: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  onRemove?: () => void | Promise<void>;
  onError: (message: string) => void;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export function CompanyLogoUploader({
  previewUrl,
  fallbackLabel,
  onChange,
  onFileChange,
  onRemove,
  onError,
}: CompanyLogoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      onError("Company logo must be a JPG, PNG, or WebP file.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      onError("Company logo must be 5MB or smaller.");
      return;
    }
    onFileChange?.(file);
    onChange(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className="flex items-center gap-4 rounded-2xl border border-border/30 bg-background p-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-border/30 bg-muted/30">
          {previewUrl ? (
            <img src={previewUrl} alt="Company logo preview" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
              {fallbackLabel}
            </div>
          )}
          {previewUrl ? (
            <button
              type="button"
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background shadow"
              onClick={() => inputRef.current?.click()}
              aria-label="Replace company logo"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Company logo</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, or WebP up to 5MB.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => inputRef.current?.click()}>
              {previewUrl ? "Replace logo" : "Upload logo"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-xl text-muted-foreground"
              disabled={!previewUrl}
              onClick={async () => {
                await onRemove?.();
                onFileChange?.(null);
                onChange("");
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Remove logo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

