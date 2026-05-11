"use client";

import { useRef, useState } from "react";
import { Upload, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateResumeFile } from "@/services/impl/parsing.service";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const validationError = validateResumeFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
          dragOver
            ? "border-primary bg-primary/5"
            : error
            ? "border-red-300 bg-red-50/30"
            : "border-border/50 hover:border-border/80 bg-muted/10 hover:bg-muted/20",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 mb-3">
          {error ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm font-medium mb-1">
          {error ? error : "Drag & drop your resume here"}
        </p>
        <p className="text-xs text-muted-foreground">
          PDF or DOCX, up to 5MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && (
        <button
          onClick={() => setError(null)}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}