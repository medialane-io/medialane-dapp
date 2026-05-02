"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, HandCoins } from "lucide-react";
import { toast } from "sonner";
import { fireConfetti } from "@/lib/confetti";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { useMarketplace } from "@/hooks/use-marketplace";
import { EXPLORER_URL, DURATION_OPTIONS } from "@/lib/constants";
import { getListableTokens } from "@medialane/sdk";
import { CurrencyIcon } from "@/components/shared/currency-icon";
import {
  CurrencyPicker,
  DurationPicker,
  MarketplaceSuccessState,
  MarketplaceProcessingState,
} from "@/components/marketplace/marketplace-dialog-primitives";

const CURRENCIES = getListableTokens().map((t) => t.symbol);

const schema = z.object({
  price: z.string().min(1, "Price required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be positive"),
  currency: z.string().refine((v) => getListableTokens().some((t) => t.symbol === v), "Invalid currency"),
  durationSeconds: z.number().min(86400),
});
type FormValues = z.infer<typeof schema>;

interface OfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetContract: string;
  tokenId: string;
  tokenName?: string;
  tokenStandard?: string;
  onSuccess?: () => void;
}

export function OfferDialog({ open, onOpenChange, assetContract, tokenId, tokenName, tokenStandard, onSuccess }: OfferDialogProps) {
  const { isConnected } = useUnifiedWallet();
  const { makeOffer, isProcessing, txHash, error, resetState } = useMarketplace();
  const confettiFired = useRef(false);
  const [txStatus, setTxStatus] = useState<"idle" | "confirmed">("idle");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { price: "", currency: "USDC", durationSeconds: 604800 },
  });

  const onSubmit = async (values: FormValues) => {
    if (!isConnected) { toast.error("Connect your wallet first"); return; }
    const hash = await makeOffer(assetContract, tokenId, values.price, values.currency, values.durationSeconds, tokenStandard);
    if (hash) setTxStatus("confirmed");
  };

  useEffect(() => {
    if (txStatus === "confirmed" && !confettiFired.current) { confettiFired.current = true; fireConfetti(); }
    if (txStatus !== "confirmed") confettiFired.current = false;
  }, [txStatus]);

  useEffect(() => {
    if (open) { resetState(); form.reset(); setTxStatus("idle"); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isProcessing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        {txStatus === "confirmed" ? (
          <MarketplaceSuccessState
            title="Offer submitted!"
            description={`Your offer on ${tokenName || `#${tokenId}`} is live.`}
            txHash={txHash}
            explorerUrl={EXPLORER_URL}
            name={tokenName || `#${tokenId}`}
            onDone={() => { onOpenChange(false); onSuccess?.(); }}
          />
        ) : isProcessing ? (
          <MarketplaceProcessingState title="Submitting offer…" />
        ) : (
          <>
            <DialogHeader><DialogTitle>Make an offer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Badge variant="outline" className="font-mono">#{tokenId}</Badge>
                <span className="text-sm font-medium truncate">{tokenName || `Token #${tokenId}`}</span>
              </div>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offer amount</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input type="number" step="any" placeholder="0.00" className="pr-20" {...field} />
                        </FormControl>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
                          <CurrencyIcon symbol={form.watch("currency")} size={14} />
                          <span className="text-xs font-bold">{form.watch("currency")}</span>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <CurrencyPicker currencies={CURRENCIES} value={field.value} onChange={field.onChange} disabled={isProcessing} />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="durationSeconds" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <DurationPicker options={DURATION_OPTIONS} value={field.value} onChange={field.onChange} disabled={isProcessing} cols={4} />
                      </FormControl>
                    </FormItem>
                  )} />
                  {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                  <Button type="submit" className="w-full h-11" disabled={isProcessing || !isConnected}>
                    <HandCoins className="h-4 w-4 mr-2" />Submit offer
                  </Button>
                </form>
              </Form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
