"use client";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { CounterOffersTable } from "@/components/portfolio/counter-offers-table";

export default function PortfolioCounterOffersPage() {
  const { address: walletAddress } = useUnifiedWallet();
  return <CounterOffersTable address={walletAddress!} />;
}
