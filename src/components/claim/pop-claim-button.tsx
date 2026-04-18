"use client";

import { toast } from "sonner";
import { Loader2, CheckCircle2, Ban, Award, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useUnifiedWallet } from "@/hooks/use-unified-wallet";
import { usePaymasterTransaction } from "@/hooks/use-paymaster-transaction";
import { usePopClaimStatus } from "@/hooks/use-pop";

interface PopClaimButtonProps {
  collectionAddress: string;
}

export function PopClaimButton({ collectionAddress }: PopClaimButtonProps) {
  const { address, isConnected } = useUnifiedWallet();
  const { claimStatus, isLoading, error, mutate } = usePopClaimStatus(
    collectionAddress,
    address ?? null
  );
  const { executeAuto, isLoading: isTxLoading } = usePaymasterTransaction();

  if (!isConnected) {
    return <ConnectWallet />;
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled className="w-full">
        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        Checking eligibility…
      </Button>
    );
  }

  if (error) {
    return (
      <Button variant="ghost" size="sm" className="w-full text-muted-foreground gap-1.5" onClick={() => mutate()}>
        <RefreshCw className="h-3.5 w-3.5" />
        Retry
      </Button>
    );
  }

  if (claimStatus?.hasClaimed) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-green-500 font-medium">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Claimed{claimStatus.tokenId ? ` · #${claimStatus.tokenId}` : ""}
      </div>
    );
  }

  if (claimStatus && !claimStatus.isEligible) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Ban className="h-3.5 w-3.5 shrink-0" />
        Not eligible
      </div>
    );
  }

  const handleClaim = async () => {
    try {
      await executeAuto([
        { contractAddress: collectionAddress, entrypoint: "claim", calldata: [] },
      ]);
      toast.success("Credential claimed! Your proof of participation is on-chain.");
      mutate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Claim failed");
    }
  };

  return (
    <Button
      size="sm"
      className="w-full gap-1.5"
      onClick={handleClaim}
      disabled={isTxLoading}
    >
      {isTxLoading ? (
        <><Loader2 className="h-3.5 w-3.5 animate-spin" />Claiming…</>
      ) : (
        <><Award className="h-3.5 w-3.5" />Claim credential</>
      )}
    </Button>
  );
}
