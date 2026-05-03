import type { Metadata } from "next";
import { NFTEditionsContent } from "./nfteditions-content";

export const metadata: Metadata = {
  title: "NFT Editions | Launchpad | Medialane",
  description: "Manage your multi-edition ERC-1155 IP collections — mint new token editions or deploy a new collection.",
};

export default function NFTEditionsPage() {
  return <NFTEditionsContent />;
}
