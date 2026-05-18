"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, User } from "@supabase/supabase-js";
import { authService } from "@/services";
import type { Session } from "@/services";
import { getSupabaseClient } from "@/lib/supabase/client";

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
  role: UserRole;
  onboardingComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<AuthUser | null>;
  refreshUser: () => Promise<AuthUser | null>;
  setRole: (role: "candidate" | "recruiter") => Promise<void>;
  completeOnboarding: (
    role?: "candidate" | "recruiter",
    updates?: Partial<ProfileUpdates>
  ) => Promise<void>;
  getPostAuthRedirect: (authUser?: AuthUser | null) => string;
  userRole: UserRole;
}

interface ProfileRow {
  id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  role: UserRole;
  onboarding_complete: boolean | null;
}

interface ProfileUpdates {
  name: string;
  headline: string;
  location: string;
  phone: string;
  avatar_url: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getUserName(user: User): string {
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User"
  );
}

function getInitials(nameOrEmail: string): string {
  return nameOrEmail
    .split(/[ @._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

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

async function loadProfile(user: User): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,email,avatar_url,role,onboarding_complete")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  if (error) {
    console.error("Failed to load profile:", error);
    return null;
  }

  return data ?? null;
}

async function ensureProfile(user: User): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const name = getUserName(user);
  const email = user.email || "";
  const avatarUrl = user.user_metadata?.avatar_url || null;
  const existing = await loadProfile(user);

  if (existing) {
    const patch: Partial<ProfileRow> = {};
    if (!existing.name && name) patch.name = name;
    if (!existing.email && email) patch.email = email;
    if (existing.name !== name && name) patch.name = name;
    if (existing.email !== email && email) patch.email = email;
    if (existing.avatar_url !== avatarUrl && avatarUrl) patch.avatar_url = avatarUrl;

    if (Object.keys(patch).length > 0) {
      const { data, error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", user.id)
        .select("id,name,email,avatar_url,role,onboarding_complete")
        .single<ProfileRow>();

      if (!error && data) return data;
    }

    return existing;
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      name,
      email,
      avatar_url: avatarUrl,
      role: null,
      onboarding_complete: false,
    })
    .select("id,name,email,avatar_url,role,onboarding_complete")
    .single<ProfileRow>();

  if (error) {
    console.error("Failed to create profile:", error);
    return null;
  }

  return data;
}

function mapSupabaseUser(user: User, profile: ProfileRow | null): AuthUser {
  const name = profile?.name || getUserName(user);
  const email = profile?.email || user.email || "";
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  return {
    id: user.id,
    name,
    email,
    initials: getInitials(name || email || "User"),
    avatarUrl,
    role: profile?.role ?? null,
    onboardingComplete: Boolean(profile?.onboarding_complete),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const applyUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    return nextUser;
  }, []);

  const hydrateSupabaseUser = useCallback(
    async (supabaseUser: User): Promise<AuthUser> => {
      const profile = await ensureProfile(supabaseUser);
      const authUser = mapSupabaseUser(supabaseUser, profile);
      applyUser(authUser);
      return authUser;
    },
    [applyUser]
  );

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        return applyUser(null);
      }

      return hydrateSupabaseUser(session.user);
    }

    const result = await authService.getSession();
    return applyUser(result.data ? toAuthUser(result.data) : null);
  }, [applyUser, hydrateSupabaseUser]);

  const restoreSession = useCallback(async (): Promise<AuthUser | null> => {
    setIsLoading(true);
    try {
      return await refreshUser();
    } catch (error) {
      console.error("Failed to restore session:", error);
      return applyUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyUser, refreshUser]);

  const login = useCallback(
    async (_email?: string, _password?: string) => {
      const result = await authService.signIn(_email || "", _password || "");

      if (result.data) {
        applyUser(toAuthUser(result.data));
      } else {
        throw new Error(result.error?.message || "Email authentication requires a verified Supabase session.");
      }
    },
    [applyUser]
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const result = await authService.signUp(email, password, name);
      if (result.data) {
        applyUser(toAuthUser(result.data));
      }
    },
    [applyUser]
  );

  const logout = useCallback(async () => {
    applyUser(null);
    router.replace("/");
    await authService.signOut();
  }, [applyUser, router]);

  const setRole = useCallback(
    async (role: "candidate" | "recruiter") => {
      const supabase = getSupabaseClient();
      let currentUser = user;

      if (supabase && !currentUser) {
        currentUser = await refreshUser();
      }

      if (supabase && currentUser?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({ role, onboarding_complete: false })
          .eq("id", currentUser.id);

        if (error) throw error;

        applyUser({ ...currentUser, role, onboardingComplete: false });
        return;
      }

      if (!currentUser) throw new Error("You must be signed in to choose a role.");
      applyUser({ ...currentUser, role, onboardingComplete: false });
    },
    [applyUser, refreshUser, user]
  );

  const completeOnboarding = useCallback(
    async (
      selectedRole?: "candidate" | "recruiter",
      updates: Partial<ProfileUpdates> = {}
    ) => {
      const role = selectedRole ?? user?.role;
      if (!role) throw new Error("Select a role before completing onboarding.");

      const supabase = getSupabaseClient();
      let currentUser = user;

      if (supabase && !currentUser) {
        currentUser = await refreshUser();
      }

      if (supabase && currentUser?.id) {
        const { error } = await supabase
          .from("profiles")
          .update({
            ...updates,
            role,
            onboarding_complete: true,
          })
          .eq("id", currentUser.id);

        if (error) throw error;

        applyUser({ ...currentUser, ...updates, role, onboardingComplete: true });
        return;
      }

      if (!currentUser) throw new Error("You must be signed in to complete onboarding.");
      applyUser({ ...currentUser, ...updates, role, onboardingComplete: true });
    },
    [applyUser, refreshUser, user]
  );

  const getPostAuthRedirect = useCallback((authUser: AuthUser | null = user) => {
    if (!authUser?.onboardingComplete || !authUser.role) {
      return "/onboarding/select-role";
    }

    return authUser.role === "recruiter" ? "/recruiter" : "/dashboard";
  }, [user]);

  useEffect(() => {
  const supabase = getSupabaseClient();

  if (!supabase) {
    setIsLoading(false);
    return;
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("[AUTH EVENT]", event);

    if (event === "SIGNED_OUT") {
      applyUser(null);
      setIsLoading(false);
      return;
    }

    if (event === "INITIAL_SESSION") {
      if (session?.user) {
        await hydrateSupabaseUser(session.user);
      }

      setIsLoading(false);
      return;
    }

    if (event === "SIGNED_IN") {
      if (session?.user) {
        await hydrateSupabaseUser(session.user);
      }

      setIsLoading(false);
    }
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);

  useEffect(() => {
    void Promise.resolve().then(restoreSession);
  }, [restoreSession]);

  const role = user?.role ?? null;
  const onboardingComplete = Boolean(user?.onboardingComplete);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        onboardingComplete,
        isAuthenticated: user !== null,
        isLoading,
        loading: isLoading,
        login,
        signUp,
        logout,
        restoreSession,
        refreshUser,
        setRole,
        completeOnboarding,
        getPostAuthRedirect,
        userRole: role,
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
