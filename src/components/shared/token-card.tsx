"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MotionCard } from "@/components/ui/motion-primitives";
import { ShoppingCart, Tag, ArrowRightLeft, X, Loader2, HandCoins } from "lucide-react";
import { cn, ipfsToHttp, formatDisplayPrice } from "@/lib/utils";
import { useCart } from "@/hooks/use-cart";
import { IpTypeBadge } from "@/components/shared/ip-type-badge";
import { CurrencyIcon } from "@/components/shared/currency-icon";
import { ListingDialog } from "@/components/marketplace/listing-dialog";
import { OfferDialog } from "@/components/marketplace/offer-dialog";
import type { RarityTier } from "@/lib/rarity";
import type { ApiToken } from "@medialane/sdk";

const RARITY_STYLE: Record<RarityTier, { label: string; className: string } | null> = {
  legendary: { label: "Legendary", className: "bg-yellow-400/90 text-yellow-900" },
  epic:      { label: "Epic",      className: "bg-purple-500/85 text-white" },
  rare:      { label: "Rare",      className: "bg-blue-500/85 text-white" },
  uncommon:  { label: "Uncommon",  className: "bg-emerald-500/85 text-white" },
  common:    null,
};

const BTN_SOLID = "h-8 text-xs rounded-[11px] font-semibold text-white hover:brightness-110 active:scale-[0.98] transition-all";
const BTN_OUTLINE = "h-8 w-8 p-0 shrink-0 rounded-[11px] border hover:brightness-110 active:scale-[0.98] transition-all";

interface TokenCardProps {
  token: ApiToken;
  showBuyButton?: boolean;
  onBuy?: (token: ApiToken) => void;
  onOffer?: (token: ApiToken) => void;
  onList?: (token: ApiToken) => void;
  onTransfer?: (token: ApiToken) => void;
  onCancel?: (token: ApiToken) => void;
  isOwner?: boolean;
  rarityTier?: RarityTier;
}

export function TokenCard({
  token,
  showBuyButton = true,
  onBuy,
  onOffer,
  onList,
  onTransfer,
  onCancel,
  isOwner = false,
  rarityTier,
}: TokenCardProps) {
  const { addItem, items } = useCart();
  const [imgError, setImgError] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);

  const name = token.metadata?.name || `Token #${token.tokenId}`;
  const image = ipfsToHttp(token.metadata?.image);
  const activeOrder = token.activeOrders?.[0];
  const inCart = activeOrder ? items.some((i) => i.orderHash === activeOrder.orderHash) : false;
  const assetHref = `/asset/${token.contractAddress}/${token.tokenId}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!activeOrder || inCart) return;
    addItem({
      orderHash: activeOrder.orderHash,
      nftContract: token.contractAddress,
      nftTokenId: token.tokenId,
      name,
      image,
      price: formatDisplayPrice(activeOrder.price.formatted),
      currency: activeOrder.price.currency ?? "",
      currencyDecimals: activeOrder.price.decimals,
      offerer: activeOrder.offerer ?? "",
      considerationToken: activeOrder.consideration.token ?? "",
      considerationAmount: activeOrder.consideration.startAmount ?? "",
    });
    toast.success("Added to cart", { description: name });
  };

  const handleOffer = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOffer) onOffer(token);
    else setOfferOpen(true);
  };

  const handleList = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onList) onList(token);
    else setListOpen(true);
  };

  function renderActions() {
    // Owner + listed
    if (isOwner && activeOrder) {
      return (
        <>
          {onCancel && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 h-8 text-xs text-destructive hover:text-destructive rounded-[11px]"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCancel(token); }}
            >
              <X className="h-3 w-3 mr-1" />Cancel
            </Button>
          )}
          {onTransfer && (
            <button
              className={cn(BTN_OUTLINE, "text-muted-foreground border-border/60")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTransfer(token); }}
              aria-label="Transfer"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      );
    }

    // Owner + unlisted
    if (isOwner && !activeOrder) {
      return (
        <>
          <Button
            size="sm"
            className={cn(BTN_SOLID, "flex-1 bg-brand-blue")}
            onClick={handleList}
          >
            <Tag className="h-3 w-3 mr-1" />List for sale
          </Button>
          {onTransfer && (
            <button
              className={cn(BTN_OUTLINE, "text-muted-foreground border-border/60")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onTransfer(token); }}
              aria-label="Transfer"
            >
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      );
    }

    // Non-owner + listed
    if (!isOwner && activeOrder) {
      return (
        <>
          {showBuyButton && onBuy && (
            <Button
              size="sm"
              className={cn(BTN_SOLID, "flex-1 bg-brand-purple")}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBuy(token); }}
            >
              Buy
            </Button>
          )}
          <button
            className={cn(BTN_OUTLINE, "text-muted-foreground border-border/60", inCart && "opacity-40")}
            onClick={handleAddToCart}
            disabled={inCart}
            aria-label={inCart ? "In cart" : "Add to cart"}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </button>
          <button
            className={cn(BTN_OUTLINE, "text-brand-orange border-brand-orange/40 hover:bg-brand-orange/10")}
            onClick={handleOffer}
            aria-label="Make an offer"
          >
            <HandCoins className="h-3.5 w-3.5" />
          </button>
        </>
      );
    }

    // Non-owner + unlisted: offer only
    if (!isOwner && !activeOrder) {
      return (
        <button
          className={cn(BTN_OUTLINE, "w-full text-brand-orange border-brand-orange/40 hover:bg-brand-orange/10")}
          onClick={handleOffer}
          aria-label="Make an offer"
        >
          <HandCoins className="h-3.5 w-3.5" />
        </button>
      );
    }

    return null;
  }

  const hasActions = isOwner || (!isOwner && activeOrder);

  return (
    <>
      <MotionCard className="card-base group relative">
        <Link href={assetHref} className="block relative">
          {/* Image */}
          <div className="relative aspect-square bg-muted overflow-hidden">
            {!imgError ? (
              <Image
                src={image}
                alt={name}
                fill
                className="object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-purple/15 to-brand-blue/15">
                <span className="text-2xl font-mono text-muted-foreground">#{token.tokenId}</span>
              </div>
            )}

            {/* IP type badge — top-left */}
            {token.metadata?.ipType && (
              <div className="absolute top-2 left-2 z-10">
                <IpTypeBadge ipType={token.metadata.ipType as any} size="sm" />
              </div>
            )}

            {/* Rarity tier — top-right */}
            {rarityTier && RARITY_STYLE[rarityTier] && (
              <div className="absolute top-2 right-2 z-10">
                <span className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded-md backdrop-blur-sm text-[10px] font-bold leading-none",
                  RARITY_STYLE[rarityTier]!.className
                )}>
                  {RARITY_STYLE[rarityTier]!.label}
                </span>
              </div>
            )}

            {/* Indexing indicator */}
            {(token.metadataStatus === "PENDING" || token.metadataStatus === "FETCHING") && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/85 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Indexing…</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className={cn("p-3 space-y-0.5", hasActions && "pb-14 sm:pb-3")}>
            <p className="font-bold text-xl truncate leading-snug">{name}</p>
            {activeOrder && (
              <p className="flex items-center gap-1 text-[11px] font-semibold text-foreground/80">
                <CurrencyIcon symbol={activeOrder.price.currency} size={11} />
                {formatDisplayPrice(activeOrder.price.formatted)}
                <span className="font-normal text-muted-foreground">{activeOrder.price.currency}</span>
              </p>
            )}
            {token.metadata?.description ? (
              <p className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">
                {token.metadata.description}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">#{token.tokenId}</p>
            )}
          </div>

          {/* Action bar */}
          {hasActions && (
            <div className={cn(
              "absolute bottom-0 inset-x-0 p-2 flex gap-2",
              "bg-background/90 backdrop-blur-sm border-t border-border/40",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-150"
            )}>
              {renderActions()}
            </div>
          )}
        </Link>
      </MotionCard>

      <ListingDialog
        open={listOpen}
        onOpenChange={setListOpen}
        assetContract={token.contractAddress}
        tokenId={token.tokenId}
        tokenName={name}
        tokenStandard={(token as any).standard}
        onSuccess={() => setListOpen(false)}
      />
      <OfferDialog
        open={offerOpen}
        onOpenChange={setOfferOpen}
        assetContract={token.contractAddress}
        tokenId={token.tokenId}
        tokenName={name}
        tokenStandard={(token as any).standard}
        onSuccess={() => setOfferOpen(false)}
      />
    </>
  );
}

export function TokenCardSkeleton() {
  return (
    <div className="card-base">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-3 space-y-2.5">
        <div className="space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
