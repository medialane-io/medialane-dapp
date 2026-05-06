"use client";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { AssetsGrid } from "@/components/portfolio/assets-grid";

export default function PortfolioAssetsPage() {
  const { address: walletAddress } = useUnifiedWallet();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your assets</h2>
      </div>
      <AssetsGrid key={walletAddress ?? "no-wallet"} address={walletAddress ?? null} />
    </div>
  );
}
