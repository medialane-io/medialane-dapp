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

// ---------------------------------------------------------------------------
// Cartridge session policies for Medialane contracts
// ---------------------------------------------------------------------------

const COLLECTION_CONTRACT =
  process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_COLLECTION_CONTRACT;
const MARKETPLACE_CONTRACT =
  process.env.NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS ||
  process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT;

const CARTRIDGE_POLICIES = [
  COLLECTION_CONTRACT && { target: COLLECTION_CONTRACT, method: "mint" },
  COLLECTION_CONTRACT && { target: COLLECTION_CONTRACT, method: "create_collection" },
  COLLECTION_CONTRACT && { target: COLLECTION_CONTRACT, method: "burn" },
  COLLECTION_CONTRACT && { target: COLLECTION_CONTRACT, method: "transfer_token" },
  MARKETPLACE_CONTRACT && { target: MARKETPLACE_CONTRACT, method: "register_order" },
  MARKETPLACE_CONTRACT && { target: MARKETPLACE_CONTRACT, method: "fulfill_order" },
  MARKETPLACE_CONTRACT && { target: MARKETPLACE_CONTRACT, method: "cancel_order" },
].filter(Boolean) as { target: string; method: string }[];

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
