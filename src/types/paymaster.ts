// AVNU Paymaster types
export interface GasTokenPrice {
  tokenAddress: string;
  gasTokenPrice: bigint;
  priceInUSD?: string;
}

export interface PaymasterOptions {
  apiKey?: string;
  baseUrl?: string;
  gasTokenAddress?: string;
  maxGasTokenAmount?: bigint;
}

export interface AccountCompatibility {
  isCompatible: boolean;
  reason?: string;
}

export interface PaymasterResponse {
  transactionHash: string;
  success?: boolean;
  error?: string;
}

export type PaymasterStatus = "idle" | "loading" | "success" | "error";

export type TransactionType = "gasless" | "sponsored" | "traditional" | "mint";
