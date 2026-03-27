"use client";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { useAllTokenBalances } from "@/hooks/use-token-balance";

export function useWalletWithBalance() {
  const { address, isConnected } = useUnifiedWallet();
  const allBalances = useAllTokenBalances(address);

  return {
    wallet: null,
    walletAddress: address ?? null,
    hasWallet: isConnected,
    isLoadingWallet: false,
    refetchWallet: () => {},
    storedSession: null,
    sessionPreferences: null,
    balance: allBalances.USDC.raw !== null ? allBalances.USDC.raw.toString() : null,
    isLoadingBalance: allBalances.USDC.isLoading,
    refetchBalance: () => allBalances.refreshAll(),
  };
}
