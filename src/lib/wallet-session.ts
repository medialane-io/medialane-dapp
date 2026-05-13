export type WalletSessionType = "injected" | "cartridge" | "privy";

export type WalletSessionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "authenticating"
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
  return {
    status: "connecting",
    walletType,
    address: null,
    error: null,
  };
}

export function walletConnected(
  walletType: WalletSessionType,
  address: string,
): WalletSession {
  return {
    status: "connected",
    walletType,
    address,
    error: null,
  };
}

export function walletAuthenticating(
  walletType: WalletSessionType,
  address: string | null = null,
): WalletSession {
  return {
    status: "authenticating",
    walletType,
    address,
    error: null,
  };
}

export function walletReady(
  walletType: WalletSessionType,
  address: string,
): WalletSession {
  return {
    status: "ready",
    walletType,
    address,
    error: null,
  };
}

export function walletError(
  walletType: WalletSessionType | null,
  error: string,
): WalletSession {
  return {
    status: "error",
    walletType,
    address: null,
    error,
  };
}

export function isWalletSessionActive(session: WalletSession): boolean {
  return session.status === "connected" || session.status === "ready";
}

export function isWalletSessionBusy(session: WalletSession): boolean {
  return session.status === "connecting" || session.status === "authenticating";
}
