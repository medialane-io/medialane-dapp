
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, Layers, Users, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"
import { useMarketplaceListings } from "@/hooks/use-marketplace-events"

export function MarketplaceStats() {
    const { activeCount, totalVolume, allOrders, isLoading } = useMarketplaceListings();

    // Compute unique creators from all orders
    const uniqueCreators = new Set(allOrders.map(o => o.offerer)).size;

    const stats = [
        {
            label: "Total Orders",
            value: isLoading ? "..." : allOrders.length.toString(),
            change: totalVolume > 0 ? `${totalVolume} filled` : "0 filled",
            icon: Activity,
            gradient: "from-blue-500 to-cyan-500",
        },
        {
            label: "Active Listings",
            value: isLoading ? "..." : activeCount.toString(),
            change: "Live on-chain",
            icon: Layers,
            gradient: "from-violet-500 to-purple-500",
        },
        {
            label: "Unique Creators",
            value: isLoading ? "..." : uniqueCreators.toString(),
            change: "On-chain verified",
            icon: Users,
            gradient: "from-emerald-500 to-teal-500",
        },
        {
            label: "Protocol",
            value: "Medialane",
            change: "Sepolia Testnet",
            icon: TrendingUp,
            gradient: "from-amber-500 to-orange-500",
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4"
        >
            {stats.map((stat, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                >
                    <Card className="bg-m3-surface-container shadow-m3-1 border border-m3-outline-variant/20 rounded-m3-xl transition-shadow hover:shadow-m3-2 duration-m3-short group cursor-default">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 truncate">{stat.label}</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="text-lg md:text-2xl font-bold truncate">{stat.value}</h3>
                                        <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                                            {stat.change}
                                        </span>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon className="h-4 w-4 md:h-5 md:w-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </motion.div>
    )
}

