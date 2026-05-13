"use client";

import { getAnyStoredSiwsToken } from "@/lib/siws-client";

/**
 * Wraps a fetch RequestInit with an Authorization: Bearer header.
 *
 * Preferred usage — pass an explicit token from getValidToken() so sign-in
 * is triggered before the request if needed:
 *   const token = await getValidToken();
 *   const res = await fetch("/api/pinata/signed-url", withSiwsAuth(token, { method: "POST" }));
 *
 * Legacy usage (silent — no sign-in prompt, just reads localStorage):
 *   const res = await fetch("/api/pinata/signed-url", withSiwsAuth({ method: "POST" }));
 */
export function withSiwsAuth(
  tokenOrInit?: string | null | RequestInit,
  init?: RequestInit,
): RequestInit {
  let token: string | null;
  let options: RequestInit | undefined;

  if (typeof tokenOrInit === "string" || tokenOrInit === null) {
    token = tokenOrInit ?? null;
    options = init;
  } else {
    token = getAnyStoredSiwsToken();
    options = tokenOrInit;
  }

  if (!token) return options ?? {};
  return {
    ...options,
    headers: {
      ...(options?.headers as Record<string, string> ?? {}),
      Authorization: `Bearer ${token}`,
    },
  };
}
