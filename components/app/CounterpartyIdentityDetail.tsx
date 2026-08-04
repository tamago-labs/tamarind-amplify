"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { useParams } from "next/navigation";
import { RefreshCw, ShieldCheck } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();
function dateLabel(value?: number | null) { return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value * 1000)) : "Not available"; }
function chainLabel(chain?: string | null) { return chain === "monad" ? "Monad Testnet" : "Base Sepolia"; }
function countryFlag(code?: string | null) { return code && code.length === 2 ? String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0))) : ""; }

export default function CounterpartyIdentityDetail() {
  const { workspaceId, workspaceIdentityId } = useParams<{ workspaceId: string; workspaceIdentityId: string }>();
  const [identity, setIdentity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadIdentity() {
    setLoading(true);
    setError("");
    try { const { data } = await client.queries.queryApass({ workspaceId, workspaceIdentityId }); if (!data) throw new Error("Identity data is unavailable."); setIdentity(data); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not load identity."); }
    setLoading(false);
  }
  useEffect(() => { loadIdentity(); }, [workspaceId, workspaceIdentityId]);

  if (loading) return <div className="rounded-xl border border-hair bg-panel p-10 text-center text-sm text-sub">Loading A-Pass...</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-panel p-8 text-center text-sm text-red-700">{error}<button onClick={loadIdentity} className="mx-auto mt-4 flex items-center gap-2 text-indigo"><RefreshCw size={14} />Try again</button></div>;
  const active = identity.cleanverseStatus === 1;
  return <div><div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">A-Pass</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{chainLabel(identity.chain)}</h1><p className="mt-1 font-mono text-sm text-sub">{identity.walletAddress?.slice(0, 10)}...{identity.walletAddress?.slice(-8)}</p></div><button onClick={loadIdentity} className="inline-flex items-center gap-2 rounded-lg border border-hair px-3 py-2 text-sm font-medium text-sub hover:bg-paper hover:text-ink"><RefreshCw size={15} />Refresh status</button></div><div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-hair bg-panel p-5"><p className="text-xs uppercase tracking-wide text-sub">Cleanverse status</p><p className={`mt-3 text-2xl font-semibold ${active ? "text-okgreen" : "text-ink"}`}>{active ? "Active" : identity.cleanverseStatus === 2 ? "Frozen" : "Unavailable"}</p><p className="mt-2 text-sm text-sub">Live status from Cleanverse A-Pass.</p></div><div className="rounded-xl border border-hair bg-panel p-5"><p className="text-xs uppercase tracking-wide text-sub">Workspace status</p><p className="mt-3 text-2xl font-semibold capitalize text-ink">{identity.internalStatus || "pending"}</p><p className="mt-2 text-sm text-sub">Internal status managed by the workspace company.</p></div></div><div className="mt-4 grid gap-4 md:grid-cols-4"><div className="rounded-xl border border-hair bg-panel p-5"><p className="text-xs text-sub">Issuing country</p><p className="mt-2 text-lg font-semibold text-ink">{countryFlag(identity.countries?.[0])} {identity.countries?.[0] || "Not available"}</p></div><div className="rounded-xl border border-hair bg-panel p-5"><p className="text-xs text-sub">Tier</p><p className="mt-2 text-lg font-semibold text-ink">{identity.tier || "Not available"}</p></div><div className="rounded-xl border border-hair bg-panel p-5"><p className="text-xs text-sub">Sub-tier</p><p className="mt-2 text-lg font-semibold text-ink">{identity.subTier ?? "Not available"}</p></div><div className="rounded-xl border border-hair bg-panel p-5"><p className="text-xs text-sub">Expires</p><p className="mt-2 text-lg font-semibold text-ink">{dateLabel(identity.expirationTime)}</p></div></div><div className="mt-4 flex items-center gap-3 rounded-xl border border-hair bg-panel p-5 text-sm text-sub"><ShieldCheck size={18} className={identity.ownershipVerified ? "text-okgreen" : "text-sub"} />{identity.ownershipVerified ? "Wallet ownership verified by the workspace." : "Wallet ownership is awaiting workspace verification."}</div></div>;
}
