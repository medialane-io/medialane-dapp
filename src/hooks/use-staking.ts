"use client";

/**
 * useStaking — STRK delegation staking via StarkZap's Staking class.
 *
 * Lets IP holders earn passive income by delegating STRK to a validator pool.
 * Execution is handled by the already-connected wallet (starknet-react or StarkZap),
 * while StarkZap supplies the contract call data.
 *
 * @example
 * ```tsx
 * const { stake, position, pools, isLoading } = useStaking(validatorAddress);
 *
 * // Stake 10 STRK with the validator
 * const txHash = await stake("10");
 *
 * // Show the user's current position
 * if (position) {
 *   console.log("Staked:", position.staked.toFormatted());
 *   console.log("Rewards:", position.rewards.toFormatted());
 * }
 * ```
 */

import { useState, useCallback, useEffect } from "react";
import { useAccount } from "@starknet-react/core";
import { Staking, Amount } from "starkzap";
import type { PoolMember, Pool } from "starkzap";
import {
  getStarkZapSdk,
  getAppStakingConfig,
  STARKZAP_TOKENS,
  fromAddress,
} from "@/lib/starkzap";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import type { WalletInterface } from "starkzap";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseStakingResult {
  position: PoolMember | null;
  isMember: boolean;
  commission: number | null;
  pools: Pool[];
  isLoading: boolean;
  error: string | null;
  stake: (amountStr: string) => Promise<string | null>;
  exitIntent: (amountStr: string) => Promise<string | null>;
  exitPool: () => Promise<string | null>;
  claimRewards: () => Promise<string | null>;
  refresh: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * @param validatorAddress - The staker/validator address whose pool to interact with.
 *                           Set to undefined to skip all network calls.
 */
export function useStaking(
  validatorAddress: string | undefined
): UseStakingResult {
  const { account, address: walletAddress } = useAccount();

  const [position, setPosition] = useState<PoolMember | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [commission, setCommission] = useState<number | null>(null);
  const [pools, setPools] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getStakingInstance = useCallback(async (): Promise<Staking> => {
    if (!validatorAddress) throw new Error("No validator address provided");

    const sdk = getStarkZapSdk();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const provider = sdk.getProvider() as any;
    const stakingConfig = getAppStakingConfig();

    return Staking.fromStaker(
      fromAddress(validatorAddress),
      STARKZAP_TOKENS.STRK,
      provider,
      stakingConfig
    );
  }, [validatorAddress]);

  const refresh = useCallback(async () => {
    if (!validatorAddress) return;

    setIsLoading(true);
    setError(null);

    try {
      const sdk = getStarkZapSdk();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const provider = sdk.getProvider() as any;
      const stakingConfig = getAppStakingConfig();

      const validatorPools = await Staking.getStakerPools(
        provider,
        fromAddress(validatorAddress),
        stakingConfig
      );
      setPools(validatorPools);

      if (!walletAddress) {
        setPosition(null);
        setIsMember(false);
        setCommission(null);
        return;
      }

      const staking = await getStakingInstance();
      const stub = { address: walletAddress } as unknown as WalletInterface;

      const [member, pos, comm] = await Promise.all([
        staking.isMember(stub),
        staking.getPosition(stub),
        staking.getCommission(),
      ]);

      setIsMember(member);
      setPosition(pos);
      setCommission(comm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staking data");
    } finally {
      setIsLoading(false);
    }
  }, [validatorAddress, walletAddress, getStakingInstance]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const { execute: unifiedExecute } = useUnifiedWallet();

  const executeAndReturn = useCallback(
    async (calls: unknown[]): Promise<string | null> => {
      try {
        const hash = await unifiedExecute(calls as any);
        return hash;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Transaction failed");
        return null;
      }
    },
    [unifiedExecute]
  );

  const stake = useCallback(
    async (amountStr: string): Promise<string | null> => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const staking = await getStakingInstance();
        const amount = Amount.parse(amountStr, STARKZAP_TOKENS.STRK.decimals, STARKZAP_TOKENS.STRK.symbol);

        const calls = isMember
          ? staking.populateAdd(fromAddress(walletAddress), amount)
          : staking.populateEnter(fromAddress(walletAddress), amount);

        const txHash = await executeAndReturn(calls);
        refresh();
        return txHash;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Stake failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getStakingInstance, isMember, executeAndReturn, refresh]
  );

  const exitIntent = useCallback(
    async (amountStr: string): Promise<string | null> => {
      if (!walletAddress) {
        setError("Wallet not connected");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const staking = await getStakingInstance();
        const amount = Amount.parse(amountStr, STARKZAP_TOKENS.STRK.decimals, STARKZAP_TOKENS.STRK.symbol);
        const calls = [staking.populateExitIntent(amount)];
        const txHash = await executeAndReturn(calls);
        refresh();
        return txHash;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Exit intent failed");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [walletAddress, getStakingInstance, executeAndReturn, refresh]
  );

  const exitPool = useCallback(async (): Promise<string | null> => {
    if (!walletAddress) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const staking = await getStakingInstance();
      const calls = [staking.populateExit(fromAddress(walletAddress))];
      const txHash = await executeAndReturn(calls);
      refresh();
      return txHash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Exit pool failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, getStakingInstance, executeAndReturn, refresh]);

  const claimRewards = useCallback(async (): Promise<string | null> => {
    if (!walletAddress) {
      setError("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const staking = await getStakingInstance();
      const calls = [staking.populateClaimRewards(fromAddress(walletAddress))];
      const txHash = await executeAndReturn(calls);
      refresh();
      return txHash;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim rewards failed");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, getStakingInstance, executeAndReturn, refresh]);

  return {
    position,
    isMember,
    commission,
    pools,
    isLoading,
    error,
    stake,
    exitIntent,
    exitPool,
    claimRewards,
    refresh,
  };
}
