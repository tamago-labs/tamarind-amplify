"use client";

import { useState } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useAccount, useSignMessage } from "wagmi";
import { useParams, useRouter } from "next/navigation";
import { baseSepolia, sepolia } from "viem/chains";
import { ArrowLeft, CheckCircle2, Upload } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";
import { monadTestnet } from "@/lib/wagmi";

const client = generateClient<Schema>();
const networks = [{ id: baseSepolia.id, label: "Base Sepolia", slug: "base" }, { id: sepolia.id, label: "Ethereum Sepolia", slug: "ethereum" }, { id: monadTestnet.id, label: "Monad Testnet", slug: "monad" }];
const countries = [["US", "United States"], ["SG", "Singapore"], ["JP", "Japan"], ["TH", "Thailand"], ["GB", "United Kingdom"], ["AU", "Australia"], ["CA", "Canada"], ["DE", "Germany"], ["FR", "France"], ["IN", "India"], ["HK", "Hong Kong"], ["CN", "China"], ["KR", "South Korea"], ["MY", "Malaysia"], ["ID", "Indonesia"], ["VN", "Vietnam"]];

export default function CreateIdentityPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const router = useRouter();
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { user } = useAuthenticator((context) => [context.user]);
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [issuingCountryISO2, setIssuingCountryISO2] = useState("US");
  const [chain, setChain] = useState("base");
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const userId = user?.username || user?.userId || "";
  const selectedNetwork = networks.find((network) => network.slug === chain);
  const selectedCountry = countries.find(([code]) => code === issuingCountryISO2)?.[1] || issuingCountryISO2;

  function continueToReview() {
    if (!fullName.trim() || !passportNumber.trim() || !validUntil || !issuingCountryISO2 || !address) {
      setError("Complete the passport details and connect a wallet before continuing.");
      return;
    }
    if (new Date(`${validUntil}T23:59:59Z`) <= new Date()) { setError("Passport must not be expired."); return; }
    setError("");
    setStep(2);
  }

  async function createIdentity() {
    if (!address || !selectedNetwork) return;
    setSaving(true); setError("");
    try {
      const ownershipMessage = `Tamarind A-Pass registration\nWallet: ${address}\nChain: ${selectedNetwork.slug}\nNonce: ${crypto.randomUUID()}`;
      const ownershipSignature = await signMessageAsync({ message: ownershipMessage });
      const { data, errors } = await client.mutations.generateApass({ workspaceId, walletAddress: address, chain: selectedNetwork.slug, ownershipMessage, ownershipSignature, fullName: fullName.trim(), passportNumber: passportNumber.trim(), validUntil, issuingCountryISO2 });
      if (errors?.length) throw new Error(errors[0].message);
      if (!data?.workspaceIdentityId) throw new Error("Identity was created but could not be opened.");
      router.push(`/app/workspaces/${workspaceId}/identity/identities/${data.workspaceIdentityId}`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create the identity."); setSaving(false); }
  }

  return <div className="mx-auto max-w-2xl"><button onClick={() => router.push(`/app/workspaces/${workspaceId}/identity/identities`)} className="mb-6 inline-flex items-center gap-2 text-sm text-sub hover:text-ink"><ArrowLeft size={15} />Back to A-Passes</button><div className="rounded-2xl border border-hair bg-panel p-6 md:p-8"><div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step >= 1 ? "bg-indigo text-white" : "bg-paper text-sub"}`}>1</span><span className="h-px flex-1 bg-hair" /><span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step === 2 ? "bg-indigo text-white" : "bg-paper text-sub"}`}>2</span></div><p className="mt-8 font-mono text-[11px] font-medium uppercase tracking-wide text-sub">New identity</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{step === 1 ? "Passport and wallet" : "Review identity"}</h1><p className="mt-2 text-sm leading-relaxed text-sub">{step === 1 ? "Add passport details, then choose the wallet and network for this A-Pass." : "Check the details before signing and creating your one-year A-Pass."}</p>
      {step === 1 ? <div className="mt-8 space-y-5"><div><label htmlFor="passport-image" className="block text-sm font-medium text-ink">Passport image <span className="font-normal text-sub">(demo preview)</span></label><label htmlFor="passport-image" className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-hair bg-paper px-4 py-4 text-sm text-sub hover:border-indigo/40"><Upload size={18} className="text-indigo" /><span>{imagePreview ? "Replace passport image" : "Upload passport image"}</span></label><input id="passport-image" type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) setImagePreview(URL.createObjectURL(file)); }} />{imagePreview && <img src={imagePreview} alt="Passport preview" className="mt-3 h-28 w-44 rounded-lg border border-hair object-cover" />}<p className="mt-2 text-xs text-sub">This demo image is previewed locally and is not uploaded or stored.</p></div><div><label htmlFor="full-name" className="block text-sm font-medium text-ink">Full name</label><input id="full-name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Name as shown on passport" className="mt-2 w-full rounded-lg border border-hair bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-indigo" /></div><div><label htmlFor="passport-number" className="block text-sm font-medium text-ink">Passport number</label><input id="passport-number" value={passportNumber} onChange={(event) => setPassportNumber(event.target.value)} placeholder="Passport number" className="mt-2 w-full rounded-lg border border-hair bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-indigo" /></div><div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="valid-until" className="block text-sm font-medium text-ink">Valid until</label><input id="valid-until" type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} className="mt-2 w-full rounded-lg border border-hair bg-paper px-4 py-3 text-sm text-ink outline-none focus:border-indigo" /></div><div><label htmlFor="issuing-country" className="block text-sm font-medium text-ink">Issuing country</label><select id="issuing-country" value={issuingCountryISO2} onChange={(event) => setIssuingCountryISO2(event.target.value)} className="mt-2 w-full rounded-lg border border-hair bg-panel px-4 py-3 text-sm text-ink outline-none focus:border-indigo">{countries.map(([code, name]) => <option key={code} value={code}>{name} ({code})</option>)}</select></div></div><div><label className="block text-sm font-medium text-ink">Connected wallet</label><div className="mt-2 rounded-lg bg-paper px-4 py-3 font-mono text-sm text-ink">{address ? `${address.slice(0, 12)}...${address.slice(-10)}` : "No wallet connected"}</div></div><div><label htmlFor="identity-chain" className="block text-sm font-medium text-ink">Network</label><select id="identity-chain" value={chain} onChange={(event) => setChain(event.target.value)} className="mt-2 w-full rounded-lg border border-hair bg-panel px-4 py-3 text-sm text-ink outline-none focus:border-indigo">{networks.map((network) => <option key={network.slug} value={network.slug}>{network.label}</option>)}</select></div><button onClick={continueToReview} className="w-full rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-white hover:brightness-110">Continue to review</button></div> : <div className="mt-8 space-y-4"><div className="rounded-xl border border-hair bg-paper p-5"><div className="grid gap-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-sub">Full name</p><p className="mt-1 font-medium text-ink">{fullName}</p></div><div><p className="text-xs text-sub">Passport number</p><p className="mt-1 font-medium text-ink">{passportNumber}</p></div><div><p className="text-xs text-sub">Issuing country</p><p className="mt-1 font-medium text-ink">{selectedCountry} ({issuingCountryISO2})</p></div><div><p className="text-xs text-sub">Valid until</p><p className="mt-1 font-medium text-ink">{validUntil}</p></div><div><p className="text-xs text-sub">Wallet</p><p className="mt-1 font-mono text-xs text-ink">{address?.slice(0, 12)}...{address?.slice(-10)}</p></div><div><p className="text-xs text-sub">Network</p><p className="mt-1 font-medium text-ink">{selectedNetwork?.label}</p></div></div></div><div className="flex items-start gap-3 rounded-lg bg-indigo/10 p-4 text-sm text-indigo"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><p>Cleanverse attributes will use sub-tier 1, Tamarind group code TM, and the passport expiry date.</p></div>{error && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<div className="flex justify-between gap-3"><button onClick={() => setStep(1)} className="rounded-lg border border-hair px-4 py-3 text-sm font-medium text-ink">Back</button><button disabled={saving || !address || !userId} onClick={createIdentity} className="rounded-lg bg-indigo px-5 py-3 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50">{saving ? "Creating identity..." : "Sign and create A-Pass"}</button></div></div>}
      {step === 1 && error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
    </div></div>;
}
