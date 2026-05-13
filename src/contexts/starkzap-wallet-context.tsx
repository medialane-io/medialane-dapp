"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import type { User } from "@privy-io/react-auth";
import { OnboardStrategy } from "starkzap";
import type { WalletInterface } from "starkzap";
import { getStarkZapSdk } from "@/lib/starkzap";
import {
  IDLE_WALLET_SESSION,
  isWalletSessionBusy,
  walletConnecting,
  walletError,
  walletReady,
  walletAuthenticating,
  type WalletSession,
} from "@/lib/wallet-session";
import {
  COLLECTION_721_CONTRACT,
  MARKETPLACE_721_CONTRACT,
  MARKETPLACE_1155_CONTRACT,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
// Cartridge session policies for Medialane contracts
// ---------------------------------------------------------------------------

export const CARTRIDGE_POLICIES = [
  { target: COLLECTION_721_CONTRACT, method: "mint" },
  { target: COLLECTION_721_CONTRACT, method: "create_collection" },
  { target: COLLECTION_721_CONTRACT, method: "burn" },
  { target: COLLECTION_721_CONTRACT, method: "transfer_token" },
  { target: MARKETPLACE_721_CONTRACT, method: "register_order" },
  { target: MARKETPLACE_721_CONTRACT, method: "fulfill_order" },
  { target: MARKETPLACE_721_CONTRACT, method: "cancel_order" },
  { target: MARKETPLACE_1155_CONTRACT, method: "register_order" },
  { target: MARKETPLACE_1155_CONTRACT, method: "fulfill_order" },
  { target: MARKETPLACE_1155_CONTRACT, method: "cancel_order" },
] as { target: string; method: string }[];

// ---------------------------------------------------------------------------
// Context types
// ---------------------------------------------------------------------------

export type StarkZapWalletType = "cartridge" | "privy";

export interface StarkZapWalletCtx {
  wallet: WalletInterface | null;
  session: WalletSession;
  walletType: StarkZapWalletType | null;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  privyUser: User | null;
  connectCartridge: () => Promise<void>;
  connectPrivy: () => Promise<void>;
  disconnect: () => void;
}

/** Internal interface used only by PrivyBridge — not exported publicly. */
export interface StarkZapPrivyBridge {
  pendingPrivyConnect: boolean;
  clearPendingPrivyConnect: () => void;
  onPrivyConnecting: () => void;
  onPrivyConnected: (wallet: WalletInterface, address: string, user: User | null) => void;
  onPrivyError: (msg: string) => void;
  onPrivyDisconnect: () => void;
  walletType: StarkZapWalletType | null;
}

const StarkZapWalletContext = createContext<StarkZapWalletCtx | undefined>(undefined);
const StarkZapPrivyBridgeContext = createContext<StarkZapPrivyBridge | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider — no Privy imports. Privy logic lives in PrivyBridge.
// ---------------------------------------------------------------------------

export function StarkZapWalletProvider({
  children,
  onRequestPrivy,
}: {
  children: React.ReactNode;
  onRequestPrivy: () => void;
}) {
  const [wallet, setWallet] = useState<WalletInterface | null>(null);
  const [session, setSession] = useState<WalletSession>(IDLE_WALLET_SESSION);
  const [privyUser, setPrivyUser] = useState<User | null>(null);
  const [pendingPrivyConnect, setPendingPrivyConnect] = useState(false);
  const walletType = session.walletType === "cartridge" || session.walletType === "privy"
    ? session.walletType
    : null;
  const address = session.address;
  const isConnecting = isWalletSessionBusy(session);
  const error = session.error;

  // ---------------------------------------------------------------------------
  // Connect Cartridge
  // ---------------------------------------------------------------------------

  const connectCartridge = useCallback(async () => {
    setSession(walletConnecting("cartridge"));
    try {
      const sdk = getStarkZapSdk();
      const result = await sdk.onboard({
        strategy: OnboardStrategy.Cartridge,
        cartridge: { policies: CARTRIDGE_POLICIES },
        deploy: "if_needed",
      });
      setWallet(result.wallet);
      setSession(walletReady("cartridge", result.wallet.address as unknown as string));
    } catch (err) {
      setWallet(null);
      setSession(walletError("cartridge", err instanceof Error ? err.message : "Failed to connect Cartridge"));
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Connect Privy — activates PrivyProvider if not yet mounted, then signals
  // PrivyBridge to run login + wallet initialisation.
  // ---------------------------------------------------------------------------

  const connectPrivy = useCallback(async () => {
    localStorage.setItem("ml_privy_session", "1");
    setSession(walletAuthenticating("privy"));
    onRequestPrivy(); // mounts PrivyProvider + PrivyBridge in providers.tsx
    setPendingPrivyConnect(true);
  }, [onRequestPrivy]);

  // ---------------------------------------------------------------------------
  // Disconnect
  // ---------------------------------------------------------------------------

  const disconnect = useCallback(() => {
    if (walletType === "privy") {
      localStorage.removeItem("ml_privy_session");
    }
    setWallet(null);
    setSession(IDLE_WALLET_SESSION);
    setPrivyUser(null);
  }, [walletType]);

  // ---------------------------------------------------------------------------
  // PrivyBridge callbacks
  // ---------------------------------------------------------------------------

  const bridge: StarkZapPrivyBridge = {
    pendingPrivyConnect,
    clearPendingPrivyConnect: () => setPendingPrivyConnect(false),
    onPrivyConnecting: () => { setSession(walletAuthenticating("privy")); },
    onPrivyConnected: (w, addr, u) => {
      setWallet(w);
      setSession(walletReady("privy", addr));
      setPrivyUser(u);
    },
    onPrivyError: (msg) => {
      setWallet(null);
      setSession(walletError("privy", msg));
    },
    onPrivyDisconnect: () => {
      setWallet(null);
      setSession(IDLE_WALLET_SESSION);
      setPrivyUser(null);
      localStorage.removeItem("ml_privy_session");
    },
    walletType,
  };

  return (
    <StarkZapWalletContext.Provider
      value={{ wallet, session, walletType, address, isConnecting, error, privyUser, connectCartridge, connectPrivy, disconnect }}
    >
      <StarkZapPrivyBridgeContext.Provider value={bridge}>
        {children}
      </StarkZapPrivyBridgeContext.Provider>
    </StarkZapWalletContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Public hook
// ---------------------------------------------------------------------------

const STARKZAP_DEFAULT_CTX: StarkZapWalletCtx = {
  wallet: null, session: IDLE_WALLET_SESSION, walletType: null, address: null,
  isConnecting: false, error: null, privyUser: null,
  connectCartridge: async () => {},
  connectPrivy: async () => {},
  disconnect: () => {},
};

export function useStarkZapWallet(): StarkZapWalletCtx {
  return useContext(StarkZapWalletContext) ?? STARKZAP_DEFAULT_CTX;
}

export function useStarkZapPrivyBridge(): StarkZapPrivyBridge | undefined {
  return useContext(StarkZapPrivyBridgeContext);
}
