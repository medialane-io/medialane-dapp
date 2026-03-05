"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Layers, Grid3X3 } from "lucide-react"
import { motion } from "framer-motion"

interface MarketplaceTabsProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

const tabs = [
    { id: "all", label: "All Assets", icon: Grid3X3 },
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "recent", label: "Recent", icon: Clock },
    { id: "collections", label: "Collections", icon: Layers },
]

export function MarketplaceTabs({ activeTab, onTabChange }: MarketplaceTabsProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList className="w-full justify-start h-auto p-1 bg-foreground/5 backdrop-blur-xl border border-foreground/10 rounded-xl gap-1">
                    {tabs.map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg data-[state=active]:bg-foreground/10 data-[state=active]:text-foreground data-[state=active]:shadow-lg data-[state=active]:shadow-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-200"
                        >
                            <tab.icon className="h-4 w-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </motion.div>
    )
}
