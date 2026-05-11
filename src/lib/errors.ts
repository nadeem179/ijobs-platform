/**
 * API Error Handling Structure
 *
 * Centralized error handling for all service calls.
 * Replaces scattered try/catch logic with consistent patterns.
 */

import type { ApiError, ApiResult } from "@/services/types/service-types";

// ───── Custom Error Types ─────

export class ServiceError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ServiceError";
    this.code = error.code;
    this.status = error.status ?? 500;
    this.details = error.details;
  }
}

export class NetworkError extends Error {
  constructor(message = "Network request failed. Please check your connection.") {
    super(message);
    this.name = "NetworkError";
  }
}

export class AuthError extends ServiceError {
  constructor(message = "Authentication required") {
    super({ code: "UNAUTHORIZED", message, status: 401 });
    this.name = "AuthError";
  }
}

export class NotFoundError extends ServiceError {
  constructor(resource = "Resource") {
    super({ code: "NOT_FOUND", message: `${resource} not found.`, status: 404 });
    this.name = "NotFoundError";
  }
}

// ───── Success / Error Factory ─────

export function success<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

export function failure<T = never>(error: ApiError): ApiResult<T> {
  return { data: null, error };
}

// ───── Request Wrapper ─────

export type RequestConfig = {
  signal?: AbortSignal;
};

/**
 * Wraps an async operation with consistent error handling.
 * Use this in service implementations.
 *
 * @example
 * async function getData(): AsyncResult<Data> {
 *   return wrapRequest(async () => {
 *     const res = await fetch("/api/data");
 *     return res.json();
 *   });
 * }
 */
export async function wrapRequest<T>(
  fn: () => Promise<T>,
  config?: RequestConfig
): Promise<ApiResult<T>> {
  try {
    if (config?.signal?.aborted) {
      return failure({ code: "ABORTED", message: "Request was cancelled.", status: 499 });
    }
    const data = await fn();
    return success(data);
  } catch (err) {
    if (err instanceof ServiceError) {
      return failure({ code: err.code, message: err.message, status: err.status, details: err.details });
    }
    if (err instanceof TypeError && (err as Error).message === "Failed to fetch") {
      return failure({ code: "NETWORK_ERROR", message: "Network request failed.", status: 0 });
    }
    return failure({
      code: "UNKNOWN_ERROR",
      message: err instanceof Error ? err.message : "An unexpected error occurred.",
      status: 500,
    });
  }
}

// ───── Helper: Extract data with default ─────

/**
 * Safely extracts data from an ApiResult, falling back to a default value.
 */
export function extractData<T>(result: ApiResult<T>, fallback: T): T {
  return result.data ?? fallback;
}

/**
 * Gets the error message from an ApiResult, or null if successful.
 */
export function extractError<T>(result: ApiResult<T>): string | null {
  return result.error?.message ?? null;
}
