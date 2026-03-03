"use client";

import { useState } from "react";
import { PortfolioOrderList } from "@/components/portfolio/portfolio-order-list";
import { Input } from "@/components/ui/input";
import { Search, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { PortfolioTabs } from "@/components/portfolio/portfolio-tabs";

export default function OffersClientPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen py-6 md:py-10">
            <main className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto">
                {/* Header Section */}
                <PageHeader
                    title="Offers Made"
                    description="Track offers you have made on assets."
                    className="pt-8 pb-8"
                >
                    <div className="relative group flex-1 sm:min-w-[300px]">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search your offers..."
                            className="pl-10 h-11 bg-muted/40 border-border/40 focus:bg-background transition-all rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Link href="/portfolio/bid-history">
                        <Button variant="outline" className="h-11 rounded-xl border-border/40 px-6 gap-2 hover:bg-muted/50">
                            <History className="w-4 h-4" />
                            Bid History
                        </Button>
                    </Link>
                </PageHeader>

                {/* Quick Navigation Tabs */}
                <PortfolioTabs activePath="/portfolio/offers" />

                {/* Content Area */}
                <div className="relative">
                    <PortfolioOrderList searchQuery={searchQuery} mode="offers-made" />

                    {/* Decorative background element */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
                </div>
            </main>
        </div>
    );
}
