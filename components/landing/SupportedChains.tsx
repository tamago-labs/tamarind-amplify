"use client";

import { motion } from "framer-motion";
import { networkIcons } from "@web3icons/react";

const chains = [
  { name: "Monad", icon: networkIcons.NetworkMonad },
  { name: "Base", icon: networkIcons.NetworkBase },
  { name: "Ethereum", icon: networkIcons.NetworkEthereum },
  { name: "Arbitrum", icon: networkIcons.NetworkArbitrumOne },
  { name: "Polygon", icon: networkIcons.NetworkPolygon },
  { name: "Solana", icon: networkIcons.NetworkSolana },
  { name: "Tron", icon: networkIcons.NetworkTron },
  { name: "Optimism", icon: networkIcons.NetworkOptimism },
  { name: "Sonic", icon: networkIcons.NetworkSonic },
  { name: "Sei", icon: networkIcons.NetworkSeiNetwork },
  { name: "Unichain", icon: networkIcons.NetworkUnichain },
  { name: "World Chain", icon: networkIcons.NetworkWorld },
  { name: "Linea", icon: networkIcons.NetworkLinea },
  { name: "Cronos", icon: networkIcons.NetworkCronos },
  { name: "Avalanche", icon: networkIcons.NetworkAvalanche },
  { name: "Flow", icon: networkIcons.NetworkFlow },
  { name: "Hedera", icon: networkIcons.NetworkHederaHashgraph },
  { name: "NEAR", icon: networkIcons.NetworkNearProtocol },
  { name: "Celo", icon: networkIcons.NetworkCelo },
  { name: "Gnosis", icon: networkIcons.NetworkGnosis },
  { name: "zkSync", icon: networkIcons.NetworkZksync },
];

export default function SupportedChains() {
  return (
    <section id="supported-chains" className="bg-panel">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4 }}
        >
          <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
            Supported Chains
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
            Available on{" "}
            <span className="text-indigo">20+ Chains</span><span className="text-indigo text-lg align-super">*</span>
          </h2>
          <p className="text-lg text-sub max-w-2xl leading-relaxed mb-10">
            Send and receive USDC on any supported network. Cross-chain transfers powered by Circle Gateway — same asset, instant settlement.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {chains.map((chain, i) => {
              const Icon = chain.icon;
              return (
                <motion.div
                  key={chain.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className="bg-white border border-hair rounded-xl px-4 py-3 flex items-center gap-2.5 shadow-sm hover:border-indigo/40 hover:shadow-md transition-all"
                >
                  {Icon && <Icon variant="branded" size={20} />}
                  <span className="text-sm font-medium text-ink/70">{chain.name}</span>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-sm">
            <span className="text-sub">*Now available on testnet during Alpha:</span>
            <span className="font-medium text-ink">Base Sepolia</span>
            <span className="text-hair">·</span>
            <span className="font-medium text-ink">Monad Testnet</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
