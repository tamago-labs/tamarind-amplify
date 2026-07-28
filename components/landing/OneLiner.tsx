"use client";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const QUOTE =
  "After years of paying payrolls in crypto, we realized the hardest part wasn't the payment—it was everything around it: taxes, payslips, and compliance. Tamarind was built to solve that.";

const NAME = "Pisuth";
const ROLE = "Founder, Tamago Labs Japan";

export default function OneLiner() {
  return (
    <section className="relative bg-ink text-white overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 0.9, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 28,
            mass: 0.9,
          }}
          className="flex justify-center"
        >
          <Quote size={40} className="text-okgreen opacity-90 mb-5" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            delay: 0.08,
            type: "spring",
            stiffness: 320,
            damping: 28,
          }}
          className="font-sans text-2xl md:text-3xl lg:text-[32px] font-medium leading-snug text-white m-0 max-w-5xl mx-auto"
        >
          &ldquo;{QUOTE}&rdquo;
        </motion.p>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{
            delay: 0.2,
            duration: 0.5,
            ease: "easeOut",
          }}
          style={{ transformOrigin: "center" }}
          className="h-px bg-okgreen/40 my-8 max-w-xs mx-auto"
        />

        <motion.p
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="font-mono text-[12px] tracking-wide text-white/80 uppercase m-0"
        >
          <span className="text-okgreen font-bold">{NAME}</span>
          <span className="mx-2 text-white/40">·</span>
          <span>{ROLE}</span>
        </motion.p>
      </div>
    </section>
  );
}
