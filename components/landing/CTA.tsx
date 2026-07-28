"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-panel">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16 lg:py-20">
        <div className="relative bg-ink text-white rounded-xl overflow-hidden p-10 lg:p-14">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-8 items-center">
            <div>
              <p className="font-mono text-[11px] tracking-wide text-okgreen uppercase font-medium mb-3">
                Free. Open-source. Local-first.
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
                Private Payroll & HR on Canton that{" "}
                <span className="text-okgreen">actually works</span>.
              </h2>
              <p className="mt-4 text-base text-white/70 max-w-xl leading-relaxed">
                No subscription, no vendor lock-in. Run Tamarind on your machine or self-host.
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <Link
                href="/app"
                className="rounded-md bg-indigo text-white font-semibold text-sm px-5 py-3 hover:brightness-110 transition no-underline inline-flex items-center gap-2"
              >
                Launch App
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
