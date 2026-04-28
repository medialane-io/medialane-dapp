import { MedialaneClient } from "@medialane/sdk";
import { MEDIALANE_BACKEND_URL, MEDIALANE_API_KEY, STARKNET_RPC_URL, MARKETPLACE_721_CONTRACT } from "./constants";

let _client: MedialaneClient | null = null;

export function getMedialaneClient(): MedialaneClient {
  if (!_client) {
    _client = new MedialaneClient({
      backendUrl: MEDIALANE_BACKEND_URL,
      apiKey: MEDIALANE_API_KEY || undefined,
      rpcUrl: STARKNET_RPC_URL || undefined,
      marketplaceContract: MARKETPLACE_721_CONTRACT,
      network: "mainnet",
    });
  }
  return _client;
}
