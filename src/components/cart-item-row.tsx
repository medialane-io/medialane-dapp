"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { getCurrency, formatPrice } from "@/lib/utils";
import type { CartItem } from "@/store/use-cart";

interface CartItemRowProps {
    item: CartItem;
    onRemove: (orderHash: string) => void;
}

export function CartItemRow({ item, onRemove }: CartItemRowProps) {
    const name = item.asset.name || "Unknown Asset";
    const image = item.asset.image || "/placeholder.svg";
    const currency = getCurrency(item.listing.considerationToken);
    const price = formatPrice(item.listing.considerationAmount, currency.decimals);

    return (
        <div className="flex items-start gap-4 p-3 rounded-lg border border-m3-outline-variant/30 bg-m3-surface-variant/10">
            <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover"
                    unoptimized={image.startsWith("http")}
                />
            </div>
            <div className="flex-1 min-w-0 pr-2">
                <h4 className="font-semibold text-sm truncate" title={name}>
                    {name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                    {item.collectionName}
                </p>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="font-medium text-foreground">{price}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">
                        {currency.symbol}
                    </span>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 mt-2"
                onClick={() => onRemove(item.listing.orderHash)}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </div>
    );
}
