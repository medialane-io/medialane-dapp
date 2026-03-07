"use client"

import { Button } from "@/components/ui/button"
import { ArrowRightLeft, History, Palette, Share2, AlertTriangle, ExternalLink, Check } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

interface AssetActionPanelProps {
    assetId: string
    slug: string
    isOwner: boolean
    nftAddress: string
    tokenId: string
    onTransferClick: () => void
    onReportClick: () => void
    assetName?: string
}

export function AssetActionPanel({
    assetId,
    slug,
    isOwner,
    nftAddress,
    tokenId,
    onTransferClick,
    onReportClick,
    assetName
}: AssetActionPanelProps) {
    const { toast } = useToast()
    const [copied, setCopied] = useState(false)
    const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://voyager.online";

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: assetName || "Asset",
                    text: `Check out ${assetName} on Medialane`,
                    url: window.location.href,
                })
            } catch (error) {
                console.error("Error sharing:", error)
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href)
                setCopied(true)
                toast({ title: "Link Copied", description: "Asset link copied to clipboard" })
                setTimeout(() => setCopied(false), 2000)
            } catch (error) {
                console.error("Failed to copy URL:", error)
            }
        }
    }

    const actionButtonClass = "h-10 justify-start w-full text-foreground hover:bg-accent hover:text-accent-foreground rounded-lg text-sm font-medium transition-colors"

    return (
        <div className="space-y-4">
            {/* Actions Card */}
            <div className="glass-panel p-4 space-y-2 rounded-2xl">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">Actions</h3>

                {isOwner && (
                    <Button variant="ghost" className={actionButtonClass} onClick={onTransferClick}>
                        <ArrowRightLeft className="mr-2.5 h-4 w-4 text-neon-cyan" />
                        Transfer Asset
                    </Button>
                )}


                <Link href={`/provenance/${slug}`} className="block">
                    <Button variant="ghost" className={`w-full ${actionButtonClass}`}>
                        <History className="mr-2.5 h-4 w-4 text-outrun-yellow" />
                        View Provenance
                    </Button>
                </Link>

                <div className="h-px bg-border/50 my-2" />

                <div className="grid grid-cols-2 gap-2">
                    <Button variant="ghost" className={actionButtonClass} onClick={handleShare}>
                        {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Share2 className="mr-2 h-4 w-4" />}
                        Share
                    </Button>

                    <Link target="_blank" rel="noopener noreferrer" href={`${EXPLORER_URL}/nft/${nftAddress}/${tokenId}`} className="block">
                        <Button variant="ghost" className={`w-full ${actionButtonClass}`}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Explorer
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Report Link */}
            <div className="flex justify-center">
                <Button variant="link" size="sm" className="text-xs text-muted-foreground/60 hover:text-destructive h-auto py-1" onClick={onReportClick}>
                    <AlertTriangle className="mr-1.5 h-3 w-3" />
                    Report Issue
                </Button>
            </div>
        </div>
    )
}
