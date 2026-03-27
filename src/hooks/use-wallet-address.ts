"use client";

/**
 * Simple hook that returns the connected wallet address.
 * Drop-in replacement for useSessionKey().walletAddress in copied medialane-io code.
 */

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";

export function useWalletAddress(): string | undefined {
  const { address } = useUnifiedWallet();
  return address;
}
