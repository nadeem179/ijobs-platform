"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { authService } from "@/services";
import type { Session } from "@/services";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";

export type UserRole = "candidate" | "recruiter" | null;

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  id?: string;
  role: UserRole;
  onboardingComplete: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setRole: (role: "candidate" | "recruiter") => void;
  completeOnboarding: () => void;
  userRole: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAuthUser(session: Session): AuthUser {
  return {
    name: session.user.name,
    email: session.user.email,
    initials: session.user.initials,
    avatarUrl: session.user.avatarUrl,
    id: session.user.id,
    role: null,
    onboardingComplete: false,
  };
}

const MOCK_AUTH_USER: AuthUser = {
  name: "Jane Doe",
  email: "jane.doe@example.com",
  initials: "JD",
  role: null,
  onboardingComplete: false,
};

function persistRole(role: "candidate" | "recruiter"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("ijobs_role", role);
}

function loadRole(): UserRole {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ijobs_role") as UserRole;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const setRole = useCallback((role: "candidate" | "recruiter") => {
    setUserRole(role);
    persistRole(role);
    setUser((prev) => (prev ? { ...prev, role, onboardingComplete: false } : prev));
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser((prev) => (prev ? { ...prev, onboardingComplete: true } : prev));
  }, []);

  const login = useCallback(async (_email?: string, _password?: string) => {
    const result = await authService.signIn(_email || "test@test.com", _password || "password");
    if (result.data) {
      const authUser = toAuthUser(result.data);
      const savedRole = loadRole();
      authUser.role = savedRole;
      setUser(authUser);
      setUserRole(savedRole);
    } else {
      const savedRole = loadRole();
      setUser({ ...MOCK_AUTH_USER, role: savedRole });
      setUserRole(savedRole);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const result = await authService.signUp(email, password, name);
    if (result.data) {
      setUser(toAuthUser(result.data));
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.signOut();
    setUser(null);
    setUserRole(null);
    localStorage.removeItem("ijobs_role");
  }, []);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const savedRole = loadRole();
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = session.user;
          setUser({
            name: userData.user_metadata?.full_name || userData.email?.split("@")[0] || "User",
            email: userData.email || "",
            initials: (userData.user_metadata?.full_name || userData.email || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            avatarUrl: userData.user_metadata?.avatar_url,
            id: userData.id,
            role: savedRole,
            onboardingComplete: false,
          });
          setUserRole(savedRole);
          setIsLoading(false);
          return;
        }
      }

      const result = await authService.getSession();
      if (result.data) {
        const authUser = toAuthUser(result.data);
        authUser.role = savedRole;
        setUser(authUser);
        setUserRole(savedRole);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const userData = session.user;
            const savedRole = loadRole();
            setUser({
              name: userData.user_metadata?.full_name || userData.email?.split("@")[0] || "User",
              email: userData.email || "",
              initials: (userData.user_metadata?.full_name || userData.email || "U")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2),
              avatarUrl: userData.user_metadata?.avatar_url,
              id: userData.id,
              role: savedRole,
              onboardingComplete: false,
            });
            setUserRole(savedRole);
          } else if (event === "SIGNED_OUT") {
            setUser(null);
            setUserRole(null);
          }
        }
      );
      return () => { subscription.unsubscribe(); };
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        signUp,
        logout,
        restoreSession,
        setRole,
        completeOnboarding,
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}

export { MOCK_AUTH_USER };