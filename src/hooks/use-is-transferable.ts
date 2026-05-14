import { useReadContract } from "@starknet-react/core";
import { Abi } from "starknet";
import { ipCollectionAbi } from "@/abis/ip_collection";
import { COLLECTION_721_CONTRACT } from "@/lib/constants";

interface UseIsTransferableArgs {
  /** On-chain numeric collection ID (decimal string). */
  collectionId: string | undefined;
  /** Numeric token ID within the collection (decimal string). */
  tokenId: string | undefined;
}

/**
 * Wraps the audited IPCollection.is_transferable_token view.
 * Returns true when the token exists and is not archived.
 *
 * For tokens that do not belong to the audited registry (legacy or external
 * collections), this hook errors and `isTransferable` is `undefined` — callers
 * must treat `undefined` as "no signal" and default to allowing the action.
 */
export function useIsTransferable({ collectionId, tokenId }: UseIsTransferableArgs) {
  const enabled = Boolean(collectionId && tokenId);
  const tokenKey = enabled ? `${collectionId}:${tokenId}` : undefined;

  const { data, isLoading, error, refetch } = useReadContract({
    abi: ipCollectionAbi as unknown as Abi,
    functionName: "is_transferable_token",
    address: COLLECTION_721_CONTRACT,
    args: tokenKey ? [tokenKey] : undefined,
    watch: false,
  });

  // Cairo bool decodes as boolean in starknet.js v6+/v8.
  const isTransferable: boolean | undefined =
    data === undefined || data === null ? undefined : Boolean(data);

  return { isTransferable, isLoading, error, refetch };
}
