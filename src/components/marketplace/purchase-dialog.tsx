"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CheckCircle2, AlertCircle, ShoppingCart, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { fireConfetti } from "@/lib/confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { useMarketplace } from "@/hooks/use-marketplace";
import { EXPLORER_URL } from "@/lib/constants";
import { formatDisplayPrice, ipfsToHttp } from "@/lib/utils";
import { CurrencyIcon } from "@/components/shared/currency-icon";
import type { ApiOrder } from "@medialane/sdk";

interface PurchaseDialogProps {
  order: ApiOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function PurchaseDialog({ order, open, onOpenChange, onSuccess }: PurchaseDialogProps) {
  const { isConnected } = useUnifiedWallet();
  const { checkoutCart, isProcessing, txHash, error, resetState } = useMarketplace();
  const confettiFired = useRef(false);
  const [txStatus, setTxStatus] = useState<"idle" | "confirmed">("idle");

  useEffect(() => {
    if (txStatus === "confirmed" && !confettiFired.current) { confettiFired.current = true; fireConfetti(); }
    if (txStatus !== "confirmed") confettiFired.current = false;
  }, [txStatus]);

  useEffect(() => {
    if (open) { resetState(); setTxStatus("idle"); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBuy = async () => {
    if (!isConnected) { toast.error("Connect your wallet first"); return; }
    try {
      await checkoutCart([order as any]);
      setTxStatus("confirmed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Purchase failed");
    }
  };

  const price = order.price;
  const tokenImg = (order as any).token?.metadata?.image;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isProcessing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Complete purchase</DialogTitle>
          <DialogDescription>Confirm the details below to buy this asset.</DialogDescription>
        </DialogHeader>
        {txStatus === "confirmed" ? (
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <CheckCircle2 className="h-9 w-9 text-emerald-500" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-yellow-400" />
            </div>
            <p className="font-bold text-xl">Purchase confirmed!</p>
            {txHash && (
              <a href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <span className="font-mono">{txHash.slice(0, 10)}…{txHash.slice(-8)}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <Button className="w-full" onClick={() => { onOpenChange(false); onSuccess?.(); }}>Done</Button>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing purchase…</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tokenImg && (
              <img src={ipfsToHttp(tokenImg)} alt="Asset" className="w-full aspect-square object-cover rounded-lg" />
            )}
            {price && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-sm text-muted-foreground">Price</span>
                <div className="flex items-center gap-1.5 font-semibold">
                  <CurrencyIcon symbol={price.currency} size={14} />
                  <span>{price.formatted ?? formatDisplayPrice(price.raw ?? "")}</span>
                  <span className="text-xs text-muted-foreground">{price.currency}</span>
                </div>
              </div>
            )}
            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            <Button className="w-full h-11" onClick={handleBuy} disabled={isProcessing || !isConnected}>
              <ShoppingCart className="h-4 w-4 mr-2" />Buy now
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
