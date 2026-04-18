"use client";

import { DiscoverHero } from "@medialane/ui";
import { usePlatformStats } from "@/hooks/use-stats";
import { useOrders } from "@/hooks/use-orders";

export function Hero() {
  const { stats } = usePlatformStats();
  const { orders } = useOrders({ status: "ACTIVE", sort: "recent", limit: 14 });

  return (
    <DiscoverHero
      stats={stats ?? null}
      orders={orders}
      badgeText="Powered on Starknet"
      headlineText="Create, license & trade"
    />
  );
}
