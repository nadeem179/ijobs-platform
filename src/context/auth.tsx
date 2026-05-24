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
import {
  getNextRouteForProfile,
  getStepForRole,
  normalizeOnboardingStep,
  normalizeRole,
  type OnboardingStep,
} from "@/lib/auth/onboarding-route";
import { getSupabaseClient } from "@/lib/supabase/client";

export type UserRole = "candidate" | "recruiter" | "admin" | null;
type SelectableRole = "candidate" | "recruiter";

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  id?: string;
  role: UserRole;
  onboardingComplete: boolean;
  onboardingStep: OnboardingStep | null;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  onboardingComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  authError: string | null;
  login: (email?: string, password?: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<AuthUser | null>;
  refreshUser: () => Promise<AuthUser | null>;
  setRole: (role: SelectableRole) => Promise<void>;
  setOnboardingStep: (step: OnboardingStep) => Promise<void>;
  completeOnboarding: (
    role?: SelectableRole,
    updates?: Partial<ProfileUpdates>
  ) => Promise<void>;
  getPostAuthRedirect: (authUser?: AuthUser | null) => string;
  userRole: UserRole;
}

interface ProfileRow {
  id: string;
  name?: string | null;
  full_name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  role: string | null;
  onboarding_complete: boolean | null;
  onboarding_step?: string | null;
}

interface ProfileUpdates {
  full_name: string;
  headline: string;
  location: string;
  phone: string;
  avatar_url: string;
}

type ProfileUpdatePayload = Partial<ProfileUpdates> & {
  role: SelectableRole;
  onboarding_complete: boolean;
  onboarding_step: OnboardingStep;
};

type SupabaseErrorDetails = {
  message?: unknown;
  code?: unknown;
  details?: unknown;
  hint?: unknown;
  name?: unknown;
  status?: unknown;
};

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
    onboardingStep: "select_role",
  };
}

function isMissingOnboardingStepColumn(error: unknown): boolean {
  const details = getSupabaseErrorDetails(error);
  if (!details || typeof details !== "object") return false;

  const message =
    "message" in details && typeof details.message === "string"
      ? details.message
      : "";
  const code =
    "code" in details && typeof details.code === "string" ? details.code : "";

  return (
    code === "42703" ||
    message.includes("onboarding_step") ||
    message.includes("Could not find the 'onboarding_step' column")
  );
}

function isSchemaColumnError(error: unknown): boolean {
  const details = getSupabaseErrorDetails(error);
  if (!details || typeof details !== "object") return false;

  const message =
    "message" in details && typeof details.message === "string"
      ? details.message
      : "";
  const code =
    "code" in details && typeof details.code === "string" ? details.code : "";

  return (
    code === "42703" ||
    message.includes("schema cache") ||
    message.includes("Could not find the") ||
    message.includes("column")
  );
}

function getProfileRoutePatch(role: UserRole, onboardingComplete: boolean) {
  const normalizedRole = normalizeRole(role);

  if (onboardingComplete) {
    return normalizedRole
      ? { role: normalizedRole, onboarding_complete: true, onboarding_step: "completed" as const }
      : { role: null, onboarding_complete: false, onboarding_step: "select_role" as const };
  }

  if (normalizedRole === "candidate" || normalizedRole === "recruiter") {
    return {
      role: normalizedRole,
      onboarding_complete: false,
      onboarding_step: getStepForRole(normalizedRole),
    };
  }

  return { role: null, onboarding_complete: false, onboarding_step: "select_role" as const };
}

async function loadProfile(user: User): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const selectAttempts = [
    "id,name,full_name,email,avatar_url,role,onboarding_complete,onboarding_step",
    "id,name,full_name,email,avatar_url,role,onboarding_complete",
    "id,full_name,email,avatar_url,role,onboarding_complete",
    "id,email,role,onboarding_complete",
    "id,role,onboarding_complete",
    "id",
  ];

  let lastError: unknown = null;
  for (const columns of selectAttempts) {
    const { data, error } = await supabase
      .from("profiles")
      .select(columns)
      .eq("id", user.id)
      .maybeSingle<ProfileRow>();

    if (!error) return data ?? null;

    lastError = error;
    if (!isSchemaColumnError(error) && !isMissingOnboardingStepColumn(error)) {
      logProfileError("load", error);
      throw createProfileSaveError(error);
    }
  }

  logProfileError("load", lastError);
  throw createProfileSaveError(lastError);
}

async function upsertProfileRouteState(
  userId: string,
  patch:
    | (ReturnType<typeof getProfileRoutePatch> & Partial<ProfileUpdates>)
    | ({ role: UserRole; onboarding_complete: boolean; onboarding_step: OnboardingStep } & Partial<ProfileUpdates>)
) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      ...patch,
    },
    { onConflict: "id" }
  );

  if (!error) return;

  if (isMissingOnboardingStepColumn(error)) {
    const { onboarding_step: _onboardingStep, ...fallbackPatch } = patch;
    const fallback = await supabase.from("profiles").upsert(
      {
        id: userId,
        ...fallbackPatch,
      },
      { onConflict: "id" }
    );

    if (fallback.error) throw fallback.error;
    return;
  }

  throw error;
}

async function ensureProfile(user: User): Promise<ProfileRow | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const existing = await loadProfile(user);

  if (existing) return existing;

  const insertPayload = {
    id: user.id,
    email: user.email || "",
    full_name: getUserName(user),
    avatar_url: user.user_metadata?.avatar_url || null,
    role: null,
    onboarding_complete: false,
    onboarding_step: "select_role",
  };

  const { data, error } = await supabase
    .from("profiles")
    .insert(insertPayload)
    .select("id,role,onboarding_complete,onboarding_step")
    .single<ProfileRow>();

  if (error) {
    logProfileError("create", error);
  }

  if (error && getProfileErrorMessage(error).includes("role")) {
    throw createProfileSaveError(error);
  }

  if (error && (isMissingOnboardingStepColumn(error) || getProfileErrorMessage(error).includes("column"))) {
    const fallbackPayload: Partial<typeof insertPayload> = { ...insertPayload };
    const message = getProfileErrorMessage(error);
    if (message.includes("onboarding_step")) delete fallbackPayload.onboarding_step;
    if (message.includes("full_name")) delete fallbackPayload.full_name;
    if (message.includes("avatar_url")) delete fallbackPayload.avatar_url;
    if (message.includes("email")) delete fallbackPayload.email;

    const fallback = await supabase
      .from("profiles")
      .insert(fallbackPayload)
      .select("id,role,onboarding_complete")
      .single<ProfileRow>();

    if (fallback.error) {
      logProfileError("create", fallback.error);
      throw createProfileSaveError(fallback.error);
    }

    return fallback.data;
  }

  if (error) throw createProfileSaveError(error);

  return data;
}

function mapSupabaseUser(user: User, profile: ProfileRow | null): AuthUser {
  const email = profile?.email || user.email || "";
  const name = profile?.full_name || profile?.name || getUserName(user);
  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;

  const role = normalizeRole(profile?.role);
  const onboardingComplete = Boolean(profile?.onboarding_complete) && Boolean(role);
  const onboardingStep =
    normalizeOnboardingStep(profile?.onboarding_step) ??
    (onboardingComplete
      ? "completed"
      : role === "candidate" || role === "recruiter"
        ? getStepForRole(role)
        : "select_role");

  return {
    id: user.id,
    name,
    email,
    initials: getInitials(name || email || "User"),
    avatarUrl,
    role,
    onboardingComplete,
    onboardingStep,
  };
}

function getSupabaseErrorDetails(error: unknown): SupabaseErrorDetails | unknown {
  if (!error || typeof error !== "object") return error;

  const record = error as SupabaseErrorDetails;
  return {
    name: record.name,
    message: record.message,
    code: record.code,
    details: record.details,
    hint: record.hint,
    status: record.status,
  };
}

function logProfileError(action: string, error: unknown) {
  console.error(`[AUTH] Profile ${action} failed`, getSupabaseErrorDetails(error));
}

function getProfileErrorMessage(error: unknown): string {
  const details = getSupabaseErrorDetails(error);
  if (details && typeof details === "object" && "message" in details) {
    const message = details.message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return "We could not save your role. Please try again.";
}

function createProfileSaveError(error: unknown): Error {
  return new Error(getProfileErrorMessage(error));
}

function logProfileSaveError(action: "upsert", error: unknown) {
  const detail =
    error && typeof error === "object" ? getSupabaseErrorDetails(error) : error;

  console.error(`[AUTH] Profile ${action} failed`, detail);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  const applyUser = useCallback((nextUser: AuthUser | null) => {
    setUser(nextUser);
    return nextUser;
  }, []);

  const hydrateSupabaseUser = useCallback(
    async (supabaseUser: User): Promise<AuthUser> => {
      const profile = await ensureProfile(supabaseUser);
      const rawRole = normalizeRole(profile?.role);
      const hasCorruptCompletedState = profile?.onboarding_complete === true && !rawRole;
      const hasInvalidRoleValue = Boolean(profile?.role) && !rawRole;
      const authUser = mapSupabaseUser(supabaseUser, profile);

      if (hasCorruptCompletedState || hasInvalidRoleValue) {
        await upsertProfileRouteState(
          supabaseUser.id,
          getProfileRoutePatch(null, false)
        );
      }

      setAuthError(null);
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
        setAuthError(null);
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
      setAuthError(
        error instanceof Error && error.message
          ? error.message
          : "We could not restore your session. Please try again."
      );
      return applyUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [applyUser, refreshUser]);

  const login = useCallback(
    async (email?: string, password?: string) => {
      const result = await authService.signIn(email || "", password || "");

      if (result.data) {
        applyUser(toAuthUser(result.data));
      } else {
        throw new Error(
          result.error?.message ||
            "Email authentication requires a verified Supabase session."
        );
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
    async (role: SelectableRole) => {
      const currentUser = user ?? (await refreshUser());
      if (!currentUser?.id) {
        throw new Error("You must be signed in before choosing a role.");
      }

      const onboardingStep = getStepForRole(role);
      await upsertProfileRouteState(currentUser.id, {
        role,
        onboarding_complete: false,
        onboarding_step: onboardingStep,
      });

      applyUser({
        ...currentUser,
        role,
        onboardingComplete: false,
        onboardingStep,
      });
    },
    [applyUser, refreshUser, user]
  );

  const setOnboardingStep = useCallback(
    async (step: OnboardingStep) => {
      const currentUser = user ?? (await refreshUser());
      if (!currentUser?.id) {
        throw new Error("You must be signed in to update onboarding progress.");
      }

      await upsertProfileRouteState(currentUser.id, {
        role: currentUser.role,
        onboarding_complete: false,
        onboarding_step: step,
      });

      applyUser({
        ...currentUser,
        onboardingComplete: false,
        onboardingStep: step,
      });
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
      if (role !== "candidate" && role !== "recruiter") {
        throw new Error("Choose candidate or recruiter before completing onboarding.");
      }

      const supabase = getSupabaseClient();
      let currentUser = user;

      if (supabase && !currentUser) {
        currentUser = await refreshUser();
      }

      if (supabase && currentUser?.id) {
        const payload: ProfileUpdatePayload = {
          role,
          onboarding_complete: true,
          onboarding_step: "completed",
          ...updates,
        };

        try {
          await upsertProfileRouteState(currentUser.id, payload);
        } catch (error) {
          logProfileSaveError("upsert", error);
          throw createProfileSaveError(error);
        }

        applyUser({
          ...currentUser,
          name: updates.full_name || currentUser.name,
          avatarUrl: updates.avatar_url || currentUser.avatarUrl,
          role,
          onboardingComplete: true,
          onboardingStep: "completed",
        });
        return;
      }

      if (!currentUser) throw new Error("You must be signed in to complete onboarding.");
      applyUser({
        ...currentUser,
        ...updates,
        role,
        onboardingComplete: true,
        onboardingStep: "completed",
      });
    },
    [applyUser, refreshUser, user]
  );

  const getPostAuthRedirect = useCallback((authUser: AuthUser | null = user) => {
    return getNextRouteForProfile(authUser);
  }, [user]);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!supabase) {
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      if (event === "SIGNED_OUT") {
        setAuthError(null);
        applyUser(null);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        setIsLoading(true);
        setTimeout(() => {
          void hydrateSupabaseUser(session.user)
            .catch((error) => {
              console.error("Failed to hydrate Supabase session:", error);
              setAuthError(
                error instanceof Error && error.message
                  ? error.message
                  : "We could not load your account profile. Please try again."
              );
              applyUser(null);
            })
            .finally(() => {
              setIsLoading(false);
            });
        }, 0);
        return;
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [applyUser, hydrateSupabaseUser]);

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
        authError,
        login,
        signUp,
        logout,
        restoreSession,
        refreshUser,
        setRole,
        setOnboardingStep,
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
