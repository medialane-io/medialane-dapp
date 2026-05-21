import type { ApiOrder } from "@medialane/sdk";

/**
 * A marketplace order prepared for checkout. `considerationAmount` is the
 * TOTAL ERC-20 amount (wei) the contract will charge for this item — always
 * derive it with `orderTotal()`, never from a raw consideration value.
 */
export interface CheckoutItem {
  orderHash: string;
  considerationToken: string;
  /** Total wei the contract charges to fill this item. From `orderTotal()`. */
  considerationAmount: string;
  isERC1155: boolean;
  offerIdentifier: string;
  /** ERC-1155 fill quantity. Omit (or "1") for a single unit / ERC-721. */
  quantity?: string;
}

/**
 * The total ERC-20 amount the marketplace contract charges to fill `quantity`
 * units of an order — the single source of truth for checkout maths.
 *
 * `order.consideration.startAmount` is the price PER edition: the listing form
 * labels the field "Price per edition", and `fulfill_order` charges
 * price × quantity for ERC-1155. ERC-721 always fills exactly one item, so the
 * consideration is the whole price.
 */
export function orderTotal(order: ApiOrder, quantity: number): bigint {
  const perUnit = BigInt(order.consideration.startAmount);
  const isERC1155 = order.offer.itemType === "ERC1155";
  return isERC1155 ? perUnit * BigInt(quantity) : perUnit;
}
