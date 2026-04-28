"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { OnboardStrategy } from "starkzap";
import type { WalletInterface } from "starkzap";
import { getStarkZapSdk } from "@/lib/starkzap";
import { COLLECTION_721_CONTRACT, MARKETPLACE_721_CONTRACT, MARKETPLACE_1155_CONTRACT } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Cartridge session policies for Medialane contracts
// ---------------------------------------------------------------------------

const CARTRIDGE_POLICIES = [
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

export type StarkZapWalletType = "cartridge";

export interface StarkZapWalletCtx {
  wallet: WalletInterface | null;
  walletType: StarkZapWalletType | null;
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  connectCartridge: () => Promise<void>;
  disconnect: () => void;
}

const StarkZapWalletContext = createContext<StarkZapWalletCtx | undefined>(
  undefined
);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function StarkZapWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wallet, setWallet] = useState<WalletInterface | null>(null);
  const [walletType, setWalletType] = useState<StarkZapWalletType | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Connect Cartridge
  // ---------------------------------------------------------------------------

  const connectCartridge = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const sdk = getStarkZapSdk();
      const result = await sdk.onboard({
        strategy: OnboardStrategy.Cartridge,
        cartridge: {
          policies: CARTRIDGE_POLICIES,
        },
        deploy: "if_needed",
      });

      setWallet(result.wallet);
      setWalletType("cartridge");
      setAddress(result.wallet.address as unknown as string);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect Cartridge"
      );
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Disconnect
  // ---------------------------------------------------------------------------

  const disconnect = useCallback(() => {
    setWallet(null);
    setWalletType(null);
    setAddress(null);
    setError(null);
  }, []);

  return (
    <StarkZapWalletContext.Provider
      value={{
        wallet,
        walletType,
        address,
        isConnecting,
        error,
        connectCartridge,
        disconnect,
      }}
    >
      {children}
    </StarkZapWalletContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const STARKZAP_DEFAULT_CTX: StarkZapWalletCtx = {
  wallet: null,
  walletType: null,
  address: null,
  isConnecting: false,
  error: null,
  connectCartridge: async () => {},
  disconnect: () => {},
};

export function useStarkZapWallet(): StarkZapWalletCtx {
  const ctx = useContext(StarkZapWalletContext);
  return ctx ?? STARKZAP_DEFAULT_CTX;
}
