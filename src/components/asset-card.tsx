"use client"

import { useAccount } from "@starknet-react/core"

import { MarketplaceOrder } from "@/hooks/use-marketplace-events"
import { Skeleton } from "@/components/ui/skeleton"
import { normalizeStarknetAddress, getCurrency, formatPrice } from "@/lib/utils"
import { EXPLORER_URL } from "@/lib/constants"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Share2, FileText, Flag, Shield, MoreHorizontal, RefreshCw, ShoppingBag, Loader2, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { useCart } from "@/store/use-cart"
import { useTokenMetadata } from "@/hooks/use-token-metadata"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Asset } from "@/types/asset"
import type { RecentAsset } from "@/hooks/use-recent-assets"
import { isOwnListing } from "@/lib/ownership"
import { useAssetOffers } from "@/hooks/use-asset-offers"

interface AssetCardProps {
  listing?: MarketplaceOrder;
  asset?: Partial<Asset> & Partial<RecentAsset> & { collectionName?: string, nftAddress?: string };
}

export function AssetCard({ listing, asset }: AssetCardProps) {
  // Resolve identifiers
  const offerToken = listing?.offerToken || asset?.nftAddress || asset?.collectionAddress || (typeof asset?.collection === 'string' ? asset.collection : "") || "";
  const extractedTokenId = asset?.id?.includes('-') ? asset.id.split('-')[1] : asset?.id;
  const offerIdentifier = listing?.offerIdentifier || asset?.tokenId || extractedTokenId || "";

  // Derived ownership / creation
  const creatorAddress = listing?.offerer || asset?.creator || "";
  const collectionName = asset?.collectionName || (typeof asset?.collection === 'object' ? (asset.collection as any).name : asset?.collection) || null;
  const ipType = asset?.ipType || asset?.type || null;

  // Fetch metadata mirroring ListingCard ONLY if asset doesn't provide it
  const shouldFetchMetadata = !asset?.image || !asset?.name;
  const { name: fetchedName, image: fetchedImage, loading: metadataLoading } = useTokenMetadata(
    shouldFetchMetadata ? offerIdentifier : "",
    shouldFetchMetadata ? offerToken : ""
  );

  const [imageError, setImageError] = useState(false);

  // Wallet connection
  const { address } = useAccount();

  // Ownership detection
  const isOwn = isOwnListing(listing?.offerer || asset?.owner || asset?.creator, address);

  // Best bid
  const { allOffers } = useAssetOffers(offerToken || undefined, offerIdentifier || undefined);

  // Cart integration
  const { items, addItem, removeItem, setIsOpen } = useCart();
  const isInCart = listing && !isOwn && items.some((i) => i.listing.orderHash === listing.orderHash);

  const handleCartAction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!listing || !asset || isOwn) return;

    if (isInCart) {
      removeItem(listing.orderHash);
    } else {
      addItem(listing, asset as Asset | RecentAsset, address);
      setIsOpen(true);
    }
  };

  // Resolve currency details for listings
  const currency = getCurrency(listing?.considerationToken || "");
  const formattedPrice = formatPrice(listing?.considerationAmount || "0", currency.decimals);

  // Final Display Values
  const name = asset?.name || fetchedName || "Unknown Asset";
  const image = asset?.image || fetchedImage;
  const displayImage = imageError || !image ? "/placeholder.svg" : image;
  const assetUrl = `/asset/${offerToken}-${offerIdentifier}`;
  const isLoading = shouldFetchMetadata && metadataLoading;

  return (
    <Card className="overflow-hidden bg-m3-surface-container-lowest rounded-m3-xl shadow-m3-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-m3-outline-variant hover:border-blue-600/40 transition-all duration-m3-medium ease-m3-standard group flex flex-col h-full relative">
      <motion.div layoutId={`asset-card-${offerToken}-${offerIdentifier}`} className="block relative aspect-square overflow-hidden bg-m3-surface-variant/30 rounded-t-m3-xl">
        <Link href={assetUrl} className="block w-full h-full">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-m3-on-surface-variant/30" />
            </div>
          ) : (
            <Image
              src={displayImage}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-m3-long ease-m3-standard group-hover:scale-105"
              onError={() => setImageError(true)}
              unoptimized={displayImage.startsWith("htt")}
            />
          )}
        </Link>
      </motion.div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="pb-3 mb-3 border-b border-m3-outline-variant/15">
          <div className="flex items-start justify-between gap-2">
            <Link href={assetUrl} className="block flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight truncate text-m3-on-surface transition-colors duration-m3-short" title={name}>
                {name}
              </h3>
            </Link>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 max-w-[70%]">
              {creatorAddress ? (
                isOwn ? (
                  <span className="text-[11px] text-m3-primary font-semibold">
                    You
                  </span>
                ) : (
                  <p className="text-[11px] text-m3-on-surface-variant font-mono truncate hover:underline" title={creatorAddress}>
                    <Link href={`/creator/${creatorAddress}`}>
                      {creatorAddress.slice(0, 6)}...{creatorAddress.slice(-4)}
                    </Link>
                  </p>
                )
              ) : (
                <>
                  <div className="w-5 h-5 flex-shrink-0 rounded-m3-full bg-m3-surface-variant border border-m3-outline-variant/30 flex items-center justify-center overflow-hidden">
                    <span className="text-[8px] font-medium text-m3-on-surface-variant uppercase">{(collectionName || "IP").slice(0, 2)}</span>
                  </div>
                  <Link href={`/collections/${offerToken}`} className="text-[11px] text-m3-on-surface-variant font-medium truncate hover:underline">
                    {collectionName || "Unknown Collection"}
                  </Link>
                </>
              )}
            </div>

            <Badge variant="secondary" className="text-[10px] shrink-0 font-medium bg-m3-tertiary-container text-m3-on-tertiary-container border-0 ml-auto uppercase tracking-wider rounded-m3-sm">
              {ipType || "IP Asset"}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-end mt-auto h-[38px]">
          {listing ? (
            <div>
              <p className="text-[10px] font-medium text-m3-on-surface-variant mb-0.5">Price</p>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-m3-on-surface tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-[10px] font-medium text-m3-on-surface-variant uppercase">{currency.symbol}</span>
              </div>
            </div>
          ) : (
            <div className="mb-0.5">
              <p className="text-[10px] font-medium text-m3-on-surface-variant mb-1">Status</p>
              <span className="text-xs font-medium text-m3-on-surface-variant px-2 py-0.5 rounded-m3-xs bg-m3-surface-variant border border-m3-outline-variant/20">
                Unlisted
              </span>
            </div>
          )}
          {allOffers.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-m3-on-surface-variant">Best Bid</p>
              <span className="text-xs font-semibold text-m3-primary">
                {allOffers[0].formattedPrice} {allOffers[0].currencySymbol}
              </span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 gap-2 grid grid-cols-[1fr,auto]">
        {listing ? (
          isOwn ? (
            <Link href={assetUrl} className="w-full">
              <Button
                variant="default"
                className="w-full h-9 gap-1.5 px-2 font-medium active:scale-[0.98] transition-transform"
              >
                <Eye className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">View</span>
              </Button>
            </Link>
          ) : (
            <Button
              variant={isInCart ? "secondary" : "premium"}
              onTouchStart={handleCartAction}
              onClick={handleCartAction}
              className="w-full h-9 gap-1.5 px-2 font-bold active:scale-[0.98] transition-transform"
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{isInCart ? "In Cart" : "Add to Cart"}</span>
            </Button>
          )
        ) : (
          <Link href={assetUrl} className="w-full">
            <Button
              variant="default"
              className="w-full h-9 gap-1.5 px-2 font-medium active:scale-[0.98] transition-transform"
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">View</span>
            </Button>
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-10 text-m3-on-surface-variant shrink-0 rounded-m3-md p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-m3-surface-container-high border-m3-outline-variant/20 text-m3-on-surface shadow-m3-3 rounded-m3-md">
            <Link href={assetUrl}>
              <DropdownMenuItem className="focus:bg-m3-on-surface/8 cursor-pointer py-2.5 rounded-m3-sm">
                <Eye className="mr-3 h-4 w-4 opacity-60" /> View Details
              </DropdownMenuItem>
            </Link>
            <Link href={`/proof-of-ownership/${offerToken}-${offerIdentifier}`}>
              <DropdownMenuItem className="focus:bg-m3-on-surface/8 cursor-pointer py-2.5 rounded-m3-sm">
                <Shield className="mr-3 h-4 w-4 opacity-60" /> Proof of Ownership
              </DropdownMenuItem>
            </Link>
            <DropdownMenuItem className="focus:bg-m3-on-surface/8 cursor-pointer py-2.5 rounded-m3-sm">
              <Share2 className="mr-3 h-4 w-4 opacity-60" /> Transfer Asset
            </DropdownMenuItem>
            <DropdownMenuItem className="focus:bg-m3-on-surface/8 cursor-pointer py-2.5 rounded-m3-sm">
              <FileText className="mr-3 h-4 w-4 opacity-60" /> View Provenance
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-m3-outline-variant/20" />
            <div onClick={() => window.open(`${EXPLORER_URL}/contract/${offerToken}`, '_blank')}>
              <DropdownMenuItem className="focus:bg-m3-on-surface/8 cursor-pointer py-2.5 rounded-m3-sm">
                <ExternalLink className="mr-3 h-4 w-4 opacity-60" /> View on Explorer
              </DropdownMenuItem>
            </div>
            <DropdownMenuItem className="focus:bg-m3-error-container text-m3-error cursor-pointer py-2.5 mt-1 border-t border-m3-outline-variant/10 rounded-m3-sm">
              <Flag className="mr-3 h-4 w-4 opacity-60" /> Report Asset
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

export default AssetCard;

export function AssetCardSkeleton() {
  return (
    <Card className="overflow-hidden bg-m3-surface-container-low rounded-m3-xl shadow-m3-1 border border-m3-outline-variant/10 h-full flex flex-col">
      <div className="relative aspect-square w-full bg-m3-surface-variant/30 rounded-t-m3-xl" />
      <div className="p-4 flex-1 flex flex-col">
        <div className="pb-3 mb-3 border-b border-m3-outline-variant/10">
          <div className="flex items-start justify-between gap-2 mb-2">
            <Skeleton className="h-5 w-2/3 bg-m3-surface-variant/50 rounded-m3-xs" />
            <Skeleton className="h-5 w-16 bg-m3-surface-variant/50 rounded-m3-xs" />
          </div>
          <Skeleton className="h-4 w-1/3 bg-m3-surface-variant/50 rounded-m3-xs" />
        </div>

        <div className="flex justify-between items-end mt-auto h-[38px]">
          <div className="space-y-1.5 w-full">
            <Skeleton className="h-3 w-8 bg-m3-surface-variant/50 rounded-m3-xs" />
            <Skeleton className="h-5 w-20 bg-m3-surface-variant/50 rounded-m3-xs" />
          </div>
        </div>
      </div>
      <CardFooter className="p-4 pt-0 gap-2 grid grid-cols-[1fr,1fr,auto]">
        <Skeleton className="h-9 w-full bg-m3-surface-variant/50 rounded-m3-full" />
        <Skeleton className="h-9 w-full bg-m3-surface-variant/50 rounded-m3-full" />
        <Skeleton className="h-9 w-10 bg-m3-surface-variant/50 rounded-m3-md" />
      </CardFooter>
    </Card>
  )
}
