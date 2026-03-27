"use client"

import { useState, useEffect, useCallback, useMemo } from "react";
import { RpcProvider, hash, num, Contract, shortString } from "starknet";
import { MEDIALANE_CONTRACT_ADDRESS, START_BLOCK } from "@/lib/constants";
import { normalizeAddress } from "@/lib/utils";
import { IPMarketplaceABI } from "@/abis/ip_market";

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL;

// Compute selectors for marketplace events
const ORDER_CREATED_SELECTOR = hash.getSelectorFromName("OrderCreated");
const ORDER_FULFILLED_SELECTOR = hash.getSelectorFromName("OrderFulfilled");
const ORDER_CANCELLED_SELECTOR = hash.getSelectorFromName("OrderCancelled");

export interface MarketplaceOrder {
    orderHash: string;
    offerer: string;
    offerToken: string;
    offerIdentifier: string;
    offerAmount: string;
    offerType: string;
    considerationToken: string;
    considerationIdentifier: string;
    considerationAmount: string;
    considerationType: string;
    startTime: number;
    endTime: number;
    blockNumber?: number;
    transactionHash?: string;
    status: "active" | "fulfilled" | "cancelled";
}

let globalListingsPromise: Promise<{ listings: MarketplaceOrder[], allOrders: MarketplaceOrder[] }> | null = null;
let globalLastFetchTime = 0;
let globalCachedListings: MarketplaceOrder[] | null = null;
let globalCachedAllOrders: MarketplaceOrder[] | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds

/**
 * Hook to scan marketplace contract events and derive active listings.
 * Fetches OrderCreated, OrderFulfilled, and OrderCancelled events,
 * then computes the set of currently active orders.
 */
export function useMarketplaceListings() {
    const [listings, setListings] = useState<MarketplaceOrder[]>(globalCachedListings || []);
    const [allOrders, setAllOrders] = useState<MarketplaceOrder[]>(globalCachedAllOrders || []);
    const [isLoading, setIsLoading] = useState(!globalCachedListings);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = useCallback(async (force = false) => {
        if (!RPC_URL || !MEDIALANE_CONTRACT_ADDRESS) {
            return;
        }

        const now = Date.now();
        if (!force && globalCachedListings && (now - globalLastFetchTime < CACHE_TTL_MS)) {
            setListings(globalCachedListings);
            setAllOrders(globalCachedAllOrders!);
            setIsLoading(false);
            return;
        }

        if (globalListingsPromise && !force) {
            setIsLoading(true);
            try {
                const result = await globalListingsPromise;
                setListings(result.listings);
                setAllOrders(result.allOrders);
            } catch (err: any) {
                setError(err.message || "Failed to fetch marketplace events");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        setIsLoading(true);
        setError(null);

        globalListingsPromise = (async () => {
            const provider = new RpcProvider({ nodeUrl: RPC_URL });
            const contractAddress = normalizeAddress(MEDIALANE_CONTRACT_ADDRESS);

            // Fetch all marketplace events in one call (created + fulfilled + cancelled)
            const allEvents: any[] = [];
            let continuationToken: string | undefined = undefined;
            let page = 0;
            const MAX_PAGES = 50;

            do {
                const response = await provider.getEvents({
                    address: contractAddress,
                    from_block: { block_number: START_BLOCK },
                    to_block: "latest",
                    keys: [[
                        ORDER_CREATED_SELECTOR,
                        ORDER_FULFILLED_SELECTOR,
                        ORDER_CANCELLED_SELECTOR,
                    ]],
                    chunk_size: 500,
                    continuation_token: continuationToken,
                });

                if (response.events) {
                    allEvents.push(...response.events);
                }

                continuationToken = response.continuation_token;
                page++;

                // Add delay to prevent rate limit on Alchemy for starknet_getEvents
                if (continuationToken && page < MAX_PAGES) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            } while (continuationToken && page < MAX_PAGES);

            // Process events: build order map
            const orderMap = new Map<string, MarketplaceOrder>();
            const fulfilledSet = new Set<string>();
            const cancelledSet = new Set<string>();

            // Collect active hashes to fetch details
            const activeHashesToFetch: { hash: string; offerer: string; event: any }[] = [];

            for (const event of allEvents) {
                const keys = (event.keys || []).map((k: string) => num.toHex(k));
                const selector = keys[0];

                if (selector === ORDER_CREATED_SELECTOR) {
                    const orderHash = keys[1];
                    const offerer = keys[2];
                    activeHashesToFetch.push({ hash: orderHash, offerer, event });
                } else if (selector === ORDER_FULFILLED_SELECTOR) {
                    const orderHash = keys[1];
                    fulfilledSet.add(orderHash);
                } else if (selector === ORDER_CANCELLED_SELECTOR) {
                    const orderHash = keys[1];
                    cancelledSet.add(orderHash);
                }
            }

            // Fetch details for each order hash
            // Rate-limiting parallel calls for Alchemy Free Tier (~330 CU/sec, starknet_call is ~15 CU)
            const contract = new Contract({ abi: IPMarketplaceABI as any, address: contractAddress, providerOrAccount: provider });

            const orderDetailsResults: any[] = [];
            const BATCH_SIZE = 10;
            const BATCH_DELAY_MS = 500;

            for (let i = 0; i < activeHashesToFetch.length; i += BATCH_SIZE) {
                const batch = activeHashesToFetch.slice(i, i + BATCH_SIZE);

                const batchResults = await Promise.all(
                    batch.map(async ({ hash: orderHash, offerer, event }) => {
                        try {
                            const details = await contract.get_order_details(orderHash);

                            // Parse status from enum 
                            // OrderStatus variants: None, Created, Filled, Cancelled
                            const statusKey = Object.keys(details.order_status)[0];
                            let status: "active" | "fulfilled" | "cancelled" = "active";
                            if (statusKey === "Filled") status = "fulfilled";
                            if (statusKey === "Cancelled") status = "cancelled";

                            return {
                                orderHash,
                                offerer: normalizeAddress(details.offerer.toString()),
                                offerToken: normalizeAddress(details.offer.token.toString()),
                                offerIdentifier: details.offer.identifier_or_criteria.toString(),
                                offerAmount: details.offer.start_amount.toString(),
                                offerType: shortString.decodeShortString(num.toHex(details.offer.item_type)),
                                considerationToken: normalizeAddress(details.consideration.token.toString()),
                                considerationIdentifier: details.consideration.identifier_or_criteria.toString(),
                                considerationAmount: details.consideration.start_amount.toString(),
                                considerationType: shortString.decodeShortString(num.toHex(details.consideration.item_type)),
                                startTime: Number(details.start_time),
                                endTime: Number(details.end_time),
                                blockNumber: event.block_number,
                                transactionHash: event.transaction_hash,
                                status,
                            } as MarketplaceOrder;
                        } catch (err) {
                            console.error(`Failed to fetch details for order ${orderHash}:`, err);
                            return null;
                        }
                    })
                );

                orderDetailsResults.push(...batchResults);

                // Add delay between batches if there are more items to process
                if (i + BATCH_SIZE < activeHashesToFetch.length) {
                    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
                }
            }

            for (const order of orderDetailsResults) {
                if (order) {
                    orderMap.set(order.orderHash, order);
                }
            }

            // Mark fulfilled and cancelled orders from events (secondary verification)
            for (const hash of fulfilledSet) {
                const order = orderMap.get(hash);
                if (order) order.status = "fulfilled";
            }
            for (const hash of cancelledSet) {
                const order = orderMap.get(hash);
                if (order) order.status = "cancelled";
            }

            const now = Math.floor(Date.now() / 1000);
            const orders = Array.from(orderMap.values());

            // All orders (for stats)
            setAllOrders(orders);

            // Active listings: status === active AND not expired
            const activeListings = orders.filter(
                (o) => o.status === "active" && o.endTime > now
            );

            return { listings: activeListings, allOrders: orders };
        })();

        try {
            const result = await globalListingsPromise;
            globalCachedListings = result.listings;
            globalCachedAllOrders = result.allOrders;
            globalLastFetchTime = Date.now();
            setListings(result.listings);
            setAllOrders(result.allOrders);
        } catch (err: any) {
            console.error("[Marketplace Events] Fetch error:", err);
            setError(err.message || "Failed to fetch marketplace events");
        } finally {
            globalListingsPromise = null;
            setIsLoading(false);
        }
    }, [setListings, setAllOrders, setIsLoading, setError]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        listings,
        allOrders,
        isLoading,
        error,
        refetch: fetchEvents,
        activeCount: listings.length,
        totalVolume: allOrders.filter((o) => o.status === "fulfilled").length,
    };
}

/**
 * Find a listing for a specific NFT token.
 * Returns the most recent active listing matching the given contract + tokenId.
 */
export function findListingForToken(
    listings: MarketplaceOrder[],
    nftContract: string,
    tokenId: string
): MarketplaceOrder | null {
    const normalizedContract = normalizeAddress(nftContract).toLowerCase();
    const targetTokenId = BigInt(tokenId);

    // Find listings where offer is an ERC721 matching our token
    const matching = listings.filter((listing) => {
        try {
            const listingOfferToken = normalizeAddress(listing.offerToken).toLowerCase();
            const listingIdentifier = BigInt(listing.offerIdentifier);

            const isMatch = listingOfferToken === normalizedContract && listingIdentifier === targetTokenId;
            return isMatch;
        } catch (err) {
            console.error("[findListingForToken] Error comparing listing:", err);
            return false;
        }
    });

    if (matching.length === 0) return null;

    // Return the most recent one (highest block number)
    return matching.sort((a, b) => (b.blockNumber || 0) - (a.blockNumber || 0))[0];
}
