import { RpcProvider } from "starknet";
import { STARKNET_RPC_URL } from "./constants";

/**
 * Public Starknet mainnet fallback (RPC spec 0.8.1, no API key required).
 *
 * Alchemy's Starknet endpoint intermittently returns HTTP 503 with the
 * JSON-RPC envelope `-32001 "Unable to complete request at this time."`
 * (~1 in 6 calls, reproducible regardless of API key, while Alchemy's status
 * page reads green). A single 503 inside a `waitForTransaction` poll loop or
 * an approval `callContract` stalls/aborts listings and mints.
 *
 * lava.build answers the same methods on the same chain (SN_MAIN), sends
 * permissive CORS, and was 10/10 reliable in testing — so we fail over to it
 * when the primary endpoint returns a transient error.
 */
const FALLBACK_RPC_URL = "https://rpc.starknet.lava.build/";

const PRIMARY_RPC_URL = STARKNET_RPC_URL || FALLBACK_RPC_URL;

/** Transient = worth retrying against the fallback. Deterministic Starknet
 *  contract errors (revert / invalid params — small positive JSON-RPC codes)
 *  must NOT match: they propagate verbatim so callers see the real failure. */
function looksTransient(status: number, bodyText: string): boolean {
  if (status === 429 || status >= 500) return true;
  // Some providers wrap capacity failures in a 200 JSON-RPC envelope.
  return /"code"\s*:\s*-32001|"code"\s*:\s*-32603|unable to complete|rate.?limit|too many|throttl|temporarily unavailable|service unavailable|overload|gateway.*time/i.test(
    bodyText,
  );
}

/**
 * fetch wrapper passed to RpcProvider.baseFetch: try the primary endpoint,
 * and on a transient failure (network error, 5xx/429, or a transient
 * JSON-RPC envelope) replay the identical request against the fallback.
 */
const failoverFetch: typeof fetch = async (input, init) => {
  const primaryUrl = typeof input === "string" ? input : PRIMARY_RPC_URL;
  try {
    const res = await fetch(primaryUrl, init);
    const text = await res.text();
    if (!looksTransient(res.status, text)) {
      return new Response(text, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
      });
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[starknet] primary RPC transient failure → failing over to lava.build",
        { status: res.status },
      );
    }
  } catch {
    // Primary unreachable (network / CORS) — fall through to the fallback.
  }
  return fetch(FALLBACK_RPC_URL, init);
};

/** Shared RpcProvider singleton — import this instead of creating new instances. */
export const starknetProvider = new RpcProvider({
  nodeUrl: PRIMARY_RPC_URL,
  baseFetch: failoverFetch,
});
