"use client";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { PortfolioActivity } from "@/components/portfolio/portfolio-activity";

export default function PortfolioActivityPage() {
  const { address: walletAddress } = useUnifiedWallet();
  return <PortfolioActivity address={walletAddress ?? null} />;
}
