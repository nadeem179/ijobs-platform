"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  isSchemaQueryError,
  logOptionalSupabaseLoadFailure,
} from "@/lib/supabase/query-errors";

export type BlockedCompany = {
  id: string;
  companyName: string;
  recruiterId?: string | null;
  createdAt: string;
};

type BlockedCompanyRow = {
  id: string;
  company_name: string;
  recruiter_id?: string | null;
  created_at?: string | null;
};

function mapBlockedCompany(row: BlockedCompanyRow): BlockedCompany {
  return {
    id: row.id,
    companyName: row.company_name,
    recruiterId: row.recruiter_id,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function normalizeCompanyName(value: string) {
  return value.trim().toLowerCase();
}

export function useBlockedCompanies() {
  const { user, role, isAuthenticated } = useAuth();
  const [blockedCompanies, setBlockedCompanies] = useState<BlockedCompany[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const userId = user?.id ?? null;

  const canUseSupabase = Boolean(isAuthenticated && userId && role === "candidate");

  const refetchBlockedCompanies = useCallback(async () => {
    const supabase = getSupabaseClient();
    if (!canUseSupabase || !supabase || !userId) {
      setBlockedCompanies([]);
      setLoaded(true);
      return;
    }

    const loadAttempts = [
      () =>
        supabase
          .from("blocked_companies")
          .select("id,company_name,recruiter_id,created_at")
          .eq("candidate_id", userId)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("blocked_companies")
          .select("id,company_name,created_at")
          .eq("candidate_id", userId)
          .order("created_at", { ascending: false }),
      () =>
        supabase
          .from("blocked_companies")
          .select("id,company_name")
          .eq("candidate_id", userId),
    ];

    let data: unknown[] | null = null;
    let lastError: Awaited<ReturnType<(typeof loadAttempts)[number]>>["error"] = null;
    for (const attempt of loadAttempts) {
      const result = await attempt();
      if (!result.error) {
        data = (result.data ?? []) as unknown[];
        lastError = null;
        break;
      }

      lastError = result.error;
      if (!isSchemaQueryError(result.error)) break;
    }

    if (lastError) {
      logOptionalSupabaseLoadFailure("[BLOCKED_COMPANIES] Load failed", lastError);
      setBlockedCompanies([]);
    } else {
      setBlockedCompanies(((data ?? []) as BlockedCompanyRow[]).map(mapBlockedCompany));
    }

    setLoaded(true);
  }, [canUseSupabase, userId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refetchBlockedCompanies();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refetchBlockedCompanies]);

  const blockedNames = useMemo(
    () => new Set(blockedCompanies.map((company) => normalizeCompanyName(company.companyName))),
    [blockedCompanies]
  );

  const isCompanyBlocked = useCallback(
    (companyName: string) => blockedNames.has(normalizeCompanyName(companyName)),
    [blockedNames]
  );

  const blockCompany = useCallback(
    async (companyName: string, recruiterId?: string | null) => {
      const supabase = getSupabaseClient();
      const trimmedName = companyName.trim();
      if (!trimmedName) return { error: "Company name is required." };
      if (!canUseSupabase || !supabase || !userId) {
        return { error: "Sign in as a candidate to block companies." };
      }

      setSavingIds((current) => new Set(current).add(trimmedName));
      const { error } = await supabase.from("blocked_companies").upsert(
        {
          candidate_id: userId,
          company_name: trimmedName,
          recruiter_id: recruiterId || null,
        },
        { onConflict: "candidate_id,company_name" }
      );
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(trimmedName);
        return next;
      });

      if (error) {
        console.error("[BLOCKED_COMPANIES] Block failed", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return { error: error.message };
      }

      await refetchBlockedCompanies();
      return { error: null };
    },
    [canUseSupabase, refetchBlockedCompanies, userId]
  );

  const unblockCompany = useCallback(
    async (id: string) => {
      const supabase = getSupabaseClient();
      if (!canUseSupabase || !supabase || !userId) {
        return { error: "Sign in as a candidate to unblock companies." };
      }

      setSavingIds((current) => new Set(current).add(id));
      const { error } = await supabase
        .from("blocked_companies")
        .delete()
        .eq("candidate_id", userId)
        .eq("id", id);
      setSavingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });

      if (error) {
        console.error("[BLOCKED_COMPANIES] Unblock failed", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        return { error: error.message };
      }

      await refetchBlockedCompanies();
      return { error: null };
    },
    [canUseSupabase, refetchBlockedCompanies, userId]
  );

  return {
    blockedCompanies,
    loaded,
    savingIds,
    isCompanyBlocked,
    blockCompany,
    unblockCompany,
    refetchBlockedCompanies,
  };
}
