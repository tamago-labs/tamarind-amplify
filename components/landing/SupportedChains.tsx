"use client";

import { motion } from "framer-motion";
import { networkIcons } from "@web3icons/react";

const chains = [
  { name: "Solana", icon: networkIcons.NetworkSolana },
  { name: "Base", icon: networkIcons.NetworkBase },
  { name: "Avalanche", icon: networkIcons.NetworkAvalanche },
  { name: "Arbitrum", icon: networkIcons.NetworkArbitrumOne },
  { name: "Ethereum", icon: networkIcons.NetworkEthereum },
  { name: "Polygon", icon: networkIcons.NetworkPolygon },
  { name: "BSC", icon: networkIcons.NetworkBinanceSmartChain },
  { name: "Monad", icon: networkIcons.NetworkMonad },
  { name: "HashKey", icon: networkIcons.NetworkHashkey },
];

export default function SupportedChains() {
  return (
    <section id="supported-chains" className="bg-panel">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
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
            <span className="text-indigo">10+ Chains</span><span className="text-indigo text-lg align-super">*</span>
          </h2>
          <p className="text-lg text-sub max-w-2xl leading-relaxed mb-10">
            Send and receive payment assets across supported networks, with A-Pass identity and Cleanverse compliance checks built into every transfer.
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
            <span className="font-medium text-ink">Ethereum Sepolia</span>
            <span className="text-hair">·</span>
            <span className="font-medium text-ink">Monad Testnet</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
