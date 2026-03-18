"use client";

import { MarketplaceOrder } from "@/hooks/use-marketplace-events";
import { normalizeStarknetAddress, cn, formatPrice } from "@/lib/utils";
import { SUPPORTED_TOKENS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTokenMetadata } from "@/hooks/use-token-metadata";
import { formatDistanceToNow } from "date-fns";

interface PortfolioOrderItemProps {
    listing: MarketplaceOrder;
    onCancel?: (hash: string) => void;
}

export function PortfolioOrderItem({ listing, onCancel }: PortfolioOrderItemProps) {
    const {
        orderHash,
        offerToken, offerIdentifier, offerAmount, offerType,
        considerationToken, considerationIdentifier, considerationAmount, considerationType,
        startTime, status
    } = listing;

    // Detect Order Type
    const isListing = offerType === "ERC721" || offerType === "ERC1155";
    const isBid = considerationType === "ERC721" || considerationType === "ERC1155";

    // Display Data
    const displayToken = isListing ? offerToken : considerationToken;
    const displayIdentifier = isListing ? offerIdentifier : considerationIdentifier;
    const paymentToken = isListing ? considerationToken : offerToken;
    const paymentAmount = isListing ? considerationAmount : offerAmount;

    // Fetch metadata
    const { name, image, loading: metadataLoading } = useTokenMetadata(displayIdentifier, displayToken);

    // Resolve currency details
    const getCurrency = (tokenAddress: string) => {
        const normalized = normalizeStarknetAddress(tokenAddress).toLowerCase();
        for (const token of SUPPORTED_TOKENS) {
            const tokenNormalized = normalizeStarknetAddress(token.address).toLowerCase();
            if (tokenNormalized === normalized) {
                return { symbol: token.symbol, decimals: token.decimals };
            }
        }
        return { symbol: "TOKEN", decimals: 18 };
    };

    const currency = getCurrency(paymentToken);

    const formattedPrice = formatPrice(paymentAmount, currency.decimals);

    // Collection Offer routing
    const isCollectionOffer = isBid && displayIdentifier === "0";
    const assetUrl = isCollectionOffer ? `/collections/${displayToken}` : `/asset/${displayToken}-${displayIdentifier}`;
    const displayName = isCollectionOffer ? "Collection Offer (Any)" : (name || `Asset #${displayIdentifier}`);

    const timeText = startTime > 0 ? formatDistanceToNow(startTime * 1000, { addSuffix: true }) : "Recently";

    return (
        <div className="group grid grid-cols-1 md:grid-cols-[2.5fr_1fr_1.5fr_1.5fr_1fr_auto] items-center gap-4 p-4 rounded-2xl border border-m3-outline-variant/10 bg-m3-surface-container-low hover:bg-m3-surface-container transition-all duration-300 shadow-m3-1">
            {/* Mobile Row 1 / Desktop Cols 1 & 5: Item Info & Status */}
            <div className="flex justify-between items-start md:contents">
                <Link href={assetUrl} className="flex items-center gap-3 min-w-0">
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-m3-surface-container-highest shrink-0 border border-m3-outline-variant/10">
                        {!metadataLoading && image && (
                            <Image
                                src={image}
                                alt={name}
                                fill
                                className="object-cover"
                            />
                        )}
                    </div>
                    <div className="min-w-0 pr-4 block md:hidden">
                        <h4 className="text-sm font-bold truncate text-m3-on-surface group-hover:text-m3-primary transition-colors">
                            {displayName}
                        </h4>
                        <p className="text-[10px] text-m3-on-surface-variant font-medium truncate">
                            {displayToken.slice(0, 6)}...{displayToken.slice(-4)}
                        </p>
                    </div>
                    <div className="min-w-0 hidden md:block">
                        <h4 className="text-sm font-bold truncate text-m3-on-surface group-hover:text-m3-primary transition-colors">
                            {displayName}
                        </h4>
                        <p className="text-[10px] text-m3-on-surface-variant font-medium truncate">
                            {displayToken.slice(0, 6)}...{displayToken.slice(-4)}
                        </p>
                    </div>
                </Link>

                <div className="md:order-4 self-center">
                    <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                        status === 'active' ? 'bg-m3-tertiary-container/80 text-m3-on-tertiary-container border-m3-tertiary/20' :
                            status === 'fulfilled' ? 'bg-m3-primary-container/80 text-m3-on-primary-container border-m3-primary/20' :
                                'bg-m3-surface-variant/80 text-m3-on-surface-variant border-m3-outline/20'
                    )}>
                        {status}
                    </span>
                </div>
            </div>

            {/* Mobile Data Row / Desktop Cols 2 & 3: Type & Price */}
            <div className="flex justify-between items-center py-2 md:py-0 border-y border-m3-outline-variant/10 md:border-y-0 md:contents">
                <div className="text-xs font-bold text-m3-on-surface-variant md:order-1">
                    <span className={cn(
                        "block md:hidden mb-1 uppercase tracking-widest text-[9px] font-black opacity-60",
                        isListing ? 'text-m3-primary' : 'text-m3-secondary'
                    )}>
                        Type
                    </span>
                    <span className={isListing ? 'text-m3-primary' : 'text-m3-secondary'}>
                        {isListing ? 'Sale Listing' : 'Buy Offer'}
                    </span>
                </div>

                <div className="flex flex-col items-end md:items-start md:order-2">
                    <span className="text-[9px] font-black text-m3-on-surface-variant/60 uppercase tracking-widest block md:hidden mb-1">Price</span>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-m3-on-surface">{formattedPrice}</span>
                        <span className="text-[10px] font-bold text-m3-on-surface-variant uppercase">{currency.symbol}</span>
                    </div>
                </div>
            </div>

            {/* Mobile Footer Row / Desktop Cols 4 & 6: Time & Actions */}
            <div className="flex justify-between items-center pt-1 md:pt-0 md:contents">
                <div className="text-xs font-medium text-m3-on-surface-variant md:order-3 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black text-m3-on-surface-variant/50 block md:hidden">Listed:</span>
                    {timeText}
                </div>

                <div className="flex justify-end gap-2 md:order-5">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-9 md:w-9 md:p-0 px-4 rounded-xl bg-m3-surface-container-high hover:bg-m3-primary/10 hover:text-m3-primary transition-colors text-xs font-bold"
                        asChild
                    >
                        <Link href={assetUrl}>
                            <span className="block md:hidden mr-1">View</span>
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>

                    {status === 'active' && (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-9 md:w-9 md:p-0 px-4 rounded-xl bg-m3-error/10 text-m3-error hover:bg-m3-error hover:text-white transition-colors text-xs font-bold md:bg-transparent md:hover:bg-m3-error/10 md:hover:text-m3-error"
                            onClick={() => onCancel?.(orderHash)}
                            title="Cancel Order"
                        >
                            <span className="block md:hidden mr-1">Cancel</span>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
