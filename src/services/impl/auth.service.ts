"use client";

import type { AuthService, Session } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { wrapRequest } from "@/lib/errors";
import { getLocalAuthCallbackUrl } from "@/lib/auth/redirect";
import { getSupabaseClient } from "@/lib/supabase/client";

function getInitials(nameOrEmail: string): string {
  return nameOrEmail
    .split(/[ @._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function requireSupabase() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase authentication is not configured.");
  }
  return supabase;
}

export const authService: AuthService = {
  async signIn(): AsyncResult<Session> {
    return wrapRequest(async () => {
      throw new Error("Use Google OAuth or email magic-link authentication.");
    });
  },

  async signUp(email, _password, name): AsyncResult<Session> {
    return wrapRequest(async () => {
      const supabase = requireSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: getLocalAuthCallbackUrl(),
          data: {
            full_name: name,
            name,
            email,
          },
        },
      });

      if (error) throw error;
      throw new Error("Check your email to finish signing in.");
    });
  },

  async signOut(): AsyncResult<void> {
    return wrapRequest(async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    });
  },

  async getSession(): AsyncResult<Session | null> {
    return wrapRequest(async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return null;

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      if (!session?.user) return null;

      const name =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "User";

      return {
        user: {
          id: session.user.id,
          name,
          email: session.user.email || "",
          initials: getInitials(name || session.user.email || "User"),
          avatarUrl: session.user.user_metadata?.avatar_url,
        },
        accessToken: session.access_token,
        expiresAt: session.expires_at ? session.expires_at * 1000 : undefined,
      };
    });
  },

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    const supabase = getSupabaseClient();
    if (!supabase) return () => {};

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, supabaseSession) => {
      if (!supabaseSession?.user) {
        callback(null);
        return;
      }

      const name =
        supabaseSession.user.user_metadata?.full_name ||
        supabaseSession.user.user_metadata?.name ||
        supabaseSession.user.email?.split("@")[0] ||
        "User";

      callback({
        user: {
          id: supabaseSession.user.id,
          name,
          email: supabaseSession.user.email || "",
          initials: getInitials(name || supabaseSession.user.email || "User"),
          avatarUrl: supabaseSession.user.user_metadata?.avatar_url,
        },
        accessToken: supabaseSession.access_token,
        expiresAt: supabaseSession.expires_at
          ? supabaseSession.expires_at * 1000
          : undefined,
      });
    });

    return () => subscription.unsubscribe();
  },
};
