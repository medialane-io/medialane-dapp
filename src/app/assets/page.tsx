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
        <div className="min-h-screen py-6 md:py-10">
            <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto py-4">

                <PageHeader
                    title="Explore Onchain IP Assets"
                    description="Discover and collect intellectual property assets secured on Starknet."
                >
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mt-4 md:mt-0">
                        <div className="relative flex-1 md:min-w-[300px] group">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-outrun-cyan transition-colors" />
                            <Input
                                placeholder="Search by name, ID, or collection..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 bg-background/50 border-input/50 focus:border-outrun-cyan/50 focus:ring-outrun-cyan/20 rounded-xl"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            {totalCount > 0 && (
                                <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-outrun-cyan/10 backdrop-blur-md rounded-xl border border-outrun-cyan/20 h-10">
                                    <Box className="h-4 w-4 text-outrun-cyan" />
                                    <span className="font-semibold text-sm">{totalCount}</span>
                                </div>
                            )}
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={refresh}
                                disabled={loading}
                                className="h-10 w-10 border-input/50 bg-background/50 hover:bg-outrun-cyan/10 hover:border-outrun-cyan/30 backdrop-blur-sm rounded-xl transition-all"
                            >
                                <RefreshCw className={`h-4 w-4 ${loading && !loadingMore ? "animate-spin text-outrun-cyan" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </PageHeader>

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
                        <Card className="border-dashed">
                            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
                                <Loader2 className="h-10 w-10 text-outrun-cyan animate-spin" />
                                <div className="space-y-2">
                                    <h3 className="text-lg font-medium">Retrieving onchain data...</h3>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        Please wait while we fetch the latest assets directly from the blockchain. This might take a moment.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ) : filteredAssets.length === 0 && !loading ? (
                        <Card className="border-dashed">
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
                        </Card>
                    ) : (
                        <>
                            <div className="space-y-12">
                                {Array.from(
                                    filteredAssets.reduce((acc, asset) => {
                                        const type = asset.ipType || "Other";
                                        if (!acc.has(type)) acc.set(type, []);
                                        acc.get(type)!.push(asset);
                                        return acc;
                                    }, new Map<string, typeof filteredAssets>())
                                ).map(([type, typeAssets]) => (
                                    <Shelf key={type} title={type === 'Other' ? 'Discover More IP' : `${type} Assets`}>
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
