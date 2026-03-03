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
                    <div className="flex justify-between items-end px-4 sm:px-6 lg:px-12 xl:px-20 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-1 bg-outrun-cyan rounded-full"></div>
                            <h2 className="text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-foreground/80">
                                {title}
                            </h2>
                        </div>
                        {href && (
                            <Link
                                href={href}
                                className="group flex items-center text-[10px] sm:text-xs font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-[0.15em]"
                            >
                                Explore
                                <ChevronRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </Link>
                        )}
                    </div>
                )}
                <div
                    className={cn(
                        "flex w-full gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 px-4 sm:px-6 lg:px-12 xl:px-20 items-stretch",
                        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    )}
                >
                    {React.Children.map(children, (child) => (
                        <div className="snap-start shrink-0 w-[85vw] sm:w-[320px] md:w-[350px]">
                            {child}
                        </div>
                    ))}
                </div>

                {/* Right edge fade for affordance */}
                <div className="pointer-events-none absolute right-0 top-0 bottom-8 w-12 sm:w-24 bg-gradient-to-l from-background to-transparent opacity-80 z-10" />
            </div>
        )
    }
)
Shelf.displayName = "Shelf"
