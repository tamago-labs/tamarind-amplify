"use client";

import { motion, type Variants } from "framer-motion";

interface Step {
  num: string;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    num: "01",
    title: "Operate",
    body: "Run payroll, invoicing, and contractor payments from one compliant workspace. Every action generates a record.",
  },
  {
    num: "02",
    title: "Verify",
    body: "Each record — payslip, invoice, settlement — is hashed into a Merkle root, tied to CVI-bound identity.",
  },
  {
    num: "03",
    title: "Originate",
    body: "Verified invoice history becomes a CVA-issued RWA — a compliant, financeable receivable, built on the payment proof behind it.",
  },
  {
    num: "04",
    title: "Finance",
    body: "Tier-eligible investors access the marketplace, evaluate origination history directly, and finance receivables without reconstructed evidence.",
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
      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-20 lg:py-28">
        <div className="mb-12">
          <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-ink tracking-tight leading-tight max-w-2xl">
            From Operation to{" "}
            <span className="text-indigo">Origination</span> — in Four Steps.
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
      </div>
    </section>
  );
}
