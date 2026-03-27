import {
  MARKETPLACE_CONTRACT_MAINNET,
  COLLECTION_CONTRACT_MAINNET,
  SUPPORTED_TOKENS,
} from "@medialane/sdk";

export { SUPPORTED_TOKENS };

// Support both env var naming conventions (medialane-io and legacy dapp)
export const MARKETPLACE_CONTRACT =
  (process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT as `0x${string}`) ||
  (process.env.NEXT_PUBLIC_MEDIALANE_CONTRACT_ADDRESS as `0x${string}`) ||
  MARKETPLACE_CONTRACT_MAINNET;

export const COLLECTION_CONTRACT =
  (process.env.NEXT_PUBLIC_COLLECTION_CONTRACT as `0x${string}`) ||
  (process.env.NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS as `0x${string}`) ||
  COLLECTION_CONTRACT_MAINNET;

/** Legacy alias used by old dapp pages. */
export const COLLECTION_CONTRACT_ADDRESS = COLLECTION_CONTRACT;

export const STARKNET_RPC_URL =
  process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
  process.env.NEXT_PUBLIC_RPC_URL || "";

export const MEDIALANE_BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDIALANE_BACKEND_URL || "http://localhost:3001";

// read-only public key — authorizes read operations only. Do NOT use for admin ops.
export const MEDIALANE_API_KEY =
  process.env.NEXT_PUBLIC_MEDIALANE_API_KEY || "";

export const PINATA_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  "https://gateway.pinata.cloud";

export const EXPLORER_URL =
  process.env.NEXT_PUBLIC_EXPLORER_URL || "https://voyager.online";

export const MINT_CONTRACT =
  (process.env.NEXT_PUBLIC_MINT_CONTRACT as `0x${string}`) || ("" as `0x${string}`);

export const COMMENTS_CONTRACT =
  (process.env.NEXT_PUBLIC_COMMENTS_CONTRACT as `0x${string}`) || ("" as `0x${string}`);

// Genesis launch mint (alias kept for env compat)
export const LAUNCH_MINT_CONTRACT =
  (process.env.NEXT_PUBLIC_LAUNCH_MINT_CONTRACT as `0x${string}`) || ("" as `0x${string}`);

export const GENESIS_NFT_URI =
  process.env.NEXT_PUBLIC_GENESIS_NFT_URI || "";

/** Optional: direct image URL shown in the NFT card preview (e.g. Pinata gateway URL). */
export const GENESIS_NFT_IMAGE_URL =
  process.env.NEXT_PUBLIC_GENESIS_NFT_IMAGE_URL || "";

/** Delay (ms) before re-fetching after a write op, allowing the indexer to process the block. */
export const INDEXER_REVALIDATION_DELAY_MS = 10_000;

// ---------------------------------------------------------------------------
// Legacy aliases (used by old dapp hooks, kept for backwards compat)
// ---------------------------------------------------------------------------

/** @deprecated Use COLLECTION_CONTRACT */
export const CONTRACT_ADDRESS = COLLECTION_CONTRACT;

/** @deprecated Use MARKETPLACE_CONTRACT */
export const MEDIALANE_CONTRACT_ADDRESS = MARKETPLACE_CONTRACT;

/** @deprecated Use PINATA_GATEWAY */
export const IPFS_URL = PINATA_GATEWAY;

/** Block at which the collection registry was first deployed on mainnet. */
export const START_BLOCK = Number(process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT_START_BLOCK || 0);

/** Block at which the registry (collection contract) was deployed. */
export const REGISTRY_START_BLOCK = Number(
  process.env.NEXT_PUBLIC_COLLECTIONS_CONTRACT_START_BLOCK || 0
);

/** IP types allowed for minting. */
export const ALLOWED_IP_TYPES = [
  "Audio", "Art", "Documents", "NFT", "Video",
  "Photography", "Patents", "Posts", "Publications", "RWA",
] as const;

/** AVNU paymaster configuration for gasless transactions. */
export const AVNU_PAYMASTER_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY,
};

export const DURATION_OPTIONS = [
  { label: "1 Day", seconds: 86400 },
  { label: "7 Days", seconds: 604800 },
  { label: "30 Days", seconds: 2592000 },
  { label: "6 Months", seconds: 15552000 },
  { label: "1 Year", seconds: 31536000 },
  { label: "2 Years", seconds: 63072000 },
] as const;

