"use client";

import { MarketplaceOrder } from "@/hooks/use-marketplace-events";
import { normalizeStarknetAddress } from "@/lib/utils";
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
        <Card className="overflow-hidden border-border/50 bg-card/10 backdrop-blur-sm hover:bg-card/20 transition-all duration-300 group shadow-sm hover:shadow-md rounded-xl border">
            <Link href={assetUrl} className="block relative aspect-square overflow-hidden bg-muted/30">
                {metadataLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/30" />
                    </div>
                ) : (
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-xs font-semibold flex items-center gap-1.5 translate-y-2 transition-transform duration-300">
                        View Item <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                    <div className={`${listing.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
                        listing.status === 'fulfilled' ? 'bg-blue-500/20 text-blue-400 border-blue-500/50' :
                            'bg-muted/50 text-muted-foreground border-foreground/10'
                        } backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border`}>
                        {listing.status}
                    </div>
                    <div className={`${isListing ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]' : 'bg-outrun-magenta/20 text-outrun-magenta border-outrun-magenta/50 shadow-[0_0_10px_rgba(255,0,255,0.2)]'} backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border`}>
                        {isListing ? 'Sale' : 'Offer'}
                    </div>
                </div>
            </Link>

            <CardContent className="p-4 bg-gradient-to-b from-transparent to-card/30">
                <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                        <h3 className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors" title={name}>
                            {name}
                        </h3>
                        <p className="text-[10px] text-muted-foreground/70 font-mono truncate" title={displayToken}>
                            {displayToken.slice(0, 6)}...{displayToken.slice(-4)}
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className={`text-sm font-black tracking-tight drop-shadow-sm ${isListing ? 'text-neon-cyan' : 'text-outrun-magenta'}`}>
                            {formattedPrice} <span className="text-[10px] font-bold ml-0.5">{currency.symbol}</span>
                        </p>
                        <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest">{isListing ? 'List Price' : 'Offer Price'}</p>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs font-bold border border-destructive/30 text-destructive hover:bg-destructive/20 hover:text-red-400 hover:border-destructive/50 hover:shadow-glow-sm hover:shadow-destructive/20 transition-all duration-300 rounded-lg group/btn"
                    onClick={() => onCancel?.(orderHash)}
                    disabled={(!isListing && !isBid) || listing.status !== 'active'}
                >
                    {isListing ? (
                        <>
                            <Trash2 className="w-3.5 h-3.5 mr-2 group-hover/btn:scale-110 transition-transform" />
                            Remove Listing
                        </>
                    ) : isBid ? (
                        listing.offerer === normalizeStarknetAddress(normalizeStarknetAddress("0x0")) // Place holder check, will improve
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
