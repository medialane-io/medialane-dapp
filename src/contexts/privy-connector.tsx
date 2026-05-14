"use client";

/**
 * PrivyConnector — runs the Privy onboarding flow.
 * Rendered by StarkZapWalletProvider only when providers.tsx has loaded
 * the lazy Privy bundle. Communicates with its parent via props (no
 * second context — that pattern caused a silent-mount regression).
 */

import { useCallback, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { OnboardStrategy } from "starkzap";
import type { WalletInterface } from "starkzap";
import type { User } from "@privy-io/react-auth";
import { getStarkZapSdk, isStarkZapSponsorshipEnabled } from "@/lib/starkzap";
import type { WalletSession } from "@/lib/wallet-session";
import {
  IDLE_WALLET_SESSION,
  walletAuthenticating,
  walletDeployingAccount,
  walletError,
  walletPreparingWallet,
  walletReady,
} from "@/lib/wallet-session";

export interface PrivyConnectorProps {
  pendingConnect: boolean;
  clearPending: () => void;
  walletType: "cartridge" | "privy" | null;
  setSession: (next: WalletSession) => void;
  setWallet: (w: WalletInterface | null) => void;
  setPrivyUser: (u: User | null) => void;
}

export function PrivyConnector({
  pendingConnect,
  clearPending,
  walletType,
  setSession,
  setWallet,
  setPrivyUser,
}: PrivyConnectorProps) {
  const { ready, authenticated, login, logout, getAccessToken, user } = usePrivy();

  const runOnboarding = useCallback(async (silent = false) => {
    setSession(walletPreparingWallet("privy"));

    const token = await getAccessToken();
    if (!token) {
      if (silent) return;
      throw new Error("No Privy access token");
    }

    const res = await fetch("/api/wallet/starknet", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to create Privy Starknet wallet");
    const walletData = (await res.json()) as { id: string; address: string; publicKey: string };

    if (!isStarkZapSponsorshipEnabled()) {
      throw new Error("Privy onboarding requires AVNU paymaster sponsorship to deploy the Starknet account.");
    }

    setSession(walletDeployingAccount("privy", walletData.address));

    const sdk = getStarkZapSdk();
    const privyResolve = async () => ({
      walletId: walletData.id,
      publicKey: walletData.publicKey,
      serverUrl: `${window.location.origin}/api/wallet/sign`,
      headers: async (): Promise<Record<string, string>> => {
        const freshToken = await getAccessToken();
        if (!freshToken) return {};
        return { Authorization: `Bearer ${freshToken}` };
      },
    });

    const result = await sdk.onboard({
      strategy: OnboardStrategy.Privy,
      accountPreset: "argentXV050",
      feeMode: "sponsored",
      privy: { resolve: privyResolve },
      deploy: "if_needed",
    });

    setWallet(result.wallet);
    setSession(walletReady("privy", result.wallet.address as unknown as string));
    setPrivyUser(user ?? null);
  }, [getAccessToken, setSession, setWallet, setPrivyUser, user]);

  // Explicit connect — gated on Privy `ready` so login() isn't called before init.
  useEffect(() => {
    if (!pendingConnect) return;
    if (!ready) {
      console.log("[Privy] pending connect but SDK not ready yet — waiting");
      return;
    }
    console.log("[Privy] SDK ready, starting connect flow. authenticated=", authenticated);
    clearPending();
    setSession(walletAuthenticating("privy"));

    const run = async () => {
      if (!authenticated) {
        console.log("[Privy] calling login()");
        await login();
        console.log("[Privy] login() resolved");
      } else {
        console.log("[Privy] already authenticated, skipping login()");
      }
      await runOnboarding();
    };

    run().catch((err) => {
      console.error("[Privy] connect flow failed:", err);
      setWallet(null);
      setSession(walletError("privy", err instanceof Error ? err.message : "Failed to connect with Privy"));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pendingConnect]);

  // Auto-reconnect on page reload — gated on `ready`.
  useEffect(() => {
    if (!ready) return;
    if (!authenticated || walletType === "cartridge") return;
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("ml_privy_session")) return;

    runOnboarding(true).catch((err) => {
      console.error("[Privy] auto-reconnect failed:", err);
      setSession(walletError("privy", err instanceof Error ? err.message : "Privy auto-reconnect failed"));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  // Sync logout when Privy session ends externally.
  useEffect(() => {
    if (!ready) return;
    if (!authenticated && walletType === "privy") {
      logout().catch(() => {});
      setWallet(null);
      setSession(IDLE_WALLET_SESSION);
      setPrivyUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("ml_privy_session");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated]);

  return null;
}
