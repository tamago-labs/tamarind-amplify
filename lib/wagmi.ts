import { baseSepolia, sepolia } from "viem/chains";
import { defineChain } from "viem";
import { createConfig, http, injected } from "wagmi";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY || "";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "Monad", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet-rpc.monad.xyz"] } },
  blockExplorers: { default: { name: "Monadscan", url: "https://testnet.monadscan.com" } },
  testnet: true,
});

export const config = createConfig({
  chains: [baseSepolia, sepolia, monadTestnet],
  connectors: [injected()],
  transports: {
    [baseSepolia.id]: http(alchemyKey ? `https://base-sepolia.g.alchemy.com/v2/${alchemyKey}` : "https://sepolia.base.org"),
    [sepolia.id]: http(alchemyKey ? `https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}` : "https://rpc.sepolia.org"),
    [monadTestnet.id]: http("https://testnet-rpc.monad.xyz"),
  },
  ssr: true,
});
