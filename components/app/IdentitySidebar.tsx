"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useParams, usePathname } from "next/navigation";
import { Fingerprint, Plus } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

function chainLabel(chain?: string | null) { return chain === "ethereum" ? "Ethereum Sepolia" : chain === "monad" ? "Monad Testnet" : "Base Sepolia"; }

export default function IdentitySidebar() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const pathname = usePathname();
  const [items, setItems] = useState<any[]>([]);
  const userId = user?.username || user?.userId || "";
  const basePath = `/app/workspaces/${workspaceId}/identity`;

  useEffect(() => {
    async function loadItems() {
      if (!workspaceId || !userId) return;
      const { data: links } = await client.models.WorkspaceIdentity.list({ filter: { workspaceId: { eq: workspaceId }, userId: { eq: userId } } });
      const nextItems = await Promise.all((links || []).map(async (link) => {
        const { data: wallet } = await client.models.WalletIdentity.get({ id: link.walletIdentityId });
        return { ...link, ...wallet };
      }));
      setItems(nextItems);
    }
    loadItems();
  }, [workspaceId, userId, pathname]);

  return <aside className="w-full shrink-0 lg:w-60"><div className="mb-4"><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Identity</p><h2 className="mt-2 text-lg font-semibold text-ink">A-Passes</h2></div><nav className="space-y-1">{items.map((item) => { const href = `${basePath}/identities/${item.id}`; const active = pathname === href; return <Link key={item.id} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${active ? "bg-indigo/10 text-indigo" : "text-sub hover:bg-paper hover:text-ink"}`}><Fingerprint size={17} /><span className="min-w-0 flex-1"><span className="block font-medium">{chainLabel(item.chain)}</span><span className="mt-0.5 block truncate font-mono text-[10px] opacity-70">{item.walletAddress?.slice(0, 6)}...{item.walletAddress?.slice(-4)}</span></span></Link>; })}<Link href={`${basePath}/identities/new`} className={`mt-3 flex items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-sm font-medium transition-colors ${pathname === `${basePath}/identities/new` ? "border-indigo bg-indigo/10 text-indigo" : "border-hair text-sub hover:border-indigo/40 hover:bg-paper hover:text-ink"}`}><Plus size={17} />Create New Identity</Link></nav></aside>;
}
