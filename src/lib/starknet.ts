import { RpcProvider } from "starknet";
import { createFailoverFetch, PUBLIC_RPC_FALLBACKS } from "@medialane/sdk";
import { STARKNET_RPC_URL } from "./constants";

/**
 * Resilient Starknet RPC: try the configured primary (Alchemy), then the public
 * fallbacks (lava.build, …) on a transient failure — Alchemy's intermittent
 * HTTP 503 / `-32001 "Unable to complete request"` (~1 in 6 calls) otherwise
 * stalls waitForTransaction poll loops and aborts mints/listings.
 *
 * The failover policy + fallback list are owned by @medialane/sdk
 * (`createFailoverFetch` / `PUBLIC_RPC_FALLBACKS`) — single source of truth
 * shared across dapp, io, and the backend. No app-local copy.
 */
const RPC_URLS = Array.from(
  new Set([STARKNET_RPC_URL, ...PUBLIC_RPC_FALLBACKS].filter(Boolean)),
);

/** Shared failover fetch — exported so the starknet-react provider factory
 *  (`starknet-provider.tsx`) and the singleton below use one implementation. */
export const failoverFetch = createFailoverFetch(RPC_URLS);

/** Shared RpcProvider singleton — import this instead of creating new instances. */
export const starknetProvider = new RpcProvider({
  nodeUrl: RPC_URLS[0],
  baseFetch: failoverFetch,
});
