"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    Tag,
    CheckCircle2,
    ExternalLink,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useMarketplace } from "@/hooks/use-marketplace"
import { EXPLORER_URL } from "@/lib/constants"
import { useTokenMetadata } from "@/hooks/use-token-metadata"
import { useRouter } from "next/navigation"


interface ListingDialogProps {
    trigger?: React.ReactNode
    asset: {
        id: string // contract-tokenId
        name: string
        image: string
        collectionAddress: string
        tokenId: string
    }
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

const DURATION_OPTIONS = [
    { value: "1d", label: "1 Day", seconds: 86400 },
    { value: "7d", label: "7 Days", seconds: 604800 },
    { value: "30d", label: "30 Days", seconds: 2592000 },
    { value: "180d", label: "6 Months", seconds: 15552000 },
]

// Determine supported currencies - ideally this comes from SUPPORTED_TOKENS directly
// But for schema defining at module level, we explicitly define the core valid ones
const SUPPORTED_CURRENCY_SYMBOLS = ["STRK", "USDC", "USDT"] as const;

// Strict form validation schema
const listingSchema = z.object({
    price: z.string()
        .min(1, { message: "Price is required" })
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
            message: "Price must be a positive number",
        })
        .refine((val) => {
            // Check for excessive decimals
            if (val.includes(".")) {
                const decimalPlaces = val.split(".")[1].length;
                return decimalPlaces <= 18; // generic cap, actual decimal limits per token handle later if needed
            }
            return true;
        }, {
            message: "Too many decimal places",
        }),
    currency: z.enum(SUPPORTED_CURRENCY_SYMBOLS, {
        required_error: "Please select a currency",
    }),
    durationSeconds: z.number().min(86400, "Duration must be at least 1 day"),
})

type ListingFormValues = z.infer<typeof listingSchema>

export function ListingDialog({ trigger, asset }: ListingDialogProps) {
    const { createListing, isProcessing, txHash, error, resetState } = useMarketplace()
    const metadata = useTokenMetadata(asset.tokenId, asset.collectionAddress)
    const { name: mName, image: mImage, loading: isLoadingMetadata } = metadata
    const router = useRouter()

    const displayName = mName || asset.name
    const displayImage = mImage || asset.image

    const [open, setOpen] = useState(false)

    // Derived state
    const stage = txHash ? "success" : isProcessing ? "processing" : error ? "error" : "input"

    // Initialize React Hook Form
    const form = useForm<ListingFormValues>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            price: "",
            currency: "USDC",
            durationSeconds: 2592000, // 30 days default
        },
    })

    const onSubmit = async (data: ListingFormValues) => {
        await createListing(
            asset.collectionAddress,
            asset.tokenId,
            data.price,
            data.currency,
            data.durationSeconds
        )
    }

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            const hadTxHash = !!txHash
            // Delay reset to avoid UI flicker during close animation
            setTimeout(() => {
                resetState()
                form.reset()
                if (hadTxHash) {
                    router.refresh()
                }
            }, 300)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[420px] bg-m3-surface text-m3-on-surface border-none shadow-m3-5 p-0 overflow-hidden sm:rounded-m3-2xl">
                <DialogHeader className="p-6 pb-2 relative z-10 text-left">
                    <DialogTitle className="text-2xl font-black tracking-tight text-m3-on-surface">List for Sale</DialogTitle>
                </DialogHeader>

                {stage === "success" ? (
                    <div className="p-8 flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
                        <div className="h-20 w-20 bg-m3-primary-container rounded-full flex items-center justify-center shadow-m3-1">
                            <CheckCircle2 className="h-10 w-10 text-m3-primary" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold tracking-tight text-m3-on-surface">Listing Live!</h2>
                            <p className="text-sm font-medium text-m3-on-surface-variant max-w-[280px]">
                                Your asset is now available for <span className="font-bold text-m3-on-surface">{form.getValues().price} {form.getValues().currency}</span> on the marketplace.
                            </p>
                        </div>
                        <div className="w-full space-y-3 pt-2 flex flex-col gap-2">
                            <Button asChild variant="default" className="w-full font-bold shadow-m3-1 rounded-m3-full h-11">
                                <Link href={`${EXPLORER_URL}/tx/${txHash}`} target="_blank" className="flex items-center justify-center gap-2">
                                    View Transaction <ExternalLink className="w-4 h-4" />
                                </Link>
                            </Button>
                            <Button variant="ghost" onClick={() => setOpen(false)} className="w-full h-11 rounded-m3-full font-bold text-m3-on-surface-variant">Done</Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 pt-2 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Compact Asset Preview */}
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
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-m3-on-surface truncate">{displayName}</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Badge variant="secondary" className="text-[10px] h-5 px-2 font-medium bg-m3-surface-container-highest text-m3-on-surface hover:bg-m3-surface-container-highest">#{asset.tokenId}</Badge>
                                    <p className="text-[9px] text-m3-on-surface-variant uppercase font-bold tracking-wider">Asset Listing</p>
                                </div>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2.5">
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant ml-1">
                                                Set Price
                                            </FormLabel>
                                            <div className="relative group">
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        step="any"
                                                        placeholder="0.00"
                                                        className="h-16 pl-5 pr-20 text-2xl font-black bg-m3-surface-container-high border-none focus-visible:ring-2 focus-visible:ring-m3-primary transition-all rounded-m3-xl shadow-inner text-m3-on-surface"
                                                        disabled={isProcessing}
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
                                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-m3-on-surface-variant ml-1">
                                                Listing Duration
                                            </FormLabel>
                                            <FormControl>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {DURATION_OPTIONS.map(opt => (
                                                        <Button
                                                            key={opt.value}
                                                            type="button"
                                                            variant={field.value === opt.seconds ? "default" : "tonal"}
                                                            size="sm"
                                                            onClick={() => field.onChange(opt.seconds)}
                                                            className={cn(
                                                                "h-10 text-[11px] font-bold uppercase tracking-tight rounded-m3-full transition-all",
                                                                field.value === opt.seconds ? "shadow-m3-1" : "hover:bg-m3-surface-container-highest"
                                                            )}
                                                            disabled={isProcessing}
                                                        >
                                                            {opt.label}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs ml-1" />
                                        </FormItem>
                                    )}
                                />

                                {stage === "error" && (
                                    <Alert className="bg-m3-error-container text-m3-on-error-container border-none animate-in shake-in-1 duration-300 rounded-m3-lg py-3 mt-4">
                                        <AlertCircle className="h-4 w-4 text-m3-error" />
                                        <AlertDescription className="text-xs font-medium pl-2">{error || "Listing failed. Please try again."}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="pt-4 flex flex-col gap-4">
                                    <Button
                                        type="submit"
                                        variant="default"
                                        disabled={isProcessing}
                                        className="w-full h-12 font-bold shadow-m3-2 rounded-m3-full text-base"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                <Tag className="w-5 h-5 mr-2" />
                                                Complete Listing
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-[11px] font-medium text-center text-m3-on-surface-variant px-4 leading-relaxed opacity-90">
                                        Listing is free. You will be prompted to sign a message and approve the asset for sale in one atomic transaction.
                                    </p>
                                </div>
                            </form>
                        </Form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

