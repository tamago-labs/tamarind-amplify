"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section id="pricing" className="bg-panel">
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
                Pricing
              </p>
              <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
                Early Access during{" "}
                <span className="text-okgreen">Alpha</span>
              </h2>
              <p className="mt-4 text-base text-white/70 max-w-xl leading-relaxed">
                Pricing announced at GA. Early-access teams onboard at no cost during the closed-beta period and get founding-cohort pricing once paid plans are introduced. There is no commitment to upgrade.
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3">
              <Link
                href="/app"
                className="rounded-md bg-indigo text-white font-semibold text-sm px-5 py-3 hover:brightness-110 transition no-underline inline-flex items-center gap-2"
              >
                Get Started
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
