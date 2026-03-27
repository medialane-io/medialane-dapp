"use client";

// Legacy shim — the real provider tree lives in src/app/providers.tsx.
// This file is kept for any stray imports that haven't been updated yet.
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
