"use client";

import { PageContainer } from "@medialane/ui";

import { Hero } from "./hero";
import { CollectionsStrip } from "./collections-strip";
import { CreatorsStrip } from "./creators-strip";
import { FeedSection } from "./feed-section";
import { IpTypeNav } from "./ip-type-nav";

export function DiscoverPage() {
  return (
    <PageContainer className="box-border max-w-full space-y-10 px-4 sm:px-5 lg:px-6">
      <Hero />
      <IpTypeNav />
      <CollectionsStrip />
      <FeedSection />
      <CreatorsStrip />
    </PageContainer>
  );
}
