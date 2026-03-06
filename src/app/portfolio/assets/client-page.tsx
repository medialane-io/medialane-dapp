"use client";

import { Suspense, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Search, X } from "lucide-react";
import { usePortfolio } from "@/hooks/use-portfolio";
import { useAccount } from "@starknet-react/core";
import { Alert } from "@/components/ui/alert";
import { CollectionValidator } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import dynamic from "next/dynamic";

import { WalletConnectCTA } from "@/components/portfolio/wallet-connect-cta";
import { PageHeader } from "@/components/page-header";

const PortfolioAssets = dynamic(() =>
    import("@/components/portfolio/portfolio-assets").then(mod => mod.PortfolioAssets), {
    loading: () => <AssetsSkeleton />
});

export default function AssetsClientPage() {
    const { address } = useAccount();
    const { collections, loading, error, tokens } = usePortfolio();
    const [searchQuery, setSearchQuery] = useState("");

    // Validate collections before passing to components
    const validCollections = collections.filter(collection => {
        const isValid = CollectionValidator.isValid(collection);
        return isValid;
    });

    // Filter tokens based on search query
    const filteredTokens = useMemo(() => {
        if (!searchQuery) return tokens;

        const query = searchQuery.toLowerCase();
        const filtered: Record<string, any[]> = {};

        Object.keys(tokens).forEach(collectionId => {
            const collectionTokens = tokens[collectionId].filter(asset =>
                (asset.name && asset.name.toLowerCase().includes(query)) ||
                (asset.collection_id && asset.collection_id.toLowerCase().includes(query)) ||
                (asset.token_id && asset.token_id.includes(query))
            );

            if (collectionTokens.length > 0) {
                filtered[collectionId] = collectionTokens;
            }
        });

        return filtered;
    }, [tokens, searchQuery]);

    return (
        <div className="min-h-screen">
            <main className="">
                <PageHeader
                    title="My Assets"
                    description="View and manage your digital assets"
                >
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Button variant="ghost" size="icon" asChild className="shrink-0">
                            <Link href="/portfolio">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        {address && (
                            <div className="relative w-full sm:min-w-[300px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search your assets..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-9"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </PageHeader>

                {/* Show CTA when no wallet is connected */}
                {!address && (
                    <div className="max-w-4xl mx-auto">
                        <WalletConnectCTA
                            title="Connect wallet"
                            description="Securely access and manage your onchain assets."
                        />
                    </div>
                )}

                {/* Show content when wallet is connected */}
                {address && (
                    <Suspense fallback={<AssetsSkeleton />}>
                        <div className="space-y-8 w-full">
                            {/* Search bar moved to PageHeader */}

                            {loading ? (
                                <AssetsSkeleton />
                            ) : error ? (
                                <Alert variant="destructive">{error}</Alert>
                            ) : (
                                <PortfolioAssets
                                    tokens={filteredTokens}
                                    loading={loading}
                                    collections={validCollections}
                                />
                            )}
                        </div>
                    </Suspense>
                )}
            </main>
        </div>
    );
}

function AssetsSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-[300px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, i) => (
                    <div key={i} className="rounded-lg border overflow-hidden">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <div className="pt-2 flex gap-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
