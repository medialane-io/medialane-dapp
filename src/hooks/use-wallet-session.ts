"use client";

/**
 * useWalletSession — thin read of the single active-wallet slot.
 *
 * Preserves the field names its remaining consumers use. The old
 * referee/state-machine (which compared StarkZap vs injected every render and
 * silently let a background Privy session win) is gone — identity now comes
 * straight from the one slot via useWallet().
 */

import { useWallet } from "@/hooks/use-wallet";

export type WalletSessionType =
  | "argent"
  | "braavos"
  | "injected"
  | "cartridge"
  | "privy";

export interface ActiveWalletSession {
  address: string | null;
  walletType: WalletSessionType | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWalletSession(): ActiveWalletSession {
  const { address, walletType, isConnected, isConnecting, error } = useWallet();
  return {
    address,
    walletType: walletType as WalletSessionType | null,
    isConnected,
    isConnecting,
    error: error ?? null,
  };
}
