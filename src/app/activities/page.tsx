"use client"

import { Button } from "@/components/ui/button"
import { useActivitySection, ActivityFeedSection } from "@/components/activity-feed-section"
import { RefreshCw, Search } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { cn } from "@/lib/utils"

export default function ActivitiesPage() {
  const section = useActivitySection(undefined, 20)

  return (
    <div className="min-h-screen">
      <div className="h-16"></div>
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px] pointer-events-none fixed" />

      <main className="w-full mx-auto py-4 relative">
        <PageHeader
          variant="expressive"
          title="Protocol Activity"
          description="Explore the pulse of the Mediolano ecosystem. Track live mints, collections, and asset transfers occurring on Starknet."
          statusBadge="Live Feed"
          primaryAction={
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-m3-on-surface-variant/50" />
              <input
                type="search"
                placeholder="Find specific activity events..."
                className="w-full h-12 md:h-14 pl-12 pr-4 bg-m3-surface-container border border-m3-outline-variant/20 focus:border-m3-primary/30 text-base transition-all rounded-full shadow-sm focus:shadow-md outline-none text-m3-on-surface placeholder:text-m3-on-surface-variant/40"
                value={section.searchQuery}
                onChange={(e) => section.setSearchQuery(e.target.value)}
              />
            </div>
          }
          utilityContent={
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-m3-primary/5 border border-m3-primary/10">
                <span className="text-[10px] font-black uppercase tracking-wider text-m3-primary/70">Events Tracked:</span>
                <span className="text-[11px] font-black text-m3-primary">{section.activities.length}</span>
              </div>

              <div className="h-4 w-px bg-m3-outline-variant/20 mx-1 hidden lg:block" />

              <Button
                variant="ghost"
                size="sm"
                onClick={section.refresh}
                disabled={section.loading}
                className="h-9 gap-2 rounded-full border border-m3-outline-variant/10 bg-m3-surface-container-high/30 hover:bg-m3-surface-container-high/60 transition-colors"
              >
                <RefreshCw className={cn("h-4 w-4 text-m3-primary", section.loading && !section.loadingMore && "animate-spin")} />
                <span className="text-xs font-bold text-m3-on-surface-variant">Refresh Feed</span>
              </Button>
            </div>
          }
        />

        <div className="layout-px py-8">
          <ActivityFeedSection
            {...section}
            // We use the header's search now, so we hide the built-in one
            showFilters={false}
            searchPlaceholder="Search by asset, user, or details..."
            emptyMessage="No protocol activity yet"
            emptyMessageFiltered={section.hasActiveFilters ? "No results — try adjusting your filters" : undefined}
          />
        </div>
      </main>
    </div>
  )
}
