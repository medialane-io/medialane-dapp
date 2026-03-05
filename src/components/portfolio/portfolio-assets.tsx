"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, Sparkles, MoreHorizontal, History, ShieldCheck, Flag, Send, Eye } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { TokenData } from "@/hooks/use-portfolio";
import AssetCardGlobal from "@/components/asset-card";
import { useMarketplaceListings, findListingForToken } from "@/hooks/use-marketplace-events";

interface PortfolioAssetsProps {
    tokens: Record<string, TokenData[]>;
    loading: boolean;
    collections?: any[]; // Optional to resolve collection names if needed
}

export function PortfolioAssets({ tokens, loading, collections = [] }: PortfolioAssetsProps) {
    const [visibleCount, setVisibleCount] = useState(12);

    // Fetch active marketplace listings to display status/price
    const { listings } = useMarketplaceListings();

    // Flatten tokens from all collections
    const allAssets = Object.values(tokens).flat();

    // Pagination
    const visibleAssets = allAssets.slice(0, visibleCount);
    const hasMore = allAssets.length > visibleCount;

    // Reset pagination when tokens change (e.g. external filter)
    useEffect(() => {
        setVisibleCount(12);
    }, [tokens]);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 12);
    };

    if (loading && allAssets.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-[300px]" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                    {Array(8).fill(0).map((_, i) => (
                        <AssetCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {allAssets.length === 0 ? (
                <EmptyState
                    title="No Assets Found"
                    description="No assets found to display."
                />
            ) : (
                <div className="space-y-8 max-w-[100vw] overflow-x-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
                        {visibleAssets.map((asset) => {
                            // Try to match collection to get NFT address for link
                            const collection = collections.find(c => c.id.toString() === asset.collection_id);
                            // If we have an nftAddress, use it, otherwise fallback to collection_id-token_id (might not work if slug expects address)
                            // The slug format in app/creator/[slug] seems to accept 'nftAddress-tokenId' or just 'nftAddress' for collection?
                            // Actually the asset page is usually /collections/[nftAddress]/[tokenId] or similar.
                            // Let's check where the asset link should go. Usually /assets/[nftAddress]/[tokenId] or similar.
                            // Based on previous chats, there is an asset single page.
                            // Let's assume /collections/[nftAddress]/[tokenId] or /asset/[nftAddress]-[tokenId]
                            // Looking at file list: src/app/create/remix/[slug] exists.
                            // src/app/portfolio/asset/[slug] ? No.
                            // src/app/collections/[address]/[tokenId] is a common pattern.
                            // Let's stick to a safe link or check structure if possible.
                            // The remix page links to router.push(`/create/remix/${nftAddress}-${tokenId}`)
                            // Let's use a generic link structure for now: /collections/[nftAddress]/[tokenId] if we have address.
                            // Or /asset/[nftAddress]/[tokenId]

                            // The user said: "The My Assets tab showing the user assets...".

                            const nftAddress = collection?.nftAddress || asset.collection_id;
                            const activeListing = findListingForToken(listings, nftAddress, asset.token_id);

                            return (
                                <AssetCardGlobal
                                    key={`${asset.collection_id}-${asset.token_id}`}
                                    listing={activeListing || undefined}
                                    asset={{
                                        id: `${nftAddress}-${asset.token_id}`,
                                        name: asset.name || `Token #${asset.token_id}`,
                                        description: asset.description || "",
                                        image: asset.image || "/placeholder.svg",
                                        collection: nftAddress,
                                        creator: "",
                                        owner: asset.owner,
                                        type: "NFT",
                                        licenseType: "all-rights-reserved",
                                    }}
                                />
                            );
                        })}
                    </div>

                    {hasMore && (
                        <div className="flex justify-center pt-8">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleLoadMore}
                                className="min-w-[150px] border-outrun-cyan/30 text-outrun-cyan hover:bg-outrun-cyan/10 hover:border-neon-cyan/50 hover:shadow-glow-sm hover:shadow-neon-cyan/30 transition-all active:scale-[0.98]"
                            >
                                Load More Assets
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}



function AssetCardSkeleton() {
    return (
        <div className="rounded-lg border overflow-hidden">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="pt-2 flex gap-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-outrun-cyan/30 rounded-3xl bg-card/5 backdrop-blur-sm shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]">
            <div className="p-4 rounded-full bg-gradient-to-br from-outrun-cyan/20 to-transparent flex items-center justify-center mb-6 shadow-glow-sm shadow-neon-cyan/20 ring-1 ring-outrun-cyan/30">
                <Box className="h-8 w-8 text-outrun-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">{title}</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6 px-4">{description}</p>
        </div>
    );
}
