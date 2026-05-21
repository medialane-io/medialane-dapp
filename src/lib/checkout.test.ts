import { test, expect } from "bun:test";
import { orderTotal } from "@/lib/checkout";
import type { ApiOrder } from "@medialane/sdk";

const ONE_STRK = 10n ** 18n;

/** Minimal ApiOrder stub — orderTotal only reads consideration + offer.itemType. */
function order(itemType: "ERC721" | "ERC1155", editions = "1"): ApiOrder {
  return {
    offer: { itemType, startAmount: editions },
    consideration: { startAmount: ONE_STRK.toString() },
  } as unknown as ApiOrder;
}

test("ERC-1155: charges price per edition × quantity", () => {
  expect(orderTotal(order("ERC1155"), 2)).toBe(2n * ONE_STRK);
  expect(orderTotal(order("ERC1155"), 1)).toBe(ONE_STRK);
  expect(orderTotal(order("ERC1155"), 7)).toBe(7n * ONE_STRK);
});

test("ERC-1155: does NOT divide by the listing edition count (regression)", () => {
  // The original bug divided price by offer.startAmount. editions=5, qty=2
  // must be 2 STRK — not 0.4 STRK.
  expect(orderTotal(order("ERC1155", "5"), 2)).toBe(2n * ONE_STRK);
});

test("ERC-721: always the single consideration amount", () => {
  expect(orderTotal(order("ERC721"), 1)).toBe(ONE_STRK);
});
