"use client";

import { HeroSlider } from "./hero-slider";
import { ActivityTicker } from "./activity-ticker";
import { TrendingCollections } from "./trending-collections";
import { NewOnMarketplace } from "./new-on-marketplace";
import { AirdropSection } from "./airdrop-section";
import { CommunityActivity } from "./community-activity";
import { LearnDocsCta } from "./learn-docs-cta";

export function HomePage() {
  return (
    <div className="pb-20">
      {/* Hero — full-bleed */}
      <HeroSlider />

      {/* Live market ticker */}
      <div className="container mx-auto px-4 sm:px-6 pt-6">
        <ActivityTicker />
      </div>

      {/* Padded content sections */}
      <div className="container mx-auto px-4 sm:px-6 space-y-20 mt-16">
        <TrendingCollections />
        <NewOnMarketplace />
        <AirdropSection />
        <CommunityActivity />
        <LearnDocsCta />
      </div>
    </div>
  );
}
