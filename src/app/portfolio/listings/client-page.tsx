"use client";

import { Suspense, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, X, Tag } from "lucide-react";
import { useAccount } from "@starknet-react/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import dynamic from "next/dynamic";
import { WalletConnectCTA } from "@/components/portfolio/wallet-connect-cta";
import { PageHeader } from "@/components/page-header";
import { PortfolioTabs } from "@/components/portfolio/portfolio-tabs";

const PortfolioListings = dynamic<any>(() =>
    import("@/components/portfolio/portfolio-listings").then(mod => mod.PortfolioListings), {
    loading: () => <ListingsSkeleton />
});

export default function ListingsClientPage() {
    const { address } = useAccount();
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen py-6 md:py-10">
            <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
                {/* Header Section */}
                <PageHeader
                    title="My Listings"
                    description="Manage your active marketplace listings."
                    className="pt-8 pb-8"
                >
                    {!address ? null : (
                        <div className="relative group flex-1 sm:min-w-[300px]">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search your listings..."
                                className="pl-10 h-11 bg-muted/40 border-border/40 focus:bg-background transition-all rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </PageHeader>

                {/* Quick Navigation Tabs */}
                <PortfolioTabs activePath="/portfolio/listings" />

                {/* Content Area */}
                <div className="relative">
                    {!address ? (
                        <div className="max-w-4xl mx-auto py-12">
                            <WalletConnectCTA
                                title="Connect wallet"
                                description="Securely manage your active marketplace listings."
                            />
                        </div>
                    ) : (
                        <Suspense fallback={<ListingsSkeleton />}>
                            <PortfolioListings searchQuery={searchQuery} mode="listings" />
                        </Suspense>
                    )}

                    {/* Decorative background element */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
                </div>
            </main>
        </div>
    );
}

function ListingsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/50 bg-card/50 overflow-hidden shadow-sm">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="pt-2 flex flex-col gap-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-9 w-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
