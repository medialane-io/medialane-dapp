import { describe, it, expect } from "bun:test";
import { coinKind, formatCoinPrice, formatFdv } from "./coins";

describe("coinKind", () => {
  it("maps creator-coin to 'creator'", () => {
    expect(coinKind("creator-coin")).toBe("creator");
  });
  it("maps external-erc20 to 'memecoin'", () => {
    expect(coinKind("external-erc20")).toBe("memecoin");
  });
  it("falls back to 'creator' for unknown/null", () => {
    expect(coinKind(null)).toBe("creator");
    expect(coinKind("something-else")).toBe("creator");
  });
});

describe("formatCoinPrice", () => {
  it("formats small prices with precision", () => {
    expect(formatCoinPrice(0.0101)).toBe("0.0101");
  });
  it("uses exponential for tiny prices", () => {
    expect(formatCoinPrice(0.0000001)).toBe("1.00e-7");
  });
  it("returns '0' for zero", () => {
    expect(formatCoinPrice(0)).toBe("0");
  });
});

describe("formatFdv", () => {
  it("computes price x supply with a quote symbol", () => {
    expect(formatFdv(0.01, 1000, "STRK")).toBe("10 STRK");
  });
  it("abbreviates large values", () => {
    expect(formatFdv(1, 2_500_000, "STRK")).toBe("2.5M STRK");
  });
  it("returns null when supply or price is missing", () => {
    expect(formatFdv(null, 1000, "STRK")).toBeNull();
    expect(formatFdv(0.01, null, "STRK")).toBeNull();
  });
});
