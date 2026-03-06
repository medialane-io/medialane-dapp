"use client"

import * as React from "react"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface ShelfProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    href?: string
}

export const Shelf = React.forwardRef<HTMLDivElement, ShelfProps>(
    ({ title, href, children, className, ...props }, ref) => {
        return (
            <div className={cn("relative w-full overflow-hidden mb-8", className)} ref={ref} {...props}>
                {title && (
                    <div className="flex justify-between items-center mb-6">
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
                        "flex w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] xl:w-[calc(100%+5rem)] overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 items-stretch layout-bleed",
                        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    )}
                >
                    <div className="snap-start shrink-0 w-4 sm:w-6 lg:w-8 xl:w-10" />
                    {React.Children.map(children, (child, index) => (
                        <div className={cn(
                            "snap-start shrink-0 w-[85vw] sm:w-[320px] md:w-[350px]",
                            index !== 0 && "ml-4 md:ml-6"
                        )}>
                            {child}
                        </div>
                    ))}
                    <div className="snap-start shrink-0 w-4 sm:w-6 lg:w-8 xl:w-10" />
                </div>

                {/* Right edge fade for affordance */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-8 w-12 sm:w-24 bg-gradient-to-l from-background to-transparent opacity-80 z-10" />
            </div>
        )
    }
)
Shelf.displayName = "Shelf"
