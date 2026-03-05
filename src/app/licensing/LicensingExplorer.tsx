"use client"

import { useState } from "react"
import Image from "next/image"
import { useAccount } from "@starknet-react/core"
import { motion, AnimatePresence } from "framer-motion"
import {
    Search,
    Loader2,
    Box,
    Users,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
    Sparkles
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { useRouter } from "next/navigation"
import { usePaginatedCollections } from "@/hooks/use-collection"
import { useCollectionAssets } from "@/hooks/use-collection-new"
import { CollectionsGrid } from "@/components/collections/collections-public"
import { Collection } from "@/lib/types"

export function LicensingExplorer() {
    const router = useRouter()
    const { isConnected } = useAccount()
    const [searchQuery, setSearchQuery] = useState("")
    const [viewState, setViewState] = useState<"collections" | "assets">("collections")
    const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)

    // Data Hooks
    const { collections: allCollections, loading: collectionsLoading, hasMore, loadMore, loadingMore } = usePaginatedCollections(12)

    // Selected Collection Assets Hook
    const {
        assets: collectionAssets,
        loading: collectionAssetsLoading
    } = useCollectionAssets(selectedCollection?.nftAddress || "")

    // Filter Collection Assets
    const filteredCollectionAssets = (collectionAssets || []).filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleSelectCollection = (collection: Collection) => {
        setSelectedCollection(collection)
        setViewState("assets")
        setSearchQuery("")
    }

    const handleBackToCollections = () => {
        setSelectedCollection(null)
        setViewState("collections")
        setSearchQuery("")
    }

    const openLicensePage = (asset: any, nftAddress: string) => {
        const tokenId = asset.token_id || asset.id?.split("-").pop() || "0";
        router.push(`/licensing/${nftAddress}-${tokenId}`);
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl glass border border-foreground/10 bg-black/20">
                <ShieldCheck className="h-16 w-16 text-muted-foreground mb-6 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">Connect Your Wallet</h3>
                <p className="text-muted-foreground max-w-md mb-8">
                    To acquire IP licenses and make offers on assets, you need to connect your Starknet wallet.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Controls */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end gap-4 p-1.5"
            >
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search collections or assets..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/40 border-0 focus-visible:ring-1 focus-visible:ring-primary/50 backdrop-blur-sm h-10 rounded-xl"
                    />
                </div>
            </motion.div>

            {/* CONTENT AREA */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="collections-view"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* VIEW: LIST COLLECTIONS */}
                        {viewState === "collections" && (
                            <div className="space-y-8">
                                {collectionsLoading && allCollections.length === 0 ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-muted-foreground justify-center py-8">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <p>Loading collections...</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {Array(6).fill(0).map((_, i) => <CollectionCardSkeleton key={i} />)}
                                        </div>
                                    </div>
                                ) : allCollections && allCollections.length > 0 ? (
                                    <>
                                        <CollectionsGrid
                                            collections={allCollections.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))}
                                            onCollectionClick={handleSelectCollection}
                                        />
                                        {hasMore && (
                                            <div className="flex justify-center pt-8">
                                                <Button
                                                    onClick={() => loadMore()}
                                                    disabled={loadingMore}
                                                    variant="outline"
                                                    size="lg"
                                                    className="glass-button"
                                                >
                                                    {loadingMore ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Loading more...
                                                        </>
                                                    ) : "Load More Collections"}
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <EmptyState
                                        title="No Collections Found"
                                        description="No collections available at the moment."
                                    />
                                )}
                            </div>
                        )}

                        {/* VIEW: INSIDE COLLECTION (ASSETS) */}
                        {viewState === "assets" && selectedCollection && (
                            <div className="space-y-6">
                                {/* Collection Header */}
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4 glass p-6 rounded-2xl mb-8"
                                >
                                    <Button variant="ghost" size="icon" onClick={handleBackToCollections} className="shrink-0 rounded-full hover:bg-foreground/10">
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-foreground/10 shadow-lg">
                                        <Image
                                            src={selectedCollection.image || "/placeholder.svg"}
                                            alt={selectedCollection.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">{selectedCollection.name}</h2>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{selectedCollection.itemCount} Items</span>
                                            </div>
                                            <Badge variant="outline" className="text-xs h-6 px-2 bg-transparent border-foreground/20">
                                                {selectedCollection.type || "Collection"}
                                            </Badge>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Assets Grid */}
                                {collectionAssetsLoading ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {Array(8).fill(0).map((_, i) => <AssetCardSkeleton key={i} />)}
                                    </div>
                                ) : filteredCollectionAssets.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredCollectionAssets.map((asset, i) => {
                                            const tokenId = asset.id.split("-").pop() || "0"
                                            return (
                                                <motion.div
                                                    key={asset.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <LicensableAssetCard
                                                        asset={{
                                                            name: asset.name,
                                                            image: asset.image,
                                                            token_id: tokenId,
                                                            collection_id: selectedCollection.id.toString(),
                                                            owner: asset.owner || "Unknown",
                                                            collectionName: selectedCollection.name,
                                                            type: selectedCollection.type || "Art",
                                                            metadata_uri: ""
                                                        }}
                                                        nftAddress={selectedCollection.nftAddress}
                                                        onLicense={() => openLicensePage(asset, selectedCollection.nftAddress)}
                                                    />
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <EmptyState
                                        title="No Assets Found"
                                        description="This collection seems to be empty or search returned no results."
                                    />
                                )}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

// --- Subcomponents ---

function LicensableAssetCard({ asset, onLicense }: { asset: any, nftAddress: string, onLicense: () => void }) {
    return (
        <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short border-foreground/5 dark:border-foreground/5 bg-foreground/5 dark:bg-black/20 hover:border-primary/30 dark:hover:border-primary/30 flex flex-col h-full">
            <div className="aspect-square relative bg-muted/20 overflow-hidden shrink-0">
                <Image
                    src={asset.image || "/placeholder.svg"}
                    alt={asset.name || "Asset"}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 pointer-events-none" />

                <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/50 hover:bg-black/60 backdrop-blur-md text-white border-foreground/10 text-[10px] uppercase tracking-wider font-semibold">
                        IP Asset
                    </Badge>
                </div>
            </div>
            <CardContent className="p-4 space-y-4 relative flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                    <div className="space-y-1">
                        <h3 className="font-semibold truncate text-base pr-2 group-hover:text-primary transition-colors" title={asset.name}>{asset.name}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="truncate max-w-[70%] font-medium opacity-80">{asset.collectionName || "Collection"}</span>
                            <span className="opacity-50 font-mono">#{asset.token_id || "0"}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-foreground/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary/70" />
                        <span>Standard terms available</span>
                    </div>
                    <Button
                        onClick={onLicense}
                        className="w-full gap-2 font-medium shadow-sm hover:shadow-md transition-all glass-button text-xs h-9 bg-primary/10 hover:bg-primary/20 hover:text-primary border-primary/20"
                        size="sm"
                        variant="ghost"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Request License
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

function AssetCardSkeleton() {
    return (
        <div className="rounded-xl border border-foreground/10 bg-foreground/5 overflow-hidden">
            <Skeleton className="aspect-square w-full bg-foreground/5" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-4 w-3/4 bg-foreground/5" />
                <Skeleton className="h-3 w-1/2 bg-foreground/5" />
            </div>
        </div>
    )
}

function CollectionCardSkeleton() {
    return (
        <div className="rounded-xl border border-foreground/10 bg-foreground/5 overflow-hidden">
            <Skeleton className="h-56 w-full bg-foreground/5" />
            <div className="p-4 flex justify-between">
                <Skeleton className="h-5 w-32 bg-foreground/5" />
                <Skeleton className="h-5 w-16 bg-foreground/5" />
            </div>
        </div>
    )
}

function EmptyState({ title, description }: { title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 glass border-foreground/10">
                <Box className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{description}</p>
        </div>
    )
}
