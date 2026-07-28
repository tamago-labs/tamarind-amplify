"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const CRYPTO_TOKENS = [
  { symbol: "CC", name: "Canton Coin" },
  { symbol: "cBTC", name: "Canton Bitcoin" },
  { symbol: "USDCx", name: "Bridged USDC" },
];

const JURISDICTIONS = [
  {
    country: "Japan",
    entities: "KK (株式会社), GK (合同会社)",
    features: "Withholding tax, Nenkin (年金) social insurance, resident tax",
  },
  {
    country: "Thailand",
    entities: "Co., Ltd. (บริษัทจำกัด), Ltd. Partnership (หจก.)",
    features: "Personal income tax, social security (SSO), withholding tax",
  },
  {
    country: "Others",
    entities: "US, UK, EU, Singapore, and more",
    features: "Withholding tax, social security, pension — jurisdiction-specific rules built in",
  },
];

export default function GlobalPayroll() {
  return (
    <section className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
            Pay the team where they{" "}
            <span className="text-indigo">actually live</span>.
          </h2>
          <p className="text-lg text-sub max-w-xl leading-relaxed">
            Flexible payments — crypto on Canton or fiat to local bank accounts.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Options Card */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="bg-panel border border-hair rounded-xl p-6"
          >
            <h3 className="text-lg font-medium text-ink mb-6">Payment Options</h3>

            <div className="space-y-6">
              <div>
                <p className="font-mono text-[11px] tracking-wide text-sub uppercase mb-3">Crypto</p>
                <div className="flex flex-wrap gap-2">
                  {CRYPTO_TOKENS.map((token) => (
                    <span
                      key={token.symbol}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-paper border border-hair text-sm"
                    >
                      <span className="font-mono font-medium text-okgreen">{token.symbol}</span>
                      <span className="text-sub">{token.name}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] tracking-wide text-sub uppercase mb-3">Fiat</p>
                <div className="flex flex-wrap gap-2">
                  {["JPY", "THB", "USD"].map((currency) => (
                    <span
                      key={currency}
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-paper border border-hair text-sm font-mono font-medium text-ink"
                    >
                      {currency}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[11px] tracking-wide text-sub uppercase mb-3">Multi-currency split</p>
                <p className="text-sm text-sub leading-relaxed">
                  e.g. 50% stablecoin / 50% fiat — split payments across crypto and traditional rails.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Jurisdictions Card */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-panel border border-hair rounded-xl p-6"
          >
            <h3 className="text-lg font-medium text-ink mb-6">Jurisdictions</h3>

            <div className="space-y-4">
              {JURISDICTIONS.map((j) => (
                <div key={j.country} className="flex items-start gap-3 pb-4 border-b border-hair last:border-0 last:pb-0">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-okgreen/15 flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-okgreen" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-ink">{j.country}</span>
                      <span className="text-xs text-sub">{j.entities}</span>
                    </div>
                    <p className="text-sm text-sub leading-relaxed">{j.features}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
