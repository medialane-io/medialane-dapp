"use client"

import { useMemo } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Tag, Gavel, XCircle, Activity } from "lucide-react"
import { useMarketplaceListings } from "@/hooks/use-marketplace-events"
import { normalizeStarknetAddress } from "@/lib/utils"
import { formatPrice, lookupToken, formatTimeAgoFromUnix } from "@/lib/activity-ui"

interface AssetHistoryProps {
    nftAddress: string
    tokenId: string
}

type HistoryIconType = "cart" | "x-circle" | "tag" | "gavel"

function HistoryIcon({ type, color }: { type: HistoryIconType; color: string }) {
    switch (type) {
        case "cart":  return <ShoppingCart className={`h-4 w-4 ${color}`} />
        case "x-circle": return <XCircle className={`h-4 w-4 ${color}`} />
        case "tag":   return <Tag className={`h-4 w-4 ${color}`} />
        case "gavel": return <Gavel className={`h-4 w-4 ${color}`} />
    }
}

export function AssetHistory({ nftAddress, tokenId }: AssetHistoryProps) {
    const { allOrders } = useMarketplaceListings()

    const activityRows = useMemo(() => {
        if (!nftAddress || !tokenId || !allOrders.length) return []

        const normalizedNft = normalizeStarknetAddress(nftAddress).toLowerCase()
        let targetId: bigint
        try { targetId = BigInt(tokenId) } catch { return [] }

        return allOrders
            .filter(order => {
                try {
                    if (order.offerType === "ERC721") {
                        const oToken = normalizeStarknetAddress(order.offerToken).toLowerCase()
                        const oId = BigInt(order.offerIdentifier)
                        return oToken === normalizedNft && oId === targetId
                    }
                    if (order.offerType === "ERC20" && order.considerationType === "ERC721") {
                        const cToken = normalizeStarknetAddress(order.considerationToken).toLowerCase()
                        const cId = BigInt(order.considerationIdentifier)
                        return cToken === normalizedNft && cId === targetId
                    }
                    return false
                } catch {
                    return false
                }
            })
            .map(order => {
                const isListing = order.offerType === "ERC721"

                let eventType: string
                let iconType: HistoryIconType
                let iconColor: string

                if (isListing) {
                    if (order.status === "fulfilled") {
                        eventType = "Sale"
                        iconType = "cart"
                        iconColor = "text-green-400"
                    } else if (order.status === "cancelled") {
                        eventType = "Cancelled"
                        iconType = "x-circle"
                        iconColor = "text-red-400"
                    } else {
                        eventType = "Listed"
                        iconType = "tag"
                        iconColor = "text-blue-400"
                    }
                } else {
                    if (order.status === "fulfilled") {
                        eventType = "Offer Accepted"
                        iconType = "cart"
                        iconColor = "text-green-400"
                    } else if (order.status === "cancelled") {
                        eventType = "Offer Cancelled"
                        iconType = "x-circle"
                        iconColor = "text-red-400"
                    } else {
                        eventType = "Offer"
                        iconType = "gavel"
                        iconColor = "text-purple-400"
                    }
                }

                const priceToken = isListing ? order.considerationToken : order.offerToken
                const priceAmount = isListing ? order.considerationAmount : order.offerAmount
                const { symbol, decimals } = lookupToken(priceToken) ?? { symbol: "TOKEN", decimals: 18 }
                const price = `${formatPrice(priceAmount, decimals)} ${symbol}`

                return {
                    key: order.orderHash,
                    eventType,
                    iconType,
                    iconColor,
                    price,
                    from: `${order.offerer.slice(0, 6)}...${order.offerer.slice(-4)}`,
                    status: order.status,
                    date: formatTimeAgoFromUnix(order.startTime),
                    startTime: order.startTime,
                }
            })
            .sort((a, b) => b.startTime - a.startTime)
    }, [allOrders, nftAddress, tokenId])

    if (activityRows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-foreground/10 rounded-xl">
                <Activity className="h-8 w-8 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No activity yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Listings, offers, and sales will appear here</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border border-foreground/10 overflow-hidden">
            <Table>
                <TableHeader className="bg-foreground/5">
                    <TableRow className="border-foreground/10 hover:bg-foreground/5">
                        <TableHead>Event</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {activityRows.map(row => (
                        <TableRow key={row.key} className="border-foreground/10 hover:bg-foreground/5">
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <HistoryIcon type={row.iconType} color={row.iconColor} />
                                    {row.eventType}
                                </div>
                            </TableCell>
                            <TableCell>{row.price}</TableCell>
                            <TableCell className="text-blue-400 font-mono text-xs">{row.from}</TableCell>
                            <TableCell>
                                <Badge
                                    variant="secondary"
                                    className={
                                        row.status === "active"
                                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                                            : row.status === "fulfilled"
                                                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                                : "bg-red-500/10 text-red-400 border-red-500/20"
                                    }
                                >
                                    {row.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">{row.date}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
