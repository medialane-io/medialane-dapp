"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Share2, Users, Calendar, Shield, Flag } from "lucide-react"
import { Collection } from "@/lib/types"
import Link from "next/link"
import { LazyImage } from "@/components/ui/lazy-image"
import { AddressLink } from "@/components/ui/address-link"
import { formatDate } from "@/lib/utils"
import { ReportCollectionDialog } from "@/components/report-collection-dialog"

interface CollectionCardProps {
  collection: Collection
  index: number
}

export function CollectionCard({ collection, index }: CollectionCardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false)

  // Helper to safely format date key
  const getFormattedDate = (dateStr: string) => {
    if (!dateStr || dateStr === "0") return "Unknown"
    // Handle numeric timestamp (seconds or ms)
    if (/^\d+$/.test(dateStr)) {
      const num = Number(dateStr)
      // If > 1e12 likely ms, else seconds. Starknet uses seconds usually.
      // Current timestamp in seconds is ~1.7e9. In ms ~1.7e12.
      const date = num > 1e12 ? new Date(num) : new Date(num * 1000)

      // If invalid date, fallback
      if (isNaN(date.getTime())) return "Unknown"

      return formatDate(date.toISOString())
    }
    return formatDate(dateStr)
  }

  return (
    <>
      <div className="group relative w-full h-full rounded-2xl overflow-hidden bg-muted/20 isolate">
        <Link href={`/collections/${collection.nftAddress || collection.id}`} className="block h-full w-full">
          {/* Image Container */}
          <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-muted/10">
            <LazyImage
              src={collection.image}
              fallbackSrc="/placeholder.svg"
              alt={`${collection.name} preview ${index + 1}`}
              fill
              className="h-full w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Dark Gradient Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

            {/* Top Right: Asset Count (Subtle) */}
            <div className="absolute top-3 left-3 z-10 transition-opacity duration-300">
              <Badge variant="secondary" className="bg-black/40 text-white/90 backdrop-blur-md border-none text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium shadow-sm">
                {collection.type || "Collection"}
              </Badge>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 flex flex-col justify-end z-10">
              <div className="transform transition-transform duration-500 group-hover:translate-y-[-4px]">
                <h3 className="font-bold text-lg sm:text-xl text-white leading-tight line-clamp-1 drop-shadow-md">
                  {collection.name}
                </h3>

                {collection.description && (
                  <p className="text-xs text-white/70 mt-1.5 line-clamp-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Actions Dropdown Button - Top Right */}
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white backdrop-blur-md border-none shadow-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] rounded-xl border-border/10 bg-background/95 backdrop-blur-xl">
              <DropdownMenuItem asChild>
                <Link href={`/collections/${collection.nftAddress || collection.id}`} className="cursor-pointer py-2.5 px-3 rounded-lg focus:bg-accent/50 transition-colors">
                  <Eye className="mr-2 h-4 w-4" />
                  View Collection
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-lg focus:bg-accent/50 transition-colors">
                <Share2 className="mr-2 h-4 w-4" />
                Share Collection
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setIsReportOpen(true)}
                className="cursor-pointer py-2.5 px-3 rounded-lg focus:bg-destructive/10 text-destructive focus:text-destructive transition-colors"
              >
                <Flag className="mr-2 h-4 w-4" />
                Report Collection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ReportCollectionDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        collectionId={collection.id.toString()}
        collectionName={collection.name}
        collectionOwner={collection.owner}
      />
    </>
  )
}
