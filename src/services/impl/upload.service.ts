/**
 * Upload Service Implementation (Mock)
 *
 * Placeholder for file upload architecture.
 * Replace with real Supabase Storage calls when backend is ready.
 */

import type { UploadService, UploadResult } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { wrapRequest, failure } from "@/lib/errors";
import { storageConfig } from "@/lib/config/env";

const delay = (ms = 1000): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ───── Validation Helpers ─────

const ALLOWED_RESUME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFile(file: File, allowedTypes: string[]): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return "File size exceeds 5MB limit.";
  }
  if (!allowedTypes.includes(file.type)) {
    return `File type "${file.type}" is not supported.`;
  }
  return null;
}

function generateMockResult(file: File): UploadResult {
  const ext = file.name.split(".").pop() || "";
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  return {
    url: `https://storage.mock/${path}`,
    path,
    size: file.size,
    mimeType: file.type,
  };
}

// ───── Service Implementation ─────

export const uploadService: UploadService = {
  async uploadResume(file: File): AsyncResult<UploadResult> {
    return wrapRequest(async () => {
      const validationError = validateFile(file, ALLOWED_RESUME_TYPES);
      if (validationError) {
        throw new Error(validationError);
      }
      if (storageConfig.enabled) {
        // Future: upload to Supabase Storage
      }
      await delay(1500);
      return generateMockResult(file);
    });
  },

  async uploadAvatar(file: File): AsyncResult<UploadResult> {
    return wrapRequest(async () => {
      const validationError = validateFile(file, ALLOWED_IMAGE_TYPES);
      if (validationError) {
        throw new Error(validationError);
      }
      if (storageConfig.enabled) {
        // Future: upload to Supabase Storage
      }
      await delay(1000);
      return generateMockResult(file);
    });
  },

  async uploadPortfolioImage(file: File): AsyncResult<UploadResult> {
    return wrapRequest(async () => {
      const validationError = validateFile(file, ALLOWED_IMAGE_TYPES);
      if (validationError) {
        throw new Error(validationError);
      }
      if (storageConfig.enabled) {
        // Future: upload to Supabase Storage
      }
      await delay(1000);
      return generateMockResult(file);
    });
  },

  async delete(): AsyncResult<void> {
    return wrapRequest(async () => {
      await delay(300);
      // Future: delete from Supabase Storage
    });
  },
};
