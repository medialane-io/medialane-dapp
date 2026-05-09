"use client";

const STORAGE_PREFIX = "ml_siws_";

function getStoredSiwsToken(): string | null {
  if (typeof window === "undefined") return null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(STORAGE_PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (!raw?.startsWith("siws_")) continue;
    try {
      const inner = raw.slice(5);
      const dot = inner.lastIndexOf(".");
      if (dot === -1) continue;
      const payload = inner.slice(0, dot);
      const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
      const pad = "=".repeat((4 - (b64.length % 4)) % 4);
      const data = JSON.parse(atob(b64 + pad)) as { exp?: number };
      if (data.exp && data.exp > Math.floor(Date.now() / 1000)) return raw;
    } catch {
      continue;
    }
  }
  return null;
}

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
    token = getStoredSiwsToken();
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
