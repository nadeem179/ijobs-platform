/**
 * Auth Service Implementation (Mock)
 *
 * Replace with Supabase auth in a future phase.
 * Implements the AuthService interface with mock data.
 */

"use client";

import type { AuthService, Session } from "@/services/types/service-types";
import type { AsyncResult } from "@/services/types/service-types";
import { supabaseConfig } from "@/lib/config/env";
import { wrapRequest, success } from "@/lib/errors";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/db";

const STORAGE_KEY = "ijobs_session";

const MOCK_SESSION: Session = {
  user: {
    id: "mock-user-1",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    initials: "JD",
  },
  accessToken: "mock-token-xxx",
  expiresAt: Date.now() + 86400000, // 24 hours
};

// ───── Helpers ─────

function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function persistSession(session: Session | null): void {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function loadSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: Session = JSON.parse(raw);
    // Check expiry
    if (session.expiresAt && session.expiresAt < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

// ───── Service Implementation ─────

export const authService: AuthService = {
  async signIn(_email, _password): AsyncResult<Session> {
    return wrapRequest(async () => {
      await delay(800);
      const session = { ...MOCK_SESSION };
      persistSession(session);
      return session;
    });
  },

  async signUp(email, password, name): AsyncResult<Session> {
    return wrapRequest(async () => {
      const supabase = getSupabaseClient();

      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });

        if (error) throw error;

        if (data.user) {
          await ensureProfile(data.user.id, name, email);

          const session: Session = {
            user: {
              id: data.user.id,
              name,
              email,
              initials: name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase(),
            },
            accessToken: data.session?.access_token,
            expiresAt: data.session?.expires_at
              ? data.session.expires_at * 1000
              : Date.now() + 86400000,
          };

          persistSession(session);
          return session;
        }

        throw new Error("Sign up failed");
      }

      // Mock fallback
      await delay(1000);
      const mockSession: Session = {
        user: {
          id: "mock-user-" + Date.now(),
          name,
          email,
          initials: name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase(),
        },
        accessToken: "mock-token-xxx",
        expiresAt: Date.now() + 86400000,
      };
      persistSession(mockSession);
      return mockSession;
    });
  },

  async signOut(): AsyncResult<void> {
    return wrapRequest(async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      await delay(300);
      persistSession(null);
    });
  },

  async getSession(): AsyncResult<Session | null> {
    return wrapRequest(async () => {
      const supabase = getSupabaseClient();

      if (supabase) {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        if (supabaseSession?.user) {
          return {
            user: {
              id: supabaseSession.user.id,
              name: supabaseSession.user.user_metadata?.full_name || supabaseSession.user.email?.split("@")[0] || "User",
              email: supabaseSession.user.email || "",
              initials: (supabaseSession.user.user_metadata?.full_name || supabaseSession.user.email || "U")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              avatarUrl: supabaseSession.user.user_metadata?.avatar_url,
            },
            accessToken: supabaseSession.access_token,
            expiresAt: supabaseSession.expires_at ? supabaseSession.expires_at * 1000 : undefined,
          };
        }
        return null;
      }

      await delay(100);
      return loadSession();
    });
  },

  onAuthStateChange(_callback: (session: Session | null) => void): () => void {
    // Future: Subscribe to Supabase auth state changes
    // For now, return a no-op cleanup function
    return () => {};
  },
};
