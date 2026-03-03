"use client"

import { useActivitySection, ActivityFeedSection } from "@/components/activity-feed-section"
import { useCreatorData } from "@/components/creator/creator-data-context"

export default function CreatorActivitiesPage() {
    const { walletAddress } = useCreatorData()
    const section = useActivitySection(walletAddress, 12)

    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 mx-auto py-8 space-y-8">
            <ActivityFeedSection
                {...section}
                showRefresh
                searchPlaceholder="Search activities..."
                emptyMessage="This creator hasn't performed any activities yet"
                emptyMessageFiltered={section.hasActiveFilters ? "Try adjusting your search or filters" : undefined}
            />
        </div>
    )
}
