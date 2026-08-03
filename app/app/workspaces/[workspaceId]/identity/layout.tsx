"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Fingerprint } from "lucide-react";

export default function IdentityLayout({ children }: { children: ReactNode }) {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const pathname = usePathname();
  const basePath = `/app/workspaces/${workspaceId}/identity`;

  return <div className="flex flex-col gap-6 lg:flex-row lg:gap-8"><aside className="w-full shrink-0 lg:w-52"><div className="mb-4"><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Identity</p><h2 className="mt-2 text-lg font-semibold text-ink">Identity center</h2></div><nav><Link href={`${basePath}/identities`} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${pathname === `${basePath}/identities` ? "bg-indigo/10 text-indigo" : "text-sub hover:bg-paper hover:text-ink"}`}><Fingerprint size={17} />Identities</Link></nav></aside><section className="min-w-0 flex-1">{children}</section></div>;
}
