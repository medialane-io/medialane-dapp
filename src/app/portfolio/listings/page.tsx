"use client";

import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { ListingsTable } from "@/components/portfolio/listings-table";

export default function PortfolioListingsPage() {
  const { address: walletAddress } = useUnifiedWallet();
  return <ListingsTable address={walletAddress!} />;
}
