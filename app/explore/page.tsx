import Link from "next/link";

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-panel">
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-20 lg:py-32 text-center">
        <p className="font-mono text-[11px] font-medium tracking-wide text-sub uppercase mb-3">
          RWA Marketplace
        </p>
        <h1 className="text-4xl md:text-5xl font-semibold text-ink tracking-tight leading-tight mb-6">
          Explore{" "}
          <span className="text-indigo">Compliant RWAs</span>
        </h1>
        <p className="text-lg text-sub max-w-2xl mx-auto leading-relaxed mb-10">
          Browse payroll, invoice, and receivable RWAs originated from verified company operations. Access tier-gated investment opportunities backed by cryptographic proof.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { title: "Payroll Receivables", desc: "Salary-backed RWAs from verified payroll records" },
            { title: "Invoice Financing", desc: "Tradeable invoice receivables with CVI verification" },
            { title: "Revenue-Backed Assets", desc: "Cash flow instruments from operational history" },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-paper border border-hair rounded-xl p-6 text-left"
            >
              <h3 className="text-lg font-semibold text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-sub leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-md border border-hair bg-panel text-ink font-medium text-sm px-5 py-3 hover:border-sub/50 transition no-underline"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-12 text-sm text-sub">
          Marketplace coming soon. Join early access to get founding-cohort pricing.
        </p>
      </div>
    </main>
  );
}
