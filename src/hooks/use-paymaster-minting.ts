"use client";

/**
 * usePaymasterMinting — gasless / sponsored IP asset minting.
 *
 * Wraps the mint contract call with AVNU Paymaster support so users can:
 *  - Mint without holding ETH/STRK (pay gas with USDC/USDT instead)
 *  - Mint completely free when Medialane sponsors the transaction
 *  - Fall back to traditional gas payment at any time
 *
 * @example
 * ```tsx
 * const { mintSponsored, mintGasless, mintTraditional, isMinting, txHash } =
 *   usePaymasterMinting();
 *
 * // Completely free for the user
 * const hash = await mintSponsored(recipientAddress, tokenURI);
 *
 * // User pays with USDC instead of ETH/STRK
 * const hash = await mintGasless(recipientAddress, tokenURI, usdcAddress, maxFee);
 * ```
 */

import { useState, useCallback } from "react";
import { useAccount, useContract } from "@starknet-react/core";
import { Abi } from "starknet";
import { ipCollectionAbi } from "@/abis/ip_collection";
import { usePaymasterTransaction } from "@/hooks/use-paymaster-transaction";
import { useTxTracker } from "@/hooks/use-tx-tracker";
import { shouldSponsorTransaction } from "@/utils/paymaster";
import { useToast } from "@/components/ui/use-toast";

export interface UsePaymasterMintingResult {
  /**
   * Primary mint path — sponsored gas first, silent fallback to traditional.
   * Use this in all UI flows; users never pay gas when sponsorship is active.
   */
  mint: (recipient: string, tokenURI: string) => Promise<string | null>;
  /** Mint with Medialane-sponsored gas (free for user). */
  mintSponsored: (recipient: string, tokenURI: string) => Promise<string | null>;
  /** Mint paying gas with an alternative token (e.g. USDC). */
  mintGasless: (
    recipient: string,
    tokenURI: string,
    gasTokenAddress: string,
    maxGasTokenAmount: bigint
  ) => Promise<string | null>;
  /** Mint the traditional way (user pays ETH/STRK gas). */
  mintTraditional: (recipient: string, tokenURI: string) => Promise<string | null>;

  isMinting: boolean;
  txHash: string | null;
  txStatus: ReturnType<typeof useTxTracker>["status"];
  explorerUrl: string | null;
  isConfirmed: boolean;
  error: string | null;
  /** Whether sponsored minting is available. */
  isSponsorAvailable: boolean;
  /** Whether gasless minting is available for this account. */
  isGaslessCompatible: boolean;
  resetMintState: () => void;
}

export function usePaymasterMinting(
  contractAddress?: string
): UsePaymasterMintingResult {
  const { address } = useAccount();
  const { toast } = useToast();

  const [isMinting, setIsMinting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    executeAuto,
    executeGasless,
    executeSponsored,
    executeTraditional,
    isLoading: paymasterLoading,
    error: paymasterError,
    isGaslessCompatible,
    isSponsorAvailable,
  } = usePaymasterTransaction();

  const { status: txStatus, explorerUrl, isConfirmed } = useTxTracker(txHash);

  const finalContractAddress =
    contractAddress ?? process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS;

  const { contract } = useContract({
    abi: ipCollectionAbi as Abi,
    address: finalContractAddress as `0x${string}`,
  });

  const canSponsorMint = isSponsorAvailable && shouldSponsorTransaction("mint");

  const resetMintState = useCallback(() => {
    setIsMinting(false);
    setTxHash(null);
    setError(null);
  }, []);

  const buildMintCalls = useCallback(
    (recipient: string, tokenURI: string) => {
      if (!contract || !address) throw new Error("Contract or wallet not ready");
      return [contract.populate("mint", [recipient, tokenURI])];
    },
    [contract, address]
  );

  // ---------------------------------------------------------------------------
  // Auto mint — sponsored first, silent fallback to traditional (primary path)
  // ---------------------------------------------------------------------------

  const mint = useCallback(
    async (recipient: string, tokenURI: string): Promise<string | null> => {
      setIsMinting(true);
      setError(null);
      setTxHash(null);
      try {
        const calls = buildMintCalls(recipient, tokenURI);
        const hash = await executeAuto(calls);
        if (hash) {
          setTxHash(hash);
          toast({ title: "Mint submitted", description: "Your IP asset is being minted." });
        }
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Mint failed";
        setError(msg);
        toast({ title: "Mint failed", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsMinting(false);
      }
    },
    [buildMintCalls, executeAuto, toast]
  );

  // ---------------------------------------------------------------------------
  // Sponsored mint (free for user)
  // ---------------------------------------------------------------------------

  const mintSponsored = useCallback(
    async (recipient: string, tokenURI: string): Promise<string | null> => {
      if (!canSponsorMint) {
        setError("Sponsored minting is not available");
        return null;
      }
      setIsMinting(true);
      setError(null);
      setTxHash(null);
      try {
        const calls = buildMintCalls(recipient, tokenURI);
        const hash = await executeSponsored(calls);
        if (hash) {
          setTxHash(hash);
          toast({ title: "Mint submitted", description: "Gas fees sponsored by Medialane." });
        }
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sponsored mint failed";
        setError(msg);
        toast({ title: "Mint failed", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsMinting(false);
      }
    },
    [canSponsorMint, buildMintCalls, executeSponsored, toast]
  );

  // ---------------------------------------------------------------------------
  // Gasless mint (user pays with alt token)
  // ---------------------------------------------------------------------------

  const mintGasless = useCallback(
    async (
      recipient: string,
      tokenURI: string,
      gasTokenAddress: string,
      maxGasTokenAmount: bigint
    ): Promise<string | null> => {
      setIsMinting(true);
      setError(null);
      setTxHash(null);
      try {
        const calls = buildMintCalls(recipient, tokenURI);
        const hash = await executeGasless(calls, gasTokenAddress, maxGasTokenAmount);
        if (hash) {
          setTxHash(hash);
          toast({ title: "Mint submitted", description: "Gas paid with alternative token." });
        }
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gasless mint failed";
        setError(msg);
        toast({ title: "Mint failed", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsMinting(false);
      }
    },
    [buildMintCalls, executeGasless, toast]
  );

  // ---------------------------------------------------------------------------
  // Traditional mint
  // ---------------------------------------------------------------------------

  const mintTraditional = useCallback(
    async (recipient: string, tokenURI: string): Promise<string | null> => {
      setIsMinting(true);
      setError(null);
      setTxHash(null);
      try {
        const calls = buildMintCalls(recipient, tokenURI);
        const hash = await executeTraditional(calls);
        if (hash) {
          setTxHash(hash);
          toast({ title: "Mint submitted", description: "Transaction sent to the network." });
        }
        return hash;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Mint failed";
        setError(msg);
        toast({ title: "Mint failed", description: msg, variant: "destructive" });
        return null;
      } finally {
        setIsMinting(false);
      }
    },
    [buildMintCalls, executeTraditional, toast]
  );

  return {
    mint,
    mintSponsored,
    mintGasless,
    mintTraditional,
    isMinting: isMinting || paymasterLoading,
    txHash,
    txStatus,
    explorerUrl,
    isConfirmed,
    error: error ?? paymasterError,
    isSponsorAvailable: canSponsorMint,
    isGaslessCompatible,
    resetMintState,
  };
}
