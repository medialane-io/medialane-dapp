"use client"

import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useMarketplaceListings, MarketplaceOrder } from "@/hooks/use-marketplace-events";
import { normalizeAddress, formatPrice } from "@/lib/utils";
import { SUPPORTED_TOKENS } from "@/lib/constants";

// ─── Helpers (mirrors use-listing.ts) ────────────────────────────────────────

const getCurrencyInfo = (tokenAddress: string): { symbol: string; decimals: number } => {
    const normalized = normalizeAddress(tokenAddress).toLowerCase();
    for (const token of SUPPORTED_TOKENS) {
        if (normalizeAddress(token.address).toLowerCase() === normalized) {
            return { symbol: token.symbol, decimals: token.decimals };
        }
    }
    return { symbol: "TOKEN", decimals: 18 };
};

const formatTimeRemaining = (endTime: number): string => {
    const remaining = endTime - Math.floor(Date.now() / 1000);
    if (remaining <= 0) return "Expired";
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const mins = Math.floor((remaining % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
};

// ─── Public types ─────────────────────────────────────────────────────────────

export interface FormattedOffer extends MarketplaceOrder {
    formattedPrice: string;
    currencySymbol: string;
    timeRemaining: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns all active bids on a specific asset and, separately, the connected
 * user's own active bid (if any). Consumes the already-fetched allOrders from
 * useMarketplaceListings so no extra RPC calls are made.
 *
 * A "bid" is an order where:
 *   offerType       === "ERC20"   (bidder offers currency)
 *   considerationType === "ERC721" (bidder wants this specific NFT)
 *   considerationToken === nftAddress
 *   considerationIdentifier === tokenId
 *   status === "active" AND endTime > now
 */
export function useAssetOffers(nftAddress?: string, tokenId?: string) {
    const { address } = useAccount();
    const { allOrders, isLoading } = useMarketplaceListings();

    const allOffers = useMemo((): FormattedOffer[] => {
        if (!nftAddress || !tokenId || !allOrders.length) return [];

        const now = Math.floor(Date.now() / 1000);
        const normalizedNft = normalizeAddress(nftAddress).toLowerCase();

        let targetId: bigint;
        try { targetId = BigInt(tokenId); } catch { return []; }

        return allOrders
            .filter((order) => {
                if (order.status !== "active") return false;
                if (order.endTime <= now) return false;
                if (order.offerType !== "ERC20") return false;
                if (order.considerationType !== "ERC721") return false;
                try {
                    const cToken = normalizeAddress(order.considerationToken).toLowerCase();
                    const cId = BigInt(order.considerationIdentifier);
                    return cToken === normalizedNft && cId === targetId;
                } catch {
                    return false;
                }
            })
            .map((order): FormattedOffer => {
                const { symbol, decimals } = getCurrencyInfo(order.offerToken);
                return {
                    ...order,
                    formattedPrice: formatPrice(order.offerAmount, decimals),
                    currencySymbol: symbol,
                    timeRemaining: formatTimeRemaining(order.endTime),
                };
            })
            // Highest bid first
            .sort((a, b) => {
                try {
                    const diff = BigInt(b.offerAmount) - BigInt(a.offerAmount);
                    return diff > 0n ? 1 : diff < 0n ? -1 : 0;
                } catch {
                    return 0;
                }
            });
    }, [allOrders, nftAddress, tokenId]);

    // The connected user's own active offer (null if not connected or no offer)
    const userOffer = useMemo((): FormattedOffer | null => {
        if (!address) return null;
        const normalizedUser = normalizeAddress(address).toLowerCase();
        return (
            allOffers.find(
                (o) => normalizeAddress(o.offerer).toLowerCase() === normalizedUser
            ) ?? null
        );
    }, [allOffers, address]);

    return { allOffers, userOffer, isLoading };
}
