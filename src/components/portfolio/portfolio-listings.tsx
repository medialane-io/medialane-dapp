"use client";

import { useMemo } from "react";
import { useAccount } from "@starknet-react/core";
import { useMarketplaceListings } from "@/hooks/use-marketplace-events";
import { ListingCard } from "./listing-card";
import { useMarketplace } from "@/hooks/use-marketplace";
import { normalizeStarknetAddress } from "@/lib/utils";
import { Tag, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";

interface PortfolioListingsProps {
    searchQuery?: string;
}

import { usePortfolio } from "@/hooks/use-portfolio";

export function PortfolioListings({ searchQuery = "" }: PortfolioListingsProps) {
    const { address } = useAccount();
    const { listings, isLoading, refetch } = useMarketplaceListings();
    const { cancelOrder } = useMarketplace();
    const { tokens } = usePortfolio();

    // Filter listings for the connected user (only active sale listings)
    const filteredListings = useMemo(() => {
        if (!address || !listings) return [];

        const normalizedUser = normalizeStarknetAddress(address).toLowerCase();

        return listings.filter(listing => {
            const normalizedOfferer = normalizeStarknetAddress(listing.offerer).toLowerCase();
            const isUserOfferer = normalizedOfferer === normalizedUser;
            const isNFTListing = listing.offerType === "ERC721" || listing.offerType === "ERC1155";

            if (!isUserOfferer || !isNFTListing) return false;

            if (!searchQuery) return true;

            const query = searchQuery.toLowerCase();
            const matchesSearch =
                listing.offerToken.toLowerCase().includes(query) ||
                listing.offerIdentifier.includes(query) ||
                listing.orderHash.toLowerCase().includes(query);

            return matchesSearch;
        });
    }, [listings, address, searchQuery]);

    const handleCancel = async (orderHash: string) => {
        try {
            await cancelOrder(orderHash);
            toast.success(`Listing cancellation initiated`);
            // Refetch events after a short delay to allow chain to update
            setTimeout(() => refetch(), 5000);
        } catch (err) {
            console.error(`Failed to cancel listing:`, err);
            toast.error(`Failed to cancel. Please try again.`);
        }
    };

    if (isLoading && filteredListings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p>Loading your listings...</p>
            </div>
        );
    }

    if (filteredListings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-m3-outline-variant/10 rounded-3xl bg-m3-surface-container-low shadow-m3-1">
                <div className="p-5 rounded-full bg-m3-primary/10 flex items-center justify-center mb-6 ring-1 ring-m3-primary/20">
                    <Tag className="h-8 w-8 text-m3-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2 text-m3-on-surface">No listings found</h3>
                <p className="text-m3-on-surface-variant mt-2 max-w-sm mb-8 px-4 font-medium">
                    {searchQuery
                        ? `No items match your search "${searchQuery}".`
                        : "You don't have any active marketplace listings yet. List an asset to see it here."}
                </p>
                {!searchQuery && (
                    <Button asChild className="px-8 h-12 text-sm font-black tracking-wide rounded-full">
                        <Link href="/portfolio/assets">
                            Go to My Assets
                        </Link>
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6">
                {filteredListings.map((listing) => (
                    <ListingCard
                        key={listing.orderHash}
                        listing={listing}
                        onCancel={handleCancel}
                    />
                ))}
            </div>

            <div className="pt-8 border-t border-border/20 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                <p>Showing {filteredListings.length} listings</p>
                <button
                    onClick={() => refetch()}
                    className="hover:text-neon-cyan transition-colors flex items-center gap-1.5 group"
                >
                    <Loader2 className={`h-3 w-3 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    Refresh Listings
                </button>
            </div>
        </div>
    );
}
