"use client"

import { PageHeader } from "@/components/page-header"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { LazyImage } from "@/components/ui/lazy-image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Shelf } from "@/components/ui/shelf"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Search,
    Box,
    Sparkles,
    RefreshCw,
    Loader2,
    AlertCircle,
    MoreHorizontal,
    History,
    ShieldCheck,
    Flag,
    Eye,
} from "lucide-react"
import { useRecentAssets, type RecentAsset } from "@/hooks/use-recent-assets"
import { useMarketplaceListings } from "@/hooks/use-marketplace-events"
import { cn } from "@/lib/utils"

import { AssetCard } from "@/components/asset-card"

export default function AssetsPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const { assets, loading, loadingMore, error, hasMore, totalCount, loadMore, refresh } = useRecentAssets(50)

    // Client-side filtering of loaded assets
    const filteredAssets = useMemo(() => {
        if (!searchQuery) return assets

        const lowerQuery = searchQuery.toLowerCase()
        return assets.filter(
            (asset) =>
                asset.name.toLowerCase().includes(lowerQuery) ||
                asset.tokenId.includes(searchQuery) ||
                asset.collectionId.includes(searchQuery)
        )
    }, [assets, searchQuery])

    // Load active marketplace listings
    const { listings } = useMarketplaceListings()

    // Create a fast map of active listings by contract + tokenId
    const activeListingsMap = useMemo(() => {
        const map = new Map<string, any>()
        if (!listings) return map

        listings.forEach(listing => {
            if (listing.status === "active" && (listing.offerType === "ERC721" || listing.offerType === "ERC1155")) {
                const key = `${listing.offerToken.toLowerCase()}-${listing.offerIdentifier}`
                map.set(key, listing)
            }
        })
        return map
    }, [listings])

    return (
        <div className="min-h-screen">
            <div className="h-12"></div>
            <main className="w-full px-6 sm:px-10 lg:px-16 mx-auto py-4">

                <PageHeader
                    variant="expressive"
                    title="Onchain Assets"
                    description="Discover and collect intellectual property assets secured on Starknet."
                    statusBadge="NFTs"
                    primaryAction={
                        <div className="relative w-full max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-m3-on-surface-variant/50" />
                            <Input
                                type="search"
                                placeholder="Search by name, ID, or collection..."
                                className="h-12 md:h-14 pl-12 bg-m3-surface-container border border-m3-outline-variant/20 focus:border-m3-primary/30 text-base transition-all rounded-full shadow-sm focus:shadow-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    }
                    utilityContent={
                        <div className="flex flex-wrap items-center gap-3">
                            {totalCount > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-m3-primary/5 border border-m3-primary/10">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-m3-primary/70">Registry Assets:</span>
                                    <span className="text-[11px] font-black text-m3-primary">{totalCount}</span>
                                </div>
                            )}

                            <div className="h-4 w-px bg-m3-outline-variant/20 mx-1 hidden lg:block" />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={refresh}
                                disabled={loading}
                                className="h-9 gap-2 rounded-full border border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors"
                            >
                                <RefreshCw className={cn("h-4 w-4 text-m3-primary", loading && !loadingMore && "animate-spin")} />
                                <span className="text-xs font-bold text-m3-on-surface-variant">Sync Protocol</span>
                            </Button>
                        </div>
                    }
                />

                {/* Assets Grid */}
                <div className="space-y-6">


                    {error && (
                        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            <p>{error}</p>
                            <Button variant="link" onClick={refresh} className="h-auto p-0 ml-2">Try Again</Button>
                        </div>
                    )}

                    {loading && !loadingMore && assets.length === 0 ? (
                        <div>
                            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                                <Loader2 className="h-10 w-10 text-outrun-cyan animate-spin" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Retrieving onchain data...</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Please wait while we fetch the latest assets directly from the blockchain. This might take a moment.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : filteredAssets.length === 0 && !loading ? (
                        <div>
                            <div className="p-8 md:p-12 text-center space-y-4">
                                <Box className="h-10 md:h-12 w-10 md:w-12 mx-auto text-muted-foreground/50" />
                                <div className="space-y-2">
                                    <p className="text-base md:text-lg font-medium">No assets found</p>
                                    <p className="text-sm text-muted-foreground">
                                        {searchQuery ? "Try a different search term" : "No assets have been minted yet"}
                                    </p>
                                </div>
                                {searchQuery && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        Clear Search
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-12 mt-12">
                                {Array.from(
                                    filteredAssets.reduce((acc, asset) => {
                                        const type = asset.ipType || "Other";
                                        if (!acc.has(type)) acc.set(type, []);
                                        acc.get(type)!.push(asset);
                                        return acc;
                                    }, new Map<string, typeof filteredAssets>())
                                ).map(([type, typeAssets]) => (
                                    <Shelf key={type} title={type === 'Other' ? 'Discover More IP' : `${type}`}>
                                        {typeAssets.map((asset) => {
                                            const key = `${asset.collectionAddress.toLowerCase()}-${asset.tokenId}`
                                            const matchedListing = activeListingsMap.get(key)
                                            return <AssetCard key={asset.id} asset={asset} listing={matchedListing} />
                                        })}
                                    </Shelf>
                                ))}
                            </div>

                            {/* Load More Pagination */}
                            {hasMore && !searchQuery && (
                                <div className="flex justify-center pt-8">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={loadMore}
                                        disabled={loadingMore}
                                        className="min-w-[200px] hover:border-outrun-cyan/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.15)] transition-all"
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin text-outrun-cyan" />
                                                Loading more...
                                            </>
                                        ) : (
                                            "Load More Assets"
                                        )}
                                    </Button>
                                </div>
                            )}
                            {!hasMore && assets.length > 0 && !searchQuery && (
                                <p className="text-center text-muted-foreground text-sm pt-8">
                                    You have reached the end of the asset list.
                                </p>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
