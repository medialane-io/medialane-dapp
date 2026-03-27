"use client";
/**
 * Transaction execution adapter — wraps usePaymasterTransaction
 * (AVNU gasless SDK + StarkZap) into a simple stateful hook.
 *
 * Usage:
 *   const { execute, status, txHash, error, statusMessage, reset } = useTx();
 *   const hash = await execute(calls);
 */
import { useState, useCallback } from "react";
import type { Call } from "starknet";
import { usePaymasterTransaction } from "@/hooks/use-paymaster-transaction";

export type TxStatus =
  | "idle"
  | "submitting"
  | "confirming"
  | "confirmed"
  | "reverted"
  | "error";

export function useTx() {
  const { executeAuto } = usePaymasterTransaction();

  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const execute = useCallback(async (calls: Call[]): Promise<string | null> => {
    setStatus("submitting");
    setStatusMessage("Submitting transaction…");
    setError(null);
    try {
      const hash = await executeAuto(calls);
      if (hash) {
        setTxHash(hash);
        setStatus("confirmed");
        setStatusMessage("Transaction confirmed");
        return hash;
      }
      setStatus("reverted");
      setStatusMessage("Transaction failed");
      return null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      setError(msg);
      setStatus("error");
      setStatusMessage(msg);
      return null;
    }
  }, [executeAuto]);

  const reset = useCallback(() => {
    setStatus("idle");
    setTxHash(null);
    setError(null);
    setStatusMessage("");
  }, []);

  return { execute, status, txHash, error, statusMessage, reset };
}
