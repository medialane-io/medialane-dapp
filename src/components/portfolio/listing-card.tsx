"use client";

import { MarketplaceOrder } from "@/hooks/use-marketplace-events";
import { normalizeStarknetAddress, cn } from "@/lib/utils";
import { SUPPORTED_TOKENS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ExternalLink, Trash2, Tag, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTokenMetadata } from "@/hooks/use-token-metadata";

interface ListingCardProps {
    listing: MarketplaceOrder;
    onCancel?: (hash: string) => void;
}

export function ListingCard({ listing, onCancel }: ListingCardProps) {
    const {
        orderHash,
        offerToken, offerIdentifier, offerAmount, offerType,
        considerationToken, considerationIdentifier, considerationAmount, considerationType
    } = listing;

    // Detect Order Type
    // Typically: strings returned by decodeShortString
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

    // Price formatting matching use-listing.ts logic
    const formatPrice = (amount: string, decimals: number) => {
        try {
            const val = BigInt(amount);
            return (Number(val) / Math.pow(10, decimals)).toFixed(decimals <= 6 ? 2 : 4);
        } catch (e) {
            return "0";
        }
    };

    const formattedPrice = formatPrice(paymentAmount, currency.decimals);

    // Asset URL (using contract-id format)
    const assetUrl = `/asset/${displayToken}-${displayIdentifier}`;

    return (
        <Card className="overflow-hidden bg-m3-surface-container-low border-m3-outline-variant/10 hover:bg-m3-surface-container transition-all duration-300 group shadow-m3-1 hover:shadow-m3-2 rounded-2xl border">
            <Link href={assetUrl} className="block relative aspect-square overflow-hidden bg-m3-surface-container-highest">
                {metadataLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-m3-on-surface-variant/30" />
                    </div>
                ) : (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-bold flex items-center gap-1.5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                        View Item <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md",
                        listing.status === 'active' ? 'bg-m3-tertiary-container/80 text-m3-on-tertiary-container border-m3-tertiary/20' :
                            listing.status === 'fulfilled' ? 'bg-m3-primary-container/80 text-m3-on-primary-container border-m3-primary/20' :
                                'bg-m3-surface-variant/80 text-m3-on-surface-variant border-m3-outline/20'
                    )}>
                        {listing.status}
                    </div>
                    <div className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border backdrop-blur-md",
                        isListing ? 'bg-m3-secondary-container/80 text-m3-on-secondary-container border-m3-secondary/20' :
                            'bg-m3-error-container/80 text-m3-on-error-container border-m3-error/20'
                    )}>
                        {isListing ? 'Sale' : 'Offer'}
                    </div>
                </div>
            </Link>

            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                        <h3 className="font-bold text-sm truncate text-m3-on-surface group-hover:text-m3-primary transition-colors" title={name}>
                            {name}
                        </h3>
                        <p className="text-[10px] text-m3-on-surface-variant font-medium truncate" title={displayToken}>
                            {displayToken.slice(0, 6)}...{displayToken.slice(-4)}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={cn(
                            "text-sm font-black tracking-tight",
                            isListing ? 'text-m3-primary' : 'text-m3-tertiary'
                        )}>
                            {formattedPrice} <span className="text-[10px] font-bold ml-0.5">{currency.symbol}</span>
                        </p>
                        <p className="text-[9px] font-black text-m3-on-surface-variant/60 uppercase tracking-widest">{isListing ? 'List Price' : 'Offer Price'}</p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-bold border-m3-error/30 text-m3-error hover:bg-m3-error/10 hover:text-m3-error hover:border-m3-error/50 transition-all duration-300 rounded-xl group/btn h-10"
                    onClick={() => onCancel?.(orderHash)}
                    disabled={(!isListing && !isBid) || listing.status !== 'active'}
                >
                    {isListing ? (
                        <>
                            <Trash2 className="w-3.5 h-3.5 mr-2 group-hover/btn:scale-110 transition-transform" />
                            Remove Listing
                        </>
                    ) : isBid ? (
                        listing.offerer === normalizeStarknetAddress("0x0")
                            ? "Accept Offer"
                            : (
                                <>
                                    <Trash2 className="w-3.5 h-3.5 mr-2 group-hover/btn:scale-110 transition-transform" />
                                    {listing.status === 'active' ? "Cancel Bid" : listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                                </>
                            )
                    ) : (
                        "Manage"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
