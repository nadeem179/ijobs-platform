"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ApiResult } from "@/services/types/service-types";

export interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  /** Reset state back to initial */
  reset: () => void;
}

export interface UseDataOptions {
  /** Enable/disable auto-fetch on mount */
  enabled?: boolean;
  /** Called on successful data load */
  onSuccess?: (data: unknown) => void;
  /** Called on error */
  onError?: (error: string) => void;
}

/**
 * Enhanced generic hook for fetching data from services.
 * Supports loading, error, refetch, and abort states.
 *
 * @example
 * const { data: jobs, loading, error } = useData(
 *   () => jobsService.list(filters),
 *   [filters]
 * );
 */
export function useData<T>(
  fetcher: () => Promise<ApiResult<T>>,
  deps: unknown[] = [],
  options: UseDataOptions = {}
): UseDataResult<T> {
  const { enabled = true, onSuccess, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  const fetch = useCallback(async () => {
    // Cancel previous request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (!mountedRef.current) return;

      if (result.error) {
        setError(result.error.message);
        onError?.(result.error.message);
      } else {
        setData(result.data);
        onSuccess?.(result.data);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      if (err instanceof DOMException && err.name === "AbortError") return;
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      onError?.(message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    if (enabled) {
      fetch();
    } else {
      setLoading(false);
    }
    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, [fetch, enabled]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, refetch: fetch, reset };
}

/**
 * Hook for mutations (create, update, delete operations).
 *
 * @example
 * const { mutate, loading, error } = useMutation(
 *   (data: ApplyData) => profileService.apply(jobId, data)
 * );
 */
export function useMutation<TData, TResult>(
  mutationFn: (data: TData) => Promise<ApiResult<TResult>>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (data: TData): Promise<ApiResult<TResult>> => {
      setLoading(true);
      setError(null);
      try {
        const result = await mutationFn(data);
        if (result.error) {
          setError(result.error.message);
        }
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "An error occurred";
        setError(message);
        return { data: null, error: { code: "UNKNOWN", message, status: 500 } };
      } finally {
        setLoading(false);
      }
    },
    [mutationFn]
  );

  return { mutate, loading, error, reset: () => setError(null) };
}
