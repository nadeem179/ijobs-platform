/**
 * Supabase Client
 *
 * Creates and exports a single Supabase client instance.
 * Used by services when real backend features are enabled.
 *
 * When NEXT_PUBLIC_ENABLE_AUTH is false, services fall back to mock data.
 * When true, this client connects to the real Supabase project.
 */

import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/config/env";

const supabaseUrl = supabaseConfig.url;
const supabaseAnonKey = supabaseConfig.anonKey;

// Only create the client if credentials are provided
const hasCredentials = supabaseUrl && supabaseAnonKey;

export const supabase = hasCredentials
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Returns the Supabase client if configured, or null.
 * Services should check this before making real API calls.
 */
export function getSupabaseClient() {
  if (!supabaseConfig.enabled) return null;
  if (!supabase) {
    console.warn(
      "Supabase client not initialized. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }
  return supabase;
}