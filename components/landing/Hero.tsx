import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-8 pb-24 lg:pt-12 lg:pb-32 text-center">
        <h1 className="mt-6 text-3xl md:text-4xl lg:text-5xl font-semibold text-ink tracking-tight leading-[1.1]">
          Compliant RWAs Backed by{" "}
          <span className="text-indigo">Real Financial Operations</span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-sub max-w-2xl mx-auto leading-relaxed">
          Companies manage payroll, invoices, receivables, and payments through a compliance workspace with CVI-bound identities and immutable Merkle-rooted records. Investors access CVA-verified RWAs backed by the same financial history for financing, salary advances, and receivable markets.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="rounded-md bg-indigo text-white font-semibold text-sm px-5 py-3 hover:brightness-110 transition no-underline"
          >
            Request Demo
          </Link>
          <Link
            href="/app"
            className="rounded-md border border-hair bg-panel text-ink font-medium text-sm px-5 py-3 hover:border-sub/50 transition no-underline"
          >
            Explore RWAs
          </Link>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center justify-center gap-3 sm:gap-2.5 text-sm text-sub font-medium leading-relaxed">
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-okgreen flex-shrink-0" />
            Cleanverse Compliance Layer
          </span>
          <span className="hidden sm:inline text-hair">·</span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-okgreen flex-shrink-0" />
            15+ Chains USDC Settlement
          </span>
          <span className="hidden sm:inline text-hair">·</span>
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-okgreen flex-shrink-0" />
            RWA Origination
          </span>
        </div>
      </div>
    </section>
  );
}
