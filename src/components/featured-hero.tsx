"use client"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { ChevronLeft, ChevronRight, TrendingUp } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

import { useFeaturedCollectionsByAddress } from "@/hooks/use-collection"
import { FEATURED_COLLECTION_ADDRESSES } from "@/lib/featured-collections"
import type { Collection } from "@/lib/types"

// Default "Welcome" Hero Content
const DefaultHero = () => (
    <div className="w-full relative overflow-hidden">
        <Card className="border-0 rounded-none shadow-none">
            <CardContent className="p-0">
                <div className="relative h-[100svh] w-full bg-m3-surface-container-high flex items-center justify-center">
                    {/* Subtle abstract background using M3 primary tones */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-m3-primary-container/30 via-transparent to-transparent opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-m3-tertiary-container/30 via-transparent to-transparent opacity-50"></div>
                    </div>

                    <div className="text-center p-8 max-w-3xl relative z-10">
                        <Badge variant="secondary" className="mb-6 bg-m3-secondary-container text-m3-on-secondary-container border-0">
                            Medialane
                        </Badge>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-m3-on-surface leading-tight tracking-tight">
                            Feature your collection here
                        </h2>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                asChild
                                size="lg"
                                className="font-bold px-8 h-12 text-base"
                            >
                                <Link href="/create/">Create</Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="font-semibold px-8 h-12 text-base"
                            >
                                <Link href="/collections">Explore</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
);

export function FeaturedHero() {
    const { collections, loading } = useFeaturedCollectionsByAddress(FEATURED_COLLECTION_ADDRESSES);
    
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isTransitioning, setIsTransitioning] = useState(false)

    useEffect(() => {
        if (collections.length === 0) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 6000)
        return () => clearInterval(interval)
    }, [collections.length, currentSlide])

    const nextSlide = useCallback(() => {
        if (collections.length === 0) return
        setIsTransitioning(true)
        setCurrentSlide((prev) => (prev + 1) % collections.length)
        setTimeout(() => setIsTransitioning(false), 500)
    }, [collections.length])

    const prevSlide = useCallback(() => {
        if (collections.length === 0) return
        setIsTransitioning(true)
        setCurrentSlide((prev) => (prev - 1 + collections.length) % collections.length)
        setTimeout(() => setIsTransitioning(false), 500)
    }, [collections.length])

    const goToSlide = useCallback(
        (index: number) => {
            if (isTransitioning || index === currentSlide || collections.length === 0) return
            setIsTransitioning(true)
            setCurrentSlide(index)
            setTimeout(() => setIsTransitioning(false), 500)
        },
        [isTransitioning, currentSlide, collections.length],
    )

    if (loading && collections.length === 0) return <DefaultHero />
    if (!loading && collections.length === 0) return <DefaultHero />

    const currentCollection = collections[currentSlide]

    return (
        <div className="w-full relative overflow-hidden">
            <Card className="border-0 rounded-none shadow-none">
                <CardContent className="p-0">
                    <div className="relative h-[100svh] w-full bg-m3-scrim">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <Image
                                src={currentCollection.image || "/placeholder.svg"}
                                alt={currentCollection.name}
                                fill
                                className={`object-cover transition-all duration-m3-long ease-m3-standard ${isTransitioning ? "scale-105 opacity-80" : "scale-100 opacity-90"
                                    }`}
                                priority={true}
                                loading="eager"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            />

                            {/* Preload next image */}
                            {collections.length > 1 && (
                                <div className="hidden">
                                    <Image
                                        src={collections[(currentSlide + 1) % collections.length].image || "/placeholder.svg"}
                                        alt="preload"
                                        width={100}
                                        height={100}
                                        priority={false}
                                        loading="lazy"
                                    />
                                </div>
                            )}

                            {/* M3 Scrim overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                        </div>

                        {/* Content */}
                        <div className="relative h-full flex items-center justify-center p-6 md:p-12">
                            <div className="container mx-auto px-4 md:px-8 text-center flex flex-col items-center">
                                <div
                                    className={`max-w-4xl transition-all duration-m3-long ease-m3-standard ${isTransitioning ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                                        }`}
                                >
                                    <div className="flex items-center justify-center gap-3 mb-6">
                                        <Badge variant="secondary" className="bg-foreground/15 text-foreground border-0 rounded-m3-full px-3 py-1">
                                            IP
                                        </Badge>
                                        <Badge variant="secondary" className="bg-foreground/15 text-foreground border-0 rounded-m3-full px-3 py-1">
                                            {currentCollection.type || "Mixed Media"}
                                        </Badge>
                                    </div>

                                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground leading-tight tracking-tight">
                                        {currentCollection.name}
                                    </h2>

                                    <p className="text-lg md:text-xl text-foreground/90 mb-8 leading-relaxed max-w-2xl mx-auto line-clamp-3 font-light">
                                        {currentCollection.description || "Discover this amazing collection on Medialane."}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-center gap-8 mb-10">
                                        <div className="flex items-center gap-3 text-foreground">
                                            <div className="p-3 bg-foreground/15 rounded-m3-full">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Assets</p>
                                                <span className="text-xl font-bold">{currentCollection.itemCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="bg-white text-black hover:bg-foreground/90 font-semibold px-8 h-12 text-base"
                                        >
                                            <Link href={`/collections/${currentCollection.nftAddress || currentCollection.id}`}>View Collection</Link>
                                        </Button>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Arrow Navigation */}
                        {collections.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={prevSlide}
                                    disabled={isTransitioning}
                                    className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 bg-m3-inverse-surface/30 text-foreground hover:bg-m3-inverse-surface/50 h-14 w-14 rounded-m3-full border-0 transition-all duration-m3-short disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={nextSlide}
                                    disabled={isTransitioning}
                                    className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 bg-m3-inverse-surface/30 text-foreground hover:bg-m3-inverse-surface/50 h-14 w-14 rounded-m3-full border-0 transition-all duration-m3-short disabled:opacity-50"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </Button>
                            </>
                        )}

                        {/* Dots Indicator */}
                        {collections.length > 1 && (
                            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3">
                                {collections.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        disabled={isTransitioning}
                                        className={`transition-all duration-m3-medium ease-m3-standard rounded-m3-full ${index === currentSlide ? "w-12 h-3 bg-white" : "w-3 h-3 bg-foreground/40 hover:bg-foreground/60"}`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
