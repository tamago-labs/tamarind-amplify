"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { verifyMessage } from "viem";
import { useParams } from "next/navigation";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();
const statuses = ["pending", "active", "needsReview", "suspended", "archived"] as const;

function dateLabel(value?: number | null) { return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value * 1000)) : "Not available"; }
function label(value?: string | null) { return value === "needsReview" ? "Needs review" : value ? value[0].toUpperCase() + value.slice(1) : "Pending"; }
function countryFlag(code?: string | null) { return code && code.length === 2 ? String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0))) : ""; }

export default function CompanyIdentities() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadIdentities() {
    setLoading(true);
    const { data: members } = await client.models.WorkspaceMember.list({ filter: { workspaceId: { eq: workspaceId } } });
    const memberMap = new Map<string, string>();
    await Promise.all((members || []).map(async (member) => {
      const { data: profiles } = await client.models.UserProfile.list({ filter: { userId: { eq: member.userId } } });
      memberMap.set(member.userId, profiles?.[0]?.displayName || member.userId);
    }));
    const { data: identities } = await client.models.WorkspaceIdentity.list({ filter: { workspaceId: { eq: workspaceId } } });
    const nextRows = await Promise.all((identities || []).map(async (identity) => {
      const { data: walletIdentity } = await client.models.WalletIdentity.get({ id: identity.walletIdentityId });
      try { const { data: live } = await client.queries.queryApass({ workspaceId, workspaceIdentityId: identity.id }); return { ...walletIdentity, ...identity, walletAddress: walletIdentity?.walletAddress, chain: walletIdentity?.chain, live, memberName: memberMap.get(identity.userId) || identity.userId }; } catch { return { ...walletIdentity, ...identity, walletAddress: walletIdentity?.walletAddress, chain: walletIdentity?.chain, live: null, memberName: memberMap.get(identity.userId) || identity.userId }; }
    }));
    setRows(nextRows);
    setLoading(false);
  }

  useEffect(() => { loadIdentities(); }, [workspaceId]);

  async function updateStatus(identityId: string, internalStatus: (typeof statuses)[number]) {
    const { errors } = await client.mutations.updateWalletIdentityStatus({ workspaceId, workspaceIdentityId: identityId, internalStatus });
    if (errors?.length) setMessage(errors[0].message); else await loadIdentities();
  }

  async function verifyOwnership(identity: any) {
    if (!identity.ownershipMessage || !identity.ownershipSignature) { setMessage("No ownership signature is available for this identity."); return; }
    try {
      const valid = await verifyMessage({ address: identity.walletAddress, message: identity.ownershipMessage, signature: identity.ownershipSignature });
      if (!valid) throw new Error("The wallet signature does not match the identity wallet.");
      const { errors } = await client.mutations.verifyWalletIdentity({ workspaceId, workspaceIdentityId: identity.id });
      if (errors?.length) throw new Error(errors[0].message);
      await loadIdentities();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not verify wallet ownership."); }
  }

  return <div><div className="mb-6 flex items-start justify-between gap-4"><div><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Identities</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Workspace identities</h1><p className="mt-1 text-sm text-sub">Review member wallets and their live Cleanverse A-Pass status.</p></div><button onClick={loadIdentities} className="inline-flex items-center gap-2 rounded-lg border border-hair px-3 py-2 text-sm font-medium text-sub hover:bg-paper hover:text-ink"><RefreshCw size={15} /> Refresh all</button></div>
    {message && <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{message}</div>}
    <div className="overflow-x-auto rounded-xl border border-hair bg-panel"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-hair bg-paper/60 text-xs uppercase tracking-wide text-sub"><tr><th className="px-5 py-4 font-medium">Member</th><th className="px-5 py-4 font-medium">Network</th><th className="px-5 py-4 font-medium">Wallet</th><th className="px-5 py-4 font-medium">A-Pass</th><th className="px-5 py-4 font-medium">Internal status</th><th className="px-5 py-4 font-medium">Actions</th></tr></thead><tbody>{loading && <tr><td colSpan={6} className="px-5 py-10 text-center text-sub">Loading identities...</td></tr>}{!loading && rows.map((identity) => <tr key={identity.id} className="border-b border-hair last:border-0"><td className="px-5 py-4"><p className="font-medium text-ink">{identity.memberName}</p><p className="mt-1 text-xs text-sub">{identity.userId}</p></td><td className="px-5 py-4 text-sub">{identity.chain}</td><td className="px-5 py-4 font-mono text-xs text-ink">{identity.walletAddress.slice(0, 8)}...{identity.walletAddress.slice(-6)}</td><td className="px-5 py-4"><p className="font-medium text-ink">{identity.live?.cleanverseStatus === 1 ? "Active" : identity.live?.cleanverseStatus === 2 ? "Frozen" : "Unavailable"}</p><p className="mt-1 text-xs text-sub">{countryFlag(identity.live?.countries?.[0])} {identity.live?.countries?.[0] || "Country unavailable"} · Tier {identity.live?.tier || "-"} · {dateLabel(identity.live?.expirationTime)}</p></td><td className="px-5 py-4"><select value={identity.internalStatus || "pending"} onChange={(event) => updateStatus(identity.id, event.target.value as (typeof statuses)[number])} className="rounded-md border border-hair bg-panel px-2.5 py-2 text-sm text-ink"><option value="pending">Pending</option><option value="active">Active</option><option value="needsReview">Needs review</option><option value="suspended">Suspended</option><option value="archived">Archived</option></select><p className="mt-1 text-xs text-sub">{label(identity.internalStatus)}</p></td><td className="px-5 py-4"><div className="flex flex-col items-start gap-2">{identity.ownershipVerifiedAt ? <span className="inline-flex items-center gap-1.5 text-xs text-okgreen"><CheckCircle2 size={14} /> Ownership verified</span> : <button onClick={() => verifyOwnership(identity)} className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo hover:underline"><ShieldCheck size={14} /> Verify ownership</button>}<button onClick={loadIdentities} className="text-xs text-sub hover:text-ink">Refresh status</button></div></td></tr>)}{!loading && rows.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-sub">No member identities have been created yet.</td></tr>}</tbody></table></div>
  </div>;
}
