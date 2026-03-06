
"use client"

import { useState } from "react"
import { FilterSidebar } from "@/components/marketplace/filter-sidebar"
import { AssetGrid } from "@/components/marketplace/asset-grid"
import { Search, SlidersHorizontal, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

import { PageHeader } from "@/components/page-header"
import { usePaginatedCollections } from "@/hooks/use-collection"
import { CollectionCard } from "@/components/collection-card"
import { Shelf } from "@/components/ui/shelf"

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
} from "@/components/ui/dropdown-menu"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export default function MarketplacePage() {
    const [sortOrder, setSortOrder] = useState<"recent" | "oldest">("recent")
    const { collections, loading: collectionsLoading } = usePaginatedCollections(8)

    return (
        <div className="min-h-screen">
            <main className="py-10">
                <PageHeader title="Marketplace">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button className="gap-2 h-11 px-6 font-medium">
                                <Filter className="h-4 w-4" />
                                <span>Search & Filters</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[320px] sm:w-[400px] overflow-y-auto border-l border-m3-outline-variant/20 bg-m3-surface-container">
                            <VisuallyHidden.Root>
                                <SheetTitle>Discovery Tools</SheetTitle>
                            </VisuallyHidden.Root>
                            <div className="py-6 space-y-8 mt-4">
                                {/* Search Bar */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold tracking-wider uppercase text-m3-on-surface-variant px-1">Find Assets</label>
                                    <div className="relative border border-m3-outline-variant/20 rounded-m3-lg overflow-hidden bg-m3-surface-container-low">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-m3-on-surface-variant" />
                                        <Input
                                            placeholder="Search marketplace..."
                                            className="pl-10 w-full h-11 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                                        />
                                    </div>
                                </div>

                                {/* Sort Menu */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold tracking-wider uppercase text-m3-on-surface-variant px-1">Sort By</label>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between h-11 bg-m3-surface-container-low border-m3-outline-variant/20 rounded-m3-lg">
                                                <div className="flex items-center gap-2">
                                                    <SlidersHorizontal className="h-4 w-4 text-m3-on-surface-variant" />
                                                    <span>{sortOrder === "recent" ? "Most Recent" : "Oldest First"}</span>
                                                </div>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-[280px] sm:w-[350px] rounded-m3-md border-m3-outline-variant/20 bg-m3-surface-container-high shadow-m3-3 p-2">
                                            <DropdownMenuItem onClick={() => setSortOrder("recent")} className="cursor-pointer py-3 px-4 rounded-m3-sm focus:bg-m3-on-surface/8 transition-colors">
                                                Most Recent
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSortOrder("oldest")} className="cursor-pointer py-3 px-4 rounded-m3-sm focus:bg-m3-on-surface/8 transition-colors">
                                                Oldest First
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="h-px w-full bg-m3-outline-variant/15"></div>

                                {/* Advanced Filters */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold tracking-wider uppercase text-m3-on-surface-variant px-1">Filters</label>
                                    <div className="bg-m3-surface-container-low rounded-m3-xl border border-m3-outline-variant/15 overflow-hidden">
                                        <FilterSidebar />
                                    </div>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </PageHeader>

                <div className="space-y-4 mt-8">
                    <AssetGrid sortOrder={sortOrder} />
                </div>

                {!collectionsLoading && collections && collections.length > 0 && (
                    <div className="mt-16 pb-10">
                        <Shelf title="Recent Collections" href="/collections">
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
