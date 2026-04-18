"use client";

import { ActivityTicker as ActivityTickerDisplay } from "@medialane/ui";
import { useOrders } from "@/hooks/use-orders";

export function ActivityTicker() {
  const { orders } = useOrders({ status: "ACTIVE", sort: "recent", limit: 14 });
  return <ActivityTickerDisplay orders={orders} />;
}
