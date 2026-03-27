/**
 * AVNU Paymaster utility functions for Medialane
 *
 * Three execution modes:
 *  1. Gasless  — user pays gas with an alternative token (USDC, USDT, ETH, STRK)
 *  2. Sponsored — Medialane pays gas using the AVNU API key
 *  3. Traditional — normal starknet-react account.execute()
 */

import {
  fetchGasTokenPrices,
  fetchAccountCompatibility,
  executeCalls,
} from "@avnu/gasless-sdk";
import { Account, Call, PaymasterRpc } from "starknet";
import { AVNU_PAYMASTER_CONFIG } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import type {
  GasTokenPrice,
  PaymasterOptions,
  AccountCompatibility,
  PaymasterResponse,
  PaymasterStatus,
  TransactionType,
} from "@/types/paymaster";

// ---------------------------------------------------------------------------
// Account compatibility
// ---------------------------------------------------------------------------

export async function checkAccountCompatibility(
  accountAddress: string
): Promise<AccountCompatibility> {
  try {
    const compatibility = await fetchAccountCompatibility(accountAddress);
    return compatibility;
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (!msg.includes("Account not deployed")) {
      console.error("[paymaster] checkAccountCompatibility:", error);
    }
    return {
      isCompatible: false,
      reason: msg.includes("Account not deployed")
        ? "Account not deployed"
        : "Failed to check compatibility",
    };
  }
}

// ---------------------------------------------------------------------------
// Gas token prices
// ---------------------------------------------------------------------------

export async function getGasTokenPrices(): Promise<GasTokenPrice[]> {
  try {
    const prices = await fetchGasTokenPrices();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return prices.map((p: any) => ({
      tokenAddress: p.tokenAddress,
      gasTokenPrice: p.gasTokenPrice ?? p.price ?? "0",
      gasUnitPrice: p.gasUnitPrice ?? p.unitPrice ?? "0",
    }));
  } catch (error) {
    console.error("[paymaster] getGasTokenPrices:", error);
    throw new Error("Failed to fetch gas token prices");
  }
}

// ---------------------------------------------------------------------------
// Gasless execution (user pays with alt token)
// ---------------------------------------------------------------------------

/**
 * Execute calls via AVNU gasless SDK — user pays with an alternative gas token.
 */
export async function executeGaslessTransaction(
  account: Account,
  calls: Call[],
  options: PaymasterOptions
): Promise<PaymasterResponse> {
  try {
    const response = await executeCalls(account, calls, {
      gasTokenAddress: options.gasTokenAddress,
      maxGasTokenAmount: options.maxGasTokenAmount,
    });

    return { transactionHash: response.transactionHash, success: true };
  } catch (error) {
    console.error("[paymaster] executeGaslessTransaction:", error);
    return {
      transactionHash: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Sponsored execution (Medialane pays gas via AVNU API key)
// ---------------------------------------------------------------------------

/**
 * Execute calls with AVNU-sponsored gas via PaymasterRpc (SNIP-29).
 * Uses the JSON-RPC paymaster endpoint with x-paymaster-api-key — works for
 * both Argent X and Braavos, regardless of whether the connector natively
 * supports avnuPaymasterProvider.
 */
export async function executeSponsoredTransaction(
  account: Account,
  calls: Call[]
): Promise<PaymasterResponse> {
  const apiKey = AVNU_PAYMASTER_CONFIG.apiKey;
  if (!apiKey) {
    return { transactionHash: "", success: false, error: "AVNU API key not configured" };
  }
  try {
    const paymaster = new PaymasterRpc({
      nodeUrl: "https://starknet.paymaster.avnu.fi/",
      headers: { "x-paymaster-api-key": apiKey },
    });

    // Build typed data for the sponsored transaction
    const built = await paymaster.buildTransaction(
      { type: "invoke", invoke: { userAddress: account.address, calls } },
      { version: "0x1", feeMode: { mode: "sponsored" } }
    );

    if (built.type !== "invoke") {
      throw new Error("Unexpected paymaster response type");
    }

    // Sign the typed data with the wallet
    const signature = await account.signMessage(built.typed_data);

    // Submit to AVNU paymaster
    const result = await paymaster.executeTransaction(
      {
        type: "invoke",
        invoke: {
          userAddress: account.address,
          typedData: built.typed_data,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          signature: signature as any,
        },
      },
      built.parameters
    );

    return { transactionHash: result.transaction_hash, success: true };
  } catch (error) {
    console.warn("[paymaster] Sponsored tx rejected:", error);
    return {
      transactionHash: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// ---------------------------------------------------------------------------
// Sponsorship eligibility
// ---------------------------------------------------------------------------

/**
 * Returns true if the AVNU API key is configured, meaning sponsored txs are possible.
 */
export function canSponsor(): boolean {
  return !!AVNU_PAYMASTER_CONFIG.apiKey;
}

/**
 * All transaction types are sponsored when the AVNU API key is present.
 * Medialane collects a 1% protocol fee on marketplace and launchpad transactions,
 * so gas costs are absorbed to remove friction for users.
 */
export function shouldSponsorTransaction(_type: TransactionType): boolean {
  return canSponsor();
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

export function formatGasTokenAmount(
  amount: string,
  decimals: number,
  symbol: string
): string {
  return `${formatPrice(amount, decimals)} ${symbol}`;
}
