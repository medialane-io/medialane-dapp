"use client";

import { useRef } from "react";
import { ConnectWallet } from "@/components/ConnectWallet";
import { GenesisMint } from "@/components/airdrop/genesis-mint";
import { PrivyInlineLogin, type PrivyInlineLocale } from "@/components/airdrop/privy-inline-login";
import { useWallet } from "@/hooks/use-wallet";
import { MINT_CONTRACT, GENESIS_NFT_URI } from "@/lib/constants";

interface AirdropClaimProps {
  storageKey: string;
  locale?: PrivyInlineLocale;
}

/**
 * Shared CTA used on /mint and /airdrop. Shows the Privy email login when
 * disconnected, or the GenesisMint claim button once a wallet is connected.
 * Mounts a hidden ConnectWallet so the "Other ways to sign in" link can
 * programmatically open the wallet picker.
 */
export function AirdropClaim({ storageKey, locale = "en" }: AirdropClaimProps) {
  const { isConnected } = useWallet();
  const hiddenConnectRef = useRef<HTMLDivElement | null>(null);

  const openWalletPicker = () => {
    const btn = hiddenConnectRef.current?.querySelector("button");
    btn?.click();
  };

  return (
    <>
      {isConnected ? (
        <GenesisMint
          contract={MINT_CONTRACT}
          nftUri={GENESIS_NFT_URI}
          storageKey={storageKey}
          locale={locale}
        />
      ) : (
        <PrivyInlineLogin onOpenWalletPicker={openWalletPicker} locale={locale} />
      )}

      {/* Hidden ConnectWallet — programmatically triggered by the
          "Other ways to sign in" link in PrivyInlineLogin. */}
      <div ref={hiddenConnectRef} className="hidden">
        <ConnectWallet />
      </div>
    </>
  );
}
