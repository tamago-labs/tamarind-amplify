"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Permission {
  action: string;
  company: boolean | string;
  counterparty: boolean | string;
  partner: boolean | string;
  investor: boolean | string;
}

const permissions: Permission[] = [
  { action: "Manage participants", company: true, counterparty: false, partner: false, investor: "Pool access only" },
  { action: "Financial records", company: true, counterparty: "View own", partner: "Permissioned review", investor: false },
  { action: "Invoice submission", company: true, counterparty: "Submit / Confirm", partner: "Review / Underwrite", investor: false },
  { action: "CVI identity verification", company: true, counterparty: true, partner: true, investor: true },
  { action: "Merkle proof verification", company: true, counterparty: true, partner: true, investor: true },
  { action: "CVA-verified RWA issuance", company: "Originate", counterparty: false, partner: "Purchase directly or pool", investor: false },
  { action: "Permissioned staking pools", company: false, counterparty: false, partner: "Create & manage", investor: "Stake into selected pool" },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-okgreen/15">
        <Check size={12} className="text-okgreen" />
      </span>
    );
  }
  if (value === false) {
    return <span className="text-ink/20">—</span>;
  }
  return <span className="text-xs text-sub font-medium">{value}</span>;
}

export default function OriginationLifecycle() {
  return (
    <section id="how-it-works" className="bg-paper">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
            The Origination{" "}
            <span className="text-indigo">Lifecycle</span>
          </h2>
          <p className="text-lg text-sub max-w-2xl leading-relaxed">
                From compliant Web3 payments to investable RWAs. Every record is cryptographically verified and originatable on-chain.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white border border-hair rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="grid grid-cols-5 border-b border-ink/8">
            <div className="px-6 py-4 text-sm font-medium text-ink/40">Permission Matrix</div>
            <div className="px-6 py-4 text-sm font-medium text-ink/70 text-center">Company</div>
            <div className="px-6 py-4 text-sm font-medium text-ink/70 text-center">Counter-party</div>
            <div className="px-6 py-4 text-sm font-medium text-ink/70 text-center">Financial Partner</div>
            <div className="px-6 py-4 text-sm font-medium text-ink/70 text-center">Pool Investor</div>
          </div>

          {/* Rows */}
          {permissions.map((row, i) => (
            <div
              key={row.action}
              className={`grid grid-cols-5 ${i < permissions.length - 1 ? "border-b border-ink/5" : ""}`}
            >
              <div className="px-6 py-4 text-sm text-ink font-medium">{row.action}</div>
              <div className="px-6 py-4 flex items-center justify-center">
                <CellValue value={row.company} />
              </div>
              <div className="px-6 py-4 flex items-center justify-center">
                <CellValue value={row.counterparty} />
              </div>
              <div className="px-6 py-4 flex items-center justify-center">
                <CellValue value={row.partner} />
              </div>
              <div className="px-6 py-4 flex items-center justify-center">
                <CellValue value={row.investor} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
