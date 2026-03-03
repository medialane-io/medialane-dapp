"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, CheckCircle2, Twitter, Instagram, Globe } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreatorData } from "@/components/creator/creator-data-context";

export function CreatorHeader() {
    const {
        headerImage,
        avatarImage,
        creatorInfo,
        collectionsLoading,
        assetsLoading,
        collections,
        standardTokens,
    } = useCreatorData();

    const isLoading = collectionsLoading;

    const handleShare = () => {
        if (typeof navigator !== 'undefined') {
            if (navigator.share) {
                navigator.share({
                    title: `Creator ${creatorInfo.name}`,
                    url: window.location.href,
                }).catch(() => { });
            } else {
                navigator.clipboard.writeText(window.location.href);
            }
        }
    };

    if (isLoading) {
        return <HeaderSkeleton />;
    }

    return (
        <div className="relative overflow-hidden -mt-[88px] pt-[150px] pb-24 min-h-[400px] flex flex-col justify-center bg-background">

            {/* --- Background Layer --- */}
            <div className="absolute inset-0 z-0 select-none pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />

                {headerImage ? (
                    <Image
                        src={headerImage}
                        alt="Background"
                        fill
                        className="object-cover opacity-50 blur-[60px] scale-110 saturate-150"
                        priority
                        sizes="100vw"
                    />
                ) : (
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-outrun-magenta/30 via-neon-cyan/20 to-transparent blur-3xl" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
            </div>

            {/* --- Content Layer --- */}
            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-8 pt-20 pb-4">

                    {/* Avatar Group */}
                    <div className="relative group shrink-0">
                        <div className={`absolute -inset-4 rounded-full blur-2xl opacity-60 transition-opacity duration-1000 ${avatarImage ? "bg-outrun-magenta/50" : "bg-gradient-to-r from-outrun-magenta via-outrun-purple to-neon-cyan"}`} />
                        <div className="relative h-48 w-48 md:h-56 md:w-56 rounded-full overflow-hidden shadow-2xl backdrop-blur-xl bg-background/50 border-4 border-white/20 dark:border-white/10 ring-2 ring-background">
                            {avatarImage ? (
                                <Image
                                    src={avatarImage}
                                    alt={creatorInfo.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    priority
                                    sizes="(max-width: 768px) 192px, 224px"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-tr from-outrun-magenta/20 via-outrun-purple/10 to-neon-cyan/20 flex items-center justify-center">
                                    <div className="w-full h-full absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-50" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Metadata & Actions Stack */}
                    <div className="flex flex-col items-center md:items-start flex-1 gap-4 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards mb-2">

                        {/* Title & Verified */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground drop-shadow-lg">
                                {creatorInfo.name}
                            </h1>
                            {creatorInfo.verified && (
                                <Badge variant="secondary" className="px-3 py-1 bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan shadow-glow-sm shadow-neon-cyan/20">
                                    <CheckCircle2 className="h-4 w-4 mr-1 text-neon-cyan" />
                                    Verified
                                </Badge>
                            )}
                        </div>

                        {/* Bio */}
                        {creatorInfo.bio && (
                            <p className="text-muted-foreground md:text-lg max-w-2xl font-light">
                                {creatorInfo.bio}
                            </p>
                        )}

                        {/* Action Bar (Stats + Social + Share) */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2">
                            {/* Glass Stats */}
                            <div className="flex flex-wrap items-center gap-2 glass-panel px-4 py-2 rounded-2xl border border-white/5 bg-background/40 backdrop-blur-md">
                                <div className="flex items-center gap-2 px-2 border-r border-white/10">
                                    <span className="font-black text-foreground text-xl leading-none">{collectionsLoading ? "—" : collections.length}</span>
                                    <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Collections</span>
                                </div>
                                <div className="flex items-center gap-2 px-2">
                                    <span className="font-black text-foreground text-xl leading-none">{assetsLoading ? "—" : standardTokens.length}</span>
                                    <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Assets</span>
                                </div>
                            </div>

                            {/* Social Loop */}
                            {(creatorInfo.twitter || creatorInfo.instagram || creatorInfo.website) && (
                                <div className="flex items-center gap-2 glass-panel px-3 py-2 rounded-2xl border border-white/5 bg-background/40 backdrop-blur-md">
                                    {creatorInfo.twitter && (
                                        <a href={creatorInfo.twitter} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-outrun-cyan/20 text-muted-foreground hover:text-outrun-cyan transition-all duration-300">
                                            <Twitter className="h-4 w-4" />
                                        </a>
                                    )}
                                    {creatorInfo.instagram && (
                                        <a href={creatorInfo.instagram} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-outrun-magenta/20 text-muted-foreground hover:text-outrun-magenta transition-all duration-300">
                                            <Instagram className="h-4 w-4" />
                                        </a>
                                    )}
                                    {creatorInfo.website && (
                                        <a href={creatorInfo.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full hover:bg-neon-cyan/20 text-muted-foreground hover:text-neon-cyan transition-all duration-300">
                                            <Globe className="h-4 w-4" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Share */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="h-10 rounded-2xl glass-panel border-white/10 hover:bg-white/10 hover:text-outrun-magenta transition-all active:scale-95"
                            >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeaderSkeleton() {
    return (
        <div className="relative overflow-hidden -mt-[88px] pt-[150px] pb-24 min-h-[400px] flex flex-col justify-center bg-background">
            <div className="relative z-10 container mx-auto px-4 max-w-7xl">
                <div className="flex flex-col items-center justify-center gap-8">
                    <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-background" />
                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                        <Skeleton className="h-10 w-64 rounded-xl" />
                        <Skeleton className="h-8 w-40 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
