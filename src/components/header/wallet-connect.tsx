"use client";

import React, { useState } from "react";
import { useConnect, useAccount, useDisconnect } from "@starknet-react/core";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Wallet,
  LogOut,
  User,
  History,
  Settings,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Copy,
  Layers,
  BarChart3,
  PlusCircle,
  Box,
  Rocket,
  ArrowRightLeft
} from "lucide-react";
import { useNetwork } from "@/components/starknet-provider";
import { StarknetkitConnector, useStarknetkitConnectModal } from "starknetkit";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export function WalletConnect() {
  const { connectAsync, connectors } = useConnect();
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const { networkConfig } = useNetwork();

  const { starknetkitConnectModal } = useStarknetkitConnectModal({
    connectors: connectors as StarknetkitConnector[],
    modalTheme: "dark",
  });

  const handleConnect = async () => {
    try {
      const { connector } = await starknetkitConnectModal();
      if (!connector) return;
      await connectAsync({ connector });
    } catch (err) {
      console.error("Failed to connect wallet", err);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied");
    }
  };

  const isWrongNetwork = isConnected && chainId && BigInt(chainId).toString() !== networkConfig.chainId;

  if (isConnected) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`relative rounded-full h-8 w-8 transition-all duration-300 hover:bg-foreground/10 dark:hover:bg-foreground/10
              ${isWrongNetwork
                ? "bg-red-500/10 text-red-500"
                : "text-foreground"}`}
          >
            <Wallet className="h-4 w-4" />
            <span
              className={`absolute top-2 right-2 h-1.5 w-1.5 rounded-full border border-background
                ${isWrongNetwork ? "bg-red-500" : "bg-emerald-500 animate-pulse"}`}
            />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-background/95 backdrop-blur-xl border-border">
          <SheetHeader className="p-6 border-b border-border/40">
            <div className="flex items-center justify-between mb-4">
              <SheetTitle className="flex items-center gap-2 text-xl font-semibold">
                <ShieldCheck className="w-5 h-5 text-outrun-cyan" />
                Account
              </SheetTitle>
              <Badge variant="outline" className={`text-[10px] font-normal ${isWrongNetwork ? "border-red-500/30 text-red-400 bg-red-500/5" : "border-emerald-500/20 text-emerald-400 bg-emerald-500/5 px-2 py-0.5"}`}>
                {networkConfig.name}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted border border-border/50 flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base truncate">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </h3>
                  <button onClick={copyAddress} className="text-muted-foreground hover:text-foreground transition-colors">
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${isWrongNetwork ? "bg-red-500" : "bg-outrun-cyan"}`} />
                    {isWrongNetwork ? "Connection Restricted" : "Securely Connected"}
                  </span>
                </div>
              </div>
              <Link
                href={`${networkConfig.explorerUrl}/address/${address}`}
                target="_blank"
                className="h-8 w-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
              {isWrongNetwork && (
                <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 flex gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <LogOut className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-red-200">Switch Network Needed</p>
                    <p className="text-[10px] text-red-200/60 leading-relaxed">
                      Please switch to {networkConfig.name} in your wallet to interact with Medialane.
                    </p>
                  </div>
                </div>
              )}

              {/* Portfolio Section */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground px-1">Portfolio</p>
                <div className="grid gap-1">
                  {[
                    { label: "Dashboard", icon: BarChart3, href: "/portfolio" },
                    { label: "My IP Assets", icon: Box, href: "/portfolio/assets" },
                    { label: "My Collections", icon: Layers, href: "/portfolio/collections" },
                    { label: "Active Listings", icon: ArrowRightLeft, href: "/portfolio/listings" },
                    { label: "Bids & Offers", icon: History, href: "/portfolio/offers" },
                    { label: "Activity Hub", icon: History, href: "/portfolio/activities" },
                  ].map((item) => (
                    <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
                      <div className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-outrun-cyan transition-colors" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-outrun-cyan/50 transition-all group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Creator Section */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground px-1">Creator Tools</p>
                <div className="grid gap-1">
                  {[
                    { label: "Mint IP Asset", icon: PlusCircle, href: "/create/asset" },
                    { label: "Deploy Collection", icon: Rocket, href: "/launchpad/collection-drop" },
                    { label: "IP Templates", icon: ShieldCheck, href: "/create/templates" },
                    { label: "Account Settings", icon: Settings, href: "/portfolio/settings" }
                  ].map((item) => (
                    <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
                      <div className="group flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border/50 hover:bg-muted/20 transition-all cursor-pointer">
                        <div className="flex items-center gap-3">
                          <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-outrun-cyan transition-colors" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-outrun-cyan/50 transition-all group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-6 border-t border-border/40 bg-card/10 mt-auto space-y-4">
            <Button
              variant="outline"
              onClick={() => {
                disconnect();
                setOpen(false);
              }}
              className="w-full h-11 border-border/40 hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive group transition-all"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Disconnect Wallet
            </Button>

            <p className="text-[10px] text-muted-foreground/50 text-center font-medium">
              Medialane Protocol v1.0
            </p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="rounded-full h-9 w-9 bg-black/5 dark:bg-foreground/5 hover:bg-black/10 dark:hover:bg-foreground/10 border border-black/5 dark:border-foreground/5 transition-all text-foreground"
      onClick={handleConnect}
    >
      <Wallet className="h-4 w-4" />
    </Button>
  );
}
