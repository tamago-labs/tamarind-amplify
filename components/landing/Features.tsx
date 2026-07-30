"use client";

import { motion, type Variants } from "framer-motion";
import { Users, ClipboardList, ShieldCheck, Link, CircleDollarSign, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const features: Feature[] = [
  {
    icon: Users,
    title: "Payee records",
    body: "Centralized directory for employees, contractors, and vendors.",
  },
  {
    icon: ClipboardList,
    title: "Payroll & invoicing rules",
    body: "Configurable templates for payroll, contractor payments, and invoicing.",
  },
  {
    icon: ShieldCheck,
    title: "CVI-bound identity",
    body: "Every participant and wallet carries a verified CVI identity, enforced at every transaction.",
  },
  {
    icon: Link,
    title: "Merkle-rooted records",
    body: "Every payslip, invoice, and settlement is hashed into a verifiable, tamper-proof history.",
  },
  {
    icon: CircleDollarSign,
    title: "Invoice receivable origination",
    body: "Verified invoice history becomes a RWA — ready for financing, without reassembling evidence.",
  },
  {
    icon: Lock,
    title: "Tiered, permissioned access",
    body: "RWA holding and transfer rights are enforced by CVI tier — non-compliant transfers fail by design.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 28,
    },
  },
};

export default function Features() {
  return (
    <section id="features" className="bg-paper">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mb-12"
        >
          <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
            Key Features
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight">
            The Workspace Behind Every{" "}
            <span className="text-indigo">Verified Record</span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((f) => (
            <motion.article
              key={f.title}
              variants={cardVariants}
              className="bg-panel border border-hair rounded-xl p-6 hover:border-indigo/40 transition-colors"
            >
              <f.icon size={24} className="text-indigo mb-4" strokeWidth={1.5} />

              <h3 className="text-lg font-medium text-ink mb-2">
                {f.title}
              </h3>

              <p className="text-sm text-sub leading-relaxed">
                {f.body}
              </p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
