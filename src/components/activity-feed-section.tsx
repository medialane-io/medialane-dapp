"use client";

import { useActivities, type Activity } from "@/hooks/use-activities";
import { useActivityFilters } from "@/hooks/use-activity-filters";
import { ActivityFilters } from "@/components/activity-filters";
import { ActivityFeed } from "@/components/activity-feed";

// Combines useActivities + useActivityFilters into a single call
export function useActivitySection(walletAddress?: string, pageSize = 20) {
    const activityResult = useActivities(walletAddress, pageSize);
    const filterResult = useActivityFilters(activityResult.activities);
    return { ...activityResult, ...filterResult };
}

interface ActivityFeedSectionProps {
    // From useActivities
    activities: Activity[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    loadMore: () => Promise<void>;
    refresh: () => void;
    // From useActivityFilters
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    typeFilter: string;
    setTypeFilter: (t: string) => void;
    filtered: Activity[];
    hasActiveFilters: boolean;
    clearFilters: () => void;
    // Config
    emptyMessage?: string;
    emptyMessageFiltered?: string;
    searchPlaceholder?: string;
    showEndMessage?: boolean;
    showRefresh?: boolean;
    showFilters?: boolean;
}

export function ActivityFeedSection({
    activities,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    filtered,
    hasActiveFilters,
    clearFilters,
    emptyMessage,
    emptyMessageFiltered,
    searchPlaceholder,
    showEndMessage,
    showRefresh,
    showFilters = true,
}: ActivityFeedSectionProps) {
    return (
        <div className="space-y-6">
            {showFilters && (
                <ActivityFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    typeFilter={typeFilter}
                    onTypeChange={setTypeFilter}
                    onRefresh={showRefresh ? refresh : undefined}
                    isRefreshing={loading && !loadingMore}
                    searchPlaceholder={searchPlaceholder}
                />
            )}
            <ActivityFeed
                activities={activities}
                filteredActivities={filtered}
                loading={loading}
                loadingMore={loadingMore}
                error={error}
                hasMore={hasMore}
                loadMore={loadMore}
                refresh={refresh}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                emptyMessage={emptyMessage}
                emptyMessageFiltered={emptyMessageFiltered}
                showEndMessage={showEndMessage}
            />
        </div>
    );
}
