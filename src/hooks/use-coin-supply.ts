"use client";

/**
 * useCoinSupply — total supply of an arbitrary ERC-20 coin, read on-chain.
 *
 * The backend only indexes supply for natively-tracked coins; external ERC-20s
 * (claimed memecoins) come through with `totalSupply: null`. Reading the ERC-20
 * `total_supply()` straight from the chain — same failover-covered read provider
 * + SWR pattern as `useCoinBalance` / `useCoinPrice` — gives a real supply for
 * every coin, day one, with no backend dependency. Returns null when the call
 * fails (caller hides the stat rather than showing an empty box).
 */

import useSWR from "swr";
import { starknetProvider } from "@/lib/starknet";

async function readTotalSupply(coinAddress: string): Promise<bigint> {
  // Cairo ERC-20s expose the getter under either name depending on the
  // OpenZeppelin version (snake_case `total_supply` or camelCase `totalSupply`).
  let res: string[];
  try {
    res = await starknetProvider.callContract({ contractAddress: coinAddress, entrypoint: "total_supply", calldata: [] });
  } catch {
    res = await starknetProvider.callContract({ contractAddress: coinAddress, entrypoint: "totalSupply", calldata: [] });
  }
  // ERC-20 returns a u256 as [low, high].
  const low = BigInt(res[0] ?? "0");
  const high = BigInt(res[1] ?? "0");
  return low + (high << 128n);
}

export interface UseCoinSupplyReturn {
  /** Raw total supply in base units, or null until loaded / unavailable. */
  raw: bigint | null;
  /** Human supply (raw / 10^decimals) as a number, or null. */
  supply: number | null;
  isLoading: boolean;
}

export function useCoinSupply(coinAddress?: string | null, decimals = 18): UseCoinSupplyReturn {
  const { data, isLoading } = useSWR<bigint>(
    coinAddress ? `coin-supply-${coinAddress}` : null,
    () => readTotalSupply(coinAddress as string),
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );
  const raw = data ?? null;
  // Divide the integer part as BigInt first to avoid Number overflow on large
  // (memecoin-scale) raw supplies, then coerce for display/market-cap math.
  const supply = raw !== null ? Number(raw / 10n ** BigInt(decimals)) : null;
  return { raw, supply, isLoading };
}
