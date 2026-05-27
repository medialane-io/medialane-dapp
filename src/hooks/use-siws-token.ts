"use client";

import { useState, useEffect, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { useStarkZapWallet } from "@/contexts/starkzap-wallet-context";
import {
  getStoredSiwsToken,
  requestSiwsToken,
  type SiwsSigner,
} from "@/lib/siws-client";

export function useSiwsToken() {
  const { account, address } = useAccount();
  const {
    wallet: starkZapWallet,
    address: starkZapAddress,
  } = useStarkZapWallet();
  const activeAddress = starkZapAddress ?? address;
  const [token, setToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync stored token on address change (handles wallet switch / disconnect)
  useEffect(() => {
    if (!activeAddress) {
      setToken(null);
      setError(null);
      return;
    }
    setToken(getStoredSiwsToken(activeAddress));
    setError(null);
  }, [activeAddress]);

  const signIn = useCallback(async (): Promise<string | null> => {
    if (!activeAddress) return null;

    const signer = (starkZapWallet ?? account) as SiwsSigner | null;
    if (!signer) return null;

    setIsSigningIn(true);
    setError(null);
    try {
      const newToken = await requestSiwsToken({ walletAddress: activeAddress, signer });
      setToken(newToken);
      return newToken;
    } catch (err) {
      // Capture for UI surfaces that read the hook's `error` field, AND
      // rethrow so callers awaiting getValidToken() see the real reason
      // (e.g. "Check if your wallet is deployed on Starknet.") in their
      // try/catch instead of a null they convert to a generic message.
      const message = err instanceof Error ? err.message : "Wallet sign-in failed";
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    } finally {
      setIsSigningIn(false);
    }
  }, [activeAddress, starkZapWallet, account]);

  /**
   * Returns an existing valid token or triggers the SIWS sign-in flow.
   * Call this inside SWR fetchers or mutation handlers, not at render time.
   */
  const getValidToken = useCallback(async (): Promise<string | null> => {
    if (!activeAddress) return null;

    const existing = getStoredSiwsToken(activeAddress);
    if (existing) {
      setToken(existing);
      return existing;
    }
    return signIn();
  }, [activeAddress, signIn]);

  return { token, signIn, getValidToken, isSigningIn, error };
}
