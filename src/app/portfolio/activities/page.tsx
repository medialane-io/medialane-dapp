"use client"

import { Button } from "@/components/ui/button"
import { useActivitySection, ActivityFeedSection } from "@/components/activity-feed-section"
import { useAccount } from "@starknet-react/core"
import { X, Wallet } from "lucide-react"
import { PageHeader } from "@/components/page-header"

export default function PortfolioActivitiesPage() {
    const { address } = useAccount()
    const section = useActivitySection(address || "", 20)

    if (!address) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 pt-24 text-center">
                <div className="p-4 rounded-full bg-muted/20 backdrop-blur-sm border border-border/20">
                    <Wallet className="h-10 w-10 text-muted-foreground/80" />
                </div>
                <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                    Connect Wallet
                </h2>
                <p className="text-muted-foreground max-w-sm">
                    Connect your wallet to view your activity history on the Mediolano Protocol.
                </p>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-10">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] pointer-events-none fixed" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-outrun-cyan/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-outrun-magenta/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <main className="relative py-8">
                <PageHeader
                    title="My Activities"
                    description="Track your personal history on the Mediolano Protocol. View your mints, transfers, and remixes."
                >
                    <div className="flex flex-wrap gap-2 items-center mt-2">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 bg-background/40 backdrop-blur-md text-sm text-muted-foreground shadow-sm h-11">
                            <span className="font-semibold text-foreground">{section.activities.length}</span>
                            <span>events</span>
                        </div>

                        {section.hasActiveFilters && (
                            <Button
                                variant="ghost"
                                onClick={section.clearFilters}
                                className="h-11 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        )}
                    </div>
                </PageHeader>

                <ActivityFeedSection
                    {...section}
                    showRefresh
                    showEndMessage
                    searchPlaceholder="Search by asset name or transaction..."
                    emptyMessage="No activities yet"
                    emptyMessageFiltered={section.hasActiveFilters ? "No matches found — try adjusting your filters" : undefined}
                />
            </main>
        </div>
    )
}
