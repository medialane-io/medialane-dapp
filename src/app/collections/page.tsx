"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CollectionsGrid } from "@/components/collections/collections-public"
import { Skeleton } from "@/components/ui/skeleton"
import { usePaginatedCollections } from "@/hooks/use-collection"
import { ReportAssetDialog } from "@/components/report-asset-dialog"
import { Grid3X3, Loader2, Search, Filter, ArrowUpDown, Grid, List, Plus, Star, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"

import { PageHeader } from "@/components/page-header"

type SortOption = "date-new" | "date-old" | "name-asc" | "name-desc" | "assets-high" | "assets-low"

export default function CollectionsPage() {
  const router = useRouter();
  const { collections, loading, loadingMore, error, hasMore, loadMore } = usePaginatedCollections(12);

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOption, setSortOption] = useState<SortOption>("date-new")
  const [featuredOnly, setFeaturedOnly] = useState(false)

  const [reportDialogState, setReportDialogState] = useState<{ isOpen: boolean; collectionId: string; collectionName: string }>({
    isOpen: false,
    collectionId: "",
    collectionName: ""
  });

  const getSortIcon = () => {
    if (sortOption.includes("high") || sortOption.includes("desc")) {
      return <ArrowDown className="h-4 w-4" />
    }
    return <ArrowUp className="h-4 w-4" />
  }

  return (
    <main className="">
      <div className="h-16"></div>
      <PageHeader
        variant="expressive"
        title="Collections"
        description="Explore verified IP assets from the Medialane protocol."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Collections" }
        ]}
        statusBadge="Live on Starknet"
        primaryAction={
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-m3-on-surface-variant/50" />
            <Input
              type="search"
              placeholder="Search protocol collections..."
              className="h-12 md:h-14 pl-12 bg-m3-surface-container border border-m3-outline-variant/20 focus:border-m3-primary/30 text-base transition-all rounded-full shadow-sm focus:shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        }
        utilityContent={
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-m3-secondary/5 border border-m3-secondary/10">
              <span className="text-[10px] font-black uppercase tracking-wider text-m3-secondary/70">Verified Assets:</span>
              <span className="text-[11px] font-black text-m3-secondary">{collections?.length || 0}</span>
            </div>

            <div className="h-4 w-px bg-m3-outline-variant/20 mx-1 hidden lg:block" />

            <div className="flex items-center gap-1.5 p-1 bg-m3-surface-container-high/50 rounded-full border border-m3-outline-variant/10">
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-full transition-all", viewMode === "grid" ? "bg-m3-primary text-m3-on-primary shadow-sm" : "text-m3-on-surface-variant/40 hover:bg-m3-primary/5")}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 rounded-full transition-all", viewMode === "list" ? "bg-m3-primary text-m3-on-primary shadow-sm" : "text-m3-on-surface-variant/40 hover:bg-m3-primary/5")}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full border border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors">
                  <Filter className="h-4 w-4 text-m3-primary" />
                  <span className="text-xs font-bold text-m3-on-surface-variant">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-m3-xl shadow-m3-3 border-m3-outline-variant/20">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-m3-on-surface-variant/50">Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFeaturedOnly(!featuredOnly)} className="rounded-m3-lg">
                  <Star
                    className={cn(
                      "mr-2 h-4 w-4",
                      featuredOnly && "text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400",
                    )}
                  />
                  {featuredOnly ? "Show all collections" : "Show featured only"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 gap-2 rounded-full border border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors">
                  <ArrowUpDown className="h-4 w-4 text-m3-primary" />
                  <span className="text-xs font-bold text-m3-on-surface-variant">Sort</span>
                  {getSortIcon()}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-m3-xl shadow-m3-3 border-m3-outline-variant/20">
                <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <DropdownMenuRadioItem value="date-new" className="rounded-m3-lg">Date: Newest</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="date-old" className="rounded-m3-lg">Date: Oldest</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-asc" className="rounded-m3-lg">Name: A to Z</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="name-desc" className="rounded-m3-lg">Name: Z to A</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="assets-high" className="rounded-m3-lg">Assets: High to Low</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="assets-low" className="rounded-m3-lg">Assets: Low to High</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      >
        <Link href="/create/collection">
          <Button className="gap-2 h-10 px-5 rounded-full bg-m3-primary text-m3-on-primary hover:bg-m3-primary/90 shadow-m3-2 transition-all hover:-translate-y-0.5 active:translate-y-0">
            <Plus className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-wider">New Collection</span>
          </Button>
        </Link>
      </PageHeader>

      <div className="w-full mt-8">
        {/* Show loading state while data is being fetched */}
        {loading && (
          <div className="space-y-10">
            <CollectionsSkeleton />
          </div>
        )}

        {/* Show error state */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading collections</p>
          </div>
        )}

        {/* Show collections when loaded successfully */}
        {!loading && !error && collections && collections.length > 0 && (
          <div className="mb-10">
            <div className="mt-4">
              <CollectionsGrid
                collections={collections}
                searchQuery={searchQuery}
                viewMode={viewMode}
                sortOption={sortOption}
                featuredOnly={featuredOnly}
              />

              {!hasMore && collections.length > 0 && (
                <div className="mt-16 text-center text-muted-foreground pb-10">
                  <Badge variant="outline" className="text-muted-foreground border-m3-outline-variant/30 bg-m3-surface-container">You have reached the end of the Protocol</Badge>
                </div>
              )}

              {hasMore && (
                <div className="mt-12 mb-10 text-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => loadMore()}
                    disabled={loadingMore}
                    className="min-w-[200px] h-12 text-md font-medium shadow-sm transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:border-outrun-cyan/30"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin text-outrun-cyan" />
                        Loading onchain...
                      </>
                    ) : (
                      "Load More Collections"
                    )}
                  </Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Displaying {collections.length} collections
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Show no collections message */}
        {!loading && !error && (!collections || collections.length === 0) && (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="bg-muted/30 p-6 rounded-full">
              <Grid3X3 className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold">Onchain collections</h3>
              <p className="text-muted-foreground">
                No collections found onchain yet.
              </p>
            </div>
            <Button asChild size="lg" className="mt-4">
              <Link href="/create/collection">Create Collection</Link>
            </Button>
          </div>
        )}
      </div>

      <ReportAssetDialog
        contentId={reportDialogState.collectionId}
        contentName={reportDialogState.collectionName}
        contentType="collection"
        open={reportDialogState.isOpen}
        onOpenChange={(open) => setReportDialogState(prev => ({ ...prev, isOpen: open }))}
      />
    </main>
  );
}

function CollectionsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Skeleton className="glass h-10 w-full sm:w-[350px]" />
        <div className="flex gap-2">
          <Skeleton className="glass h-10 w-10" />
          <Skeleton className="glass h-10 w-10" />
          <Skeleton className="glass h-10 w-10" />
          <Skeleton className="glass h-10 w-36" />
        </div>
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(null)
          .map((_, i) => (
            <div key={i} className="rounded-xl border glass text-card-foreground overflow-hidden h-[380px]">
              <Skeleton className="h-64 w-full" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between pt-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

