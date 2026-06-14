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
    _client = new MedialaneClient({
      backendUrl: MEDIALANE_BACKEND_URL,
      apiKey: MEDIALANE_API_KEY || undefined,
      rpcUrl: STARKNET_RPC_URL || undefined,
      marketplaceContract: MARKETPLACE_721_CONTRACT,
      marketplace1155Contract: MARKETPLACE_1155_CONTRACT,
      collectionContract: COLLECTION_721_CONTRACT,
      collection1155Contract: COLLECTION_1155_CONTRACT,
      chain: "STARKNET",
    });
  }
  return _client;
}
