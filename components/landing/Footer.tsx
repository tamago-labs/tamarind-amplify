"use client";

import Brand from "@/components/Brand";

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-panel border-t border-hair">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 lg:gap-10">
          {/* Brand column - spans full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <Brand />
            <p className="mt-4 text-sm text-sub max-w-xs leading-relaxed">
              Privacy-first, decentralized payroll platform bridging Web3 settlement with real-world compliance.
            </p>
          </div>

          <FooterCol
            title="Product"
            links={[
              { href: "#features", label: "Features" },
              { href: "#flow", label: "How it works" },
            ]}
          />
          <FooterCol
            title="Company"
            links={[
              { href: "https://tamagolabs.com", label: "Tamago Labs" },
              { href: "mailto:pisuth@tamagolabs.com", label: "Contact Us" },
            ]}
          />
          <FooterCol
            title="Legal"
            links={[
              { href: "#privacy", label: "Privacy" },
              { href: "#terms", label: "Terms" },
              { href: "#security", label: "Security" },
            ]}
          />
        </div>

        <div className="mt-10 pt-6 border-t border-hair flex flex-wrap items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-sub">
            © {new Date().getFullYear()} Tamarind
          </p>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/tamago-labs/tamarind"
              aria-label="GitHub"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 border border-hair rounded-md text-ink hover:bg-paper transition-colors"
            >
              <GithubIcon size={14} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="font-mono text-[11px] text-sub font-medium mb-3">
        {title}
      </p>
      <ul className="space-y-2 list-none m-0 p-0">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-sm text-sub hover:text-ink transition-colors no-underline"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
