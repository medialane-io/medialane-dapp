"use client";

import { useUnifiedWallet } from "./use-unified-wallet";

/**
 * Normalized wallet hook — single interface across all wallet types.
 * Use this when a component only needs to know WHO the user is.
 *
 * For signing, session keys, paymaster, or execution — use the
 * platform-specific hooks (useUnifiedWallet, usePaymasterTransaction, etc.).
 */
export function useWallet() {
  const { address, isConnected } = useUnifiedWallet();
  return {
    address: address ?? null,
    isConnected,
  };
}
