"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { BaseSepolia, EthereumSepolia } from "@circle-fin/app-kit/chains";

interface WalletState {
  adapter: unknown | null;
  address: string | null;
  connected: boolean;
}

const WalletContext = createContext<WalletState>({ adapter: null, address: null, connected: false });

export function useWallet() {
  return useContext(WalletContext);
}

export default function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [adapter, setAdapter] = useState<unknown | null>(null);

  useEffect(() => {
    if (!isConnected || !walletClient) {
      setAdapter(null);
      return;
    }

    async function createAdapter() {
      try {
        const nextAdapter = await createViemAdapterFromProvider({
          provider: walletClient as never,
          capabilities: { supportedChains: [BaseSepolia, EthereumSepolia] },
        });
        setAdapter(nextAdapter);
      } catch (error) {
        console.error("Could not create Circle wallet adapter:", error);
        setAdapter(null);
      }
    }

    createAdapter();
  }, [isConnected, walletClient]);

  return <WalletContext.Provider value={{ adapter, address: address || null, connected: isConnected }}>{children}</WalletContext.Provider>;
}
