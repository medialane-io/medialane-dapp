"use client";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useAccount } from "@starknet-react/core";
import { Alert } from "@/components/ui/alert";
import { CollectionValidator } from "@/lib/types";
import { CollectionStats } from "@/components/collections/collections-stats";
import Link from "next/link";
import { ArrowRight, Grid3X3, Layers, Activity, Loader2, Compass } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Shelf } from "@/components/ui/shelf";
import { CollectionCard } from "@/components/collection-card";
import { AssetCard } from "@/components/asset-card";
import { Button } from "@/components/ui/button";

export default function PortfolioClientPage() {
    const { address } = useAccount();
    const { collections, stats, loading, error, tokens } = usePortfolio();

    // Validate collections
    const validCollections = collections.filter(collection => {
        return CollectionValidator.isValid(collection);
    });

    // Flatten all minted tokens for the user
    const allUserAssets = Object.entries(tokens).flatMap(([colId, collectionTokens]) => {
        const collection = validCollections.find(c => String(c.id) === colId);
        return collectionTokens.map(t => ({
            id: `${t.collection_id}-${t.token_id}`,
            tokenId: t.token_id,
            nftAddress: collection?.nftAddress || t.collection_id,
            collectionAddress: collection?.nftAddress || t.collection_id,
            collectionName: collection?.name || "Unknown Collection",
            owner: t.owner,
            name: t.name,
            image: t.image,
            description: t.description,
            type: collection?.type
        }));
    });

    return (
        <div className="min-h-screen">
            <main className="">
                <div className="layout-px">
                    <PageHeader
                        title="IP Portfolio"
                        description={address
                            ? "Showcase and manage your digital assets and collections"
                            : "Connect your wallet to open your onchain portfolio."
                        }
                    />

                    {/* Show message when no wallet is connected */}
                    {!address && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">Please connect your wallet to view your portfolio</p>
                        </div>
                    )}

                    {/* Show content when wallet is connected */}
                    {address && (
                        <Suspense fallback={<PortfolioSkeleton />}>
                            <div className="space-y-12 w-full">
                                {loading ? (
                                    <div className="space-y-8">
                                        <div className="flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in duration-500">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-r from-outrun-magenta/30 via-outrun-cyan/30 to-outrun-orange/30 blur-xl rounded-full animate-pulse" />
                                                <Loader2 className="h-8 w-8 animate-spin text-outrun-cyan relative z-10" />
                                            </div>
                                            <div className="text-center space-y-1">
                                                <p className="text-lg font-medium text-foreground">Loading Portfolio</p>
                                                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                                    This dapp is permissionless and is directly reading your onchain data from Starknet.
                                                </p>
                                            </div>
                                        </div>
                                        <StatsSkeleton />
                                    </div>
                                ) : (
                                    <CollectionStats
                                        totalCollections={validCollections.length}
                                        totalAssets={stats.totalNFTs}
                                        totalValue={stats.totalValue}
                                        topCollection={stats.topCollection}
                                        collections={validCollections}
                                        tokens={tokens}
                                        notInLayoutPx={true}
                                    />
                                )}

                                {error && <Alert variant="destructive">{error}</Alert>}

                                {/* Streaming Layout Shelves */}
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center p-16 text-center opacity-80 animate-in fade-in duration-m3-long ease-m3-standard">
                                        <Loader2 className="h-10 w-10 animate-spin text-m3-primary mb-6 mx-auto" />
                                        <h3 className="text-xl font-semibold text-foreground mb-2">Retrieving Onchain Assets</h3>
                                        <p className="text-muted-foreground max-w-md mx-auto">Please wait while we sync your portfolio from the Starknet blockchain.</p>
                                    </div>
                                ) : validCollections.length === 0 && allUserAssets.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-muted/5 rounded-2xl border border-border/10">
                                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                                            <Compass className="h-8 w-8 text-muted-foreground/50" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2">No Assets Found</h3>
                                        <p className="max-w-md mx-auto mb-6">Your onchain portfolio is currently empty. Explore the marketplace or launchpad to acquire assets.</p>
                                        <div className="flex gap-4">
                                            <Link href="/marketplace">
                                                <Button variant="default">Explore Marketplace</Button>
                                            </Link>
                                            <Link href="/launchpad">
                                                <Button variant="outline">Browse Launchpad</Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-16 pb-16">
                                        {validCollections.length > 0 && (
                                            <Shelf title="My Collections" href="/portfolio/collections" notInLayoutPx={true}>
                                                {validCollections.map((collection, idx) => (
                                                    <CollectionCard key={collection.id} collection={collection} index={idx} />
                                                ))}
                                            </Shelf>
                                        )}

                                        {allUserAssets.length > 0 && (
                                            <Shelf title="My Assets" href="/portfolio/assets" notInLayoutPx={true}>
                                                {allUserAssets.map(asset => (
                                                    <AssetCard key={asset.id} asset={asset} />
                                                ))}
                                            </Shelf>
                                        )}

                                        {/* Activities Navigation Footer row */}
                                        <div className="pt-8 border-t border-border/10 flex justify-between items-center bg-m3-surface-container-low rounded-2xl p-6">
                                            <div>
                                                <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                                                    <Activity className="h-5 w-5 text-outrun-orange" />
                                                    Onchain Activity
                                                </h3>
                                                <p className="text-sm text-muted-foreground mt-1">Review your recent transactions across the protocol.</p>
                                            </div>
                                            <Link href="/portfolio/activities">
                                                <Button variant="outline" className="gap-2 bg-transparent hover:bg-muted/50 rounded-full border border-border/20 px-6">
                                                    View Activity Feed <ArrowRight className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Suspense>
                    )}
                </div>
            </main>
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {Array(4)
                .fill(null)
                .map((_, i) => (
                    <div key={i} className="rounded-xl border glass text-card-foreground shadow space-y-2 p-6">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                            <Skeleton className="h-8 w-16" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                ))}
        </div>
    );
}

function PortfolioSkeleton() {
    return (
        <div className="space-y-8 w-full mt-6">
            <StatsSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full rounded-2xl" />
                <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
        </div>
    );
}
