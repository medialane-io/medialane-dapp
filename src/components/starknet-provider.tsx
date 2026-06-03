"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  avnuPaymasterProvider,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import { RpcProvider } from "starknet";
import { idResolvedBraavos, idResolvedReady } from "@/lib/starknet-connectors";
import { failoverFetch } from "@/lib/starknet";
import { QueryClient } from "@tanstack/react-query";

/**
 * Tamed React Query defaults for starknet-react. Without this it uses RQ's
 * defaults — `refetchOnWindowFocus: true` + 3 retries — so every tab focus
 * fired a burst of contract reads (visible as the 503 storm during the
 * 2026-06-03 Alchemy outage). Disable focus refetching, bound retries, and add
 * a small staleTime so reads aren't hammered. Module-scoped → one stable client.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
      staleTime: 10_000,
    },
  },
});

interface NetworkContextType {
  currentNetwork: 'mainnet' | 'sepolia';
  networkConfig: {
    chainId: string;
    name: string;
    explorerUrl: string;
  };
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const NETWORK_DEFAULT: NetworkContextType = {
  currentNetwork: 'mainnet',
  networkConfig: {
    chainId: '23448594291968334',
    name: 'Starknet Mainnet',
    explorerUrl: 'https://voyager.online',
  },
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  return context ?? NETWORK_DEFAULT;
};

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = useMemo(() => [mainnet, sepolia], []);
  const recommendedConnectors = useMemo(
    () => [idResolvedReady(), idResolvedBraavos()],
    [],
  );

  const { connectors } = useInjectedConnectors({
    recommended: recommendedConnectors,
    includeRecommended: "always",
    order: "alphabetical",
  });

  // Determine network from environment variable, default to mainnet
  const networkEnv = process.env.NEXT_PUBLIC_STARKNET_NETWORK === 'sepolia' ? 'sepolia' : 'mainnet';
  const currentNetwork = networkEnv;

  const networkConfigs = {
    mainnet: {
      chainId: mainnet.id.toString(),
      name: 'Starknet Mainnet',
      explorerUrl: 'https://voyager.online'
    },
    sepolia: {
      chainId: sepolia.id.toString(),
      name: 'Starknet Sepolia',
      explorerUrl: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://voyager.online'
    }
  };

  // Get current network config
  const networkConfig = networkConfigs[currentNetwork];

  // Retrieve your custom RPC URL from environment variables
  const customRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  const providerFactory = useCallback(
    (_chain: unknown) =>
      new RpcProvider({ nodeUrl: customRpcUrl || "", baseFetch: failoverFetch }),
    [customRpcUrl],
  );
  const paymasterProvider = useMemo(
    () => avnuPaymasterProvider({
      apiKey: process.env.NEXT_PUBLIC_AVNU_PAYMASTER_API_KEY,
    }),
    [],
  );

  return (
    <NetworkContext.Provider value={{
      currentNetwork,
      networkConfig
    }}>
      <StarknetConfig
        chains={chains}
        provider={providerFactory}
        paymasterProvider={paymasterProvider}
        connectors={connectors}
        explorer={voyager}
        queryClient={queryClient}
        defaultChainId={currentNetwork === 'mainnet' ? mainnet.id : sepolia.id}
        autoConnect={true}
      >
        {children}
      </StarknetConfig>
    </NetworkContext.Provider>
  );
}
