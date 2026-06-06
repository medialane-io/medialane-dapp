import { describe, it, expect, beforeEach } from "bun:test";
import { readLastChoice, writeLastChoice, clearLastChoice } from "./persistence";

// minimal localStorage shim for bun
const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    store[k] = v;
  },
  removeItem: (k: string) => {
    delete store[k];
  },
  clear: () => {
    for (const k of Object.keys(store)) delete store[k];
  },
  key: () => null,
  length: 0,
} as Storage;

describe("persistence", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips a valid method", () => {
    writeLastChoice("braavos");
    expect(readLastChoice()).toBe("braavos");
  });

  it("returns null when empty", () => {
    expect(readLastChoice()).toBeNull();
  });

  it("ignores a garbage stored value", () => {
    localStorage.setItem("ml_wallet", "not-a-method");
    expect(readLastChoice()).toBeNull();
  });

  it("clears", () => {
    writeLastChoice("privy");
    clearLastChoice();
    expect(readLastChoice()).toBeNull();
  });
});
