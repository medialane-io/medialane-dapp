"use client";

import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useMarketplaceListings } from "@/hooks/use-marketplace-events";
import { useMarketplace } from "@/hooks/use-marketplace";
import { usePortfolio } from "@/hooks/use-portfolio";
import { normalizeStarknetAddress, cn } from "@/lib/utils";
import { PortfolioOrderItem } from "./portfolio-order-item";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Inbox, Gavel, History, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PortfolioOrderListProps {
    searchQuery?: string;
    mode: "offers-made" | "offers-received" | "bid-history";
}

export function PortfolioOrderList({ searchQuery = "", mode }: PortfolioOrderListProps) {
    const { address } = useAccount();
    const { listings, allOrders, isLoading, refetch } = useMarketplaceListings();
    const { cancelOrder } = useMarketplace();
    const { tokens } = usePortfolio();

    // Flatten user tokens for easy lookup (copied from PortfolioListings)
    const ownedTokenSet = useMemo(() => {
        const set = new Set<string>();
        Object.keys(tokens).forEach(collectionId => {
            tokens[collectionId].forEach(token => {
                const normalizedAddr = normalizeStarknetAddress(collectionId).toLowerCase();
                set.add(`${normalizedAddr}-${token.token_id}`);
            });
        });
        return set;
    }, [tokens]);

    // Fast lookup for owned collections (used for wildcard collection offers)
    const ownedCollections = useMemo(() => {
        const set = new Set<string>();
        Object.keys(tokens).forEach(collectionId => {
            if (tokens[collectionId] && tokens[collectionId].length > 0) {
                set.add(normalizeStarknetAddress(collectionId).toLowerCase());
            }
        });
        return set;
    }, [tokens]);

    const expiringOffers = useMemo(() => {
        if (!address || mode !== "offers-made") return [];
        const now = Math.floor(Date.now() / 1000);
        const normalizedUser = normalizeStarknetAddress(address).toLowerCase();
        return allOrders.filter(o =>
            normalizeStarknetAddress(o.offerer).toLowerCase() === normalizedUser &&
            o.offerType === "ERC20" &&
            o.status === "active" &&
            o.endTime > now &&
            o.endTime - now < 86400
        );
    }, [allOrders, address, mode]);

    const filteredBids = useMemo(() => {
        if (!address || (!listings && !allOrders)) return [];

        const normalizedUser = normalizeStarknetAddress(address).toLowerCase();
        const sourceOrders = mode === "bid-history" ? allOrders : listings;

        return sourceOrders.filter(listing => {
            const normalizedOfferer = normalizeStarknetAddress(listing.offerer).toLowerCase();
            const isUserOfferer = normalizedOfferer === normalizedUser;
            const isCurrencyOffer = listing.offerType === "ERC20" || listing.offerType === "Native";

            const targetCollection = normalizeStarknetAddress(listing.considerationToken).toLowerCase();
            const isCollectionOffer = listing.considerationIdentifier === "0";

            const isNFTOfferReceived = (listing.considerationType === "ERC721" || listing.considerationType === "ERC1155") &&
                (
                    (isCollectionOffer && ownedCollections.has(targetCollection)) ||
                    (!isCollectionOffer && ownedTokenSet.has(`${targetCollection}-${listing.considerationIdentifier}`))
                );

            if (mode === "offers-made") {
                if (!isUserOfferer || !isCurrencyOffer) return false;
            } else if (mode === "offers-received") {
                if (!isNFTOfferReceived || isUserOfferer) return false;
            } else if (mode === "bid-history") {
                if (!isUserOfferer || !isCurrencyOffer) return false;
            }

            if (!searchQuery) return true;

            const query = searchQuery.toLowerCase();
            const matchesSearch =
                listing.offerToken.toLowerCase().includes(query) ||
                listing.offerIdentifier.includes(query) ||
                listing.orderHash.toLowerCase().includes(query);

            return matchesSearch;
        });
    }, [listings, allOrders, address, searchQuery, mode, ownedTokenSet]);

    const handleCancel = async (orderHash: string) => {
        try {
            await cancelOrder(orderHash);
            refetch();
        } catch (error) {
            console.error("Failed to cancel order:", error);
        }
    };

    const getEmptyState = () => {
        const icon = mode === "offers-received"
            ? <Inbox className="h-8 w-8 text-m3-primary" /> :
            mode === "offers-made"
                ? <Gavel className="h-8 w-8 text-m3-tertiary" /> :
                <History className="h-8 w-8 text-m3-secondary" />;

        const title = mode === "offers-received" ? "No offers received" :
            mode === "offers-made" ? "No offers made" :
                "No bid history found";

        const description = searchQuery ? "Try adjusting your search query." :
            mode === "offers-received" ? "You haven't received any offers on your assets yet." :
                mode === "offers-made" ? "You haven't made any buy offers yet." :
                    "Your historical bids will appear here.";

        const highlightColor = mode === "offers-received" ? "m3-primary" :
            mode === "offers-made" ? "m3-tertiary" : "m3-secondary";

        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-m3-outline-variant/10 rounded-3xl bg-m3-surface-container-low shadow-m3-1">
                <div className={cn(
                    "p-5 rounded-full flex items-center justify-center mb-2 ring-1",
                    mode === "offers-received" ? "bg-m3-primary/10 ring-m3-primary/20" :
                        mode === "offers-made" ? "bg-m3-tertiary/10 ring-m3-tertiary/20" :
                            "bg-m3-secondary/10 ring-m3-secondary/20"
                )}>
                    {icon}
                </div>
                <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-m3-on-surface">{title}</h3>
                    <p className="text-m3-on-surface-variant max-w-sm text-sm px-4 font-medium">
                        {description}
                    </p>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <PortfolioOrderSkeleton />;
    }

    if (filteredBids.length === 0) {
        return getEmptyState();
    }

    return (
        <div className="space-y-4">
            {mode === "offers-made" && expiringOffers.length > 0 && (
                <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-600">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                        {expiringOffers.length} offer{expiringOffers.length > 1 ? "s" : ""} expiring in less than 24 hours.
                    </AlertDescription>
                </Alert>
            )}

            {/* Table Header - Desktop Only */}
            <div className={cn(
                "hidden md:grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_auto] gap-4 px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-b border-m3-outline-variant/10",
                mode === 'offers-received' ? 'text-m3-primary' : mode === 'offers-made' ? 'text-m3-tertiary' : 'text-m3-secondary'
            )}>
                <div>Item</div>
                <div>Type</div>
                <div>Price</div>
                <div>Time</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredBids.map((bid) => (
                    <PortfolioOrderItem
                        key={bid.orderHash}
                        listing={bid}
                        onCancel={handleCancel}
                    />
                ))}
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-border/20 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                <p>Showing {filteredBids.length} {mode.replace('-', ' ')} items</p>
                <button
                    onClick={() => refetch()}
                    className={`hover:text-${mode === 'offers-received' ? 'neon-cyan' : mode === 'offers-made' ? 'outrun-magenta' : 'outrun-yellow'} transition-colors flex items-center gap-1.5 group`}
                >
                    <Loader2 className={`h-3 w-3 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    Refresh List
                </button>
            </div>
        </div>
    );
}

function PortfolioOrderSkeleton() {
    return (
        <div className="space-y-4">
            <div className="hidden md:grid grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_auto] gap-4 px-4 py-2">
                {Array(6).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-16" />
                ))}
            </div>
            <div className="space-y-3">
                {Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-20 w-full rounded-xl border border-border/40 bg-card/5 animate-pulse" />
                ))}
            </div>
        </div>
    );
}
