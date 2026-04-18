"use client";

import { useState, useEffect } from "react";
import { ActivityFeedShell, ActivityRow } from "@medialane/ui";
import { useActivities } from "@/hooks/use-activities";
import { EXPLORER_URL } from "@/lib/constants";

export function CommunityActivity() {
  const { activities, isLoading } = useActivities({ limit: 10 });
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isLoading) setLastUpdated(new Date().toISOString());
  }, [activities, isLoading]);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <ActivityFeedShell
      title="Community"
      href="/activities"
      lastUpdated={lastUpdated}
      isLoading={isLoading}
    >
      {activities.map((act, i) => {
        const key = act.txHash
          ? `${act.txHash}-${act.type}-${act.nftTokenId ?? ""}`
          : `activity-${i}`;
        return (
          <ActivityRow
            key={key}
            activity={act}
            showActor
            showExplorer={false}
            compact
            explorerUrl={EXPLORER_URL}
            getAssetHref={(c, t) => `/asset/${c}/${t}`}
            getActorHref={(a) => `/creator/${a}`}
          />
        );
      })}
    </ActivityFeedShell>
  );
}
