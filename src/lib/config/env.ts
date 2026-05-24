/**
 * Environment Configuration
 *
 * Centralized access to all environment variables.
 * Supabase is enabled when public credentials exist.
 */

function readPublicEnv(key: string): string {
  return (process.env[key] ?? "").trim();
}

function readBooleanFlag(key: string): boolean {
  const value = readPublicEnv(key).toLowerCase();
  return value === "true";
}

// Supabase Config

export const supabaseConfig = {
  get url(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  },
  get anonKey(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  },
  get enabled(): boolean {
    return Boolean(this.url && this.anonKey);
  },
} as const;

// Storage Config

export const storageConfig = {
  get resumesBucket(): string {
    return readPublicEnv("NEXT_PUBLIC_STORAGE_BUCKET_RESUMES") || "resumes";
  },
  get avatarsBucket(): string {
    return readPublicEnv("NEXT_PUBLIC_STORAGE_BUCKET_AVATARS") || "avatars";
  },
  get companyLogosBucket(): string {
    return readPublicEnv("NEXT_PUBLIC_STORAGE_BUCKET_COMPANY_LOGOS") || "company-logos";
  },
  get portfolioBucket(): string {
    return readPublicEnv("NEXT_PUBLIC_STORAGE_BUCKET_PORTFOLIO") || "portfolio";
  },
  get enabled(): boolean {
    return readBooleanFlag("NEXT_PUBLIC_ENABLE_STORAGE");
  },
} as const;

// App Config

export const appConfig = {
  get name(): string {
    return readPublicEnv("NEXT_PUBLIC_APP_NAME") || "Diplotix";
  },
  get url(): string {
    return readPublicEnv("NEXT_PUBLIC_APP_URL");
  },
} as const;

// Validation

export type EnvValidation = Record<
  string,
  { value: string | undefined; required: boolean }
>;

export function validateEnv(): { valid: boolean; missing: string[] } {
  const checks: EnvValidation = {
    NEXT_PUBLIC_APP_NAME: { value: appConfig.name, required: true },
    NEXT_PUBLIC_APP_URL: { value: appConfig.url, required: false },
    NEXT_PUBLIC_SUPABASE_URL: {
      value: supabaseConfig.url,
      required: supabaseConfig.enabled,
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      value: supabaseConfig.anonKey,
      required: supabaseConfig.enabled,
    },
  };

  const missing = Object.entries(checks)
    .filter(([, check]) => check.required && !check.value)
    .map(([key]) => key);

  return { valid: missing.length === 0, missing };
}
