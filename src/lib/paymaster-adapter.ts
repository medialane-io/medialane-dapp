"use client";

import type { Account, Call } from "starknet";
import {
  canSponsor,
  checkAccountCompatibility,
  executeGaslessTransaction,
  getGasTokenPrices,
} from "@/utils/paymaster";
import type { AccountCompatibility, GasTokenPrice } from "@/types/paymaster";

export interface GaslessExecutionOptions {
  gasTokenAddress: string;
  maxGasTokenAmount: bigint;
}

export function isSponsorshipConfigured(): boolean {
  return canSponsor();
}

export async function checkGaslessCompatibility(
  address: string,
): Promise<AccountCompatibility> {
  return checkAccountCompatibility(address);
}

export async function fetchGasTokenEstimatePrices(): Promise<GasTokenPrice[]> {
  return getGasTokenPrices();
}

export async function executeGaslessCalls(
  account: Account,
  calls: Call[],
  options: GaslessExecutionOptions,
): Promise<string> {
  const response = await executeGaslessTransaction(account, calls, options);
  if (!response.success || !response.transactionHash) {
    throw new Error(response.error ?? "Gasless execution failed");
  }
  return response.transactionHash;
}
