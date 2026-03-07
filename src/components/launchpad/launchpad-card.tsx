"use client"

import { useRef, useCallback, type TouchEvent } from "react"
import {
    Shield,
    Grid3X3,
    RefreshCw,
    BookOpen,
    Sparkles,
    Layers,
    Crown,
    Ticket,
    RefreshCcw,
    Heart,
    CircleDollarSign,
    Gem,
    ArrowUpRight,
    Lock,
    type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion } from "framer-motion"

const iconMap: Record<string, LucideIcon> = {
    Shield, Grid3X3, RefreshCw, BookOpen, Sparkles, Layers,
    Crown, Ticket, RefreshCcw, Heart, CircleDollarSign, Gem,
}

export interface LaunchpadFeatureData {
    id: string
    title: string
    description: string
    icon: string
    href: string
    gradient: string
    tags: string[]
    active: boolean
}

export interface LaunchpadCardProps {
    feature: LaunchpadFeatureData
    index: number
    className?: string
}

export function LaunchpadCard({ feature, index, className }: LaunchpadCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const Icon = iconMap[feature.icon] || Shield
    const isActive = feature.active

    // Touch feedback — scale down on touchStart, release on touchEnd
    const handleTouchStart = useCallback(() => {
        if (!cardRef.current || !isActive) return
        cardRef.current.style.transform = "scale(0.97)"
    }, [isActive])
    // M3 Expressive eliminates hover scale/color changes. Interaction is purely physics-based touch/press.
    const card = (
        <motion.div
            whileTap={isActive ? { scale: 0.94 } : {}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={cn(
                "h-full rounded-[32px] overflow-hidden", // M3 massive organic curve
                isActive
                    ? "bg-m3-surface-container-lowest shadow-m3-1 hover:shadow-glow-blue hover:-translate-y-1 transition-all duration-300 border border-m3-outline-variant cursor-pointer"
                    : "bg-m3-surface-variant/30 border border-transparent opacity-60 cursor-default transition-all duration-300"
            )}
        >
            <div className="relative p-6 sm:p-8 flex flex-col h-full">
                {/* Row 1: icon + status */}
                <div className="flex items-start justify-between mb-6">
                    <div
                        className={cn(
                            "w-14 h-14 rounded-[20px] flex items-center justify-center", // Extremely rounded internal block
                            isActive
                                ? "bg-blue-600 text-white" // Solid vibrant M3 fill, no glows
                                : "bg-m3-surface-variant text-m3-on-surface-variant/50",
                        )}
                    >
                        <Icon className="h-6 w-6" />
                    </div>

                    {isActive ? (
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <ArrowUpRight className="h-5 w-5" />
                        </div>
                    ) : (
                        <Lock className="h-5 w-5 text-m3-on-surface-variant/30" />
                    )}
                </div>

                {/* Title */}
                <h3 className={cn(
                    "text-xl sm:text-2xl font-semibold mb-2 leading-tight tracking-tight",
                    isActive ? "text-m3-on-surface" : "text-m3-on-surface-variant/50"
                )}>
                    {feature.title}
                </h3>

                {/* Description */}
                <p className={cn(
                    "text-base leading-relaxed flex-1 max-w-[90%]",
                    isActive ? "text-m3-on-surface-variant" : "text-m3-on-surface-variant/40"
                )}>
                    {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                    {feature.tags.map((tag) => (
                        <span
                            key={tag}
                            className={cn(
                                "text-xs px-3 py-1 rounded-full font-medium tracking-wide",
                                isActive
                                    ? "bg-m3-surface-variant text-m3-on-surface-variant"
                                    : "bg-m3-surface-variant/30 text-m3-on-surface-variant/30"
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    )

    const wrapper = (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                delay: index * 0.05,
                duration: 0.4,
                ease: [0.2, 0, 0, 1] // M3 easing
            }}
            className={cn("h-full", className)}
        >
            {card}
        </motion.div>
    )

    if (isActive) {
        return (
            <Link href={feature.href} className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-[32px]">
                {wrapper}
            </Link>
        )
    }

    return wrapper
}
