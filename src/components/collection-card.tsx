"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Eye, MoreHorizontal, Share2, Flag } from "lucide-react"
import { Collection } from "@/lib/types"
import Link from "next/link"
import { LazyImage } from "@/components/ui/lazy-image"
import { ReportCollectionDialog } from "@/components/report-collection-dialog"

interface CollectionCardProps {
  collection: Collection
  index: number
}

export function CollectionCard({ collection, index }: CollectionCardProps) {
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <>
      <div className="group relative w-full h-full rounded-m3-xl overflow-hidden bg-m3-surface-container-lowest isolate shadow-m3-1 ring-1 ring-m3-outline-variant hover:ring-blue-600/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] transition-all duration-m3-medium ease-m3-standard">
        <Link href={`/collections/${collection.nftAddress || collection.id}`} className="block h-full w-full">
          {/* Image Container */}
          <div className="relative aspect-[4/5] sm:aspect-[3/4] w-full overflow-hidden bg-m3-surface-variant/30">
            <LazyImage
              src={collection.image}
              fallbackSrc="/placeholder.svg"
              alt={`${collection.name} preview ${index + 1}`}
              fill
              className="h-full w-full object-cover transition-transform duration-m3-long ease-m3-standard group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Scrim gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Top Left: Type Badge */}
            <div className="absolute top-3 left-3 z-10">
              <Badge variant="secondary" className="bg-m3-inverse-surface/70 text-m3-inverse-on-surface border-0 text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium rounded-m3-sm">
                {collection.type || "Collection"}
              </Badge>
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-5 flex flex-col justify-end z-10">
              <div className="transform transition-transform duration-m3-medium ease-m3-standard group-hover:translate-y-[-4px]">
                <h3 className="font-bold text-lg sm:text-xl text-white leading-tight line-clamp-1 drop-shadow-md">
                  {collection.name}
                </h3>

                {collection.description && (
                  <p className="text-xs text-white/70 mt-1.5 line-clamp-2 transition-all duration-m3-medium ease-m3-standard">
                    {collection.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Link>

        {/* Actions Dropdown */}
        <div className="absolute top-2 right-2 z-20 opacity-100 transition-opacity duration-m3-short">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-8 w-8 rounded-m3-full bg-blue-600/90 text-white hover:bg-blue-500 border-none shadow-[0_2px_10px_rgba(37,99,235,0.4)]"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[180px] rounded-m3-md border-m3-outline-variant/20 bg-m3-surface-container-high shadow-m3-3">
              <DropdownMenuItem asChild>
                <Link href={`/collections/${collection.nftAddress || collection.id}`} className="cursor-pointer py-2.5 px-3 rounded-m3-sm focus:bg-m3-on-surface/8 transition-colors">
                  <Eye className="mr-2 h-4 w-4" />
                  View Collection
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2.5 px-3 rounded-m3-sm focus:bg-m3-on-surface/8 transition-colors">
                <Share2 className="mr-2 h-4 w-4" />
                Share Collection
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setIsReportOpen(true)}
                className="cursor-pointer py-2.5 px-3 rounded-m3-sm focus:bg-m3-error-container text-m3-error transition-colors"
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
