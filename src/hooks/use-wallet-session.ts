"use client";

import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useStarkZapWallet } from "@/contexts/starkzap-wallet-context";
import {
  IDLE_WALLET_SESSION,
  isWalletSessionBusy,
  walletReady,
  type WalletSession,
  type WalletSessionType,
} from "@/lib/wallet-session";

export interface ActiveWalletSession {
  session: WalletSession;
  address: string | null;
  walletType: WalletSessionType | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWalletSession(): ActiveWalletSession {
  const {
    session: starkZapSession,
    address: starkZapAddress,
  } = useStarkZapWallet();
  const { address: injectedAddress, isConnected: injectedConnectedRaw } = useAccount();
  const injectedConnected = injectedConnectedRaw ?? false;

  return useMemo(() => {
    if (starkZapSession.status !== "idle" && starkZapSession.status !== "error") {
      return {
        session: starkZapSession,
        address: starkZapSession.address,
        walletType: starkZapSession.walletType,
        isConnected: Boolean(starkZapSession.address),
        isConnecting: isWalletSessionBusy(starkZapSession),
        error: starkZapSession.error,
      };
    }

    if (starkZapAddress) {
      const session = walletReady(starkZapSession.walletType ?? "cartridge", starkZapAddress);
      return {
        session,
        address: starkZapAddress,
        walletType: session.walletType,
        isConnected: true,
        isConnecting: false,
        error: null,
      };
    }

    if (injectedConnected && injectedAddress) {
      const session = walletReady("injected", injectedAddress);
      return {
        session,
        address: injectedAddress,
        walletType: "injected" as const,
        isConnected: true,
        isConnecting: false,
        error: null,
      };
    }

    return {
      session: starkZapSession.status === "error" ? starkZapSession : IDLE_WALLET_SESSION,
      address: null,
      walletType: null,
      isConnected: false,
      isConnecting: false,
      error: starkZapSession.error,
    };
  }, [starkZapSession, starkZapAddress, injectedConnected, injectedAddress]);
}
