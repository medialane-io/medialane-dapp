"use client";

import { PopClaimButton } from "@/components/claim/pop-claim-button";

interface CollectionServiceActionProps {
  source: string | null | undefined;
  contractAddress: string;
}

export function CollectionServiceAction({ source, contractAddress }: CollectionServiceActionProps) {
  if (source === "POP_PROTOCOL") {
    return <PopClaimButton collectionAddress={contractAddress} />;
  }
  return null;
}
