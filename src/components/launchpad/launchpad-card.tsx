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

interface LaunchpadCardProps {
    feature: LaunchpadFeatureData
    index: number
}

export function LaunchpadCard({ feature, index }: LaunchpadCardProps) {
    const cardRef = useRef<HTMLDivElement>(null)
    const Icon = iconMap[feature.icon] || Shield
    const isActive = feature.active

    // Touch feedback — scale down on touchStart, release on touchEnd
    const handleTouchStart = useCallback(() => {
        if (!cardRef.current || !isActive) return
        cardRef.current.style.transform = "scale(0.97)"
    }, [isActive])

    const handleTouchEnd = useCallback(() => {
        if (!cardRef.current) return
        cardRef.current.style.transform = "scale(1)"
    }, [])

    const card = (
        <div
            ref={cardRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            className={cn(
                "h-full rounded-m3-2xl border transition-all duration-m3-medium ease-m3-standard",
                isActive
                    ? "bg-m3-surface-container shadow-m3-2 hover:shadow-m3-3 border-m3-outline-variant/15 cursor-pointer"
                    : "bg-m3-surface-container-low shadow-m3-1 border-m3-outline-variant/10 opacity-60 cursor-default",
            )}
        >
            <div className="relative z-[2] p-5 flex flex-col h-full">
                {/* Row 1: icon + status */}
                <div className="flex items-start justify-between mb-3">
                    <div
                        className={cn(
                            "w-10 h-10 rounded-m3-lg flex items-center justify-center",
                            isActive
                                ? "bg-m3-primary-container"
                                : "bg-m3-surface-variant",
                        )}
                    >
                        <Icon className={cn(
                            "h-[18px] w-[18px]",
                            isActive ? "text-m3-on-primary-container" : "text-m3-on-surface-variant/50"
                        )} />
                    </div>

                    {isActive ? (
                        <ArrowUpRight className="h-4 w-4 text-m3-on-surface-variant transition-transform duration-m3-short group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    ) : (
                        <Lock className="h-3 w-3 text-m3-on-surface-variant/30" />
                    )}
                </div>

                {/* Title */}
                <h3 className={cn(
                    "text-sm font-semibold mb-1 leading-tight",
                    isActive ? "text-m3-on-surface" : "text-m3-on-surface-variant/50"
                )}>
                    {feature.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-m3-on-surface-variant/60 leading-relaxed flex-1 line-clamp-2">
                    {feature.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                    {feature.tags.map((tag) => (
                        <span
                            key={tag}
                            className={cn(
                                "text-[9px] px-1.5 py-px rounded-m3-xs font-medium tracking-wide",
                                isActive
                                    ? "bg-m3-surface-container-highest text-m3-on-surface-variant"
                                    : "bg-m3-surface-variant/30 text-m3-on-surface-variant/30"
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )

    const wrapper = (
        <div className="stagger-in h-full group" style={{ animationDelay: `${index * 40}ms` }}>
            {card}
        </div>
    )

    if (isActive) {
        return (
            <Link href={feature.href} className="block h-full">
                {wrapper}
            </Link>
        )
    }

    return wrapper
}
