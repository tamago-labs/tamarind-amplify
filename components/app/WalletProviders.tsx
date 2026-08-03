"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { ReactNode } from "react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { config } from "@/lib/wagmi";
import WalletProvider from "./WalletProvider";

export default function WalletProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <WagmiProvider config={config}><QueryClientProvider client={queryClient}><RainbowKitProvider><WalletProvider>{children}</WalletProvider></RainbowKitProvider></QueryClientProvider></WagmiProvider>;
}
