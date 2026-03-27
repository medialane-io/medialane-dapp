"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, AlertCircle, ArrowLeftRight, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { useMarketplace } from "@/hooks/use-marketplace";
import { EXPLORER_URL, DURATION_OPTIONS } from "@/lib/constants";

const schema = z.object({
  price: z.string().min(1, "Price required").refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be positive"),
  durationSeconds: z.number().min(86400),
  message: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface CounterOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The NFT contract address (needed to place the counter-offer on-chain) */
  nftContract: string;
  tokenId: string;
  originalOrderHash: string;
  tokenName?: string;
  currentBid?: string;
  currencySymbol: string;
  currencyDecimals: number;
  onSuccess?: () => void;
}

export function CounterOfferDialog({
  open, onOpenChange, nftContract, tokenId, tokenName,
  currentBid, currencySymbol, onSuccess,
}: CounterOfferDialogProps) {
  const { isConnected } = useUnifiedWallet();
  const { makeOffer, isProcessing, txHash, error, resetState } = useMarketplace();
  const [done, setDone] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { price: "", durationSeconds: 604800, message: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!isConnected) { toast.error("Connect your wallet first"); return; }
    try {
      await makeOffer(nftContract, tokenId, values.price, currencySymbol, values.durationSeconds);
      setDone(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Counter-offer failed");
    }
  };

  useEffect(() => {
    if (open) { resetState(); form.reset(); setDone(false); }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isProcessing) onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Counter offer</DialogTitle>
          {currentBid && <DialogDescription>Current bid: {currentBid}</DialogDescription>}
        </DialogHeader>
        {done ? (
          <div className="flex flex-col items-center gap-5 py-2">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-emerald-500" />
            </div>
            <p className="font-bold text-xl">Counter-offer submitted!</p>
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
            <p className="text-sm text-muted-foreground">Submitting counter-offer…</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Your offer ({currencySymbol})</FormLabel>
                  <FormControl>
                    <Input type="number" step="any" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="durationSeconds" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-4 gap-2">
                      {DURATION_OPTIONS.map((opt) => (
                        <Button key={opt.label} type="button" variant={field.value === opt.seconds ? "default" : "outline"}
                          size="sm" onClick={() => field.onChange(opt.seconds)} className="text-xs">{opt.label}</Button>
                      ))}
                    </div>
                  </FormControl>
                </FormItem>
              )} />
              {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
              <Button type="submit" className="w-full h-11" disabled={isProcessing || !isConnected}>
                <ArrowLeftRight className="h-4 w-4 mr-2" />Submit counter-offer
              </Button>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
