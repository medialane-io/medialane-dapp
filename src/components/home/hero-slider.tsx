"use client";

import { HeroSlider as HeroSliderDisplay } from "@medialane/ui";
import { useCollections } from "@/hooks/use-collections";
import type { ApiCollection } from "@medialane/sdk";

export function HeroSlider() {
  const { collections, isLoading } = useCollections(1, 3, true, "recent");
  return (
    <HeroSliderDisplay
      collections={collections}
      isLoading={isLoading}
      getHref={(col: ApiCollection) => `/collections/${col.contractAddress}`}
    />
  );
}
