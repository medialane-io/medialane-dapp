"use client";

/**
 * useUnifiedWallet — DEPRECATED compatibility alias over useWallet().
 *
 * The wallet stack now has a single source of truth: the active-wallet slot
 * owned by WalletProvider, read via useWallet(). This alias preserves the old
 * return shape so existing consumers keep working; new code should use
 * useWallet() directly.
 */

import type { Call } from "starknet";
import { useWallet } from "@/hooks/use-wallet";

export type UnifiedWalletType =
  | "argent"
  | "braavos"
  | "injected"
  | "cartridge"
  | "privy"
  | null;

export interface UnifiedWallet {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  walletType: UnifiedWalletType;
  execute: (calls: Call[]) => Promise<string>;
  disconnect: () => void;
}

/** @deprecated Use useWallet(). Kept as a compatibility alias. */
export function useUnifiedWallet(): UnifiedWallet {
  const { address, isConnected, isConnecting, walletType, execute, disconnect } = useWallet();
  return {
    address: address ?? undefined,
    isConnected,
    isConnecting,
    walletType: walletType as UnifiedWalletType,
    execute,
    disconnect,
  };
}
