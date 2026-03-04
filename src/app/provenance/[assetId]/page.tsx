"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2, Clock, Loader2 } from "lucide-react"
import Link from "next/link"

import { AssetProvenance } from "@/components/asset-provenance/asset-provenance"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"

import { AssetErrorBoundary } from "@/components/asset/asset-error-boundary"
import { useMemo, useCallback, use } from "react"
import { useAsset } from "@/hooks/use-asset"
import { useAssetProvenanceEvents } from "@/hooks/use-events"
import { useMarketplaceListings } from "@/hooks/use-marketplace-events"
import { normalizeStarknetAddress } from "@/lib/utils"

function reload(): void {
  if (typeof window !== 'undefined' && typeof window.location?.reload === 'function') {
    window.location.reload();
  }
}

const extractErrorMessage = (error: string): string => {
  if (error.toLowerCase().includes("invalid token id")) return "This asset doesn't exist or has been removed."
  if (error.includes("Contract error")) return "Something went wrong with this asset. Please try again."
  if (error.includes("Connection timeout") || error.includes("RPC:")) return "Unable to connect to the network. Please check your connection and try again."
  return "Something went wrong. Please try again."
}

interface ProvenancePageProps {
  params: Promise<{
    assetId: string
  }>
}

export default function ProvenancePage({ params }: ProvenancePageProps) {
  const { assetId } = use(params)

  // Parse assetId to get contractAddress and Token ID
  const [contractAddress, tokenId] = useMemo(() => {
    if (!assetId) return ["", ""]
    const parts = assetId.split("-")
    if (parts.length < 2) return ["", ""]
    const token = parts.pop()
    const address = parts.join("-")
    return [address, token]
  }, [assetId])

  const { asset, loading: assetLoading, loadingState, error: assetError, uiState, showSkeleton, notFound } = useAsset(contractAddress as `0x${string}`, Number(tokenId))

  // Debug log to check addresses and owner
  console.log(`[ProvenancePage] URL Address: ${contractAddress}, Asset NFT Address: ${asset?.nftAddress}, TokenID: ${tokenId}, Owner: ${asset?.owner}`);

  // Extract collection ID if available from asset (passed as string or undefined)
  const collectionId = asset?.collectionId;

  const { events: provenanceEventsRaw, isLoading: eventsLoading, error: eventsError } = useAssetProvenanceEvents(contractAddress, tokenId || "", collectionId)
  const { allOrders, isLoading: marketplaceLoading } = useMarketplaceListings()

  const isLoading = uiState === 'loading' || showSkeleton || eventsLoading || marketplaceLoading
  const error = assetError || eventsError

  const provenanceEvents = useMemo(() => {
    const combinedEvents: any[] = []

    if (provenanceEventsRaw && provenanceEventsRaw.length > 0) {
      combinedEvents.push(...provenanceEventsRaw.map((event) => {
        const isMint = event.type === "mint"
        const from = event.from || "0x0"
        const to = event.to || "Unknown"
        const timestamp = event.timestamp ? new Date(event.timestamp) : new Date();

        return {
          id: event.id,
          type: isMint ? "mint" : "transfer",
          title: event.title || (isMint ? "Asset Minted" : "Ownership Transferred"),
          description: event.description || (isMint
            ? `Asset minted by ${to.substring(0, 6)}...${to.substring(to.length - 4)}`
            : `Transferred from ${from.substring(0, 6)}...${from.substring(from.length - 4)} to ${to.substring(0, 6)}...${to.substring(to.length - 4)}`),
          from,
          to,
          date: timestamp.toLocaleDateString(),
          timestamp: timestamp.toISOString(),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          verified: true,
        }
      }))
    }

    if (allOrders && allOrders.length > 0 && contractAddress && tokenId) {
      const normalizedNft = normalizeStarknetAddress(contractAddress).toLowerCase();
      let targetId: bigint;
      try {
        targetId = BigInt(tokenId);

        const assetOrders = allOrders.filter(order => {
          try {
            if (order.offerType === "ERC721") {
              const oToken = normalizeStarknetAddress(order.offerToken).toLowerCase();
              const oId = BigInt(order.offerIdentifier);
              return oToken === normalizedNft && oId === targetId;
            }
            if (order.offerType === "ERC20" && order.considerationType === "ERC721") {
              const cToken = normalizeStarknetAddress(order.considerationToken).toLowerCase();
              const cId = BigInt(order.considerationIdentifier);
              return cToken === normalizedNft && cId === targetId;
            }
            return false;
          } catch { return false; }
        });

        const { lookupToken, formatPrice } = require("@/lib/activity-ui");

        assetOrders.forEach(order => {
          const isListing = order.offerType === "ERC721";
          let type: "list" | "sale" | "offer" | "cancel" | "accept" = "list";
          let title = "";
          let description = "";

          if (isListing) {
            if (order.status === "fulfilled") { type = "sale"; title = "Asset Sold"; description = "Purchased on marketplace"; }
            else if (order.status === "cancelled") { type = "cancel"; title = "Listing Cancelled"; description = "Seller removed the listing"; }
            else { type = "list"; title = "Asset Listed"; description = "Listed for sale on marketplace"; }
          } else {
            if (order.status === "fulfilled") { type = "accept"; title = "Offer Accepted"; description = "Owner accepted an offer"; }
            else if (order.status === "cancelled") { type = "cancel"; title = "Offer Cancelled"; description = "Buyer rescinded offer"; }
            else { type = "offer"; title = "Offer Placed"; description = "User made an offer"; }
          }

          const priceToken = isListing ? order.considerationToken : order.offerToken;
          const priceAmount = isListing ? order.considerationAmount : order.offerAmount;
          const { symbol, decimals } = lookupToken ? lookupToken(priceToken) ?? { symbol: "TOKEN", decimals: 18 } : { symbol: "USDC", decimals: 6 };
          const priceString = formatPrice ? `${formatPrice(priceAmount, decimals)} ${symbol}` : "Price Data";

          combinedEvents.push({
            id: order.orderHash,
            type,
            title,
            description,
            from: order.offerer,
            price: priceString,
            timestamp: new Date(order.startTime * 1000).toISOString(),
            transactionHash: order.transactionHash,
            blockNumber: order.blockNumber,
            verified: true,
          });
        });
      } catch (e) {
        console.warn("Failed to parse asset events", e);
      }
    }

    return combinedEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [provenanceEventsRaw, allOrders, contractAddress, tokenId])

  const enhancedAsset = useMemo(() => {
    if (!asset) return null;

    // improved creator detection from provenance
    // The 'to' address of the creation/mint event is the original creator
    const mintEvent = provenanceEvents.find(e => e.type === "mint");
    const minterAddress = mintEvent?.to || asset.properties?.creator as string;

    // logic to determine display name
    let creatorName = "Unknown Creator";
    if (asset.collectionName) {
      creatorName = asset.collectionName;
    } else if (typeof asset.properties?.creator === 'string' && !asset.properties.creator.startsWith("0x")) {
      creatorName = asset.properties.creator;
    } else if (minterAddress && typeof minterAddress === 'string' && minterAddress !== "Unknown") {
      creatorName = `${minterAddress.substring(0, 6)}...${minterAddress.substring(minterAddress.length - 4)}`;
    }

    return {
      id: asset.id,
      name: asset.name,
      type: asset.type || "Asset",
      creator: {
        name: creatorName,
        address: minterAddress || "Unknown",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      currentOwner: {
        name: asset.owner ? `${String(asset.owner).substring(0, 6)}...` : "Unknown",
        address: asset.owner ? String(asset.owner) : "0x0",
        avatar: "/placeholder.svg?height=40&width=40",
        verified: true,
      },
      creationDate: asset.registrationDate || new Date().toISOString(),
      registrationDate: asset.registrationDate || new Date().toISOString(),
      blockchain: "Starknet",
      contract: asset.nftAddress,
      tokenId: asset.tokenId.toString(),
      image: asset.image || "/placeholder.svg",
      description: asset.description || "",
      fingerprint: asset.ipfsCid ? `ipfs://${asset.ipfsCid}` : `sha256:${Math.random().toString(16).substr(2, 64)}`,
    } as any
  }, [asset, provenanceEvents]);

  if (isLoading) {
    return (
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto py-10 min-h-screen">
        <PageHeader
          title="Provenance"
          description="Track the complete history of ownership and events for this asset onchain."
        />
        <div className="space-y-12 animate-in fade-in duration-500 mt-10">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 min-h-[500px]">
            {/* Main Hero Image Skeleton */}
            <div className="relative w-full lg:w-1/2 h-[400px] lg:h-[500px] flex-shrink-0">
              <Skeleton className="w-full h-full rounded-2xl bg-muted/20" />

              {/* Loading Message Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-xl bg-background/50 backdrop-blur-md flex items-center justify-center mb-4 border border-border/10 shadow-sm">
                  <Clock className="h-8 w-8 text-muted-foreground/80 animate-pulse" />
                </div>
                <div className="bg-background/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-border/10 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground/90 animate-pulse mb-1">Retrieving onchain history...</h3>
                  <p className="text-xs text-muted-foreground font-light">
                    Fetching immutable lineage and verifying cryptographic proofs.
                  </p>
                </div>
              </div>
            </div>
            {/* Content Skeleton */}
            <div className="flex-1 flex flex-col justify-center space-y-10 lg:py-6 w-full">
              <div className="space-y-4">
                <Skeleton className="h-12 w-3/4 bg-muted/20" />
                <Skeleton className="h-6 w-full bg-muted/20" />
                <Skeleton className="h-6 w-5/6 bg-muted/20" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Skeleton className="h-3 w-16 bg-muted/20" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-muted/20" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-3 w-16 bg-muted/20" />
                  <Skeleton className="h-16 w-full rounded-2xl bg-muted/20" />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-border/20">
                <div className="space-y-2"><Skeleton className="h-3 w-16 bg-muted/20" /><Skeleton className="h-5 w-24 bg-muted/20" /></div>
                <div className="space-y-2"><Skeleton className="h-3 w-16 bg-muted/20" /><Skeleton className="h-5 w-24 bg-muted/20" /></div>
              </div>
            </div>
          </div>

          {/* Timeline Skeleton */}
          <section className="w-full mx-auto space-y-10 pt-12">
            <div className="space-y-4 flex flex-col items-center px-4">
              <Skeleton className="h-10 w-64 bg-muted/20" />
              <Skeleton className="h-5 w-80 bg-muted/20" />
            </div>

            <div className="relative space-y-6 px-4 py-8">
              <div className="absolute left-[35px] sm:left-[39px] top-0 bottom-0 w-px bg-muted/20" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative pl-12 sm:pl-14">
                  <Skeleton className="absolute left-0 top-1 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-muted/20" />
                  <Skeleton className="h-24 w-full rounded-2xl bg-muted/20" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    )
  }

  if (uiState === 'error' || error) {
    return (
      <main className="w-full flex flex-col items-center justify-center min-h-[70vh] p-12 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">{extractErrorMessage(typeof error === 'string' ? error : (error as any)?.message || 'Error loading provenance')}</div>
        </div>
        <button
          onClick={reload}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </main>
    )
  }

  if (uiState === 'not_found' || notFound || !asset) {
    return (
      <>

        <div className="min-h-screen py-10">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Provenance Not Found</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The asset provenance history you're looking for doesn't exist or could not be loaded.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <Button variant="outline">Start</Button>
              </Link>
              <Link href="/assets">
                <Button>Explore</Button>
              </Link>
            </div>
          </div>
        </div>

      </>
    )
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${asset.name} - Asset Provenance`,
          text: `View the complete ownership history of ${asset.name}`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href)
      } catch (error) {
        console.error("Failed to copy URL:", error)
      }
    }
  }

  return (
    <AssetErrorBoundary onRetry={reload}>
      <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto py-10">
        <PageHeader
          title="Provenance"
          description="Track the complete history of ownership and events for this asset onchain."
        />

        <AssetProvenance asset={enhancedAsset} events={provenanceEvents} showActions={true} compact={false} />
      </main>
    </AssetErrorBoundary>
  )
}
