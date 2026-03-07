"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { StarkZapWalletProvider } from "@/contexts/starkzap-wallet-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["email", "google", "twitter"],
        appearance: { theme: "dark" },
      }}
    >
      <StarkZapWalletProvider>
        {children}
      </StarkZapWalletProvider>
    </PrivyProvider>
  );
}
