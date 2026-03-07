"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface ShelfProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    href?: string
    notInLayoutPx?: boolean
}

export const Shelf = React.forwardRef<HTMLDivElement, ShelfProps>(
    ({ title, href, children, className, notInLayoutPx = false, ...props }, ref) => {
        return (
            <div className={cn("relative w-full overflow-hidden mb-8", className)} ref={ref} {...props}>
                {title && (
                    <div className={cn("flex justify-between items-center mb-6", !notInLayoutPx && "layout-px")}>
                        <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-m3-on-surface">
                            {title}
                        </h2>
                        {href && (
                            <Link
                                href={href}
                                className="group flex items-center text-sm font-medium text-m3-on-surface-variant hover:text-m3-primary transition-colors"
                            >
                                Explore
                                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                )}
                <div
                    className={cn(
                        "flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 items-stretch",
                        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    )}
                >
                    <div className="snap-start shrink-0 w-6 sm:w-10 lg:w-16" />
                    {React.Children.map(children, (child, index) => (
                        <div className={cn(
                            "snap-start shrink-0 w-[85vw] sm:w-[320px] md:w-[350px]",
                            index !== 0 && "ml-4 md:ml-6"
                        )}>
                            {child}
                        </div>
                    ))}
                    <div className="snap-start shrink-0 w-6 sm:w-10 lg:w-16" />
                </div>

                {/* Right edge fade for affordance */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-8 w-12 sm:w-24 bg-gradient-to-l from-background to-transparent opacity-80 z-10" />
            </div>
        )
    }
)
Shelf.displayName = "Shelf"
