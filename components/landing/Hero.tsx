"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

const SCREENSHOTS = [
  {
    src: "/screenshot-payroll-flow.png",
    label: "Payroll Flow",
    desc: "Drag and drop payroll flows with withholding per employee group",
  },
  {
    src: "/screenshot-timesheet.png",
    label: "Timesheet",
    desc: "Employees check in daily — recorded on Canton smart contracts",
  },
  {
    src: "/screenshot-payslip-view.png",
    label: "Payslip View",
    desc: "View payslips with detailed tax, social security, and net pay",
  },
  {
    src: "/screenshot-payslip-generation.png",
    label: "AI Generation",
    desc: "Local AI generates payslips customized for your jurisdiction",
  },
  {
    src: "/screenshot-knowledge-base.png",
    label: "Knowledge Base",
    desc: "Search company docs with AI — zero cloud, P2P to employer machine",
  },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-8 pb-24 lg:pt-12 lg:pb-32 grid lg:grid-cols-[1.05fr_0.95fr] gap-16 items-center">
        <div>
          <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-semibold text-ink tracking-tight leading-[1.1]">
            Zero-Cloud AI.{" "}
            <span className="text-indigo">Zero-Leaked</span>{" "}
            Payroll Data.
          </h1>

          <p className="mt-6 text-base md:text-lg text-sub max-w-xl leading-relaxed">
            Stop sending payroll to cloud AI. Import sensitive data locally, generate payslips with on-device AI, sync direct to employee machines via P2P, and settle compliant payroll on Canton.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              className="rounded-md bg-indigo text-white font-semibold text-sm px-5 py-3 hover:brightness-110 transition no-underline"
            >
              I&apos;m an Employee
            </Link>
            <Link
              href="/app"
              className="rounded-md border border-hair bg-panel text-ink font-medium text-sm px-5 py-3 hover:border-sub/50 transition no-underline"
            >
              I&apos;m an Employer
            </Link>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-2.5 text-sm text-sub font-medium leading-relaxed">
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-okgreen flex-shrink-0" />
              Canton or fiat settlement
            </span>
            <span className="hidden sm:inline text-hair">·</span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-okgreen flex-shrink-0" />
              Encrypted P2P sync
            </span>
            <span className="hidden sm:inline text-hair">·</span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-okgreen flex-shrink-0" />
              GDPR-clean by design
            </span>
          </div>
        </div>

        <ScreenshotCarousel />
      </div>
    </section>
  );
}

function ScreenshotCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % SCREENSHOTS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, next]);

  const slide = SCREENSHOTS[current];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative bg-panel border border-hair rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-hair">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-hair" />
            <span className="w-2.5 h-2.5 rounded-full bg-hair" />
            <span className="w-2.5 h-2.5 rounded-full bg-hair" />
          </div>
          <span className="font-mono text-[11px] text-sub">tamarind</span>
          <span className="w-12" />
        </div>

        <div className="relative aspect-[21/9] bg-paper">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={slide.src}
              alt={slide.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>
        </div>

        <div className="px-5 py-4 border-t border-hair">
          <p className="font-mono text-[11px] font-medium text-ink">
            {slide.label}
          </p>
          <p className="font-sans text-sm text-sub mt-1 leading-relaxed">
            {slide.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {SCREENSHOTS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "bg-indigo w-5"
                : "bg-hair hover:bg-sub"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}
