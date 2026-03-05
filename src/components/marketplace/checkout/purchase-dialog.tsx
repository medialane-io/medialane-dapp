"use client"

import { useState } from "react"
import { useAccount, useBalance } from "@starknet-react/core"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, CheckCircle2, ShoppingBag, ExternalLink, Shield } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { useMarketplace } from "@/hooks/use-marketplace"
import { Fulfillment } from "@/types/marketplace"
import { MarketplaceOrder } from "@/hooks/use-marketplace-events"
import { EXPLORER_URL } from "@/lib/constants"
import { useTokenMetadata } from "@/hooks/use-token-metadata"
import { isOwnListing } from "@/lib/ownership"

interface PurchaseDialogProps {
    trigger?: React.ReactNode
    asset: {
        id: string
        name: string
        price: string
        currency: string
        image: string
        collectionName: string
        listing?: MarketplaceOrder & { formattedPrice?: string; currencySymbol?: string }
    }
}

export function PurchaseDialog({ trigger, asset }: PurchaseDialogProps) {
    const { checkoutCart, isProcessing, txHash, error, resetState } = useMarketplace()
    const { address } = useAccount()
    const [open, setOpen] = useState(false)

    // Check Token Balance
    const considerationAmount = asset.listing?.considerationAmount
    const considerationToken = asset.listing?.considerationToken as `0x${string}` | undefined

    const { data: balanceData } = useBalance({
        address,
        token: considerationToken,
        watch: true
    })

    const hasInsufficientBalance = balanceData && considerationAmount
        ? balanceData.value < BigInt(considerationAmount)
        : false

    // Parse NFT Address and Token ID from asset.id (contract-tokenId)
    const [nftAddress, tokenId] = asset.id.split("-")
    const metadata = useTokenMetadata(tokenId, nftAddress)
    const { name: mName, image: mImage, loading: isLoadingMetadata } = metadata

    const displayName = mName || asset.name
    const displayImage = mImage || asset.image

    // Ownership guard
    const isOwn = isOwnListing(asset.listing?.offerer, address)

    // Derived state from hook
    const stage = txHash ? "success" : isProcessing ? "processing" : error ? "error" : "review"

    const handlePurchase = async () => {
        if (!asset.listing) {
            console.error("No listing data available for purchase")
            return
        }

        await checkoutCart([asset.listing])
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            setTimeout(() => {
                resetState()
            }, 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[420px] bg-card/90 backdrop-blur-3xl border-foreground/10 shadow-2xl overflow-hidden p-0">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-outrun-magenta via-outrun-purple to-neon-cyan" />
                <div className="p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold tracking-tight">Confirm Purchase</DialogTitle>
                    </DialogHeader>

                    {stage === "success" ? (
                        <div className="py-8 flex flex-col items-center text-center space-y-6">
                            <div className="h-20 w-20 bg-neon-cyan/20 rounded-full flex items-center justify-center shadow-glow shadow-neon-cyan/30">
                                <CheckCircle2 className="h-10 w-10 text-neon-cyan drop-shadow-lg" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight">Purchase Live!</h2>
                                <p className="text-sm text-muted-foreground w-64 mx-auto">
                                    You have successfully purchased <span className="font-semibold text-foreground">{asset.name}</span>
                                </p>
                            </div>
                            <div className="w-full space-y-3 pt-2">
                                <Button asChild variant="outline" className="w-full">
                                    <Link href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" className="flex items-center justify-center gap-2">
                                        View Transaction <ExternalLink className="w-4 h-4" />
                                    </Link>
                                </Button>
                                <Button onClick={() => setOpen(false)} className="w-full h-11">Done</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 pt-2">
                            {/* Asset Preview */}
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 group hover:bg-muted/40 transition-colors">
                                <div className="h-16 w-16 rounded-lg overflow-hidden border border-border/50 bg-background shrink-0 shadow-sm relative">
                                    {isLoadingMetadata ? (
                                        <div className="absolute inset-0 bg-muted animate-pulse" />
                                    ) : (
                                        <img
                                            src={displayImage}
                                            alt={displayName}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder.svg"
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{asset.collectionName}</p>
                                    <h3 className="font-bold text-foreground truncate">{displayName}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Badge variant="outline" className="text-[9px] h-4 py-0 font-medium bg-background/50">#{tokenId}</Badge>
                                        <span className="text-[10px] text-muted-foreground/60 font-medium">Verified IP</span>
                                    </div>
                                </div>
                            </div>

                            {/* Price Details */}
                            <div className="space-y-3 px-1">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Price</span>
                                    <span className="font-bold text-lg">{asset.price} {asset.currency}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Network Fee</span>
                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-[10px] font-bold">
                                        Sponsored
                                    </Badge>
                                </div>
                                <div className="h-px bg-border pt-2" />
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Total to Pay</span>
                                    <span className="font-bold text-xl">{asset.price} {asset.currency}</span>
                                </div>
                            </div>

                            <div className="bg-outrun-magenta/5 border border-outrun-magenta/20 rounded-xl p-4 flex gap-3 shadow-inner shadow-outrun-magenta/5">
                                <Shield className="w-4 h-4 text-outrun-magenta shrink-0 mt-0.5 opacity-80" />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-foreground/80">On-Chain Binding</p>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        You will be prompted to approve the total payable amount, which will immediately be swapped for the asset.
                                    </p>
                                </div>
                            </div>

                            {/* Error Display */}
                            {stage === "error" && (
                                <Alert className="bg-destructive/10 border-destructive/20 text-destructive animate-in shake-in-1 duration-300">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs font-medium ml-2">{error || "Transaction failed. Please try again."}</AlertDescription>
                                </Alert>
                            )}

                            {/* Balance Warning */}
                            {hasInsufficientBalance && (
                                <Alert className="bg-destructive/10 border-destructive/20 text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs font-medium ml-2">
                                        Insufficient balance. You need {asset.price} {asset.currency} to complete this purchase.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Own Asset Warning */}
                            {isOwn && (
                                <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription className="text-xs font-medium ml-2">
                                        You cannot purchase your own asset.
                                    </AlertDescription>
                                </Alert>
                            )}


                            <div className="flex items-center gap-3 pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setOpen(false)}
                                    disabled={stage === "processing"}
                                    className="flex-1 font-semibold text-muted-foreground"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePurchase}
                                    disabled={stage === "processing" || !asset.listing || hasInsufficientBalance || isOwn}
                                    className="flex-[2] h-12 font-bold shadow-glow-sm shadow-neon-cyan/30 text-white bg-outrun-purple hover:bg-outrun-purple/90 transition-all active:scale-[0.98]"
                                >
                                    {stage === "processing" ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingBag className="mr-2 h-4 w-4" />
                                            {hasInsufficientBalance ? "Insufficient Balance" : "Buy Now"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
