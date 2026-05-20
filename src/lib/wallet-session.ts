export type WalletSessionType =
  | "argent"
  | "braavos"
  | "injected"
  | "cartridge"
  | "privy";

export type WalletSessionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "authenticating"
  | "preparing-wallet"
  | "deploying-account"
  | "ready"
  | "error";

export interface WalletSession {
  status: WalletSessionStatus;
  walletType: WalletSessionType | null;
  address: string | null;
  error: string | null;
}

export const IDLE_WALLET_SESSION: WalletSession = {
  status: "idle",
  walletType: null,
  address: null,
  error: null,
};

export function walletConnecting(walletType: WalletSessionType): WalletSession {
  return { status: "connecting", walletType, address: null, error: null };
}

export function walletConnected(walletType: WalletSessionType, address: string): WalletSession {
  return { status: "connected", walletType, address, error: null };
}

export function walletAuthenticating(
  walletType: WalletSessionType,
  address: string | null = null,
): WalletSession {
  return { status: "authenticating", walletType, address, error: null };
}

export function walletPreparingWallet(walletType: WalletSessionType): WalletSession {
  return { status: "preparing-wallet", walletType, address: null, error: null };
}

export function walletDeployingAccount(
  walletType: WalletSessionType,
  address: string | null = null,
): WalletSession {
  return { status: "deploying-account", walletType, address, error: null };
}

export function walletReady(walletType: WalletSessionType, address: string): WalletSession {
  return { status: "ready", walletType, address, error: null };
}

export function walletError(walletType: WalletSessionType | null, error: string): WalletSession {
  return { status: "error", walletType, address: null, error };
}

export function isWalletSessionActive(session: WalletSession): boolean {
  return session.status === "connected" || session.status === "ready";
}

export function isWalletSessionBusy(session: WalletSession): boolean {
  return (
    session.status === "connecting" ||
    session.status === "authenticating" ||
    session.status === "preparing-wallet" ||
    session.status === "deploying-account"
  );
}

export function isPrivyConnectInFlight(session: WalletSession): boolean {
  if (session.walletType !== "privy") return false;
  return (
    session.status === "authenticating" ||
    session.status === "preparing-wallet" ||
    session.status === "deploying-account"
  );
}
