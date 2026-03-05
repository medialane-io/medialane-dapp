"use client"

import * as React from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search, Plus, User } from "lucide-react"

export function FloatingHeader() {
    const { scrollY } = useScroll()
    const [isScrolled, setIsScrolled] = React.useState(false)

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0
        if (latest > 50 && latest > previous) {
            setIsScrolled(true)
        } else {
            setIsScrolled(false)
        }
    })

    return (
        <motion.header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                isScrolled ? "bg-black/50 backdrop-blur-xl border-b border-foreground/5 py-4" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-black font-bold text-lg group-hover:rotate-12 transition-transform">
                        M
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">medialane</span>
                </Link>

                {/* Center Nav */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {[
                        { name: "Marketplace", path: "/marketplace" },
                        { name: "Collections", path: "/collections" },
                        { name: "Creators", path: "/creator" },
                        { name: "Launchpad", path: "/create" }
                    ].map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2"
                        >
                            {/* {item.name === "Launchpad" && <Plus className="w-3 h-3 text-primary" />} */}
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-white/70 hover:text-white transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                    <Link href="/create">
                        <Button size="sm" className="bg-white text-black hover:bg-foreground/90 font-medium rounded-full px-6">
                            + Create
                        </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-foreground/10 rounded-full gap-2">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                        Sign In
                    </Button>
                </div>
            </div>
        </motion.header>
    )
}
