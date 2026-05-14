"use client";

import { useState } from "react";
import { UserRoundCog } from "lucide-react";
import { Contract, cairo } from "starknet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePaymasterTransaction } from "@/hooks/use-paymaster-transaction";
import { starknetProvider } from "@/lib/starknet";
import { ipCollectionAbi } from "@/abis/ip_collection";
import { COLLECTION_721_CONTRACT } from "@/lib/constants";
import { normalizeAddress } from "@/lib/utils";
import { toast } from "sonner";

interface TransferOwnershipDialogProps {
  /** On-chain numeric collection ID (decimal string). */
  collectionId: string;
  currentOwner: string;
  onTransferred?: () => void;
}

/**
 * Per-collection ownership handoff via the audited IPCollection
 * registry. The new owner controls future minting and ownership
 * transfers for this collection only — existing tokens are unaffected.
 */
export function TransferCollectionOwnershipDialog({
  collectionId,
  currentOwner,
  onTransferred,
}: TransferOwnershipDialogProps) {
  const [open, setOpen] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { executeAuto } = usePaymasterTransaction();

  const trimmed = newOwner.trim();
  const isValid = /^0x[0-9a-fA-F]{1,64}$/.test(trimmed);
  const wouldNoop =
    isValid && normalizeAddress(trimmed) === normalizeAddress(currentOwner);

  const handleTransfer = async () => {
    if (!isValid || wouldNoop) return;
    setSubmitting(true);
    try {
      const contract = new Contract({
        abi: ipCollectionAbi as any,
        address: COLLECTION_721_CONTRACT,
        providerOrAccount: starknetProvider,
      });
      const call = contract.populate("transfer_collection_ownership", [
        cairo.uint256(BigInt(collectionId)),
        trimmed,
      ]);
      await executeAuto([call]);
      toast.success("Collection ownership transferred", {
        description: `New owner: ${trimmed.slice(0, 6)}…${trimmed.slice(-4)}`,
      });
      setOpen(false);
      setNewOwner("");
      onTransferred?.();
    } catch (err) {
      toast.error("Transfer failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserRoundCog className="h-4 w-4" /> Transfer ownership
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer collection ownership</DialogTitle>
          <DialogDescription>
            The new owner will control minting and future ownership transfers
            for this collection. Existing tokens are unaffected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="new-owner">New owner address</Label>
          <Input
            id="new-owner"
            placeholder="0x…"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            className="font-mono text-sm"
            spellCheck={false}
            autoComplete="off"
          />
          {trimmed && !isValid && (
            <p className="text-xs text-red-500">Not a valid Starknet address.</p>
          )}
          {wouldNoop && (
            <p className="text-xs text-amber-500">
              This is already the current owner.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={!isValid || wouldNoop || submitting}
          >
            {submitting ? "Transferring…" : "Transfer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
