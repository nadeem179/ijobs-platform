"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, FileText, Image, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadService } from "@/services";
import type { UploadResult } from "@/services/types/service-types";

type UploadType = "resume" | "avatar" | "portfolio";

interface FileUploaderProps {
  type: UploadType;
  /** Called with the upload result after successful upload */
  onUploadComplete?: (result: UploadResult) => void;
  /** Current file URL if one already exists */
  currentUrl?: string;
  /** Accent color for the upload zone */
  accent?: "primary" | "muted";
}

const TYPE_CONFIG = {
  resume: {
    accept: ".pdf,.doc,.docx",
    label: "Upload Resume",
    hint: "PDF, DOC up to 5MB",
    icon: FileText,
    service: (file: File) => uploadService.uploadResume(file),
  },
  avatar: {
    accept: "image/*",
    label: "Upload Photo",
    hint: "JPG, PNG, WebP up to 5MB",
    icon: Image,
    service: (file: File) => uploadService.uploadAvatar(file),
  },
  portfolio: {
    accept: "image/*",
    label: "Add Image",
    hint: "JPG, PNG, WebP up to 5MB",
    icon: Image,
    service: (file: File) => uploadService.uploadPortfolioImage(file),
  },
} as const;

export function FileUploader({
  type,
  onUploadComplete,
  currentUrl,
  accent = "muted",
}: FileUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config = TYPE_CONFIG[type];

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);

      const result = await config.service(file);

      if (result.error) {
        setError(result.error.message);
      } else if (result.data) {
        setPreview(result.data.url);
        onUploadComplete?.(result.data);
      }

      setUploading(false);
    },
    [config, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const removeFile = useCallback(() => {
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const Icon = config.icon;

  if (preview && (type === "avatar" || type === "portfolio")) {
    return (
      <div className="relative inline-block">
        <img
          src={preview}
          alt="Upload preview"
          className="w-24 h-24 rounded-xl object-cover border border-border/50"
        />
        <button
          onClick={removeFile}
          className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={[
          "relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer",
          accent === "muted"
            ? "border-border/60 hover:border-primary/40 hover:bg-primary/5"
            : "border-primary/20 hover:border-primary/40 bg-primary/5",
          uploading ? "pointer-events-none opacity-60" : "",
        ].join(" ")}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        )}

        <div className="text-center">
          {uploading ? (
            <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
          ) : (
            <>
              <p className="text-sm font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{config.hint}</p>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
