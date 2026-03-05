
"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles, Search } from "lucide-react"
import Link from "next/link"

export function MarketplaceHero() {
    return (
        <div className="relative overflow-hidden pt-24 pb-12 lg:pt-28 lg:pb-16">
            {/* Animated Gradient Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-outrun-magenta/30 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 40, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-neon-cyan/25 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ x: [0, 30, 0], y: [0, 30, 0], scale: [1, 1.05, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/3 right-1/3 w-1/4 h-1/4 bg-gradient-radial from-outrun-purple/20 to-transparent rounded-full blur-3xl"
                />
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill border-neon-cyan/30 text-neon-cyan shadow-glow-sm shadow-neon-cyan/20 text-sm font-medium"
                    >
                        <Sparkles className="w-4 h-4 text-neon-cyan" />
                        <span>Discover the Integrity Web</span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                            The Marketplace for{" "}
                        </span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
                            Programmable IP
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg text-muted-foreground max-w-2xl"
                    >
                        Buy, sell, and license intellectual property with verified ownership and programmable rights on Starknet.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 pt-2"
                    >
                        <Button
                            size="lg"
                            className="rounded-full px-6 gradient-vivid-accent shadow-lg"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            Explore Assets
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full px-6 glass hover:bg-foreground/10 border-foreground/20"
                            asChild
                        >
                            <Link href="/create">
                                Start Selling <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
