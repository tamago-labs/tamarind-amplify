"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "$150k", label: "in Merkle-verified payment history after 3 months" },
  { value: "$30k", label: "invoice receivable originated, backed by that history" },
  { value: "Minutes, not weeks", label: "to verify — no PDFs, no reconstructed evidence" },
];

export default function RealWorldExample() {
  return (
    <section className="bg-paper">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
            Real-World Example
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight">
            From Invoice to{" "}
            <span className="text-indigo">Capital</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* BEFORE Card */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4 }}
            className="bg-panel border border-hair rounded-xl p-6"
          >
            <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-4">
              Before
            </p>
            <h3 className="text-lg font-semibold text-ink mb-3">
              Getting Financed, the Old Way
            </h3>
            <p className="text-sm text-sub leading-relaxed">
              A company invoicing $50k a month in USDC needs working capital. Their bank asks for six months of invoices, payroll runs, and bank statements. Someone spends three weeks exporting PDFs, redacting spreadsheets, and answering the same questions twice. By the time the lender responds, the cash need has already passed.
            </p>
          </motion.div>

          {/* WITH TAMARIND Card */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-panel border border-indigo/30 rounded-xl p-6"
          >
            <p className="font-mono text-[11px] font-medium tracking-wide text-indigo uppercase mb-4">
              With Tamarind
            </p>
            <h3 className="text-lg font-semibold text-ink mb-3">
              Getting Financed, on Tamarind
            </h3>
            <p className="text-sm text-sub leading-relaxed">
              That same company has been invoicing and running payroll on Tamarind for three months. Every invoice and payslip is already Merkle-rooted and CVI-verified. When they need capital, they don&apos;t gather anything — they originate an invoice receivable directly from their existing history. A financial partner reviews it the same day.
            </p>
          </motion.div>
        </div>

        {/* Stats Strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-hair"
        >
          {STATS.map((stat) => (
            <div key={stat.value}>
              <p className="text-2xl md:text-3xl font-semibold text-indigo mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-sub leading-relaxed">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Closing Line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-sm text-sub italic"
        >
          Same company. Same invoices. The only thing that changed is who has to do the work.
        </motion.p>
      </div>
    </section>
  );
}
