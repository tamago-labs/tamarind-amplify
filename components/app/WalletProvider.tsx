"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { BaseSepolia } from "@circle-fin/app-kit/chains";

interface WalletState {
  adapter: unknown | null;
  address: string | null;
  connected: boolean;
  chain: string | null;
}

const WalletContext = createContext<WalletState>({ adapter: null, address: null, connected: false, chain: null });

export function useWallet() {
  return useContext(WalletContext);
}

function mapChainIdToName(chainId: number | undefined): string | null {
  if (!chainId) return null;
  // Base: 8453, Base Sepolia: 84531, Base Sepolia (alt): 84532, Monad: 10143
  switch (chainId) {
    case 8453:
    case 84531:
    case 84532:
      return "base";
    case 10143:
      return "monad";
    default:
      return null;
  }
}

export default function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [adapter, setAdapter] = useState<unknown | null>(null);

  const chain = mapChainIdToName(chainId);

  useEffect(() => {
    if (!isConnected || !walletClient) {
      setAdapter(null);
      return;
    }

    async function createAdapter() {
      try {
        const nextAdapter = await createViemAdapterFromProvider({
          provider: walletClient as never,
          capabilities: { supportedChains: [BaseSepolia] },
        });
        setAdapter(nextAdapter);
      } catch (error) {
        console.error("Could not create Circle wallet adapter:", error);
        setAdapter(null);
      }
    }

    createAdapter();
  }, [isConnected, walletClient]);

  return <WalletContext.Provider value={{ adapter, address: address || null, connected: isConnected, chain }}>{children}</WalletContext.Provider>;
}
