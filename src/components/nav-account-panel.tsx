"use client";

import * as React from "react";
import { useConnect } from "@starknet-react/core";
import type { Connector } from "@starknet-react/core";
import { shortenAddress, useNavCommandMenu } from "@medialane/ui";
import { Gamepad2, LogOut, Mail, User, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useNetwork } from "@/components/starknet-provider";
import { useStarkZapWallet } from "@/contexts/starkzap-wallet-context";
import { useUnifiedWallet, type UnifiedWalletType } from "@/hooks/use-unified-wallet";
import { useWalletSession } from "@/hooks/use-wallet-session";

function getWalletLabel(walletType: UnifiedWalletType) {
  if (walletType === "cartridge") return "Cartridge";
  if (walletType === "privy") return "Social";
  if (walletType === "injected") return "Browser";
  return "Wallet";
}

function getConnectorDisplayName(id: string, fallback: string) {
  const names: Record<string, string> = {
    argentX: "Ready",
    braavos: "Braavos",
    webwallet: "Argent Web Wallet",
  };
  return names[id] ?? fallback;
}


export function NavAccountPanel() {
  const { connectAsync, connectors } = useConnect();
  const { address, isConnected, walletType, disconnect } = useUnifiedWallet();
  const { isConnecting, error } = useWalletSession();
  const { connectCartridge, connectPrivy, privyUser } = useStarkZapWallet();
  const { networkConfig } = useNetwork();
  const { close } = useNavCommandMenu();
  const [connectingId, setConnectingId] = React.useState<string | null>(null);

  const connectInjected = async (connector: Connector) => {
    setConnectingId(connector.id);
    try {
      await connectAsync({ connector });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Wallet connection failed";
      if (/user rejected|user aborted|aborted|rejected/i.test(message)) {
        toast.info("Wallet connection cancelled");
      } else {
        toast.error("Wallet connection failed", { description: message });
      }
    } finally {
      setConnectingId(null);
    }
  };

  const connectStarkZap = async (type: "cartridge" | "privy") => {
    try {
      if (type === "cartridge") await connectCartridge();
      else await connectPrivy();
    } catch {
      // The StarkZap context exposes the user-facing error state.
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background/70 text-muted-foreground">
          <User className="h-3.5 w-3.5" />
        </div>
        <span className="truncate text-sm font-medium text-foreground">{shortenAddress(address)}</span>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-[10px] font-medium text-emerald-400 shrink-0">
          {getWalletLabel(walletType)}
        </span>
        <button
          onClick={() => { disconnect(); close(); }}
          className="ml-auto shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          aria-label="Disconnect wallet"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/70 text-muted-foreground">
          <Wallet className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">Connect wallet</p>
          <p className="text-xs text-muted-foreground">Browser wallet, Cartridge, or Privy</p>
        </div>
      </div>

      {error && (
        <p className="mb-2 rounded-lg border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => void connectInjected(connector)}
            disabled={isConnecting || connectingId !== null}
            className="flex h-9 items-center justify-start gap-2 rounded-lg border border-border/50 px-3 text-xs font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{getConnectorDisplayName(connector.id, connector.name)}</span>
            {connectingId === connector.id && <span className="ml-auto text-[10px] text-muted-foreground">Connecting...</span>}
          </button>
        ))}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => void connectStarkZap("cartridge")}
            disabled={isConnecting}
            className="flex h-9 items-center justify-center gap-2 rounded-lg border border-border/50 px-3 text-xs font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Gamepad2 className="h-3.5 w-3.5 text-purple-400" />
            Cartridge
          </button>
          <button
            onClick={() => void connectStarkZap("privy")}
            disabled={isConnecting}
            className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail className="h-3.5 w-3.5" />
            Privy
          </button>
        </div>
      </div>
    </div>
  );
}
