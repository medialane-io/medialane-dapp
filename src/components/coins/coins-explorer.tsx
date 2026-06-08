"use client";

import { useState, useMemo } from "react";
import { Coins } from "lucide-react";
import { useCollections, type CollectionSort } from "@/hooks/use-collections";
import { CoinCard, CoinCardSkeleton } from "@/components/shared/coin-card";
import { cn } from "@/lib/utils";

type Filter = "all" | "creator" | "memecoin";

const FILTER_TABS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Creator Coins", value: "creator" },
  { label: "Memecoins", value: "memecoin" },
];

// Default sort is recency, never raw swap volume (05 §11 anti-wash hygiene).
const SORT_OPTIONS: { label: string; value: CollectionSort }[] = [
  { label: "Recently launched", value: "recent" },
  { label: "Holders", value: "supply" },
  { label: "Name", value: "name" },
];

export function CoinsExplorer({ heading = true }: { heading?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<CollectionSort>("recent");

  // "all" → standard=ERC20 (both coin services); per-kind → service filter.
  const service =
    filter === "creator" ? "creator-coin" : filter === "memecoin" ? "external-erc20" : undefined;
  const standard = filter === "all" ? "ERC20" : undefined;

  const { collections, isLoading } = useCollections(
    1, 24, undefined, sort, false, service, standard
  );

  const items = useMemo(() => collections ?? [], [collections]);

  return (
    <div className="space-y-6">
      {heading && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <Coins className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Tokens</span>
          </div>
          <h1 className="text-3xl font-bold">Creator coins &amp; memecoins</h1>
          <p className="text-muted-foreground">
            Trade creator-issued social tokens and claimed Starknet memecoins.
          </p>
        </div>
      )}

      {/* Filter + sort toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex gap-1.5">
          {FILTER_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                filter === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as CollectionSort)}
          className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading && items.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <CoinCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border/60 py-16 text-center text-muted-foreground">
          No coins yet. Launch one from the Launchpad.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((c) => <CoinCard key={c.contractAddress} collection={c} />)}
        </div>
      )}
    </div>
  );
}
