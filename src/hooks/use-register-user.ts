"use client";

import { useEffect } from "react";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY } from "@/lib/constants";

type BackendWalletType =
  | "ARGENT" | "BRAAVOS" | "CARTRIDGE" | "PRIVY" | "INJECTED" | "UNKNOWN";

type FrontendWalletType =
  | "argent" | "braavos" | "injected" | "cartridge" | "privy" | null;

function toBackendWalletType(walletType: FrontendWalletType): BackendWalletType {
  if (walletType === "argent") return "ARGENT";
  if (walletType === "braavos") return "BRAAVOS";
  if (walletType === "cartridge") return "CARTRIDGE";
  if (walletType === "privy") return "PRIVY";
  if (walletType === "injected") return "INJECTED";
  return "UNKNOWN";
}

const SESSION_KEY_PREFIX = "ml_registered_";

/**
 * Silently registers a wallet address with the Medialane backend.
 * Fires once per address per browser session — never adds user-visible friction.
 * Errors are swallowed — registration must never block the user.
 */
export function useRegisterUser(
  address: string | null,
  walletType: FrontendWalletType
) {
  useEffect(() => {
    if (!address || !MEDIALANE_API_KEY) return;

    const sessionKey = `${SESSION_KEY_PREFIX}${address}`;
    if (sessionStorage.getItem(sessionKey)) return;

    fetch(`${MEDIALANE_BACKEND_URL}/v1/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MEDIALANE_API_KEY,
      },
      body: JSON.stringify({
        walletAddress: address,
        walletType: toBackendWalletType(walletType),
        appSource: "MEDIALANE_DAPP",
        chain: "STARKNET",
      }),
    })
      .then(() => sessionStorage.setItem(sessionKey, "1"))
      .catch(() => {
        // non-fatal: registration failure never surfaces to the user
      });
  }, [address, walletType]);
}
