import useSWR from "swr";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY } from "@/lib/constants";
import type { RemixOffer, RemixOfferListResponse, PublicRemix } from "@/types/remix-offers";

// ─── Fetcher helpers ──────────────────────────────────────────────────────────

async function apiFetch(
  url: string,
  apiKey: string,
  _clerkToken?: string | null,
  options?: RequestInit,
  walletAddress?: string | null,
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
  };
  // Pass wallet address as identity header when no Clerk token is available
  if (walletAddress) headers["x-wallet-address"] = walletAddress;
  const res = await fetch(url, { ...options, headers: { ...headers, ...(options?.headers as Record<string, string> ?? {}) } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** List remix offers for the authenticated user. */
export function useRemixOffers(role: "creator" | "requester", status?: string) {
  const { address: walletAddress } = useUnifiedWallet();

  const key = walletAddress ? `remix-offers-${role}-${status ?? "all"}-${walletAddress}` : null;

  const { data, error, isLoading, mutate } = useSWR<RemixOfferListResponse>(
    key,
    async () => {
      const params = new URLSearchParams({ role, ...(status ? { status } : {}) });
      return apiFetch(
        `${MEDIALANE_BACKEND_URL}/v1/remix-offers?${params}`,
        MEDIALANE_API_KEY,
        null,
        undefined,
        walletAddress,
      );
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      // Silently return empty list on auth errors — Clerk not available in this app
      onErrorRetry: (err, _key, _config, revalidate, { retryCount }) => {
        if (err?.message?.includes("Clerk") || err?.message?.includes("401") || err?.message?.includes("403")) return;
        if (retryCount >= 2) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      },
    }
  );

  return { offers: data?.data ?? [], total: data?.meta.total ?? 0, isLoading, error, mutate };
}

/** Public remixes of a token. */
export function useTokenRemixes(contract: string | null, tokenId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ data: PublicRemix[]; meta: { total: number } }>(
    contract && tokenId ? `token-remixes-${contract}-${tokenId}` : null,
    () =>
      fetch(`${MEDIALANE_BACKEND_URL}/v1/tokens/${contract}/${tokenId}/remixes`, {
        headers: { "x-api-key": MEDIALANE_API_KEY },
      }).then((r) => r.json()),
    { refreshInterval: 60000, revalidateOnFocus: false }
  );

  return { remixes: data?.data ?? [], total: data?.meta.total ?? 0, isLoading, error, mutate };
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────

/** Submit a custom license offer (Path 3). */
export async function submitRemixOffer(
  body: {
    originalContract: string;
    originalTokenId: string;
    proposedPrice: string;
    proposedCurrency: string;
    licenseType: string;
    commercial: boolean;
    derivatives: boolean;
    royaltyPct?: number;
    message?: string;
    expiresInDays?: number;
  },
  walletAddress?: string | null
): Promise<RemixOffer> {
  const res = await apiFetch(`${MEDIALANE_BACKEND_URL}/v1/remix-offers`, MEDIALANE_API_KEY, null, {
    method: "POST",
    body: JSON.stringify(body),
  }, walletAddress);
  return res.data;
}

/** Submit an auto (open-license) offer (Path 2). */
export async function submitAutoRemixOffer(
  body: { originalContract: string; originalTokenId: string },
  walletAddress?: string | null
): Promise<RemixOffer> {
  const res = await apiFetch(`${MEDIALANE_BACKEND_URL}/v1/remix-offers/auto`, MEDIALANE_API_KEY, null, {
    method: "POST",
    body: JSON.stringify(body),
  }, walletAddress);
  return res.data;
}

/** Record completed self-remix (Path 1). */
export async function confirmSelfRemix(
  body: {
    originalContract: string;
    originalTokenId: string;
    remixContract: string;
    remixTokenId: string;
    txHash: string;
    licenseType: string;
    commercial: boolean;
    derivatives: boolean;
    royaltyPct?: number;
  },
  walletAddress?: string | null
): Promise<RemixOffer> {
  const res = await apiFetch(`${MEDIALANE_BACKEND_URL}/v1/remix-offers/self/confirm`, MEDIALANE_API_KEY, null, {
    method: "POST",
    body: JSON.stringify(body),
  }, walletAddress);
  return res.data;
}

/** Record completed mint + listing (Paths 2 & 3). */
export async function confirmRemixOffer(
  id: string,
  body: { remixContract: string; remixTokenId: string; approvedCollection: string; orderHash: string },
  walletAddress?: string | null
): Promise<RemixOffer> {
  const res = await apiFetch(`${MEDIALANE_BACKEND_URL}/v1/remix-offers/${id}/confirm`, MEDIALANE_API_KEY, null, {
    method: "POST",
    body: JSON.stringify(body),
  }, walletAddress);
  return res.data;
}

/** Reject an offer. */
export async function rejectRemixOffer(id: string, walletAddress?: string | null): Promise<RemixOffer> {
  const res = await apiFetch(`${MEDIALANE_BACKEND_URL}/v1/remix-offers/${id}/reject`, MEDIALANE_API_KEY, null, {
    method: "POST",
    body: JSON.stringify({}),
  }, walletAddress);
  return res.data;
}
