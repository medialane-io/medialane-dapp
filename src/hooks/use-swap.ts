"use client";

/**
 * useSwap — token swap hook powered by AVNU Exchange.
 *
 * Manages the full swap lifecycle:
 *  1. Token + amount selection
 *  2. Debounced quote fetching from AVNU
 *  3. Transaction building (approve + swap call)
 *  4. Execution via unified wallet (paymaster-sponsored when available)
 *
 * @example
 * ```tsx
 * const swap = useSwap();
 * swap.setSellToken(ETH_TOKEN);
 * swap.setSellAmount("1.5");
 * // quote auto-fetches after 500ms debounce
 * const hash = await swap.executeSwap();
 * ```
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useToast } from "@/hooks/use-toast";
import {
  fetchSwapQuotes,
  buildSwapCall,
  buildApproveCall,
  formatTokenAmount,
  parseTokenAmount,
  parseToBigInt,
  type SwapQuote,
} from "@/utils/avnu-swap";
import type { StarkZapTokenKey } from "@/lib/starkzap";

// ---------------------------------------------------------------------------
// Token definitions for swap UI
// ---------------------------------------------------------------------------

export interface SwapToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  color: string;
  /** Key for useTokenBalance hook (null for WBTC which isn't in StarkZap preset) */
  balanceKey: StarkZapTokenKey | null;
}

export const SWAP_TOKENS: SwapToken[] = [
  {
    symbol: "ETH",
    name: "Ether",
    address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
    color: "#627EEA",
    balanceKey: "ETH",
  },
  {
    symbol: "STRK",
    name: "Starknet Token",
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    decimals: 18,
    color: "#FF875B",
    balanceKey: "STRK",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
    decimals: 6,
    color: "#2775CA",
    balanceKey: "USDC",
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    decimals: 6,
    color: "#26A17B",
    balanceKey: "USDT",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac",
    decimals: 8,
    color: "#F7931A",
    balanceKey: null,
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseSwapReturn {
  // Token selection
  sellToken: SwapToken;
  buyToken: SwapToken;
  setSellToken: (token: SwapToken) => void;
  setBuyToken: (token: SwapToken) => void;
  flipTokens: () => void;

  // Amounts
  sellAmount: string;
  buyAmount: string;
  setSellAmount: (value: string) => void;

  // Quote
  quote: SwapQuote | null;
  isFetchingQuote: boolean;
  quoteError: string | null;

  // Balances
  sellBalance: string | null;
  buyBalance: string | null;
  isSellBalanceLoading: boolean;

  // Price info
  priceImpact: string | null;
  exchangeRate: string | null;

  // Execution
  executeSwap: () => Promise<string | null>;
  isExecuting: boolean;
  txHash: string | null;
  execError: string | null;

  // Validation
  insufficientBalance: boolean;
  canSwap: boolean;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 500;

export function useSwap(): UseSwapReturn {
  const { address, execute } = useUnifiedWallet();
  const { toast } = useToast();

  const [sellToken, setSellTokenState] = useState<SwapToken>(SWAP_TOKENS[0]); // ETH
  const [buyToken, setBuyTokenState] = useState<SwapToken>(SWAP_TOKENS[2]); // USDC
  const [sellAmount, setSellAmountState] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [isExecuting, setIsExecuting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [execError, setExecError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Balances -----------------------------------------------------------

  const sellBalanceHook = useTokenBalance(
    sellToken.balanceKey ?? "ETH", // fallback; won't match for WBTC
    address
  );
  const buyBalanceHook = useTokenBalance(
    buyToken.balanceKey ?? "ETH",
    address
  );

  // For WBTC (no StarkZap preset), we can't use the hook — return null
  const sellBalance = sellToken.balanceKey ? sellBalanceHook.raw : null;
  const buyBalance = buyToken.balanceKey ? buyBalanceHook.raw : null;

  const sellBalanceFormatted = sellBalance !== null
    ? formatTokenAmount(sellBalance, sellToken.decimals)
    : null;
  const buyBalanceFormatted = buyBalance !== null
    ? formatTokenAmount(buyBalance, buyToken.decimals)
    : null;

  // ---- Quote fetching -----------------------------------------------------

  const fetchQuote = useCallback(async (
    sell: SwapToken,
    buy: SwapToken,
    amount: string,
    takerAddress?: string
  ) => {
    const parsed = parseTokenAmount(amount, sell.decimals);
    if (parsed <= 0n) {
      setQuote(null);
      setBuyAmount("");
      setQuoteError(null);
      return;
    }

    setIsFetchingQuote(true);
    setQuoteError(null);

    try {
      const quotes = await fetchSwapQuotes({
        sellTokenAddress: sell.address,
        buyTokenAddress: buy.address,
        sellAmount: parsed,
        takerAddress,
      });

      if (!quotes || quotes.length === 0) {
        setQuote(null);
        setBuyAmount("");
        setQuoteError("No route found for this pair");
        return;
      }

      const best = quotes[0];
      setQuote(best);

      const buyRaw = parseToBigInt(best.buyAmount);
      setBuyAmount(formatTokenAmount(buyRaw, buy.decimals));
    } catch (err) {
      setQuote(null);
      setBuyAmount("");
      setQuoteError(err instanceof Error ? err.message : "Failed to fetch quote");
    } finally {
      setIsFetchingQuote(false);
    }
  }, []);

  // Debounced re-quote whenever inputs change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchQuote(sellToken, buyToken, sellAmount, address);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sellToken, buyToken, sellAmount, address, fetchQuote]);

  // ---- Token setters that clear the stale quote ---------------------------

  const setSellToken = useCallback((token: SwapToken) => {
    if (token.symbol === buyToken.symbol) {
      setBuyTokenState(sellToken);
    }
    setSellTokenState(token);
    setQuote(null);
    setBuyAmount("");
  }, [buyToken, sellToken]);

  const setBuyToken = useCallback((token: SwapToken) => {
    if (token.symbol === sellToken.symbol) {
      setSellTokenState(buyToken);
    }
    setBuyTokenState(token);
    setQuote(null);
    setBuyAmount("");
  }, [sellToken, buyToken]);

  const flipTokens = useCallback(() => {
    setSellTokenState(buyToken);
    setBuyTokenState(sellToken);
    setSellAmountState(buyAmount);
    setBuyAmount(sellAmount);
    setQuote(null);
  }, [sellToken, buyToken, sellAmount, buyAmount]);

  const setSellAmount = useCallback((value: string) => {
    // Allow only valid numeric input
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    setSellAmountState(value);
    if (!value) {
      setQuote(null);
      setBuyAmount("");
    }
  }, []);

  // ---- Price info ---------------------------------------------------------

  const priceImpact = quote?.priceRatioUsd != null
    ? `${(quote.priceRatioUsd * 100).toFixed(2)}%`
    : null;

  const exchangeRate = quote && sellAmount
    ? (() => {
        const sellRaw = parseTokenAmount(sellAmount, sellToken.decimals);
        const buyRaw = parseToBigInt(quote.buyAmount);
        if (sellRaw === 0n) return null;
        // rate = buyRaw / sellRaw, adjusted for decimal difference
        const decimalAdj = sellToken.decimals - buyToken.decimals;
        const scaledBuy = decimalAdj >= 0
          ? buyRaw * 10n ** BigInt(decimalAdj)
          : buyRaw / 10n ** BigInt(-decimalAdj);
        const rate = Number(scaledBuy) / Number(sellRaw);
        return `1 ${sellToken.symbol} ≈ ${rate.toFixed(4)} ${buyToken.symbol}`;
      })()
    : null;

  // ---- Validation ---------------------------------------------------------

  const sellAmountRaw = parseTokenAmount(sellAmount, sellToken.decimals);

  const insufficientBalance =
    sellBalance !== null &&
    sellAmountRaw > 0n &&
    sellAmountRaw > sellBalance;

  const canSwap =
    !!address &&
    !!quote &&
    sellAmountRaw > 0n &&
    !insufficientBalance &&
    !isFetchingQuote &&
    !isExecuting;

  // ---- Execution ----------------------------------------------------------

  const executeSwap = useCallback(async (): Promise<string | null> => {
    if (!address || !quote) return null;

    setIsExecuting(true);
    setExecError(null);

    try {
      // Re-fetch quote to ensure it's still valid
      const freshQuotes = await fetchSwapQuotes({
        sellTokenAddress: sellToken.address,
        buyTokenAddress: buyToken.address,
        sellAmount: sellAmountRaw,
        takerAddress: address,
      });

      if (!freshQuotes || freshQuotes.length === 0) {
        throw new Error("No route available — please try again");
      }

      const freshQuote = freshQuotes[0];
      setQuote(freshQuote);

      // Build swap call from AVNU
      const swapCall = await buildSwapCall({
        quoteId: freshQuote.quoteId,
        takerAddress: address,
        slippage: 0.005,
      });

      // Build approve call (AVNU router = swapCall.contractAddress)
      const approveCall = buildApproveCall(
        sellToken.address,
        swapCall.contractAddress,
        sellAmountRaw
      );

      toast({
        title: "Confirm swap",
        description: `Swapping ${sellAmount} ${sellToken.symbol} → ${buyAmount} ${buyToken.symbol}`,
      });

      const hash = await execute([approveCall, swapCall]);
      setTxHash(hash);
      toast({
        title: "Swap submitted",
        description: "Your swap is being processed on-chain.",
      });

      // Reset sell amount after success
      setSellAmountState("");
      setBuyAmount("");
      setQuote(null);

      return hash;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Swap failed";
      setExecError(msg);
      toast({ title: "Swap failed", description: msg, variant: "destructive" });
      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [address, quote, sellToken, buyToken, sellAmount, buyAmount, sellAmountRaw, execute, toast]);

  return {
    sellToken,
    buyToken,
    setSellToken,
    setBuyToken,
    flipTokens,
    sellAmount,
    buyAmount,
    setSellAmount,
    quote,
    isFetchingQuote,
    quoteError,
    sellBalance: sellBalanceFormatted,
    buyBalance: buyBalanceFormatted,
    isSellBalanceLoading: sellToken.balanceKey ? sellBalanceHook.isLoading : false,
    priceImpact,
    exchangeRate,
    executeSwap,
    isExecuting,
    txHash,
    execError,
    insufficientBalance,
    canSwap,
  };
}
