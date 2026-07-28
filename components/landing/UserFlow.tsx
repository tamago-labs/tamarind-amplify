"use client";

import { motion, type Variants } from "framer-motion";
import { Terminal } from "lucide-react";

interface Step {
  num: string;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    num: "01",
    title: "Configure",
    body: "Set up company profile, employees with salary and tax info, and payment templates.",
  },
  {
    num: "02",
    title: "Build Flow",
    body: "Connect wallets, employees, and payment rules using the visual flow builder.",
  },
  {
    num: "03",
    title: "Run Payroll",
    body: "Click Start. The system processes payments atomically on Canton with full audit trail.",
  },
  {
    num: "04",
    title: "Distribute",
    body: "Employees receive payslips via P2P and access assets through the portal.",
  },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 28,
      delay: i * 0.08,
    },
  }),
};

const circleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 360,
      damping: 22,
      delay: 0.04 + i * 0.08,
    },
  }),
};

export default function UserFlow() {
  return (
    <section id="flow" className="bg-panel">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="mb-12">
          <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight max-w-2xl">
            From payroll documents to{" "}
            <span className="text-indigo">private settlements</span> — in
            four steps.
          </h2>
        </div>

        <ol className="relative list-none m-0 p-0">
          <div
            className="absolute left-[19px] top-4 bottom-4 w-px bg-hair"
            aria-hidden="true"
          />

          {steps.map((s, i) => (
            <motion.li
              key={s.num}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              variants={itemVariants}
              className="relative flex gap-6 pb-10 last:pb-0"
            >
              <motion.div
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={circleVariants}
                className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-panel border border-hair flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="font-mono text-[11px] font-bold text-indigo">
                  {s.num}
                </span>
              </motion.div>

              <div className="flex-1 pt-1.5 min-w-0">
                <h3 className="text-lg font-semibold text-ink mb-2">
                  {s.title}
                </h3>
                <p className="text-base text-sub leading-relaxed m-0">
                  {s.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-12"
        >
          <div className="bg-paper border border-hair rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-hair">
              <Terminal size={14} className="text-sub" />
              <span className="font-mono text-[11px] text-sub">Terminal</span>
            </div>
            <div className="px-5 py-4">
              <code className="font-mono text-sm text-ink">
                <span className="text-okgreen">$</span> npx @tamago-labs/tamarind
              </code>
            </div>
          </div>
          <p className="mt-4 text-sm text-sub leading-relaxed text-center">
            Start the P2P terminal to join your team&apos;s payroll network. Sync payslips, chat, and search docs — zero cloud.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
