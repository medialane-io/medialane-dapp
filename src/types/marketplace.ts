// Marketplace-specific types

export interface Listing {
  id?: string;
  orderHash?: string;
  assetContract: string;
  tokenId: string;
  price: string;
  currency?: string;
  seller?: string;
  buyer?: string;
  startTime?: number;
  endTime?: number;
  status?: "active" | "fulfilled" | "cancelled";
}
