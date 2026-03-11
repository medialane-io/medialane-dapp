import type { IPType } from "./types";
/**
 * Application-wide constants
 */
// Contract addresses
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS as `0x${string}`;
export const COLLECTION_CONTRACT_ADDRESS = CONTRACT_ADDRESS;
export const MEDIALANE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS as `0x${string}`;
export const MARKETPLACE_ADDRESS = MEDIALANE_CONTRACT_ADDRESS;

export const IPFS_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "https://gateway.pinata.cloud";
export const EXPLORER_URL = process.env.NEXT_PUBLIC_EXPLORER_URL || "https://voyager.online";

const ENV_START_BLOCK = process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT_START_BLOCK ? parseInt(process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT_START_BLOCK) : null;
export const START_BLOCK = ENV_START_BLOCK || (process.env.NEXT_PUBLIC_STARKNET_NETWORK === "mainnet" ? 6204232 : 1861690);
export const REGISTRY_START_BLOCK = ENV_START_BLOCK || (process.env.NEXT_PUBLIC_STARKNET_NETWORK === "mainnet" ? 4924753 : 1861690);
// Note: the effective scan start is Math.min(REGISTRY_START_BLOCK, MARKETPLACE_START_BLOCK),
// so marketplace events are also fetched from REGISTRY_START_BLOCK regardless of this value.
export const MARKETPLACE_START_BLOCK = START_BLOCK;

const IS_MAINNET = process.env.NEXT_PUBLIC_STARKNET_NETWORK === "mainnet";

// Supported tokens
export const SUPPORTED_TOKENS = [
  {
    symbol: "USDC",
    address: process.env.NEXT_PUBLIC_STARKNET_USDC || (IS_MAINNET ? "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8" : "0x0512feAc6339Ff7889822cb5aA2a86C848e9D392bB0E3E237C008674feeD8343"),
    decimals: 6,
  },
  {
    symbol: "USDT",
    address: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
    decimals: 6,
  },
  {
    symbol: "ETH",
    address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    decimals: 18,
  },
  {
    symbol: "STRK",
    address: process.env.NEXT_PUBLIC_STARKNET_STRK || (IS_MAINNET ? "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d" : "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"),
    decimals: 18,
  },
] as const;

// AVNU Paymaster configuration
export const AVNU_PAYMASTER_CONFIG = {
  API_BASE_URL: "https://starknet.paymaster.avnu.fi",
  API_KEY: process.env.NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY,
  GASLESS_API_URL: "https://starknet.api.avnu.fi",
  SUPPORTED_GAS_TOKENS: [
    {
      symbol: "USDC",
      address: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
      decimals: 6,
    },
    {
      symbol: "USDT",
      address: "0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8",
      decimals: 6,
    },
    {
      symbol: "ETH",
      address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
      decimals: 18,
    },
    {
      symbol: "STRK",
      address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
      decimals: 18,
    },
  ],
} as const;

/** List of featured collection IDs (string) */
export const FEATURED_COLLECTION_IDS = [
  "20",
];


// Central list of allowed IP types used across detection and UI
export const ALLOWED_IP_TYPES: IPType[] = [
  "Audio",
  "Art",
  "Documents",
  "NFT",
  "Video",
  "Patents",
  "Posts",
  "Publications",
  "RWA",
  "Software",
  "Custom",
  "Generic",
] as const;

