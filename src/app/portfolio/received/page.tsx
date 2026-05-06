"use client";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { ReceivedOffersTable } from "@/components/portfolio/received-offers-table";

export default function PortfolioReceivedPage() {
  const { address: walletAddress } = useUnifiedWallet();
  return <ReceivedOffersTable address={walletAddress!} />;
}
