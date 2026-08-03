"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const SUBSECTION_1_BULLETS = [
  "Payroll, contractor & vendor records",
  "Invoice & receivable tracking",
  "Merkle-rooted financial records",
  "Programmable compliance rules",
];

const SUBSECTION_2_BULLETS = [
  "CVI identity binding per wallet",
  "Travel Rule compliance on every transfer",
  "Identity tiers assigned per company & investor",
  "Built on Cleanverse's compliance network",
];

const SUBSECTION_3_BULLETS = [
  "CVA-verified RWA issuance",
  "Tier-gated holding & transfer rules",
  "Non-compliant transfers rejected automatically",
  "Invoice receivable origination backed by verified payment history",
];

const SUBSECTION_4_BULLETS = [
  "Direct financing by Financial Partners",
  "One permissioned pool per Financial Partner",
  "Pool Investor staking without receivable selection",
  "Partner-defined pool terms and eligibility",
];

export default function ProductHighlights() {
  return (
    <>
      {/* Subsection #1: Compliance Workspace */}
      <section className="bg-paper">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
                <span className="text-indigo">Compliance</span> Workspace
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                Design payment workflows visually with drag-and-drop. From payroll to invoicing, every transaction is compliance-ready, cryptographically verifiable, and originatable as an RWA.
              </p>
              <ul className="space-y-3">
                {SUBSECTION_1_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-okgreen/15 flex-shrink-0">
                      <Check size={12} className="text-okgreen" />
                    </span>
                    <span className="text-sm text-ink font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <figure className="relative rounded-xl overflow-hidden border border-hair bg-panel shadow-sm">
                <img
                  src="/screenshot-payroll-flow.png"
                  alt="Tamarind compliance workspace"
                  className="block w-full h-auto"
                />
              </figure>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subsection #2: Verified Identity */}
      <section className="bg-panel">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4 }}
              className="order-2 lg:order-1"
            >
              <figure className="relative rounded-xl overflow-hidden border border-hair bg-paper shadow-sm">
                <img
                  src="/screenshot-knowledge-base.png"
                  alt="Tamarind verified identity layer"
                  className="block w-full h-auto"
                />
              </figure>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
                <span className="text-indigo">Verified</span> Identity
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                Every wallet on Tamarind carries a CVI-bound identity — verified once, enforced everywhere. Travel Rule data travels with the transaction, not around it.
              </p>
              <ul className="space-y-3">
                {SUBSECTION_2_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-okgreen/15 flex-shrink-0">
                      <Check size={12} className="text-okgreen" />
                    </span>
                    <span className="text-sm text-ink font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subsection #3: RWA Origination */}
      <section className="bg-paper">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
                <span className="text-indigo">RWA</span> Origination
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                Run your payment operations as usual. When receivables are waiting for settlement, tokenize them into compliant RWAs. No paperwork, no delays, just verifiable history backing every asset.
              </p>
              <ul className="space-y-3">
                {SUBSECTION_3_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-okgreen/15 flex-shrink-0">
                      <Check size={12} className="text-okgreen" />
                    </span>
                    <span className="text-sm text-ink font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <figure className="relative rounded-xl overflow-hidden border border-hair bg-panel shadow-sm">
                <img
                  src="/screenshot-payroll-flow.png"
                  alt="Tamarind programmable RWA issuance"
                  className="block w-full h-auto"
                />
              </figure>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subsection #4: RWA Marketplace */}
      <section className="bg-panel">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4 }}
              className="order-2 lg:order-1"
            >
              <figure className="relative rounded-xl overflow-hidden border border-hair bg-paper shadow-sm">
                <img
                  src="/screenshot-knowledge-base.png"
                  alt="Tamarind RWA marketplace"
                  className="block w-full h-auto"
                />
              </figure>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
                <span className="text-indigo">RWA</span> Marketplace
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                Financial Partners can finance receivables directly or aggregate underwritten receivables into their own permissioned pool. Pool Investors stake into a selected partner pool without choosing individual receivables.
              </p>
              <ul className="space-y-3">
                {SUBSECTION_4_BULLETS.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-okgreen/15 flex-shrink-0">
                      <Check size={12} className="text-okgreen" />
                    </span>
                    <span className="text-sm text-ink font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
