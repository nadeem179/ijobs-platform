/**
 * Database Query Helpers
 *
 * Provides helper functions for common database operations.
 * All functions use the Supabase client from client.ts.
 * Falls back gracefully when Supabase is not configured.
 */

import { getSupabaseClient } from "@/lib/supabase/client";

export function getDb() {
  const client = getSupabaseClient();
  if (!client) return null;
  return client;
}

export function isDbEnabled(): boolean {
  return getSupabaseClient() !== null;
}

// ───── Auth Session to DB User ─────

/**
 * Ensures a profile exists for the authenticated user.
 * Called after sign up or first sign in.
 */
export async function ensureProfile(userId: string, name: string, email: string) {
  const db = getDb();
  if (!db) return null;

  // Check if profile already exists
  const { data: existing } = await db
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return existing;

  // Create profile
  const { data, error } = await db
    .from("profiles")
    .insert({
      id: userId,
      name,
      email,
      role: null,
      onboarding_complete: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create profile:", error);
    return null;
  }

  return data;
}

// ───── Error Wrapper ─────

export function handleDbError(error: unknown, fallback: string = "Database error"): string {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  return fallback;
}
