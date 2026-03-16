"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Search,
    Share2,
    Users,
    BarChart3,
    Grid3X3,
    Copy,
    ExternalLink,
    Shield,
    Star,
    Eye,
    AlertTriangle,
    Loader2,
    FileText,
    User,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { isCollectionReported } from "@/lib/reported-content";
import { ReportCollectionDialog } from "@/components/report-collection-dialog";
import Link from "next/link";
import Image from "next/image";
import { LazyImage } from "@/components/ui/lazy-image";
import AssetCard from "@/components/asset-card";
import {
    useCollectionMetadata,
    useCollectionAssets,
} from "@/hooks/use-collection-new";
import { useMarketplaceListings } from "@/hooks/use-marketplace-events";
import { Asset } from "@/types/asset";
import { nextIpfsGatewayUrl } from "@/utils/ipfs";
import { CollectionOfferDialog } from "@/components/marketplace/checkout/collection-offer-dialog";
import { useCollectionFloor } from "@/hooks/use-collection-floor";

interface CollectionDetailsProps {
    collectionAddress: string;
}

export default function CollectionDetails({ collectionAddress }: CollectionDetailsProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [copied, setCopied] = useState<string | null>(null);
    const [imageRatio, setImageRatio] = useState<number | null>(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [bgImageSrc, setBgImageSrc] = useState<string | null>(null);

    // Use new hooks for fetching data
    const {
        collection,
        loading: collectionLoading,
        error: collectionError,
    } = useCollectionMetadata(collectionAddress);

    const {
        assets: collectionAssets,
        loading: assetsLoading,
        error: assetsError,
    } = useCollectionAssets(collectionAddress);

    const isLoading = collectionLoading || assetsLoading;
    const error = collectionError || assetsError;

    // Keep bgImageSrc in sync with collection.image; retry with next gateway on error
    const resolvedBgSrc = bgImageSrc ?? collection?.image ?? "/placeholder.svg";
    const handleBgImageError = useCallback(() => {
        const next = nextIpfsGatewayUrl(resolvedBgSrc);
        if (next) setBgImageSrc(next);
    }, [resolvedBgSrc]);

    const filteredAssets = (collectionAssets || []).filter((asset) => {
        const matchesSearch = asset.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType =
            filterType === "all" ||
            asset.type.toLowerCase() === filterType.toLowerCase();
        return matchesSearch && matchesType;
    });

    // Calculate unique active owners (only assets onchain)
    const uniqueOwnersCount = useMemo(() => {
        if (!collectionAssets) return "--";
        const owners = new Set<string>();
        collectionAssets.forEach(asset => {
            if (asset.owner && asset.owner !== "0x0") owners.add(asset.owner);
        });
        // A collection inherently belongs to its minter/creator even if empty
        return Math.max(1, owners.size).toString();
    }, [collectionAssets]);

    // Load active marketplace listings
    const { listings, allOrders } = useMarketplaceListings();

    const listedCount = useMemo(() => {
        if (!listings || !collection?.nftAddress) return 0;
        const normalizedAddr = collection.nftAddress.toLowerCase();
        return listings.filter(l => l.offerToken.toLowerCase() === normalizedAddr).length;
    }, [listings, collection?.nftAddress]);

    const collectionVolume = useMemo(() => {
        if (!allOrders || !collection?.nftAddress) return 0;
        const normalizedAddr = collection.nftAddress.toLowerCase();
        return allOrders.filter(o => o.status === "fulfilled" && o.offerToken.toLowerCase() === normalizedAddr).length;
    }, [allOrders, collection?.nftAddress]);

    // Derive collection floor directly
    const floorInfo = useCollectionFloor(collection?.nftAddress);

    // Create a fast map of active listings by contract + tokenId
    const activeListingsMap = useMemo(() => {
        const map = new Map<string, any>();
        if (!listings) return map;

        listings.forEach(listing => {
            if (listing.status === "active" && (listing.offerType === "ERC721" || listing.offerType === "ERC1155")) {
                const key = `${listing.offerToken.toLowerCase()}-${listing.offerIdentifier}`;
                map.set(key, listing);
            }
        });
        return map;
    }, [listings]);

    const creator = (collection as any)?.creator;

    const handleCopy = async (text: string, type: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    const handleShare = () => {
        if (!collection) return;
        if (navigator.share) {
            navigator.share({
                title: collection.name,
                text: `Check out the ${collection.name} collection`,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (collectionLoading) {
        return <CollectionPageSkeleton />;
    }

    if (error || !collection) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive">
                        Error Loading Collection
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {error || "Collection not found"}
                    </p>
                    <Link href="/collections">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Collections
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-10">
            {/*  Header */}
            <div className="relative overflow-hidden -mt-[88px] pt-[150px] pb-24 min-h-[500px] flex flex-col justify-center">
                {/* Background with gradient and blur */}
                <div className="absolute inset-0">
                    {/* Base gradient - More vivid */}
                    <div className="absolute inset-0 bg-gradient-to-br from-outrun-magenta/40 via-outrun-purple/20 to-neon-cyan/40 mix-blend-overlay" />

                    {/* Collection Image Background - More visible */}
                    <Image
                        src={resolvedBgSrc}
                        alt="Collection Background"
                        fill
                        className="object-cover opacity-60 blur-2xl scale-110"
                        priority
                        sizes="100vw"
                        onError={handleBgImageError}
                    />

                    {/*  overlay - Lighter for vividness */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 via-transparent to-background/90 backdrop-blur-[2px]" />
                </div>

                <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 mx-auto">
                    {collection && isCollectionReported(collection.nftAddress) && (
                        <Alert
                            variant="destructive"
                            className="mb-8 border-destructive/50 bg-destructive/10 text-foreground dark:border-destructive/50 backdrop-blur-md"
                        >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Reported Content</AlertTitle>
                            <AlertDescription>
                                This collection has been flagged by the Medialane Community.
                                Proceed with caution.
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-col gap-10">
                        {/* Top Section: Avatar + Info */}
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
                            {/* Collection Avatar - Massive */}
                            <div className="flex-shrink-0 relative group w-full lg:w-1/2 mx-auto lg:mx-0">
                                <div className="absolute -inset-1 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 bg-gradient-to-tr from-outrun-magenta to-neon-cyan/50" />
                                <div
                                    className="relative w-full rounded-2xl overflow-hidden border-2 border-border/50 dark:border-border/50 backdrop-blur-xl shadow-glow-blue transition-all duration-300 ease-in-out bg-black/20"
                                    style={{ aspectRatio: imageRatio || "1/1" }}
                                >
                                    <LazyImage
                                        src={collection.image || "/placeholder.svg"}
                                        alt={collection.name}
                                        fill
                                        className="object-cover"
                                        priority
                                        onLoad={(e) => {
                                            const img = e.currentTarget;
                                            if (img.naturalWidth && img.naturalHeight) {
                                                setImageRatio(img.naturalWidth / img.naturalHeight);
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Collection Info */}
                            <div className="flex-1 text-foreground text-center lg:text-left flex flex-col justify-center h-full pt-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-2">
                                        <h1 className="text-5xl font-bold tracking-tight text-foreground leading-none">{collection.name}</h1>
                                        {collection.type && (
                                            <Badge variant="outline" className="bg-foreground/10 text-foreground border-border backdrop-blur-md px-4 py-1.5 text-lg">
                                                {collection.type}
                                            </Badge>
                                        )}
                                    </div>

                                    <p className="text-xl text-foreground font-medium">
                                        {collection.description || "No description available."}
                                    </p>

                                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-4">
                                        <CollectionOfferDialog
                                            collection={{
                                                name: collection.name,
                                                image: collection.image || "/placeholder.svg",
                                                nftAddress: collection.nftAddress,
                                            }}
                                            trigger={
                                                <Button
                                                    variant="default"
                                                    className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow-blue font-bold"
                                                >
                                                    Make Collection Offer
                                                </Button>
                                            }
                                        />

                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="glass text-foreground"
                                            onClick={handleShare}
                                        >
                                            <Share2 className="h-6 w-6" />
                                        </Button>
                                        <a
                                            href={`${process.env.NEXT_PUBLIC_EXPLORER_URL || "https://voyager.online"}/nft-contract/${collection.nftAddress}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="glass text-foreground"
                                            >
                                                <ExternalLink className="h-6 w-6" />
                                            </Button>
                                        </a>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="glass text-foreground"
                                            onClick={() => setReportOpen(true)}
                                            title="Report Collection"
                                        >
                                            <AlertTriangle className="h-6 w-6" />
                                        </Button>
                                    </div>

                                    {/* Stats Widget - Moved into the same flex column */}
                                    <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-6">
                                        <div className="glass-panel p-4 lg:p-5 border-border/50 shadow-glow-mauve hover:-translate-y-1 transition-transform duration-300 rounded-2xl">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Floor Price</p>
                                                <p className="text-2xl lg:text-3xl font-black text-foreground">
                                                    {floorInfo ? `${floorInfo.formattedPrice} ${floorInfo.symbol}` : '--'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4 lg:p-5 border-border/50 shadow-glow-mauve hover:-translate-y-1 transition-transform duration-300 rounded-2xl">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Listed</p>
                                                <p className="text-2xl lg:text-3xl font-black text-foreground">{listedCount}</p>
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4 lg:p-5 border-border/50 shadow-glow-mauve hover:-translate-y-1 transition-transform duration-300 rounded-2xl">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Owners</p>
                                                <p className="text-2xl lg:text-3xl font-black text-foreground">{uniqueOwnersCount}</p>
                                            </div>
                                        </div>
                                        <div className="glass-panel p-4 lg:p-5 border-border/50 shadow-glow-mauve hover:-translate-y-1 transition-transform duration-300 rounded-2xl">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Volume</p>
                                                <p className="text-2xl lg:text-3xl font-black text-foreground">{collectionVolume}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contract and Creator Details - Inline */}
                                    <div className="mt-4 flex flex-wrap gap-3 justify-center lg:justify-start items-center text-sm font-medium">
                                        <div className="flex items-center bg-foreground/5 border border-border/50 text-foreground/90 px-3 py-1.5 rounded-full backdrop-blur-md">
                                            <span className="mr-2"><FileText className="h-4 w-4 text-muted-foreground/50" /></span>
                                            <button
                                                onClick={() => handleCopy(collection.nftAddress, "address")}
                                                className="font-mono hover:text-foreground transition-colors flex items-center"
                                            >
                                                {collection.nftAddress.substring(0, 6)}...{collection.nftAddress.substring(collection.nftAddress.length - 4)}
                                                <Copy className="h-3 w-3 ml-2 text-muted-foreground/50" />
                                            </button>
                                            {copied === "address" && <span className="ml-2 text-neon-cyan text-xs">Copied!</span>}
                                        </div>

                                        {!creator && collection.owner && (
                                            <div className="flex items-center bg-foreground/5 border border-border/50 text-foreground/90 px-3 py-1.5 rounded-full backdrop-blur-md">
                                                <span className="mr-2"><User className="h-4 w-4 text-muted-foreground/50" /></span>
                                                <Link href={`/creator/${collection.owner}`} className="font-mono hover:text-foreground transition-colors hover:underline">
                                                    {collection.owner.substring(0, 6)}...
                                                </Link>
                                            </div>
                                        )}

                                        {creator && (
                                            <div className="flex items-center bg-foreground/5 px-3 py-1.5 rounded-full border border-border/50 gap-2 backdrop-blur-md text-foreground/90">
                                                <span className="mr-1 text-muted-foreground/50">Creator:</span>
                                                <Avatar className="h-5 w-5 border border-border">
                                                    <AvatarImage src={(creator as any).avatar} />
                                                    <AvatarFallback className="text-[10px] bg-black/40 text-foreground">{(creator as any).name?.substring(0, 2)}</AvatarFallback>
                                                </Avatar>
                                                <Link href={`/creator/${(creator as any).id}`} className="hover:text-foreground hover:underline">
                                                    {(creator as any).name}
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="w-full px-6 sm:px-10 lg:px-16 mx-auto py-8">
                {/* Assets Section */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Collection Assets</h2>
                            <p className="text-muted-foreground">
                                {filteredAssets.length} of {collectionAssets.length} IP assets
                            </p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search assets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>

                    {assetsLoading ? (
                        <AssetsSkeleton />
                    ) : filteredAssets.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredAssets.map((asset) => {
                                const tokenId = asset.id.split('-').pop();
                                const contractAddr = (asset.collection || collectionAddress).toLowerCase();
                                const key = `${contractAddr}-${tokenId}`;
                                const matchedListing = activeListingsMap.get(key);
                                return <AssetCard key={asset.id} asset={asset as Asset} listing={matchedListing} />;
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                            <div className="bg-muted/30 p-6 rounded-full">
                                <Grid3X3 className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <div className="text-muted-foreground mb-4">
                                {searchQuery
                                    ? "No assets found matching your search."
                                    : "No assets in this collection yet."}
                            </div>
                            {searchQuery && (
                                <Button variant="outline" onClick={() => setSearchQuery("")}>
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <ReportCollectionDialog
                open={reportOpen}
                onOpenChange={setReportOpen}
                collectionId={collection.nftAddress}
                collectionName={collection.name}
                collectionOwner={collection.owner}
            />
        </div>
    );
}

function CollectionPageSkeleton() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Skeleton - Matches new design */}
            <div className="relative overflow-hidden -mt-[88px] pt-[150px] pb-24 min-h-[500px] flex flex-col justify-center">
                <div className="relative z-10 w-full px-6 sm:px-10 lg:px-16 mx-auto">
                    <div className="flex flex-col gap-10">
                        {/* Top Section: Avatar + Info */}
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
                            {/* Avatar */}
                            <div className="flex-shrink-0 relative w-full lg:w-1/2 mx-auto lg:mx-0">
                                <Skeleton className="h-[400px] w-full rounded-2xl border-[3px] border-border" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col items-center lg:items-start justify-center pt-4 space-y-4 w-full">
                                <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start w-full">
                                    <Skeleton className="h-16 w-3/4 max-w-lg" />
                                    <Skeleton className="h-8 w-24 rounded-full" />
                                </div>
                                <Skeleton className="h-24 w-full max-w-2xl" />
                                <div className="flex gap-4 pt-2">
                                    <Skeleton className="h-12 w-32 rounded-md" />
                                    <Skeleton className="h-12 w-32 rounded-md" />
                                </div>
                            </div>
                        </div>

                        {/* Stats Widget */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mt-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="glass-panel rounded-2xl p-6 h-32 flex flex-col justify-center space-y-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-10 w-16" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <main className="w-full px-6 sm:px-10 lg:px-16 mx-auto py-8">
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-64" />
                    </div>
                    <AssetsSkeleton />
                </div>
            </main>
        </div>
    )
}

function AssetsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(null).map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden border">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    )
}
