"use client";

/**
 * Compatibility shim — replaces medialane-io's ChipiPay-backed useSessionKey.
 * Returns the same surface so copied components compile without changes.
 */

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";

export function useSessionKey() {
  const { address, isConnected } = useUnifiedWallet();

  return {
    wallet: null,
    walletAddress: address ?? null,
    hasWallet: isConnected,
    isLoadingWallet: false,
    refetchWallet: () => {},
    storedSession: null,
    sessionPreferences: null,
    hasActiveSession: isConnected,
    isSettingUpSession: false,
    setupSession: async (_pin: string) => {
      throw new Error("Session keys not supported — use connected wallet.");
    },
    signTypedData: async () => {
      throw new Error("Direct signing not supported — use useUnifiedWallet().execute().");
    },
    maybeClearSessionForAmountCap: async () => false,
  };
}
