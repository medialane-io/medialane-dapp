"use client"

import { useMemo } from "react";
import { useMarketplaceListings } from "@/hooks/use-marketplace-events";
import { normalizeAddress, formatPrice } from "@/lib/utils";
import { SUPPORTED_TOKENS } from "@/lib/constants";

const getCurrencyInfo = (tokenAddress: string): { symbol: string; decimals: number } => {
    const normalized = normalizeAddress(tokenAddress).toLowerCase();
    for (const token of SUPPORTED_TOKENS) {
        if (normalizeAddress(token.address).toLowerCase() === normalized) {
            return { symbol: token.symbol, decimals: token.decimals };
        }
    }
    return { symbol: "TOKEN", decimals: 18 };
};

/**
 * Derives the true collection floor price from all active listings
 * for a given NFT contract address. Reuses the already-fetched allOrders
 * from useMarketplaceListings — no extra RPC calls.
 */
export function useCollectionFloor(nftAddress?: string) {
    const { allOrders } = useMarketplaceListings();

    return useMemo(() => {
        if (!nftAddress || !allOrders.length) return null;
        const now = Math.floor(Date.now() / 1000);
        const normalized = normalizeAddress(nftAddress).toLowerCase();

        const activeListings = allOrders.filter(o =>
            o.status === "active" &&
            o.endTime > now &&
            o.offerType === "ERC721" &&
            normalizeAddress(o.offerToken).toLowerCase() === normalized
        );

        if (!activeListings.length) return null;

        const min = activeListings.reduce((a, b) =>
            BigInt(a.considerationAmount) < BigInt(b.considerationAmount) ? a : b
        );

        const { symbol, decimals } = getCurrencyInfo(min.considerationToken);
        return { formattedPrice: formatPrice(min.considerationAmount, decimals), symbol };
    }, [allOrders, nftAddress]);
}
