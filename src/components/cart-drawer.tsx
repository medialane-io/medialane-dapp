"use client";

import { useCart, useCartTotals, useCheckout } from "@/store/use-cart";
import { useAccount } from "@starknet-react/core";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Loader2, AlertTriangle } from "lucide-react";
import { CartItemRow } from "@/components/cart-item-row";
import { isOwnListing } from "@/lib/ownership";

export function CartDrawer() {
    const { items, isOpen, setIsOpen, removeItem, clearCart } = useCart();
    const { address } = useAccount();
    const totals = useCartTotals();
    const { checkout, isProcessing } = useCheckout();

    // Defensive: filter out own assets from display (handles stale persisted data)
    const displayItems = items.filter(
        (i) => !isOwnListing(i.listing.offerer, address)
    );
    const ownItemCount = items.length - displayItems.length;

    const handleCheckout = async () => {
        await checkout();
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent className="w-full sm:max-w-md flex flex-col glass-heavy text-foreground p-0">
                <SheetHeader className="p-6 border-b border-foreground/10">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2 text-xl">
                            <ShoppingBag className="w-5 h-5 text-outrun-cyan" />
                            Your Cart
                            <span className="text-sm font-normal text-muted-foreground ml-2">
                                ({displayItems.length} items)
                            </span>
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                    {displayItems.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                            <ShoppingBag className="w-12 h-12 opacity-20" />
                            <p>Your cart is empty</p>
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="mt-4"
                            >
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <ScrollArea className="h-full p-6">
                            <div className="space-y-4">
                                {ownItemCount > 0 && (
                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                        {ownItemCount} item{ownItemCount > 1 ? "s" : ""} removed — you own {ownItemCount > 1 ? "these assets" : "this asset"}
                                    </div>
                                )}
                                {displayItems.map((item) => (
                                    <CartItemRow
                                        key={item.listing.orderHash}
                                        item={item}
                                        onRemove={removeItem}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {displayItems.length > 0 && (
                    <div className="p-6 border-t border-border/40 bg-card mt-auto space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-1">
                                <span>Total</span>
                            </div>
                            {totals.map((total) => (
                                <div key={total.symbol} className="flex justify-between items-end">
                                    <span className="text-xs text-muted-foreground uppercase">{total.symbol}</span>
                                    <span className="text-xl font-bold tracking-tight">
                                        {total.formatted} <span className="text-sm font-normal text-muted-foreground">{total.symbol}</span>
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={clearCart}
                            >
                                Clear
                            </Button>
                            <Button
                                className="flex-[2] font-semibold transition-all"
                                onClick={handleCheckout}
                                disabled={isProcessing}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Checkout"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
