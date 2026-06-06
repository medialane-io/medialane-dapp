import type { WalletMethod } from "./types";

const KEY = "ml_wallet";
const VALID: WalletMethod[] = ["argent", "braavos", "cartridge", "privy"];

// Guard on localStorage (not window): undefined during SSR, present in the
// browser, and shimmable under `bun test`.
function ls(): Storage | null {
  return typeof localStorage === "undefined" ? null : localStorage;
}

export function readLastChoice(): WalletMethod | null {
  const v = ls()?.getItem(KEY);
  return v && (VALID as string[]).includes(v) ? (v as WalletMethod) : null;
}

export function writeLastChoice(method: WalletMethod): void {
  ls()?.setItem(KEY, method);
}

export function clearLastChoice(): void {
  ls()?.removeItem(KEY);
}
