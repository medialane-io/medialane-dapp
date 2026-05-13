"use client";

import { useUnifiedWallet } from "./use-unified-wallet";
import { useRegisterUser } from "./use-register-user";

/**
 * Normalized wallet hook — single interface across all wallet types.
 * Use this when a component only needs to know WHO the user is.
 * Also silently registers the user with the Medialane backend on connect.
 *
 * For signing, session keys, paymaster, or execution — use the
 * platform-specific hooks (useUnifiedWallet, usePaymasterTransaction, etc.).
 */
export function useWallet() {
  const { address, isConnected, walletType } = useUnifiedWallet();

  useRegisterUser(address ?? null, walletType);

  return {
    address: address ?? null,
    isConnected,
    walletType,
  };
}
