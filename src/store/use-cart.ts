import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useMemo, useCallback } from "react";
import { useAccount } from "@starknet-react/core";
import { MarketplaceOrder } from "@/hooks/use-marketplace-events";
import { Asset } from "@/types/asset";
import { RecentAsset } from "@/hooks/use-recent-assets";
import { getCurrency, formatPrice } from "@/lib/utils";
import { useMarketplace } from "@/hooks/use-marketplace";
import { isOwnListing } from "@/lib/ownership";

export interface CartItem {
    listing: MarketplaceOrder;
    asset: Asset | RecentAsset;
    /** Pre-resolved at addItem time so the drawer never needs `as any` */
    collectionName: string;
}

interface CartStore {
    items: CartItem[];
    isOpen: boolean;

    addItem: (listing: MarketplaceOrder, asset: Asset | RecentAsset, connectedAddress?: string) => void;
    removeItem: (orderHash: string) => void;
    clearCart: () => void;

    setIsOpen: (isOpen: boolean) => void;
    toggleCart: () => void;
}

/**
 * Resolve the collection display name from an asset at write-time,
 * handling the string / object / undefined ambiguity once.
 */
function resolveCollectionName(asset: Asset | RecentAsset): string {
    // RecentAsset has `collectionName` directly
    if ("collectionName" in asset && asset.collectionName) {
        return asset.collectionName as string;
    }
    // Asset has `collection` which is a string
    if ("collection" in asset && asset.collection) {
        if (typeof asset.collection === "string") return asset.collection;
        if (typeof asset.collection === "object" && (asset.collection as any).name) {
            return (asset.collection as any).name;
        }
    }
    return "IP Asset";
}

export const useCart = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            isOpen: false,

            addItem: (listing, asset, connectedAddress) =>
                set((state) => {
                    // Reject duplicates
                    if (state.items.some((i) => i.listing.orderHash === listing.orderHash)) {
                        return state;
                    }
                    // Reject own assets
                    if (isOwnListing(listing.offerer, connectedAddress)) {
                        return state;
                    }
                    const collectionName = resolveCollectionName(asset);
                    return { items: [...state.items, { listing, asset, collectionName }] };
                }),

            removeItem: (orderHash) =>
                set((state) => ({
                    items: state.items.filter((i) => i.listing.orderHash !== orderHash),
                })),

            clearCart: () => set({ items: [] }),

            setIsOpen: (isOpen) => set({ isOpen }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
        }),
        {
            name: "medialane-cart-storage",
            partialize: (state) => ({ items: state.items }),
        }
    )
);

// ---------------------------------------------------------------------------
// Derived selectors -- usable by any consumer (drawer, header badge, etc.)
// ---------------------------------------------------------------------------

export interface CartTotal {
    symbol: string;
    formatted: string;
}

/** Derives per-currency totals from cart items. */
export function useCartTotals(): CartTotal[] {
    const items = useCart((s) => s.items);

    return useMemo(() => {
        const map = new Map<string, { amount: bigint; decimals: number }>();
        items.forEach((item) => {
            const currency = getCurrency(item.listing.considerationToken);
            const amount = BigInt(item.listing.considerationAmount);
            const existing = map.get(currency.symbol);
            map.set(currency.symbol, {
                amount: (existing?.amount ?? 0n) + amount,
                decimals: currency.decimals,
            });
        });
        return Array.from(map.entries()).map(([symbol, data]) => ({
            symbol,
            formatted: formatPrice(data.amount.toString(), data.decimals),
        }));
    }, [items]);
}

// ---------------------------------------------------------------------------
// Checkout orchestration hook
// ---------------------------------------------------------------------------

export function useCheckout() {
    const { items, clearCart, setIsOpen, removeItem } = useCart();
    const { checkoutCart, isProcessing } = useMarketplace();
    const { address } = useAccount();

    const checkout = useCallback(async () => {
        // Filter out any own assets (defensive — handles stale persisted data)
        const safeItems = items.filter(
            (i) => !isOwnListing(i.listing?.offerer, address)
        );

        // Remove own-asset items from the cart
        const removedItems = items.filter(
            (i) => isOwnListing(i.listing?.offerer, address)
        );
        removedItems.forEach((i) => removeItem(i.listing?.orderHash));

        if (safeItems.length === 0) {
            return;
        }

        const orders = safeItems.map((i) => i.listing);
        try {
            const txHash = await checkoutCart(orders);
            if (txHash) {
                clearCart();
                setIsOpen(false);
            }
            return txHash;
        } catch (e) {
            console.error("checkoutCart THREW an error:", e);
        }
    }, [items, address, checkoutCart, clearCart, setIsOpen, removeItem]);

    return { checkout, isProcessing };
}
