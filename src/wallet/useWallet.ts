"use client";

import { useStore } from "zustand";
import { useCallback } from "react";
import type { Call, WalletMethod, WalletStatus } from "./types";
import { METHOD_BACKEND } from "./types";
import { useWalletStore } from "./WalletProvider";
import { writeLastChoice, clearLastChoice } from "./persistence";

export interface UseWallet {
  address: string | null;
  method: WalletMethod | null;
  status: WalletStatus;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (method: WalletMethod, opts?: { adoptSession?: boolean }) => Promise<void>;
  disconnect: () => void;
  execute: (calls: Call[]) => Promise<string>;
}

export function useWallet(): UseWallet {
  const store = useWalletStore();
  const state = useStore(store, (s) => ({
    address: s.address,
    method: s.method,
    status: s.status,
    error: s.error,
  }));

  const connect = useCallback<UseWallet["connect"]>(
    async (method, opts) => {
      const st = store.getState();
      st.setActive(method); // marks the backend active so its ingests apply
      writeLastChoice(method); // explicit choice — the only thing that persists
      const bridge = st.bridges[METHOD_BACKEND[method]];
      await bridge?.connect(method, opts);
    },
    [store],
  );

  const disconnect = useCallback<UseWallet["disconnect"]>(() => {
    const st = store.getState();
    if (st.backend) st.bridges[st.backend]?.disconnect();
    clearLastChoice();
    st.clearActive();
  }, [store]);

  // execute is wired in Task 8 (keeps the existing AVNU paymaster path).
  const execute = useCallback<UseWallet["execute"]>(async () => {
    throw new Error("execute() is wired in Task 8");
  }, []);

  return {
    address: state.address,
    method: state.method,
    status: state.status,
    isConnected: state.status === "ready",
    isConnecting: state.status === "connecting" || state.status === "deploying",
    error: state.error,
    connect,
    disconnect,
    execute,
  };
}
