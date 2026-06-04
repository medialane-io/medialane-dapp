"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { mainnet } from "@starknet-react/chains";
import {
  StarknetConfig,
  avnuPaymasterProvider,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";
import { RpcProvider } from "starknet";
import { idResolvedBraavos, idResolvedReady } from "@/lib/starknet-connectors";

interface NetworkContextType {
  currentNetwork: 'starknet';
  networkConfig: {
    chainId: string;
    name: string;
    explorerUrl: string;
  };
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const NETWORK_DEFAULT: NetworkContextType = {
  currentNetwork: 'starknet',
  networkConfig: {
    chainId: '23448594291968334',
    name: 'Starknet',
    explorerUrl: 'https://voyager.online',
  },
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  return context ?? NETWORK_DEFAULT;
};

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = useMemo(() => [mainnet], []);
  const recommendedConnectors = useMemo(
    () => [idResolvedReady(), idResolvedBraavos()],
    [],
  );

  const { connectors } = useInjectedConnectors({
    recommended: recommendedConnectors,
    includeRecommended: "always",
    order: "alphabetical",
  });

  // Mainnet-only, identified by chain ("starknet"), not tier. When multichain
  // ships, add real chains here — never testnets.
  const currentNetwork = 'starknet' as const;

  const networkConfigs = {
    starknet: {
      chainId: mainnet.id.toString(),
      name: 'Starknet',
      explorerUrl: 'https://voyager.online',
    },
  };

  const networkConfig = networkConfigs[currentNetwork];

  // Retrieve your custom RPC URL from environment variables
  const customRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

  const providerFactory = useCallback(
    (_chain: unknown) => new RpcProvider({ nodeUrl: customRpcUrl || "" }),
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
        defaultChainId={mainnet.id}
        autoConnect={true}
      >
        {children}
      </StarknetConfig>
    </NetworkContext.Provider>
  );
}
