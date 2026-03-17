import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, TrendingUp, Zap, Sparkles, ShieldCheck, Coins } from "lucide-react"
import type { AssetFormState } from "@/hooks/use-asset-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SUPPORTED_TOKENS } from "@/lib/constants"

const DURATION_OPTIONS = [
    { value: "1d", label: "1 Day", seconds: 86400 },
    { value: "7d", label: "7 Days", seconds: 604800 },
    { value: "30d", label: "30 Days", seconds: 2592000 },
    { value: "180d", label: "6 Months", seconds: 15552000 },
]

interface MarketplacePricingProps {
    formState: any
    updateFormField: (field: string, value: any) => void
}

export function MarketplacePricing({ formState, updateFormField }: MarketplacePricingProps) {
    const hasPrice = formState.listingPrice && parseFloat(formState.listingPrice) > 0

    return (
        <div className="space-y-6 pt-6 border-t mt-6">
            <div className="space-y-2">
                <Label htmlFor="listing-price" className="text-base font-medium flex items-center gap-2">
                    <Coins className="h-4 w-4 text-muted-foreground" />
                    Marketplace Listing
                </Label>
                <div className="relative group/input">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-primary group-focus-within/input:scale-110 transition-transform" />
                    </div>
                    <Input
                        id="listing-price"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formState.listingPrice}
                        onChange={(e) => {
                            updateFormField("listingPrice", e.target.value)
                            // Auto-enable listing when price is entered
                            if (e.target.value && parseFloat(e.target.value) > 0) {
                                updateFormField("listOnMarketplace", true)
                            } else {
                                updateFormField("listOnMarketplace", false)
                            }
                        }}
                        className="h-14 text-xl font-bold pl-10 pr-16 bg-m3-surface-container-highest border border-m3-outline-variant/40 hover:border-m3-primary/50 focus:border-m3-primary focus:ring-1 focus:ring-m3-primary/30 transition-all duration-m3-medium ease-m3-standard rounded-m3-md shadow-m3-1"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-xs font-black text-primary/50 tracking-tighter">
                            {formState.listingCurrency || "USDC"}
                        </span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Setting a price ensures your asset is immediately tradable on our marketplace.
                </p>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    Listing Currency
                </Label>
                <div className="flex flex-wrap gap-2">
                    {SUPPORTED_TOKENS.map((token) => (
                        <Button
                            key={token.symbol}
                            type="button"
                            variant={(formState.listingCurrency || "USDC") === token.symbol ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFormField("listingCurrency", token.symbol)}
                            className={cn(
                                "h-9 px-4 text-xs font-bold rounded-full transition-all border",
                                (formState.listingCurrency || "USDC") === token.symbol
                                    ? "bg-m3-secondary-container text-m3-on-secondary-container border-transparent shadow-m3-1"
                                    : "bg-m3-surface-container-low border-m3-outline-variant/40 text-m3-on-surface hover:bg-m3-surface-container"
                            )}
                        >
                            {token.symbol}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-medium">
                    Listing Duration
                </Label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {DURATION_OPTIONS.map(opt => (
                        <Button
                            key={opt.value}
                            type="button"
                            variant={formState.listingDuration === opt.seconds ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFormField("listingDuration", opt.seconds)}
                            className={cn(
                                "h-10 text-xs font-bold transition-all duration-m3-medium ease-m3-standard rounded-m3-full border",
                                formState.listingDuration === opt.seconds
                                    ? "bg-m3-secondary-container text-m3-on-secondary-container border-transparent shadow-m3-1"
                                    : "bg-m3-surface-container-low border-m3-outline-variant/40 text-m3-on-surface hover:bg-m3-surface-container"
                            )}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                    * Assets will be auto-listed upon minting
                </p>
            </div>

            {hasPrice && (
                <div className="flex items-center justify-center gap-2 p-3 rounded-m3-md bg-m3-primary-container border border-m3-primary/20 animate-in fade-in slide-in-from-top-2 duration-m3-medium">
                    <Zap className="h-4 w-4 text-m3-on-primary-container" />
                    <span className="text-xs font-semibold text-m3-on-primary-container">
                        Ready to launch: Listed for {formState.listingPrice} {formState.listingCurrency || "USDC"} at mint
                    </span>
                </div>
            )}
        </div>
    )
}
