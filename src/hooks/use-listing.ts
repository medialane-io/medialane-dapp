"use client"

import { useContract, useNetwork } from "@starknet-react/core";
import { useQuery } from "@tanstack/react-query";
import { Abi } from "starknet";
import { IPMarketplaceABI } from "@/abis/ip_market";
import { useMarketplaceListings, findListingForToken, MarketplaceOrder } from "@/hooks/use-marketplace-events";
import { SUPPORTED_TOKENS } from "@/lib/constants";
import { normalizeAddress, formatPrice } from "@/lib/utils";

// Find currency symbol from address
const getCurrencySymbol = (tokenAddress: string): { symbol: string; decimals: number } => {
    const normalized = normalizeAddress(tokenAddress).toLowerCase();
    for (const token of SUPPORTED_TOKENS) {
        const tokenNormalized = normalizeAddress(token.address).toLowerCase();
        if (tokenNormalized === normalized) {
            return { symbol: token.symbol, decimals: token.decimals };
        }
    }
    return { symbol: "TOKEN", decimals: 18 };
};

export function useListing(assetContract: string, tokenId: string) {
    const { listings, isLoading: eventsLoading } = useMarketplaceListings();

    const { contract } = useContract({
        address: process.env.NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS as `0x${string}`,
        abi: IPMarketplaceABI as Abi,
    });

    const query = useQuery({
        queryKey: ['listing', assetContract, tokenId, listings.length],
        queryFn: async (): Promise<(MarketplaceOrder & { formattedPrice: string; currencySymbol: string }) | null> => {
            if (!assetContract || !tokenId) return null;

            // Find matching listing from event-based scan
            const matchingOrder = findListingForToken(listings, assetContract, tokenId);
            if (!matchingOrder) return null;

            // Parse the consideration (payment) details
            const { symbol, decimals } = getCurrencySymbol(matchingOrder.considerationToken);
            const formattedPrice = formatPrice(matchingOrder.considerationAmount, decimals);

            return {
                ...matchingOrder,
                formattedPrice,
                currencySymbol: symbol,
            };
        },
        enabled: !eventsLoading && !!assetContract && !!tokenId,
        refetchInterval: 30000, // Refetch every 30s
    });

    return {
        ...query,
        isLoading: eventsLoading || query.isLoading
    };
}
