import { RpcProvider } from "starknet";
import { createFailoverFetch, PUBLIC_RPC_FALLBACKS } from "@medialane/sdk";
import { STARKNET_RPC_URL } from "./constants";

/**
 * ⚠️ The dapp talks to Starknet through THREE distinct providers — when a read
 * fails, check which one the failing call actually uses (this tripped up the
 * 2026-06-03 Alchemy-503 hunt for days):
 *
 *  1. `starknetProvider` (below) — direct `Contract` calls + `waitForTransaction`
 *     in NON-hook contexts: launchpad pages (drop/pop/nfteditions), transfer-
 *     ownership, `use-tx`, `use-paymaster-transaction`.
 *  2. starknet-react's provider (`components/starknet-provider.tsx`) — every
 *     `useProvider()` / `useContract()` call, i.e. the whole marketplace flow
 *     (`use-marketplace.ts`: get_counter, royalty_info, approvals).
 *  3. the SDK client's `getProvider` (`@medialane/sdk`) — SDK-routed ops.
 *
 * All three share ONE failover policy: #1 + #2 use `failoverFetch` below; #3
 * uses the SDK's `createFailoverFetch` internally (≥0.28.0). Keep them in sync —
 * never give one a bare `new RpcProvider({ nodeUrl })` without `baseFetch`.
 */

/**
 * Resilient Starknet RPC: try the configured primary, then the public fallbacks
 * (lava.build, …) on a transient failure. The primary is the same-origin
 * `/api/rpc` proxy (`STARKNET_RPC_URL` ← `NEXT_PUBLIC_STARKNET_PROVIDER_URL`),
 * which forwards to Alchemy SERVER-side — so Alchemy stays the primary upstream
 * while its API key never enters the browser bundle. Alchemy's intermittent
 * HTTP 503 / `-32001 "Unable to complete request"` (~1 in 6 calls) is absorbed
 * both by the proxy's own rotation and by this client-side failover.
 *
 * The failover policy + fallback list are owned by @medialane/sdk
 * (`createFailoverFetch` / `PUBLIC_RPC_FALLBACKS`) — single source of truth
 * shared across dapp, io, and the backend. No app-local copy.
 */
const RPC_URLS = Array.from(
  new Set([STARKNET_RPC_URL, ...PUBLIC_RPC_FALLBACKS].filter(Boolean)),
);

/** The primary browser RPC URL (the `/api/rpc` proxy in prod). Share this
 *  everywhere a `nodeUrl` is needed so all client paths stay in lock-step. */
export const RPC_PRIMARY_URL = RPC_URLS[0];

/** Shared failover fetch — exported so the starknet-react provider factory
 *  (`starknet-provider.tsx`) and the singleton below use one implementation. */
export const failoverFetch = createFailoverFetch(RPC_URLS);

/** Shared RpcProvider singleton — import this instead of creating new instances. */
export const starknetProvider = new RpcProvider({
  nodeUrl: RPC_PRIMARY_URL,
  baseFetch: failoverFetch,
});
