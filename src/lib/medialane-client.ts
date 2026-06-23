import { MedialaneClient } from "@medialane/sdk";
import {
  COLLECTION_1155_CONTRACT,
  COLLECTION_721_CONTRACT,
  MARKETPLACE_1155_CONTRACT,
  MARKETPLACE_721_CONTRACT,
  MEDIALANE_API_KEY,
  MEDIALANE_BACKEND_URL,
  STARKNET_RPC_URL,
} from "./constants";

let _client: MedialaneClient | null = null;

export function getMedialaneClient(): MedialaneClient {
  if (!_client) {
    // Browser: the same-origin /api/rpc proxy (STARKNET_RPC_URL). Server (RSC):
    // a relative proxy URL can't resolve, so use the keyed Alchemy URL directly
    // — ALCHEMY_RPC_URL is server-only (no NEXT_PUBLIC_), never in the bundle.
    const rpcUrl =
      (typeof window === "undefined"
        ? process.env.ALCHEMY_RPC_URL || process.env.STARKNET_RPC_URL_SERVER
        : STARKNET_RPC_URL) || undefined;
    _client = new MedialaneClient({
      backendUrl: MEDIALANE_BACKEND_URL,
      apiKey: MEDIALANE_API_KEY || undefined,
      rpcUrl,
      marketplaceContract: MARKETPLACE_721_CONTRACT,
      marketplace1155Contract: MARKETPLACE_1155_CONTRACT,
      collectionContract: COLLECTION_721_CONTRACT,
      collection1155Contract: COLLECTION_1155_CONTRACT,
      chain: "STARKNET",
    });
  }
  return _client;
}
