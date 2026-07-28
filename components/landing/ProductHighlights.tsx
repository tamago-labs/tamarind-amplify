"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const SUBSECTION_1_BULLETS = [
  "Employee records & roles",
  "Payroll rules & templates",
  "Attendance & on-chain rewards",
  "Fiat & crypto settlement",
];

const SUBSECTION_2_BULLETS = [
  "P2P syncs payslips & docs direct",
  "Local AI generates payslips",
  "Knowledge base via P2P relay",
  "Zero cloud exposure",
];

export default function ProductHighlights() {
  return (
    <>
      {/* Subsection #1: Content left, screenshot right — bg-paper for contrast */}
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
                HR & Payroll, <span className="text-indigo">Simplified</span>.
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                One platform to manage people, payroll, and compliance — built for Web3.
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
                  alt="Tamarind payroll flow builder"
                  className="block w-full h-auto"
                />
              </figure>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Subsection #2: Screenshot left, content right — bg-panel for contrast */}
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
                  alt="Tamarind knowledge base with AI search"
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
                Team Collaboration, <span className="text-indigo">AI-Assisted</span>.
              </h2>
              <p className="text-lg text-sub leading-relaxed mb-6">
                Work together without exposing data to the cloud. AI empowers every step.
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
