"use client";

/**
 * usePaymasterMarketplace — gasless execution for Medialane marketplace ops.
 *
 * Medialane charges a 1% protocol fee on all marketplace transactions, so gas
 * costs are sponsored for users via the AVNU Paymaster API key.
 *
 * Usage pattern — the caller (e.g. a buy/list handler) builds the Call[] using
 * the existing marketplace utils (SNIP-12 approve + register_order/fulfill_order),
 * then passes them to `executeAuto`:
 *
 * ```tsx
 * const { executeAuto, isLoading } = usePaymasterMarketplace();
 *
 * // Sponsored automatically; falls back to traditional if needed
 * const hash = await executeAuto(approveCalls.concat(orderCall));
 * useTxTracker(hash);
 * ```
 *
 * The explicit `executeSponsored`, `executeGasless`, and `executeTraditional`
 * variants remain available for advanced / override flows.
 */

import { usePaymasterTransaction } from "@/hooks/use-paymaster-transaction";
import type { UsePaymasterTransactionResult } from "@/hooks/use-paymaster-transaction";

export type UsePaymasterMarketplaceResult = UsePaymasterTransactionResult;

export function usePaymasterMarketplace(): UsePaymasterMarketplaceResult {
  return usePaymasterTransaction();
}
