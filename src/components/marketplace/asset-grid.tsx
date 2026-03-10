"use client"

import { useMarketplaceListings } from "@/hooks/use-marketplace-events"
import { AssetCard, AssetCardSkeleton } from "@/components/asset-card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMemo } from "react"

import { Shelf } from "@/components/ui/shelf"

export interface AssetGridProps {
    sortOrder?: "recent" | "oldest"
    searchQuery?: string
}

export function AssetGrid({ sortOrder = "recent", searchQuery = "" }: AssetGridProps) {
    const { listings, isLoading, error, refetch } = useMarketplaceListings()

    const activeListings = useMemo(() => {
        if (!listings) return [];

        // Filter for active sell listings (NFT in offer) and search query
        return listings.filter(l => {
            const matchesStatus = l.status === "active" && (l.offerType === "ERC721" || l.offerType === "ERC1155");
            if (!matchesStatus) return false;

            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const offerer = l.offerer?.toLowerCase() || "";
                const offerToken = l.offerToken?.toLowerCase() || "";
                const orderHash = l.orderHash?.toLowerCase() || "";
                return offerer.includes(query) || offerToken.includes(query) || orderHash.includes(query);
            }

            return true;
        }).sort((a, b) => {
            const timeA = a.startTime || 0
            const timeB = b.startTime || 0
            if (sortOrder === "oldest") {
                return timeA - timeB
            }
            return timeB - timeA
        });
    }, [listings, sortOrder, searchQuery]);

    if (isLoading && activeListings.length === 0) {
        return (
            <Shelf title="Recent Listings">
                {Array.from({ length: 8 }).map((_, i) => (
                    <AssetCardSkeleton key={i} />
                ))}
            </Shelf>
        )
    }

    if (error) {
        return (
            <div className="w-full">
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
                    <AlertCircle className="h-10 w-10 mb-4 text-red-500" />
                    <p>Failed to load assets from the marketplace.</p>
                    <p className="text-sm mt-2">{error}</p>
                    <Button variant="outline" onClick={() => refetch()} className="mt-4 border-foreground/10">
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                    </Button>
                </div>
            </div>
        )
    }

    if (activeListings.length === 0) {
        return (
            <div className="w-full">
                <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/5 rounded-xl border border-dashed border-border/50 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="h-8 w-8 opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Marketplace is Quiet</h3>
                    <p className="max-w-xs mx-auto">There are currently no active intellectual property assets listed for trading.</p>
                    <Button variant="outline" onClick={() => refetch()} className="mt-6 border-border hover:bg-muted">
                        <RefreshCw className="mr-2 h-4 w-4" /> Refresh Marketplace
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="pb-20">


            <Shelf title="Recent Listings">
                {activeListings.map((listing) => (
                    <AssetCard
                        key={listing.orderHash}
                        listing={listing}
                    />
                ))}
            </Shelf>
        </div>
    )
}
