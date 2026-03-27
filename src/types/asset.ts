// Shared asset/IP types used across the dapp

export type LicenseType =
  | "cc-by"
  | "cc-by-sa"
  | "cc-by-nc"
  | "all-rights-reserved"
  | "custom";

export interface Asset {
  id: string;
  name: string;
  description?: string;
  image?: string;
  collection?: string | { id: string; name: string };
  tokenId?: string;
  contractAddress?: string;
  creator?: string;
  owner?: string;
  price?: number | string;
  licenseType?: LicenseType;
  attributes?: { trait_type: string; value: string }[];
  createdAt?: string;
  [key: string]: unknown;
}

export interface AssetDetails {
  id: string;
  name: string;
  description?: string;
  image?: string;
  tokenId?: string;
  contractAddress?: string;
  owner?: string;
  creator?: string;
  licenseType?: LicenseType;
  attributes?: { trait_type: string; value: string }[];
  collection?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  image?: string;
  owner?: string;
  floorPrice?: number;
  itemCount?: number;
  slug?: string;
  creator?: string | { name: string; [key: string]: unknown };
}

export interface Creator {
  id: string;
  name: string;
  address?: string;
  avatar?: string;
  bio?: string;
  slug?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: string;
  metadataFields?: string[];
  type?: string;
  icon?: string;
  popularity?: number;
  features?: string[];
  suitableFor?: string[];
}

export interface ActivityRecord {
  id: string;
  type: string;
  assetId?: string;
  assetName?: string;
  user?: string;
  timestamp?: string;
  txHash?: string;
  price?: string | number;
}

export interface PortfolioStats {
  totalValue?: number | string;
  totalNFTs?: number;
  topCollection?: { name: string; value: number };
  totalAssets?: number;
  createdAssets?: number;
  licensedAssets?: number;
  protectionLevel?: number;
  recentViews?: number;
}

export interface OwnershipRecord {
  assetId: string;
  owner: string;
  acquiredAt?: string;
  txHash?: string;
}
