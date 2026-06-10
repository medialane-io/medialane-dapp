import type { Metadata } from "next";
import { Coins } from "lucide-react";
import { PageContainer } from "@medialane/ui";
import { ClaimCollectionPanel } from "@/components/claim/claim-collection-panel";
import { canonical } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Claim Memecoin",
  description: "Claim a coin you launched on Starknet and bring it to Medialane.",
  alternates: canonical("/launchpad/memecoin"),
  openGraph: {
    title: "Claim Memecoin | Medialane",
    description: "Claim a coin you launched on Starknet and bring it to Medialane.",
    url: "/launchpad/memecoin",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Claim a Memecoin on Medialane" }],
  },
};

export default function MemecoinClaimPage() {
  return (
    <PageContainer className="box-border max-w-2xl pt-20 pb-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary">
          <Coins className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-wider">Claim Memecoin</span>
        </div>
        <h1 className="text-3xl font-bold">Claim your Memecoin</h1>
        <p className="text-muted-foreground">
          Add a coin you launched on Starknet (unrug or partner) to Medialane. Paste the coin
          address — coins are reviewed by our team, then appear on the Coins page and your profile.
        </p>
      </div>
      <ClaimCollectionPanel />
    </PageContainer>
  );
}
