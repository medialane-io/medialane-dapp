"use client";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { OffersTable } from "@/components/portfolio/offers-table";

export default function PortfolioOffersPage() {
  const { address: walletAddress } = useUnifiedWallet();
  return <OffersTable address={walletAddress!} />;
}
