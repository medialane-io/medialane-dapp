"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Collection } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Grid3X3,
  BarChart3,
  Grid,
  List,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Star,
  Filter,
  Box,
  X,
  ExternalLink,
  Eye,
} from "lucide-react"
import { EXPLORER_URL } from "@/lib/constants"
import { ReportAssetDialog } from "@/components/report-asset-dialog"

type SortOption = "date-new" | "date-old" | "name-asc" | "name-desc" | "assets-high" | "assets-low"

export function CollectionsGrid({
  collections,
  onCollectionClick,
  searchQuery = "",
  viewMode = "grid",
  sortOption = "date-new",
  featuredOnly = false
}: {
  collections: Collection[],
  onCollectionClick?: (collection: Collection) => void,
  searchQuery?: string,
  viewMode?: "grid" | "list",
  sortOption?: SortOption,
  featuredOnly?: boolean
}) {
  const [reportDialogState, setReportDialogState] = useState<{ isOpen: boolean; collectionId: string; collectionName: string }>({
    isOpen: false,
    collectionId: "",
    collectionName: ""
  })

  // Filter collections based on search query and featured status
  const filteredCollections = collections.filter((collection) => {
    const matchesSearch = collection.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFeatured = featuredOnly ? String(collection.id) === "bored-ape" || String(collection.id) === "cryptopunks" : true // Mock featured collections
    return matchesSearch && matchesFeatured
  })

  // Sort collections based on selected sort option
  const sortedCollections = useMemo(() => {
    return [...filteredCollections].sort((a, b) => {
      switch (sortOption) {
        case "date-new":
          return Number(b.lastMintTime || 0) - Number(a.lastMintTime || 0)
        case "date-old":
          return Number(a.lastMintTime || 0) - Number(b.lastMintTime || 0)
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "assets-high":
          return (b.itemCount || 0) - (a.itemCount || 0)
        case "assets-low":
          return (a.itemCount || 0) - (b.itemCount || 0)
        default:
          return 0
      }
    })
  }, [filteredCollections, sortOption])

  return (
    <div className="space-y-6 layout-px">
      {filteredCollections.length === 0 ? (
        <div className="text-center py-20 bg-m3-surface-container-low rounded-m3-xl border border-dashed border-m3-outline-variant/30">
          <p className="text-m3-on-surface-variant font-medium text-lg">No collections found matching your criteria</p>
          <p className="text-m3-on-surface-variant/50 text-sm mt-1">Try adjusting your filters or search query</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
          {sortedCollections.map((collection: Collection) => (
            <CollectionCard
              key={String(collection.id)}
              collection={collection}
              nftCount={collection.itemCount}
              onReportClick={() => setReportDialogState({
                isOpen: true,
                collectionId: String(collection.id),
                collectionName: collection.name
              })}
              onCollectionClick={onCollectionClick ? () => onCollectionClick(collection) : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedCollections.map((collection) => (
            <CollectionListItem
              key={String(collection.id)}
              collection={collection}
              nftCount={collection.itemCount}
              onReportClick={() => setReportDialogState({
                isOpen: true,
                collectionId: String(collection.id),
                collectionName: collection.name
              })}
              onCollectionClick={onCollectionClick ? () => onCollectionClick(collection) : undefined}
            />
          ))}
        </div>
      )}

      <ReportAssetDialog
        contentId={reportDialogState.collectionId}
        contentName={reportDialogState.collectionName}
        contentType="collection"
        open={reportDialogState.isOpen}
        onOpenChange={(open) => setReportDialogState(prev => ({ ...prev, isOpen: open }))}
      />
    </div>
  )
}

interface CollectionCardProps {
  collection: Collection
  nftCount: number
  onReportClick: () => void
  onCollectionClick?: () => void
}



function CollectionCard({ collection, nftCount, onReportClick, onCollectionClick }: CollectionCardProps) {
  const isFeatured = String(collection.id) === "5" || String(collection.id) === "0"
  if (isFeatured) { /* console.log("featured collection", collection.id) */ }
  // console.log("collection", collection.id)
  const coverImage = collection.image || "/background.jpg"

  return (
    <Card
      className={cn(
        "bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl overflow-hidden transition-all duration-500 cursor-pointer group",
        "hover:shadow-glow-mixed hover:-translate-y-1 hover:border-blue-500/30",
        onCollectionClick && "hover:ring-2 hover:ring-outrun-cyan/50"
      )}
      onClick={onCollectionClick}
    >
      <div className={cn("contents", !onCollectionClick && "cursor-default")}>
        {!onCollectionClick ? (
          <Link href={`/collections/${collection.nftAddress || String(collection.id)}`}>
            <div className="relative h-64 w-full">
              <Image
                src={coverImage || "/background.jpg"}
                alt={collection.name}
                fill
                className="object-cover transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {collection.floorPrice && (
                <div className="absolute bottom-2 right-2">
                  <Badge className="bg-blue/80 backdrop-blur-sm">Floor: {collection.floorPrice} STRK</Badge>
                </div>
              )}
              {isFeatured && (
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-outrun-orange to-outrun-magenta text-white border-none shadow-[0_0_10px_rgba(255,153,0,0.3)]"
                  >
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="relative h-64 w-full">
            <Image
              src={coverImage || "/background.jpg"}
              alt={collection.name}
              fill
              className="object-cover transition-all duration-300 group-hover:brightness-90 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            {collection.floorPrice && (
              <div className="absolute bottom-2 right-2">
                <Badge className="bg-blue/80 backdrop-blur-sm">Floor: {collection.floorPrice} STRK</Badge>
              </div>
            )}
            {isFeatured && (
              <div className="absolute top-2 left-2">
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-outrun-orange to-outrun-magenta text-white border-none shadow-[0_0_10px_rgba(255,153,0,0.3)]"
                >
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        {!onCollectionClick ? (
          <Link href={`/collections/${collection.nftAddress || String(collection.id)}`}>
            <h3 className="text-xl font-bold hover:text-primary transition-colors">{collection.name}</h3>
          </Link>
        ) : (
          <h3 className="text-xl font-bold hover:text-primary transition-colors">{collection.name}</h3>
        )}
        <CollectionActionDropdown collectionId={String(collection.id)} collectionName={collection.name} onReportClick={onReportClick} nftAddress={collection.nftAddress} />
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {collection.description || "No description available"}
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center pt-4 justify-between w-full">
          <div className="flex items-center gap-1 text-sm">
            <Grid3X3 className="h-4 w-4 text-muted-foreground" />
            <span>{nftCount} Assets</span>
          </div>
          <div className="flex items-center gap-1 text-sm bg-muted/50 px-2 py-1 rounded-md">
            <Box className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{collection.type || "Art"}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

function CollectionListItem({ collection, nftCount, onReportClick, onCollectionClick }: CollectionCardProps) {
  // Use the collection's image from IPFS metadata
  const coverImage = collection.image || "/placeholder.svg?height=400&width=600"
  const isFeatured = String(collection.id) === "5" || String(collection.id) === "0"

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors",
        onCollectionClick && "cursor-pointer hover:border-primary/50"
      )}
      onClick={onCollectionClick}
    >
      <div className={cn("contents", !onCollectionClick && "cursor-default")}>
        {!onCollectionClick ? (
          <Link href={`/collections/${collection.nftAddress || String(collection.id)}`} className="flex items-center gap-4 flex-grow cursor-pointer">
            <div className="relative h-16 w-16 sm:w-24 rounded-md overflow-hidden flex-shrink-0">
              <Image src={coverImage || "/background.jpg"} alt={collection.name} fill className="object-cover" sizes="(max-width: 640px) 25vw, 100px" />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium hover:text-primary transition-colors">{collection.name}</h3>
                    {isFeatured && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-outrun-orange to-outrun-magenta text-white border-none shadow-[0_0_10px_rgba(255,153,0,0.3)]"
                      >
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {collection.description || "No description available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                  <span>{nftCount} Assets</span>
                </div>
                {collection.floorPrice && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>{collection.floorPrice} STRK</span>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs font-medium">
                  <Box className="h-3 w-3 text-muted-foreground" />
                  <span>{collection.type || "Art"}</span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-4 flex-grow">
            <div className="relative h-16 w-16 sm:w-24 rounded-md overflow-hidden flex-shrink-0">
              <Image src={coverImage || "/background.jpg"} alt={collection.name} fill className="object-cover" sizes="(max-width: 640px) 25vw, 100px" />
            </div>

            <div className="flex-grow min-w-0">
              <div className="flex items-start">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-medium hover:text-primary transition-colors">{collection.name}</h3>
                    {isFeatured && (
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-outrun-orange to-outrun-magenta text-white border-none shadow-[0_0_10px_rgba(255,153,0,0.3)]"
                      >
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {collection.description || "No description available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                  <span>{nftCount} Assets</span>
                </div>
                {collection.floorPrice && (
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span>{collection.floorPrice} STRK</span>
                  </div>
                )}
                <div className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-xs font-medium">
                  <Box className="h-3 w-3 text-muted-foreground" />
                  <span>{collection.type || "Art"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CollectionActionDropdown collectionId={String(collection.id)} collectionName={collection.name} onReportClick={onReportClick} nftAddress={collection.nftAddress} />
    </div>
  )
}

export function FeaturedCollectionCard({ collection, nftCount, onReportClick }: CollectionCardProps) {

  const coverImage = collection.image || "/background.jpg"

  return (
    <div className="rounded-xl overflow-hidden border cursor-pointer hover:shadow-glow-mauve hover:-translate-y-1 transition-all duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        <Link href={`/collections/${collection.nftAddress || String(collection.id)}`}>
          <div className="relative h-64 md:h-auto">
            <Image src={coverImage || "/background.jpg"} alt={collection.name} fill className="object-cover hover:brightness-90 transition-all duration-300" sizes="(max-width: 768px) 100vw, 50vw" />
            <div className="absolute top-4 left-4">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-outrun-orange to-outrun-magenta text-white border-none shadow-[0_0_10px_rgba(255,153,0,0.3)]"
              >
                <Star className="h-3 w-3 mr-1 fill-current" />
                Featured Collection
              </Badge>
            </div>
          </div>
        </Link>
        <div className="p-4 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <Link href={`/collections/${collection.nftAddress || String(collection.id)}`}>
                <h2 className="text-xl md:text-2xl font-bold mb-2 hover:text-primary transition-colors">{collection.name}</h2>
              </Link>
              <CollectionActionDropdown collectionId={String(collection.id)} collectionName={collection.name} onReportClick={onReportClick} nftAddress={collection.nftAddress} />
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 md:line-clamp-none">
              {collection.description}
            </p>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground">Total Assets</p>
                <p className="text-lg md:text-xl font-bold">{nftCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs md:text-sm text-muted-foreground">IP Type</p>
                <p className="text-lg md:text-xl font-bold">{collection.type || "Art"}</p>
              </div>
              {collection.floorPrice && (
                <div className="space-y-1">
                  <p className="text-xs md:text-sm text-muted-foreground">Floor Price</p>
                  <p className="text-lg md:text-xl font-bold">{collection.floorPrice} STRK</p>
                </div>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium mb-2">Preview</p>
            <div className="flex gap-2">
              {/* Show collection image in small preview sizes */}
              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={collection.image}
                  alt={`${collection.name} preview`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={collection.image}
                  alt={`${collection.name} preview`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={collection.image}
                  alt={`${collection.name} preview`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div className="relative h-12 w-12 rounded-md overflow-hidden">
                <Image
                  src={collection.image}
                  alt={`${collection.name} preview`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CollectionActionDropdown({ collectionId, collectionName, onReportClick, nftAddress }: { collectionId: string; collectionName?: string; onReportClick: () => void; nftAddress?: string }) {
  // Use nftAddress if available, otherwise fallback to collectionId for the explorer link
  // Assuming the contract address is what we want to rely on for the explorer
  const addressToUse = nftAddress || collectionId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={`/collections/${addressToUse}`} className="cursor-pointer flex items-center">
            <Eye className="mr-2 h-4 w-4" />
            View Collection
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={`${EXPLORER_URL}/nft-contract/${addressToUse}`}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer flex items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onReportClick()
          }}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <X className="mr-2 h-4 w-4" />
          Report Collection
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

