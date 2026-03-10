
"use client"

import { useState } from "react"
import { FilterSidebar } from "@/components/marketplace/filter-sidebar"
import { AssetGrid } from "@/components/marketplace/asset-grid"
import { Search, Filter, ArrowUpDown, ArrowLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { PageHeader } from "@/components/page-header"
import { usePaginatedCollections } from "@/hooks/use-collection"
import { useMarketplaceListings } from "@/hooks/use-marketplace-events"
import { CollectionCard } from "@/components/collection-card"
import { Shelf } from "@/components/ui/shelf"
import { cn } from "@/lib/utils"

import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export default function MarketplacePage() {
    const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent")
    const [searchQuery, setSearchQuery] = useState("")
    const { listings, isLoading: listingsLoading, activeCount } = useMarketplaceListings()
    const { collections, loading: collectionsLoading } = usePaginatedCollections(8)

    return (
        <div className="min-h-screen">
            <main className="py-6">
                <PageHeader
                    variant="expressive"
                    title="Marketplace"
                    description="Discover and trade high-utility intellectual property assets on the Medialane protocol."
                    statusBadge="Live Exchange"
                    primaryAction={
                        <div className="relative w-full max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-m3-on-surface-variant/50" />
                            <Input
                                type="search"
                                placeholder="Search by offerer, token address, or hash..."
                                className="h-12 md:h-14 pl-12 bg-m3-surface-container border border-m3-outline-variant/20 focus:border-m3-primary/30 text-base transition-all rounded-full shadow-sm focus:shadow-md"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    }
                    utilityContent={
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-m3-primary/5 border border-m3-primary/10">
                                <span className="text-[10px] font-black uppercase tracking-wider text-m3-primary/70">Active Listings:</span>
                                <span className="text-[11px] font-black text-m3-primary">{activeCount || 0}</span>
                            </div>

                            <div className="h-4 w-px bg-m3-outline-variant/20 mx-1 hidden lg:block" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full border border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors">
                                        <ArrowUpDown className="h-4 w-4 text-m3-primary" />
                                        <span className="text-xs font-bold text-m3-on-surface-variant">
                                            {sortOrder === "recent" ? "Recent" : "Oldest"}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-m3-xl shadow-m3-3 border-m3-outline-variant/20">
                                    <DropdownMenuRadioGroup value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                                        <DropdownMenuRadioItem value="recent" className="rounded-m3-lg">Most Recent</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="oldest" className="rounded-m3-lg">Oldest First</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full border border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors">
                                        <Filter className="h-4 w-4 text-m3-primary" />
                                        <span className="text-xs font-bold text-m3-on-surface-variant">Advanced Filters</span>
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto border-l border-m3-outline-variant/20 bg-m3-surface-container">
                                    <VisuallyHidden.Root>
                                        <SheetTitle>Marketplace Filters</SheetTitle>
                                    </VisuallyHidden.Root>
                                    <div className="py-6 space-y-8 mt-4">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black tracking-widest uppercase text-m3-on-surface-variant/50 px-1">Attribute Filters</label>
                                            <div className="bg-m3-surface-container-low rounded-[24px] border border-m3-outline-variant/15 overflow-hidden p-4">
                                                <FilterSidebar />
                                            </div>
                                        </div>
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    }
                />

                <div className="mt-8">
                    <AssetGrid sortOrder={sortOrder} searchQuery={searchQuery} />
                </div>

                {!collectionsLoading && collections && collections.length > 0 && (
                    <div className="mt-20 pb-10">
                        <Shelf title="New Collections" href="/collections">
                            {collections.map((collection, index) => (
                                <CollectionCard key={collection.id} collection={collection} index={index} />
                            ))}
                        </Shelf>
                    </div>
                )}
            </main>
        </div>
    )
}
