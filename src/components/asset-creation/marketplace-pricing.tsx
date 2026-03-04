import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DollarSign, TrendingUp, Zap, Sparkles, ShieldCheck, Coins } from "lucide-react"
import type { AssetFormState } from "@/hooks/use-asset-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
                        className="h-14 text-xl font-bold pl-10 pr-16 bg-background/50 backdrop-blur-md border border-border/50 hover:border-outrun-cyan/40 focus:border-outrun-cyan focus:ring-1 focus:ring-outrun-cyan/30 transition-all rounded-lg shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <span className="text-xs font-black text-primary/50 tracking-tighter">USDC</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">
                    Setting a price ensures your asset is immediately tradable on our marketplace.
                </p>
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
                                "h-10 text-xs font-medium transition-all rounded-lg",
                                formState.listingDuration === opt.seconds ? "shadow-glow-sm shadow-outrun-purple/30 bg-outrun-purple text-white border-transparent" : "bg-muted/30 border-border/50 hover:bg-muted/50"
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
                <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        Ready to launch: Listed for {formState.listingPrice} USDC at mint
                    </span>
                </div>
            )}
        </div>
    )
}
