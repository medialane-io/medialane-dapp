"use client";

import { useState, useCallback } from "react";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { INDEXER_REVALIDATION_DELAY_MS } from "@/lib/constants";
import type { Call } from "starknet";

export interface TransferInput {
  contractAddress: string; // NFT contract address
  tokenId: string;         // Token ID — decimal ("42") or hex ("0x2a")
  toAddress: string;       // Recipient Starknet address
}

/**
 * Encode a token ID (decimal or hex string) into two felt252 values
 * for Starknet u256 calldata: [low_128_bits, high_128_bits].
 */
export function encodeTokenId(tokenId: string): [string, string] {
  const id = BigInt(tokenId);
  const low = (id & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")).toString();
  const high = (id >> BigInt(128)).toString();
  return [low, high];
}

export function useTransfer() {
  const { address, isConnected, execute } = useUnifiedWallet();
  const { mutate } = useSWRConfig();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"idle" | "submitting" | "confirmed" | "failed">("idle");

  const invalidate = useCallback(() => {
    mutate(
      (key) => {
        if (typeof key !== "string") return false;
        return key.startsWith("tokens-owned-") || key.startsWith("token-");
      },
      undefined,
      { revalidate: true }
    );
  }, [mutate]);

  const resetState = useCallback(() => {
    setIsProcessing(false);
    setError(null);
    setTxHash(null);
    setTxStatus("idle");
  }, []);

  const transferToken = useCallback(
    async (input: TransferInput) => {
      if (!address) throw new Error("Wallet not connected.");
      setIsProcessing(true);
      setError(null);
      setTxStatus("submitting");

      try {
        const [tokenIdLow, tokenIdHigh] = encodeTokenId(input.tokenId);

        const call: Call = {
          contractAddress: input.contractAddress,
          entrypoint: "transfer_from",
          calldata: [address, input.toAddress, tokenIdLow, tokenIdHigh],
        };

        const hash = await execute([call]);
        setTxHash(hash);
        setTxStatus("confirmed");

        toast.success("Transfer complete!", {
          description: `Token #${input.tokenId} sent successfully.`,
        });
        invalidate();
        setTimeout(() => invalidate(), INDEXER_REVALIDATION_DELAY_MS);
        return hash;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Transfer failed";
        setError(msg);
        setTxStatus("failed");
        toast.error("Transfer failed", { description: msg });
      } finally {
        setIsProcessing(false);
      }
    },
    [address, execute, invalidate]
  );

  return {
    transferToken,
    walletAddress: address ?? null,
    hasWallet: isConnected,
    isLoadingWallet: false,
    isProcessing,
    txStatus,
    txHash,
    error,
    resetState,
  };
}
