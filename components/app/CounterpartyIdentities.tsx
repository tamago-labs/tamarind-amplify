"use client";

import { useEffect, useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useAccount, useSignMessage } from "wagmi";
import { useParams } from "next/navigation";
import { baseSepolia, sepolia } from "viem/chains";
import { Fingerprint, Plus, RefreshCw } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";
import { monadTestnet } from "@/lib/wagmi";

const client = generateClient<Schema>();
const networks = [{ id: baseSepolia.id, label: "Base Sepolia", slug: "base" }, { id: sepolia.id, label: "Ethereum Sepolia", slug: "ethereum" }, { id: monadTestnet.id, label: "Monad Testnet", slug: "monad" }];

function dateLabel(value?: number | null) { return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value * 1000)) : "Not available"; }
function statusLabel(value?: string | null) { return value === "1" ? "Active" : value === "2" ? "Frozen" : value ? value : "Not found"; }

export default function CounterpartyIdentities() {
  const { user } = useAuthenticator((context) => [context.user]);
  const { address } = useAccount();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { signMessageAsync } = useSignMessage();
  const [identities, setIdentities] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedChain, setSelectedChain] = useState("base");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const userId = user?.username || user?.userId || "";

  async function loadIdentities() {
    if (!workspaceId || !userId) return;
    setLoading(true);
    const { data } = await client.models.WorkspaceIdentity.list({ filter: { workspaceId: { eq: workspaceId }, userId: { eq: userId } } });
    const rows = await Promise.all((data || []).map(async (identity) => {
      const { data: walletIdentity } = await client.models.WalletIdentity.get({ id: identity.walletIdentityId });
      try { const { data: live } = await client.queries.queryApass({ workspaceId, workspaceIdentityId: identity.id }); return { ...identity, ...walletIdentity, live }; } catch { return { ...identity, ...walletIdentity, live: null }; }
    }));
    setIdentities(rows);
    setLoading(false);
  }

  useEffect(() => { loadIdentities(); }, [workspaceId, userId]);

  async function addIdentity() {
    if (!address) { setMessage("Connect a wallet before adding an identity."); return; }
    const network = networks.find((item) => item.slug === selectedChain);
    if (!network) return;
    if (identities.some((identity) => identity.chain === network.slug)) { setMessage("You already have an identity for this network."); return; }
    setSaving(true);
    setMessage("");
    try {
      const ownershipMessage = `Tamarind A-Pass registration\nWallet: ${address}\nChain: ${network.slug}\nNonce: ${crypto.randomUUID()}`;
      const ownershipSignature = await signMessageAsync({ message: ownershipMessage });
      const { errors } = await client.mutations.generateApass({ workspaceId, walletAddress: address, chain: network.slug, ownershipMessage, ownershipSignature });
      if (errors?.length) throw new Error(errors[0].message);
      setShowAdd(false);
      await loadIdentities();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create the identity."); }
    setSaving(false);
  }

  return <div><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Identity</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Identities</h1><p className="mt-1 text-sm text-sub">Manage one A-Pass per connected wallet and network.</p></div><button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo px-3 py-2 text-sm font-semibold text-white hover:brightness-110"><Plus size={16} /> Add New Identity</button></div>
    {message && <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{message}</div>}
    {loading ? <div className="rounded-xl border border-hair bg-panel p-10 text-center text-sm text-sub">Loading identities...</div> : identities.length === 0 ? <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center"><Fingerprint size={28} className="mx-auto text-indigo" /><h2 className="mt-4 text-lg font-semibold text-ink">No identities yet</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-sub">Create an A-Pass for a connected wallet and network. Each network requires its own identity.</p><button onClick={() => setShowAdd(true)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} /> Add New Identity</button></div> : <div className="grid gap-4 md:grid-cols-2">{identities.map((identity) => <div key={identity.id} className="rounded-xl border border-hair bg-panel p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-[11px] uppercase tracking-wide text-sub">{identity.chain}</p><p className="mt-2 font-mono text-sm text-ink">{identity.walletAddress.slice(0, 8)}...{identity.walletAddress.slice(-6)}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${identity.live?.cleanverseStatus === 1 ? "bg-okgreen/10 text-okgreen" : "bg-yellow-100 text-yellow-800"}`}>{statusLabel(identity.live?.cleanverseStatus)}</span></div><div className="mt-5 grid grid-cols-2 gap-4 border-t border-hair pt-4"><div><p className="text-xs text-sub">Tier</p><p className="mt-1 text-sm font-medium text-ink">{identity.live?.tier || "Not available"}</p></div><div><p className="text-xs text-sub">Expires</p><p className="mt-1 text-sm font-medium text-ink">{dateLabel(identity.live?.expirationTime)}</p></div></div><div className="mt-4 flex items-center justify-between text-xs text-sub"><span>Internal: {identity.internalStatus || "pending"}</span><button onClick={loadIdentities} className="inline-flex items-center gap-1.5 hover:text-indigo"><RefreshCw size={13} /> Refresh</button></div></div>)}</div>}
    {showAdd && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"><div className="w-full max-w-md rounded-2xl border border-hair bg-panel p-6 shadow-xl"><h2 className="text-xl font-semibold text-ink">Add New Identity</h2><p className="mt-2 text-sm leading-relaxed text-sub">Create a one-year A-Pass for your connected wallet on one network.</p><label className="mt-5 block text-sm font-medium text-ink">Wallet</label><div className="mt-2 rounded-lg bg-paper px-3 py-2.5 font-mono text-xs text-ink">{address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "Connect a wallet first"}</div><label className="mt-4 block text-sm font-medium text-ink">Network</label><select value={selectedChain} onChange={(event) => setSelectedChain(event.target.value)} className="mt-2 w-full rounded-lg border border-hair bg-panel px-3 py-2.5 text-sm text-ink">{networks.map((network) => <option key={network.slug} value={network.slug}>{network.label}</option>)}</select><p className="mt-3 text-xs text-sub">You will sign a wallet message to confirm ownership.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowAdd(false)} className="rounded-lg border border-hair px-4 py-2.5 text-sm font-medium text-ink">Cancel</button><button disabled={saving || !address} onClick={addIdentity} className="rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Creating..." : "Create identity"}</button></div></div></div>}
  </div>;
}
