"use client";

import { useState } from "react";
import { PortfolioOrderList } from "@/components/portfolio/portfolio-order-list";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { PortfolioTabs } from "@/components/portfolio/portfolio-tabs";

export default function BidHistoryClientPage() {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen py-6 md:py-10">
            <main className="">
                {/* Header Section */}
                <PageHeader
                    title="Bid History"
                    description="View your past bidding activity."
                    className="pt-8 pb-8"
                >
                    <div className="relative group flex-1 sm:min-w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search history..."
                            className="pl-10 h-11 bg-muted/40 border-border/40 focus:bg-background transition-all rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </PageHeader>

                {/* Quick Navigation Tabs */}
                <PortfolioTabs activePath="/portfolio/bid-history" />

                {/* Content Area */}
                <div className="relative">
                    <PortfolioOrderList searchQuery={searchQuery} mode="bid-history" />

                    {/* Decorative Elements */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />
                    <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />
                </div>
            </main>
        </div>
    );
}
