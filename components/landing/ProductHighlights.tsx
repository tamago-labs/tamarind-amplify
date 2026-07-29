"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const SUBSECTION_1_BULLETS = [
  "Employee records & compensation rules",
  "CVI identity verification",
  "Automated payroll execution",
  "Fiat & digital asset settlement",
];

const SUBSECTION_2_BULLETS = [
  "Payroll receivable origination",
  "CVA-verified RWA issuance",
  "Investor marketplace",
  "Employee salary advances",
];

export default function ProductHighlights() {
  return (
    <>
      {/* Subsection #1: Enterprise Payroll Meets Web3 */}
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
                Enterprise Payroll <span className="text-indigo">Meets Web3</span>
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                Bring programmable payments into existing payroll operations. Tamarind connects HR, compliance, and digital asset settlement into one verifiable payroll system.
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
                  alt="Tamarind HR and payroll workspace"
                  className="block w-full h-auto"
                />
              </figure>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subsection #2: Marketplace for Payroll RWAs */}
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
                  alt="Tamarind employee token pools"
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
                Marketplace for <span className="text-indigo">Payroll RWAs</span>
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                Connect companies seeking payroll liquidity with investors looking for compliant real-world assets. Tamarind turns verified payroll obligations into transparent investment opportunities.
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
    </>
  );
}
