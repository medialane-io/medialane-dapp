"use client";

import { useState, useEffect } from "react";
import { DiscoverFeedSection } from "@medialane/ui";
import { useOrders } from "@/hooks/use-orders";
import { useActivities } from "@/hooks/use-activities";
import { EXPLORER_URL } from "@/lib/constants";

export function FeedSection() {
  const { orders, isLoading } = useOrders({ status: "ACTIVE", sort: "recent", limit: 6 });
  const { activities, isLoading: activitiesLoading } = useActivities({ limit: 10 });
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (!activitiesLoading) setLastUpdated(new Date().toISOString());
  }, [activities, activitiesLoading]);

  return (
    <DiscoverFeedSection
      orders={orders}
      isLoading={isLoading}
      activities={activities}
      activitiesLoading={activitiesLoading}
      lastUpdated={lastUpdated}
      getAssetHref={(contract, tokenId) => `/asset/${contract}/${tokenId}`}
      getActorHref={(address) => `/creator/${address}`}
      explorerUrl={EXPLORER_URL}
      marketplaceHref="/marketplace"
      activitiesHref="/activities"
    />
  );
}
