"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface Permission {
  action: string;
  company: boolean | string;
  payee: boolean | string;
  partner: boolean | string;
  investor: boolean | string;
}

const permissions: Permission[] = [
  { action: "Manage participants", company: true, payee: false, partner: false, investor: false },
  { action: "Payroll & payment records", company: true, payee: "View own", partner: false, investor: false },
  { action: "Invoices & documents", company: true, payee: "View own", partner: "Permissioned", investor: false },
  { action: "Invoice / receivable submission", company: "Create", payee: "Submit / Confirm", partner: "Review", investor: false },
  { action: "CVI identity & tier verification", company: true, payee: true, partner: true, investor: true },
  { action: "Merkle proof verification", company: true, payee: true, partner: true, investor: true },
  { action: "CVA-verified RWA issuance", company: "Originate", payee: false, partner: "Review", investor: false },
  { action: "Receivable financing (Invoice financing, Payroll financing)", company: "Connect", payee: false, partner: "Finance", investor: "Finance" },
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
            Permission Model
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight mb-4">
            The Origination{" "}
            <span className="text-indigo">Lifecycle</span>
          </h2>
          <p className="text-lg text-sub max-w-2xl leading-relaxed">
            Every participant operates inside the same compliant workspace. Each record strengthens the history behind every RWA.
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
          <div className="grid grid-cols-4 border-b border-ink/8">
            <div className="px-6 py-4 text-sm font-medium text-ink/40">Permission Matrix</div>
            <div className="px-6 py-4 text-sm font-medium text-ink/70 text-center">Company</div>
            <div className="px-6 py-4 text-sm font-medium text-ink/70 text-center">Payee / Payer</div>
            <div className="px-6 py-4 text-sm font-medium text-ink/70 text-center">Financial Partner</div>
          </div>

          {/* Rows */}
          {permissions.map((row, i) => (
            <div
              key={row.action}
              className={`grid grid-cols-4 ${i < permissions.length - 1 ? "border-b border-ink/5" : ""}`}
            >
              <div className="px-6 py-4 text-sm text-ink font-medium">{row.action}</div>
              <div className="px-6 py-4 flex items-center justify-center">
                <CellValue value={row.company} />
              </div>
              <div className="px-6 py-4 flex items-center justify-center">
                <CellValue value={row.payee} />
              </div>
              <div className="px-6 py-4 flex items-center justify-center">
                <CellValue value={row.partner} />
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
