"use client";

import { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useAccount, useSignMessage } from "wagmi";
import { useParams, useRouter } from "next/navigation";
import { baseSepolia, sepolia } from "viem/chains";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";
import { monadTestnet } from "@/lib/wagmi";

const client = generateClient<Schema>();
const networks = [{ id: baseSepolia.id, label: "Base Sepolia", slug: "base" }, { id: sepolia.id, label: "Ethereum Sepolia", slug: "ethereum" }, { id: monadTestnet.id, label: "Monad Testnet", slug: "monad" }];

export default function CreateIdentityPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { user } = useAuthenticator((context) => [context.user]);
  const [chain, setChain] = useState("base");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const userId = user?.username || user?.userId || "";

  async function createIdentity() {
    if (!address) { setError("Connect a wallet before creating an identity."); return; }
    setSaving(true); setError("");
    try {
      const ownershipMessage = `Tamarind A-Pass registration\nWallet: ${address}\nChain: ${chain}\nNonce: ${crypto.randomUUID()}`;
      const ownershipSignature = await signMessageAsync({ message: ownershipMessage });
      const { data, errors } = await client.mutations.generateApass({ workspaceId, walletAddress: address, chain, ownershipMessage, ownershipSignature });
      if (errors?.length) throw new Error(errors[0].message);
      if (!data?.workspaceIdentityId) throw new Error("Identity was created but could not be opened.");
      router.push(`/app/workspaces/${workspaceId}/identity/identities/${data.workspaceIdentityId}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create the identity."); setSaving(false); }
  }

  return <div className="mx-auto max-w-2xl"><button onClick={() => router.push(`/app/workspaces/${workspaceId}/identity/identities`)} className="mb-6 inline-flex items-center gap-2 text-sm text-sub hover:text-ink"><ArrowLeft size={15} />Back to A-Passes</button><div className="rounded-2xl border border-hair bg-panel p-6 md:p-8"><p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">New identity</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Create New Identity</h1><p className="mt-2 text-sm leading-relaxed text-sub">Create a one-year A-Pass for your connected wallet on one supported network.</p><div className="mt-8 space-y-6"><div><label className="block text-sm font-medium text-ink">Connected wallet</label><div className="mt-2 rounded-lg bg-paper px-4 py-3 font-mono text-sm text-ink">{address ? `${address.slice(0, 12)}...${address.slice(-10)}` : "No wallet connected"}</div><p className="mt-2 text-xs text-sub">Connect a wallet from the account menu to continue.</p></div><div><label htmlFor="identity-chain" className="block text-sm font-medium text-ink">Network</label><select id="identity-chain" value={chain} onChange={(event) => setChain(event.target.value)} className="mt-2 w-full rounded-lg border border-hair bg-panel px-4 py-3 text-sm text-ink outline-none focus:border-indigo">{networks.map((network) => <option key={network.slug} value={network.slug}>{network.label}</option>)}</select><p className="mt-2 text-xs text-sub">Each wallet can have one A-Pass per network.</p></div><div className="flex items-start gap-3 rounded-lg bg-indigo/10 p-4 text-sm text-indigo"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><p>The A-Pass expiration is set to one year. You will sign a wallet message to confirm ownership.</p></div>{error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="flex justify-end"><button disabled={saving || !address || !userId} onClick={createIdentity} className="rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">{saving ? "Creating identity..." : "Create identity"}</button></div></div></div></div>;
}
