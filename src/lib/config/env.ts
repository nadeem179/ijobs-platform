/**
 * Environment Configuration
 *
 * Centralized access to all environment variables.
 * Provides type-safe config with validation placeholders.
 *
 * To connect real credentials:
 * 1. Fill in .env.local with actual values
 * 2. Set NEXT_PUBLIC_ENABLE_AUTH=true
 * 3. Set NEXT_PUBLIC_ENABLE_STORAGE=true
 */

// ───── Supabase Config (placeholder for future integration) ─────

export const supabaseConfig = {
  get url(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  },
  get anonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  },
  get enabled(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_AUTH === "true";
  },
} as const;

// ───── Storage Config ─────

export const storageConfig = {
  get resumesBucket(): string {
    return process.env.NEXT_PUBLIC_STORAGE_BUCKET_RESUMES ?? "resumes";
  },
  get avatarsBucket(): string {
    return process.env.NEXT_PUBLIC_STORAGE_BUCKET_AVATARS ?? "avatars";
  },
  get portfolioBucket(): string {
    return process.env.NEXT_PUBLIC_STORAGE_BUCKET_PORTFOLIO ?? "portfolio";
  },
  get enabled(): boolean {
    return process.env.NEXT_PUBLIC_ENABLE_STORAGE === "true";
  },
} as const;

// ───── App Config ─────

export const appConfig = {
  get name(): string {
    return process.env.NEXT_PUBLIC_APP_NAME ?? "iJobs";
  },
  get url(): string {
    return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  },
} as const;

// ───── Validation ─────

export type EnvValidation = Record<string, { value: string | undefined; required: boolean }>;

/**
 * Placeholder for environment validation.
 * In a future phase this will warn if required vars are missing.
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const checks: EnvValidation = {
    NEXT_PUBLIC_APP_NAME: { value: appConfig.name, required: true },
    NEXT_PUBLIC_APP_URL: { value: appConfig.url, required: true },
  };

  const missing = Object.entries(checks)
    .filter(([, check]) => check.required && !check.value)
    .map(([key]) => key);

  return { valid: missing.length === 0, missing };
}
