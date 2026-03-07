"use client"

import { CreatorStatsBar } from "@/components/create/creator-stats-bar"
import { motion } from "framer-motion"
import {
    Sparkles,
    Shield,
    Grid3X3,
    RefreshCw,
    Layers,
    ArrowUpRight,
    Clock,
    Package,
    ChevronRight,
    Star,
    TrendingUp,
    Coins,
    FolderPlus,
    FileText
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/page-header"

export function LaunchpadContent() {
    return (
        <div className="relative">
            <CreatorStatsBar />

            {/* Standard Page Header */}
            <PageHeader
                title="Creator Launchpad"
                description="Your refined terminal for intellectual property. Launch and own every asset with professional grade tools."
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6">
                {/* LEFT: Primary Feature Column */}
                <div className="lg:col-span-8 space-y-8">

                    {/* HERO: Collection Drop */}
                    <motion.div
                        whileTap={{ scale: 0.985 }}
                        className="group relative overflow-hidden bg-m3-surface-container-lowest border border-m3-outline-variant rounded-[32px] p-8 sm:p-10 shadow-m3-1 hover:shadow-m3-2 transition-shadow"
                    >
                        {/* Gradient Accent Top */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500" />

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="max-w-xl">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl bg-orange-500/10 ring-1 ring-orange-500/30 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                        <Layers className="h-6 w-6" />
                                    </div>
                                    <Badge className="bg-orange-500/10 text-orange-500 border-none font-semibold tracking-wider uppercase text-[10px] px-2.5">Featured Tool</Badge>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold text-m3-on-surface mb-4 tracking-tight">
                                    Launch a Collection Drop
                                </h2>
                                <p className="text-base text-m3-on-surface-variant leading-relaxed mb-6 font-medium">
                                    Build a premium NFT drop with dedicated minting mechanics and built-in community storytelling.
                                </p>

                                {/* Rich Metadata Pills */}
                                <div className="flex flex-wrap gap-3 mb-8">
                                    <div className="flex items-center gap-2 text-xs font-bold text-m3-on-surface-variant bg-m3-surface-variant/40 px-3 py-1.5 rounded-full">
                                        <Clock className="h-3.5 w-3.5" /> 2-5 min
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-m3-on-surface-variant bg-m3-surface-variant/40 px-3 py-1.5 rounded-full">
                                        <Coins className="h-3.5 w-3.5" /> Zero Fee
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-m3-on-surface-variant bg-m3-surface-variant/40 px-3 py-1.5 rounded-full">
                                        <Star className="h-3.5 w-3.5" /> Advanced
                                    </div>
                                </div>

                                <Link href="/create/collection">
                                    <Button variant="premium" className="rounded-full h-11 px-6 group">
                                        Get Started
                                        <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="hidden md:block pr-4">
                                <div className="w-32 h-32 rounded-full border-4 border-orange-500/10 flex items-center justify-center relative">
                                    <Layers className="h-10 w-10 text-orange-500/30" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* SECONDARY ROW: Single Mint & Standard Collection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <FeatureCard
                            title="Single NFT Asset"
                            description="Quick-register individual assets directly into your studio."
                            icon={FileText}
                            color="cyan"
                            href="/create/asset"
                            time="1 min"
                            difficulty="Simple"
                        />
                        <FeatureCard
                            title="Standard Collection"
                            description="Group related assets manually without a complex drop page."
                            icon={FolderPlus}
                            color="purple"
                            href="/create/collection"
                            time="2 min"
                            difficulty="Moderate"
                        />
                    </div>
                </div>

                {/* RIGHT: Quick Action Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-m3-surface-container-low border border-m3-outline-variant rounded-[32px] p-6 sm:p-8">
                        <h3 className="text-base font-bold text-m3-on-surface mb-6 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-m3-primary" />
                            Quick Actions
                        </h3>

                        <div className="space-y-3">
                            <QuickActionItem
                                title="Start from Template"
                                description="Optimized blueprints for creators."
                                icon={Grid3X3}
                                href="/create/templates"
                            />
                        </div>

                        <div className="mt-8 pt-8 border-t border-m3-outline-variant/30">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-4">Resources</p>
                            <div className="flex flex-col gap-2">
                                <Link href="#" className="flex items-center justify-between group p-1.5">
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-m3-primary transition-colors">Documentation</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-30 transition-opacity" />
                                </Link>
                                <Link href="#" className="flex items-center justify-between group p-1.5">
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-m3-primary transition-colors">Creator Grants</span>
                                    <ArrowUpRight className="h-3.5 w-3.5 opacity-30 transition-opacity" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Ecosystem Tools */}
            <div className="mt-16">
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-foreground/90 tracking-tight mb-2">Ecosystem Tools</h3>
                    <p className="text-sm text-foreground/70 font-medium">Modular extensions to expand your IP utility.</p>
                </div>

                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4 lg:-mx-0">
                    {ecosystemTools.map((tool) => (
                        <motion.div
                            key={tool.id}
                            whileTap={{ scale: 0.98 }}
                            className="min-w-[280px] bg-m3-surface-container-low border border-m3-outline-variant rounded-[28px] p-8 group relative overflow-hidden"
                        >
                            <div className="w-12 h-12 rounded-xl bg-m3-surface-container-high flex items-center justify-center mb-6">
                                <tool.icon className="h-6 w-6 text-m3-on-surface-variant/70" />
                            </div>
                            <h4 className="text-lg font-bold text-m3-on-surface mb-2">{tool.title}</h4>
                            <p className="text-sm text-m3-on-surface-variant leading-relaxed font-medium mb-6">
                                {tool.description}
                            </p>
                            <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-m3-outline-variant/50 py-1">Coming Q2</Badge>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ title, description, icon: Icon, color, href, time, difficulty }: any) {
    const colorClasses = {
        cyan: "from-blue-500 to-cyan-500",
        purple: "from-purple-500 to-pink-500",
        orange: "from-orange-500 to-red-500"
    }[color as 'cyan' | 'purple' | 'orange']

    return (
        <motion.div
            whileTap={{ scale: 0.975 }}
            className="group relative bg-m3-surface-container-lowest border border-m3-outline-variant rounded-[28px] p-8 shadow-m3-1 hover:shadow-m3-2 transition-all"
        >
            <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", colorClasses)} />

            <div className="flex items-start justify-between mb-8">
                <div className={cn(
                    "p-3 rounded-xl ring-1 transition-transform group-hover:scale-105 duration-500",
                    color === 'cyan' ? "bg-blue-500/10 ring-blue-500/30 text-blue-500" :
                        color === 'purple' ? "bg-purple-500/10 ring-purple-500/30 text-purple-500" :
                            "bg-orange-500/10 ring-orange-500/30 text-orange-500"
                )}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground tracking-wide uppercase">
                        <Clock className="h-3 w-3" /> {time}
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-m3-outline-variant/30">{difficulty}</Badge>
                </div>
            </div>

            <h3 className="text-lg font-bold text-m3-on-surface mb-2.5">{title}</h3>
            <p className="text-sm text-m3-on-surface-variant font-medium leading-relaxed mb-8">
                {description}
            </p>

            <Link href={href}>
                <Button variant="premium" className="w-full gap-2 group/btn h-10 px-4 text-xs font-bold">
                    Get Started
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
            </Link>
        </motion.div>
    )
}

function QuickActionItem({ title, description, icon: Icon, href, highlight }: any) {
    return (
        <Link href={href}>
            <motion.div
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "p-4 rounded-[20px] border border-m3-outline-variant transition-all hover:bg-m3-surface-container-high group",
                    highlight ? "bg-m3-primary/5 border-m3-primary/10" : "bg-m3-surface-container-highest/20"
                )}
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "p-2 rounded-lg transition-transform group-hover:scale-105",
                        highlight ? "bg-m3-primary text-m3-on-primary" : "bg-m3-surface-container-highest text-m3-on-surface-variant"
                    )}>
                        <Icon className="h-4 w-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-m3-on-surface">{title}</h4>
                        <p className="text-[11px] text-muted-foreground font-medium">{description}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-20 group-hover:translate-x-0.5 transition-all text-muted-foreground" />
                </div>
            </motion.div>
        </Link>
    )
}

const ecosystemTools = [
    {
        id: "ip-clubs",
        title: "IP Clubs",
        description: "Communities for fans.",
        icon: Shield
    },
    {
        id: "ip-tickets",
        title: "IP Tickets",
        description: "NFT tickets.",
        icon: Package
    },
    {
        id: "crowdfunding",
        title: "Crowdfunding",
        description: "Community funding.",
        icon: Sparkles
    },
    {
        id: "creator-coin",
        title: "Creator Coin",
        description: "Personal economies.",
        icon: Package
    }
]
