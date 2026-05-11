"use client";

import { useRef, useState } from "react";
import { Upload, Link as LinkIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  onFile?: (file: File) => void;
  onLink?: (url: string) => void;
}

export function UploadCard({
  label,
  placeholder,
  icon,
  onFile,
  onLink,
}: UploadCardProps) {
  const [url, setUrl] = useState("");
  const [hasUrl, setHasUrl] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFile?.(file);
    }
  };

  const handleUrlSubmit = () => {
    if (url.trim()) {
      setHasUrl(true);
      onLink?.(url);
    }
  };

  return (
    <div className="rounded-xl border border-border/40 bg-background p-4 space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{placeholder}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* File upload */}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFile}
        />
        <button
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-2 text-xs transition-all flex-1 justify-center",
            fileName
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-border/40 text-muted-foreground hover:border-border/70"
          )}
        >
          {fileName ? (
            <>
              <Check className="h-3.5 w-3.5" />
              {fileName.length > 20 ? fileName.slice(0, 20) + "…" : fileName}
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Upload file
            </>
          )}
        </button>

        <span className="text-[10px] text-muted-foreground">or</span>

        {/* URL input */}
        <div className="flex items-center gap-1 flex-1">
          <input
            type="url"
            placeholder="Paste URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setHasUrl(false);
            }}
            className="flex-1 rounded-lg border border-border/40 bg-background px-2.5 py-2 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-border/70"
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
          />
          <button
            onClick={handleUrlSubmit}
            className={cn(
              "rounded-lg p-2 transition-all",
              hasUrl
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {hasUrl ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <LinkIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}