import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "@/lib/config/env";

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabaseConfig.enabled) return null;
  if (typeof window === "undefined") return null;

  supabase ??= createClient(supabaseConfig.url, supabaseConfig.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: "pkce",
    },
  });

  return supabase;
}
