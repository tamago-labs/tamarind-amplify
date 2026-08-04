"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useAccount, useSignMessage } from "wagmi";
import { useParams } from "next/navigation";
import { baseSepolia } from "viem/chains";
import { FileCheck2, Plus, RefreshCw } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";
import { monadTestnet } from "@/lib/wagmi";

const client = generateClient<Schema>();
const networks = [{ id: baseSepolia.id, label: "Base Sepolia", slug: "base" }, { id: monadTestnet.id, label: "Monad Testnet", slug: "monad" }];

function dateLabel(value?: number | null) { return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value * 1000)) : "Not available"; }
function chainLabel(chain?: string | null) { return chain === "monad" ? "Monad Testnet" : "Base Sepolia"; }
function flag(code?: string | null) { return code && code.length === 2 ? String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0))) : ""; }

export default function KybPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [identities, setIdentities] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedChain, setSelectedChain] = useState("base");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const { data: records } = await client.models.OrganizationIdentity.list({ filter: { workspaceId: { eq: workspaceId } } });
    const rows = await Promise.all((records || []).map(async (identity) => { try { const { data: live } = await client.queries.queryOrganizationApass({ workspaceId, organizationIdentityId: identity.id }); return { ...identity, live }; } catch { return { ...identity, live: null }; } }));
    setIdentities(rows);
    setLoading(false);
  }
  useEffect(() => { load(); }, [workspaceId]);

  async function createCompanyApass() {
    if (!address) { setMessage("Connect the admin wallet before creating a Company A-Pass."); return; }
    if (identities.some((identity) => identity.chain === selectedChain)) { setMessage("A Company A-Pass already exists for this network."); return; }
    setSaving(true); setMessage("");
    try {
      const ownershipMessage = `Tamarind Company A-Pass registration\nWallet: ${address}\nChain: ${selectedChain}\nNonce: ${crypto.randomUUID()}`;
      const ownershipSignature = await signMessageAsync({ message: ownershipMessage });
      const { errors } = await client.mutations.generateOrganizationApass({ workspaceId, walletAddress: address, chain: selectedChain, ownershipMessage, ownershipSignature, organization: true });
      if (errors?.length) throw new Error(errors[0].message);
      setShowCreate(false);
      await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create the Company A-Pass."); }
    setSaving(false);
  }

  return <div className="max-w-4xl"><div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Organization</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Company A-Pass</h1><p className="mt-1 text-sm text-sub">Create one company wallet identity per supported network.</p><p className="mt-2 text-xs text-sub">Corporate KYB is not supported by the current Cleanverse A-Pass flow; UAT company identities use Cleanverse's default country result.</p></div><button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-lg bg-indigo px-3 py-2 text-sm font-semibold text-white hover:brightness-110"><Plus size={16} /> Add Company A-Pass</button></div>{message && <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{message}</div>}{loading ? <div className="rounded-xl border border-hair bg-panel p-8 text-center text-sm text-sub">Loading Company A-Passes...</div> : identities.length === 0 ? <div className="rounded-xl border border-dashed border-hair bg-panel p-12 text-center"><FileCheck2 size={28} className="mx-auto text-indigo" /><h2 className="mt-4 text-lg font-semibold text-ink">No Company A-Passes yet</h2><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-sub">Connect the workspace admin wallet to create a company A-Pass for a supported network.</p><button onClick={() => setShowCreate(true)} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white"><Plus size={16} />Add Company A-Pass</button></div> : <div className="grid gap-4 md:grid-cols-3">{identities.map((identity) => <div key={identity.id} className="rounded-xl border border-hair bg-panel p-5"><p className="font-mono text-[11px] uppercase tracking-wide text-sub">{chainLabel(identity.chain)}</p><p className="mt-2 font-mono text-xs text-ink">{identity.walletAddress.slice(0, 8)}...{identity.walletAddress.slice(-6)}</p><p className="mt-5 text-xs text-sub">Cleanverse status</p><p className="mt-1 font-semibold text-ink">{identity.live?.cleanverseStatus === 1 ? "Active" : identity.live?.cleanverseStatus === 2 ? "Frozen" : "Unavailable"}</p><p className="mt-3 text-xs text-sub">{flag(identity.live?.countries?.[0] || "US")} {identity.live?.countries?.[0] || "US"} · Expires {dateLabel(identity.live?.expirationTime)}</p><button onClick={load} className="mt-4 inline-flex items-center gap-1.5 text-xs text-sub hover:text-ink"><RefreshCw size={13} />Refresh</button></div>)}</div>}
    {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"><div className="w-full max-w-md rounded-2xl border border-hair bg-panel p-6 shadow-xl"><h2 className="text-xl font-semibold text-ink">Add Company A-Pass</h2><p className="mt-2 text-sm leading-relaxed text-sub">Use the connected workspace admin wallet. Each network can have one Company A-Pass. Cleanverse supplies the country attributes for this minimal company identity.</p><div className="mt-5 rounded-lg bg-paper px-4 py-3 font-mono text-xs text-ink">{address ? `${address.slice(0, 10)}...${address.slice(-8)}` : "No wallet connected"}</div><label htmlFor="company-chain" className="mt-4 block text-sm font-medium text-ink">Network</label><select id="company-chain" value={selectedChain} onChange={(event) => setSelectedChain(event.target.value)} className="mt-2 w-full rounded-lg border border-hair bg-panel px-3 py-2.5 text-sm text-ink">{networks.map((network) => <option key={network.slug} value={network.slug}>{network.label}</option>)}</select><p className="mt-3 text-xs text-sub">The A-Pass expiration is set to one year.</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setShowCreate(false)} className="rounded-lg border border-hair px-4 py-2.5 text-sm font-medium text-ink">Cancel</button><button onClick={createCompanyApass} disabled={saving || !address} className="rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Creating..." : "Sign and create"}</button></div></div></div>}
  </div>;
}
