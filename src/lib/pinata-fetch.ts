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
 * Wraps a fetch RequestInit with an Authorization: Bearer header using the
 * current wallet's stored SIWS token. Drop-in replacement for fetch options.
 *
 * Usage:
 *   const res = await fetch("/api/pinata/signed-url", withSiwsAuth({ method: "POST" }));
 */
export function withSiwsAuth(init?: RequestInit): RequestInit {
  const token = getStoredSiwsToken();
  if (!token) return init ?? {};
  return {
    ...init,
    headers: {
      ...(init?.headers as Record<string, string> ?? {}),
      Authorization: `Bearer ${token}`,
    },
  };
}
