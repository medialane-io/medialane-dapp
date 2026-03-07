/**
 * Types for AVNU Paymaster integration
 */

import { Call } from "starknet";

export interface GasToken {
  symbol: string;
  address: string;
  decimals: number;
  balance?: string;
}

export interface GasTokenPrice {
  tokenAddress: string;
  gasTokenPrice: string;
  gasUnitPrice: string;
}

export interface PaymasterOptions {
  gasTokenAddress?: string;
  maxGasTokenAmount?: bigint;
  gasTokenPrices?: GasTokenPrice[];
  sponsored?: boolean;
}

export interface PaymasterResponse {
  transactionHash: string;
  success: boolean;
  error?: string;
}

export interface AccountCompatibility {
  isCompatible: boolean;
  reason?: string;
}

export interface SponsoredTransactionData {
  userAddress: string;
  typedData: any;
  signature: string[];
}

export interface PaymasterStatus {
  isActive: boolean;
  supportedTokens: string[];
  maxGasAmount: string;
}

/**
 * All transaction types in Medialane that can be gas-sponsored.
 */
export type TransactionType =
  | "mint"
  | "transfer"
  | "marketplace_list"
  | "marketplace_buy"
  | "marketplace_offer"
  | "marketplace_cancel"
  | "license_create";
