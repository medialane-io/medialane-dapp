"use client";

import { FeaturedCarousel } from "@medialane/ui";
import { useCollections } from "@/hooks/use-collections";
import type { ApiCollection } from "@medialane/sdk";

export function FeaturedCarouselWrapper() {
  const { collections, isLoading } = useCollections(1, 12, true, "recent");

  return (
    <FeaturedCarousel
      collections={collections}
      isLoading={isLoading}
      getHref={(col: ApiCollection) => `/collections/${col.contractAddress}`}
      allCollectionsHref="/collections"
    />
  );
}
