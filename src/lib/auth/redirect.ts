"use client";

export const AUTH_HOME_PATH = "/auth/home";

export function getAuthOrigin(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const { protocol, hostname, port } = window.location;
  if (hostname === "127.0.0.1" && port === "3003") {
    return `${protocol}//localhost:${port}`;
  }

  return window.location.origin;
}

export function getLocalAuthCallbackUrl(next?: string): string | undefined {
  const origin = getAuthOrigin();
  if (!origin) return undefined;

  const callbackUrl = new URL(`${origin}/auth/callback`);
  if (next) {
    callbackUrl.searchParams.set("next", next);
  }

  return callbackUrl.toString();
}
