"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
    Home,
    Boxes,
    PlusCircle,
    LayoutGrid,
    User,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { M3_SPRING } from "@/lib/m3-motion"

const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Explore", icon: Boxes, href: "/marketplace" },
    { name: "Create", icon: PlusCircle, href: "/create", isFab: true },
    { name: "Collections", icon: LayoutGrid, href: "/collections" },
    { name: "Portfolio", icon: User, href: "/portfolio" },
]

/**
 * M3 Navigation Bar — mobile-only bottom nav with pill-shaped active indicators.
 * Touch-first: all feedback triggers on touchStart/touchEnd, no hover dependency.
 */
export function BottomNavBar() {
    const pathname = usePathname()

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-m3-surface-container shadow-m3-2 safe-area-bottom"
            role="navigation"
            aria-label="Main navigation"
        >
            <div className="flex items-center justify-around h-20 px-2">
                {navItems.map((item) => {
                    const isActive = item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 py-2 group"
                        >
                            <motion.div
                                className="relative flex items-center justify-center"
                                whileTap={{ scale: 0.92 }}
                                transition={M3_SPRING}
                            >
                                {/* Active pill indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 -inset-x-4 rounded-m3-full bg-m3-secondary-container"
                                        style={{ height: 32, top: -4 }}
                                        transition={M3_SPRING}
                                    />
                                )}

                                <item.icon
                                    className={cn(
                                        "relative z-10 w-6 h-6 transition-colors duration-m3-short",
                                        isActive
                                            ? "text-m3-on-secondary-container"
                                            : "text-m3-on-surface-variant"
                                    )}
                                />
                            </motion.div>

                            <span
                                className={cn(
                                    "text-[11px] font-medium leading-tight transition-colors duration-m3-short",
                                    isActive
                                        ? "text-m3-on-surface font-semibold"
                                        : "text-m3-on-surface-variant"
                                )}
                            >
                                {item.name}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
