"use client";

import { motion, type Variants } from "framer-motion";
import { BrainCircuit, BookOpen, Workflow, Coins, ArrowRightLeft, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

const features: Feature[] = [
  {
    icon: BrainCircuit,
    title: "Local AI payslips",
    body: "On-device AI generates localized payslips with withholding tax and social security breakdowns.",
  },
  {
    icon: BookOpen,
    title: "Private knowledge base",
    body: "RAG-powered document search with zero cloud exposure — queries relay P2P to employer machine.",
  },
  {
    icon: Workflow,
    title: "Visual flow builder",
    body: "Drag-and-drop payroll flows connecting employees, payment rules, and wallets.",
  },
  {
    icon: Coins,
    title: "Canton settlement",
    body: "Atomic payroll settlement on Canton with immutable audit trails and selective disclosure.",
  },
  {
    icon: ArrowRightLeft,
    title: "P2P distribution",
    body: "Payslips and documents synced direct to employee machines via encrypted peer-to-peer.",
  },
  {
    icon: Clock,
    title: "Attendance & rewards",
    body: "On-chain daily check-ins with automatic reward point tracking on Canton smart contracts.",
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
            Everything you need to{" "}
            <span className="text-indigo">run payroll</span>.
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
