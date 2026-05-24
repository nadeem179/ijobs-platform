/**
 * Upload Service Implementation (Mock)
 *
 * Upload service for user files.
 */

import type { UploadService, UploadResult } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { wrapRequest } from "@/lib/errors";
import { storageConfig } from "@/lib/config/env";
import { getSupabaseClient } from "@/lib/supabase/client";
import { extractStorageObjectPathFromUrl } from "@/lib/storage/storage-paths";

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
const MAX_AVATAR_FILE_SIZE = 500 * 1024;
const MAX_COMPANY_LOGO_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_COMPANY_LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];

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

function extensionForFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension && ["jpg", "jpeg", "png", "webp"].includes(extension)) {
    return extension === "jpeg" ? "jpg" : extension;
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function validateAvatar(file: File): string | null {
  if (file.size > MAX_AVATAR_FILE_SIZE) {
    return "Profile image must be 500KB or smaller.";
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return "Profile image must be a JPG, PNG, or WebP file.";
  }
  return null;
}

function validateCompanyLogo(file: File): string | null {
  if (file.size > MAX_COMPANY_LOGO_FILE_SIZE) {
    return "Company logo must be 5MB or smaller.";
  }
  if (!ALLOWED_COMPANY_LOGO_TYPES.includes(file.type)) {
    return "Company logo must be a JPG, PNG, or WebP file.";
  }
  return null;
}

async function uploadAvatarToSupabase(file: File): Promise<UploadResult> {
  const supabase = getSupabaseClient();
  if (!storageConfig.enabled || !supabase) {
    throw new Error("Supabase Storage is not configured for profile images.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be signed in to upload a profile image.");

  const extension = extensionForFile(file);
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from(storageConfig.avatarsBucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(storageConfig.avatarsBucket)
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    size: file.size,
    mimeType: file.type,
  };
}

async function uploadCompanyLogoToSupabase(file: File): Promise<UploadResult> {
  const supabase = getSupabaseClient();
  if (!storageConfig.enabled || !supabase) {
    throw new Error("Supabase Storage is not configured for company logos.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(userError.message);
  if (!user) throw new Error("You must be signed in to upload a company logo.");

  const path = `${user.id}/company-logo`;
  const { error } = await supabase.storage
    .from(storageConfig.companyLogosBucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
    .from(storageConfig.companyLogosBucket)
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
    size: file.size,
    mimeType: file.type,
  };
}

async function deleteStorageUrl(url: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!storageConfig.enabled || !supabase) return;

  const possibleBuckets = [
    storageConfig.companyLogosBucket,
    storageConfig.avatarsBucket,
    storageConfig.portfolioBucket,
    storageConfig.resumesBucket,
  ];

  for (const bucket of possibleBuckets) {
    const path = extractStorageObjectPathFromUrl(url, bucket);
    if (!path) continue;

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(error.message);
    return;
  }
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
      const validationError = validateAvatar(file);
      if (validationError) {
        throw new Error(validationError);
      }
      if (storageConfig.enabled) {
        return uploadAvatarToSupabase(file);
      }
      throw new Error("Supabase Storage is not configured for profile images.");
    });
  },

  async uploadCompanyLogo(file: File): AsyncResult<UploadResult> {
    return wrapRequest(async () => {
      const validationError = validateCompanyLogo(file);
      if (validationError) {
        throw new Error(validationError);
      }
      if (storageConfig.enabled) {
        return uploadCompanyLogoToSupabase(file);
      }
      throw new Error("Supabase Storage is not configured for company logos.");
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

  async delete(url: string): AsyncResult<void> {
    return wrapRequest(async () => {
      if (storageConfig.enabled && url) {
        await deleteStorageUrl(url);
        return;
      }
      await delay(300);
    });
  },
};
