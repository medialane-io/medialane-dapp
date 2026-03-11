"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Rocket, Layers } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useFeaturedCollections } from "@/hooks/use-collection"
import { M3_EMPHASIZED, M3_EASED } from "@/lib/m3-motion"

export function FullScreenHero() {
    const { collections, loading } = useFeaturedCollections([1, 2, 4]);
    const [currentSlide, setCurrentSlide] = React.useState(0)
    const [isHovering, setIsHovering] = React.useState(false)

    const slides = collections.length > 0 ? collections.map((col) => ({
        id: col.id,
        title: col.name,
        description: col.description || "",
        category: col.type || "Collection",
        image: col.image,
        href: `/collections/${col.nftAddress || col.id}`,
        creator: col.owner ? `${col.owner.substring(0, 6)}...${col.owner.substring(col.owner.length - 4)}` : "Unknown"
    })) : []

    const nextSlide = React.useCallback(() => {
        if (slides.length > 1) {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }
    }, [slides.length])

    React.useEffect(() => {
        if (slides.length <= 1 || isHovering) return
        const timer = setInterval(nextSlide, 7000)
        return () => clearInterval(timer)
    }, [nextSlide, slides.length, isHovering])

    React.useEffect(() => {
        if (!loading && collections.length > 0) {
            setCurrentSlide(0)
        }
    }, [loading, collections.length])

    const activeSlide = slides[currentSlide]

    // Loading/Default state
    if (loading || slides.length === 0) {
        return (
            <div className="relative w-full h-[100svh] overflow-hidden bg-[#0A0A0A]">
                <div className="relative z-10 w-full h-full flex flex-col justify-center items-center px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={M3_EMPHASIZED}
                        className="max-w-4xl flex flex-col items-center"
                    >
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-8" />
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-4">
                            Discovering Collections
                        </h1>
                    </motion.div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-[100svh] overflow-hidden bg-[#0A0A0A]">
            {/* Full Screen Image with Crossfade */}
            <AnimatePresence mode="popLayout">
                <motion.div
                    key={activeSlide.id}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: [0.2, 0, 0, 1] }}
                    className="absolute inset-0"
                >
                    {/* Dark gradient overlay for text readability - heavier on the bottom and left */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/90 via-[#0A0A0A]/40 to-transparent z-10 w-[70%]" />

                    <Image
                        src={activeSlide.image}
                        alt={activeSlide.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </motion.div>
            </AnimatePresence>

            {/* Main Content Area - Left aligned, pushed to bottom half */}
            <div className="relative z-20 w-full h-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-24 flex items-end pb-32 md:pb-40">
                <div className="w-full flex flex-col lg:flex-row justify-between items-end gap-12">

                    {/* Text Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`content-${activeSlide.id}`}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -30, opacity: 0 }}
                            transition={{ duration: 0.6, ease: [0.2, 0, 0, 1], delay: 0.1 }}
                            className="max-w-2xl w-full"
                        >
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider uppercase text-white mb-6 border border-white/10"
                            >
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                {activeSlide.category}
                            </motion.div>

                            <Link href={activeSlide.href}>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 text-white hover:text-white/90 transition-colors drop-shadow-2xl leading-[0.9]">
                                    {activeSlide.title}
                                </h1>
                            </Link>

                            <p className="text-lg md:text-xl text-white/70 mb-8 line-clamp-2 md:line-clamp-3 font-medium max-w-xl text-balance">
                                {activeSlide.description || `Explore the exclusive ${activeSlide.title} collection by ${activeSlide.creator}. Discover unique digital assets on Medialane.`}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <Button size="lg" className="bg-white text-black hover:bg-neutral-200 text-base h-14 px-8 rounded-full font-bold shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105" asChild>
                                    <Link href={activeSlide.href}>
                                        Explore Collection
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" className="text-white border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 h-14 px-8 rounded-full font-bold text-base transition-all hover:scale-105" asChild>
                                    <Link href="/create">
                                        Creator Studio
                                    </Link>
                                </Button>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Cards (Right Aligned) */}
                    {slides.length > 1 && (
                        <div
                            className="hidden lg:flex gap-4 items-end justify-end w-full max-w-[600px] perspective-[1000px]"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            {slides.map((slide, index) => {
                                const isActive = index === currentSlide;
                                return (
                                    <motion.button
                                        key={`nav-${slide.id}`}
                                        onClick={() => setCurrentSlide(index)}
                                        className="relative rounded-2xl overflow-hidden cursor-pointer group outline-none"
                                        animate={{
                                            width: isActive ? 220 : 120,
                                            height: isActive ? 320 : 180,
                                            opacity: isActive ? 1 : 0.5,
                                            y: isActive ? 0 : 20,
                                        }}
                                        whileHover={{
                                            opacity: 1,
                                            y: isActive ? 0 : 10,
                                            transition: { duration: 0.2 }
                                        }}
                                        transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                                    >
                                        <Image
                                            src={slide.image}
                                            alt={slide.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 1200px) 150px, 250px"
                                        />

                                        {/* Active state border/glow */}
                                        {isActive && (
                                            <div className="absolute inset-0 border-2 border-white/50 rounded-2xl z-20 shadow-[0_0_20px_rgba(255,255,255,0.2)_inset]" />
                                        )}

                                        {/* Gradient overlay for text */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />

                                        {/* Card Content - Only show text when active or hovered to keep UI clean */}
                                        <motion.div
                                            className="absolute bottom-0 left-0 w-full p-4 z-20 text-left flex flex-col justify-end"
                                            initial={false}
                                            animate={{ opacity: isActive ? 1 : 0 }}
                                            whileHover={{ opacity: 1 }}
                                        >
                                            <p className="text-[10px] uppercase tracking-wider text-white/70 font-bold mb-1">
                                                {slide.category}
                                            </p>
                                            <p className="text-white font-bold leading-tight line-clamp-2 text-sm">
                                                {slide.title}
                                            </p>
                                        </motion.div>

                                        {/* Progress Bar for Active Slide */}
                                        {isActive && !isHovering && (
                                            <motion.div
                                                className="absolute bottom-0 left-0 h-1 bg-white z-30"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 7, ease: "linear" }}
                                                key={`progress-${currentSlide}`}
                                            />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Mobile Navigation Dots (Fallback for small screens where cards don't fit well) */}
                {slides.length > 1 && (
                    <div className="absolute bottom-8 left-6 lg:hidden flex gap-2 z-30">
                        {slides.map((_, index) => (
                            <button
                                key={`dot-${index}`}
                                onClick={() => setCurrentSlide(index)}
                                className={`rounded-full transition-all duration-300 ${index === currentSlide
                                        ? "w-8 h-1.5 bg-white"
                                        : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
