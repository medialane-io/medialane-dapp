"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Loader2,
    AlertCircle,
    HandCoins,
    Shield,
    CheckCircle2,
    ExternalLink,
    Clock,
    TrendingUp,
    Info,
    Sparkles
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"

interface OfferDialogProps {
    trigger?: React.ReactNode
    asset: {
        id: string
        name: string
        floorPrice?: string
        currency: string
        image: string
        collectionName: string
        nftAddress: string
        tokenId: string
    }
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

const DURATION_OPTIONS = [
    { value: "1d", label: "1 Day", seconds: 86400 },
    { value: "3d", label: "3 Days", seconds: 2592000 },
    { value: "7d", label: "7 Days", seconds: 604800 },
    { value: "14d", label: "14 Days", seconds: 1209600 },
    { value: "30d", label: "1 Month", seconds: 2592000 },
]

import { useMarketplace } from "@/hooks/use-marketplace"
import { ItemType } from "@/types/marketplace"
import { useAccount } from "@starknet-react/core"
import { SUPPORTED_TOKENS, EXPLORER_URL } from "@/lib/constants"
import { useTokenMetadata } from "@/hooks/use-token-metadata"

const SUPPORTED_CURRENCY_SYMBOLS = ["STRK", "USDC", "USDT"] as const;

const offerSchema = z.object({
    price: z.string()
        .min(1, { message: "Price is required" })
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Amount must be greater than zero",
        }),
    currency: z.enum(SUPPORTED_CURRENCY_SYMBOLS, {
        required_error: "Currency is required",
    }),
    durationSeconds: z.number().min(86400, "Duration must be at least 1 day"),
})

type OfferFormValues = z.infer<typeof offerSchema>

export function OfferDialog({ trigger, asset, isOpen: controlledOpen, onOpenChange: setControlledOpen }: OfferDialogProps) {
    const { address } = useAccount()
    const { makeOffer, isProcessing, txHash, error, resetState } = useMarketplace()
    const { metadata: metadataRaw } = { metadata: useTokenMetadata(asset.tokenId, asset.nftAddress) }
    const { name: mName, image: mImage, loading: isLoadingMetadata } = metadataRaw
    const router = useRouter()

    const [internalOpen, setInternalOpen] = useState(false)
    const isOpen = controlledOpen ?? internalOpen
    const setIsOpen = setControlledOpen ?? setInternalOpen

    const form = useForm<OfferFormValues>({
        resolver: zodResolver(offerSchema),
        defaultValues: {
            price: "",
            currency: "USDC",
            durationSeconds: 604800, // 7 days default
        },
    })

    const stage = txHash ? "success" : isProcessing ? "processing" : "form"

    const displayName = mName || asset.name
    const displayImage = mImage || asset.image
    const displayCollection = metadataRaw?.description ? asset.collectionName : asset.collectionName

    const onSubmit = async (data: OfferFormValues) => {
        if (!address) return

        await makeOffer(
            asset.nftAddress,
            asset.tokenId,
            data.price,
            data.currency,
            data.durationSeconds
        )
    }

    const reset = () => {
        resetState()
        form.reset()
    }

    const floorPrice = asset.floorPrice

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) {
                const hadTxHash = !!txHash
                setTimeout(() => {
                    reset()
                    if (hadTxHash) {
                        router.refresh()
                    }
                }, 300)
            }
        }}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[420px] bg-m3-surface text-m3-on-surface border-none shadow-m3-5 p-0 overflow-hidden sm:rounded-m3-2xl">
                <div className="p-6 space-y-6 relative">
                    <DialogHeader className="px-1 text-left">
                        <DialogTitle className="text-2xl font-black tracking-tight text-m3-on-surface">Make an Offer</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-m3-on-surface-variant">
                            Create a binding offer for this digital asset.
                        </DialogDescription>
                    </DialogHeader>

                    {stage === "success" ? (
                        <div className="py-2 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="h-20 w-20 bg-m3-primary-container rounded-full flex items-center justify-center shadow-m3-1">
                                <CheckCircle2 className="h-10 w-10 text-m3-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold tracking-tight text-m3-on-surface">Offer Live!</h2>
                                <p className="text-sm font-medium text-m3-on-surface-variant max-w-[280px]">
                                    Your offer of <span className="font-bold text-m3-on-surface">{form.getValues().price} {form.getValues().currency}</span> has been broadcast to the network.
                                </p>
                            </div>

                            <div className="w-full bg-m3-surface-container rounded-m3-xl p-4 space-y-3 text-sm shadow-m3-1">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-m3-on-surface-variant uppercase font-bold tracking-wider">Expires In</span>
                                    <span className="font-bold text-m3-on-surface">{DURATION_OPTIONS.find(o => o.seconds === form.getValues().durationSeconds)?.label}</span>
                                </div>
                                <Separator className="bg-m3-outline-variant/30" />
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-m3-on-surface-variant uppercase font-bold tracking-wider">Transaction</span>
                                    <Link
                                        href={`${EXPLORER_URL}/tx/${txHash}`}
                                        target="_blank"
                                        className="flex items-center gap-1.5 text-m3-primary hover:text-m3-primary/80 transition-colors font-bold"
                                    >
                                        <span className="font-mono">{txHash ? `${txHash.slice(0, 10)}...` : ""}</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 w-full pt-2">
                                <Button
                                    className="w-full font-bold shadow-m3-1 rounded-m3-full h-11"
                                    variant="default"
                                    asChild
                                >
                                    <Link href="/portfolio/assets">
                                        View in Portfolio
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full h-11 rounded-m3-full font-bold text-m3-on-surface-variant"
                                >
                                    Dismiss
                                </Button>
                            </div>
                        </div>
                    ) : stage === "processing" ? (
                        <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
                            <div className="h-20 w-20 bg-m3-surface-container-high rounded-full flex items-center justify-center shadow-m3-1 mb-2">
                                <Loader2 className="h-8 w-8 animate-spin text-m3-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold tracking-tight text-m3-on-surface">Processing Offer</h2>
                                <p className="text-sm font-medium text-m3-on-surface-variant max-w-[260px] mx-auto">
                                    Approving & registering your offer on-chain. Please confirm the transaction in your wallet.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-4 p-4 rounded-m3-xl bg-m3-surface-container shadow-m3-1 transition-colors">
                                <div className="h-16 w-16 rounded-m3-md overflow-hidden bg-m3-surface-container-high shrink-0 relative">
                                    {isLoadingMetadata ? (
                                        <div className="absolute inset-0 bg-m3-surface-container-highest animate-pulse" />
                                    ) : (
                                        <img
                                            src={displayImage}
                                            alt={displayName}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "/placeholder.svg"
                                            }}
                                        />
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="text-[10px] text-m3-on-surface-variant uppercase font-bold tracking-widest">{displayCollection}</p>
                                        {floorPrice && (
                                            <p className="text-[10px] font-bold text-m3-primary">FLOOR: {floorPrice} {asset.currency}</p>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-m3-on-surface truncate">{displayName}</h3>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <Badge variant="secondary" className="text-[10px] h-5 px-2 font-medium bg-m3-surface-container-highest text-m3-on-surface hover:bg-m3-surface-container-highest">#{asset.tokenId}</Badge>
                                        <span className="text-[10px] text-m3-on-surface-variant font-medium">Verified IP</span>
                                    </div>
                                </div>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2.5">
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant flex justify-between ml-1">
                                                    Amount
                                                    {field.value && floorPrice && parseFloat(field.value) < parseFloat(floorPrice) && (
                                                        <span className="text-m3-error font-bold lowercase flex items-center gap-1">
                                                            <Info className="h-3 w-3" />
                                                            below floor
                                                        </span>
                                                    )}
                                                </FormLabel>
                                                <div className="relative group">
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            step="any"
                                                            placeholder="0.00"
                                                            className="h-16 pl-5 pr-20 text-2xl font-black bg-m3-surface-container-high border-none focus-visible:ring-2 focus-visible:ring-m3-primary transition-all rounded-m3-xl shadow-inner text-m3-on-surface"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                                        <span className="text-sm font-black text-m3-primary select-none">
                                                            {form.watch("currency")}
                                                        </span>
                                                    </div>
                                                </div>
                                                <FormMessage className="text-xs ml-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="durationSeconds"
                                        render={({ field }) => (
                                            <FormItem className="space-y-2.5">
                                                <FormLabel className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant flex items-center gap-2 ml-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    Expiration
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="grid grid-cols-5 gap-2">
                                                        {DURATION_OPTIONS.map((option) => (
                                                            <Button
                                                                key={option.value}
                                                                type="button"
                                                                variant={field.value === option.seconds ? "default" : "tonal"}
                                                                size="sm"
                                                                onClick={() => field.onChange(option.seconds)}
                                                                className={cn(
                                                                    "h-10 text-[10px] font-bold uppercase tracking-tight rounded-m3-full transition-all",
                                                                    field.value === option.seconds ? "shadow-m3-1" : "hover:bg-m3-surface-container-highest"
                                                                )}
                                                            >
                                                                {option.label}
                                                            </Button>
                                                        ))}
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs ml-1" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="bg-m3-secondary-container rounded-m3-xl p-4 flex gap-3 shadow-m3-1 mt-6">
                                        <Shield className="w-5 h-5 text-m3-on-secondary-container shrink-0" />
                                        <div className="space-y-1 text-m3-on-secondary-container">
                                            <p className="text-xs font-bold">On-Chain Binding</p>
                                            <p className="text-[11px] font-medium leading-relaxed opacity-90">
                                                Your offer remains valid until it expires or is cancelled. Only the amount specified will be transferable from your wallet.
                                            </p>
                                        </div>
                                    </div>

                                    {error && (
                                        <Alert className="bg-m3-error-container text-m3-on-error-container border-none animate-in shake-in-1 duration-300 rounded-m3-lg p-3">
                                            <AlertCircle className="h-4 w-4 text-m3-error" />
                                            <AlertDescription className="text-xs font-medium ml-2">{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="flex items-center gap-3 pt-6 pb-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsOpen(false)}
                                            disabled={isProcessing}
                                            className="flex-1 h-12 font-bold text-m3-on-surface rounded-m3-full"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="default"
                                            disabled={!form.watch("price") || isProcessing}
                                            className="flex-[2] h-12 font-bold shadow-m3-2 rounded-m3-full text-base"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processing
                                                </>
                                            ) : (
                                                <>
                                                    <HandCoins className="w-5 h-5 mr-2" />
                                                    Place Offer
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
