"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, LogOut, Repeat2, Unplug, UserRound, WalletCards } from "lucide-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { useAccount, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useChainId, useSwitchChain } from "wagmi";
import { networkIcons } from "@web3icons/react";
import { baseSepolia, sepolia } from "viem/chains";
import { monadTestnet } from "@/lib/wagmi";
import { fetchUserAttributes } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import EditProfileModal from "./EditProfileModal";

const client = generateClient<Schema>();

const networks = [
  { id: baseSepolia.id, label: "Base Sepolia", icon: networkIcons.NetworkBase },
  { id: sepolia.id, label: "Ethereum Sepolia", icon: networkIcons.NetworkEthereum },
  { id: monadTestnet.id, label: "Monad Testnet", icon: networkIcons.NetworkMonad },
];

export default function UserMenu() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [networkOpen, setNetworkOpen] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [profile, setProfile] = useState({ displayName: "", avatarUrl: "" });
  const [copied, setCopied] = useState(false);
  const userId = user?.username || user?.userId || "";
  const fallbackIdentity: string = (user as any)?.signInDetails?.loginId || userId || "User";
  const identity: string = profile.displayName || fallbackIdentity;
  const initials = identity.replace(/@.*/, "").split(/[\s._-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "TM";
  const walletLabel = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect wallet";
  const activeNetwork = networks.find((network) => network.id === chainId);
  const ActiveNetworkIcon = activeNetwork?.icon;
  const networkLabel = activeNetwork?.label || "Unsupported network";

  useEffect(() => {
    async function loadProfile() {
      if (!userId) return;
      let attributes: Awaited<ReturnType<typeof fetchUserAttributes>> = {};
      try {
        attributes = await fetchUserAttributes();
      } catch { /* Profile data remains available without optional attributes. */ }
      const { data: savedProfile } = await client.models.UserProfile.get({ id: userId });
      if (savedProfile) {
        setProfile({ displayName: savedProfile.displayName || "", avatarUrl: savedProfile.avatarUrl || "" });
        return;
      }
      setProfile({ displayName: attributes.name || attributes.email || fallbackIdentity, avatarUrl: attributes.picture || "" });
    }
    loadProfile();
  }, [userId]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo text-xs font-semibold text-white hover:brightness-110"
        aria-label="Open account menu"
      >
        {profile.avatarUrl ? <img src={profile.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" /> : initials}
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-72 rounded-xl border border-hair bg-panel p-3 shadow-lg">
          <div className="px-1">
            <p className="px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-sub">Wallet</p>
            {!isConnected ? <button onClick={() => { setOpen(false); openConnectModal?.(); }} className="mt-1 flex w-full items-center gap-3 rounded-lg border border-dashed border-hair px-3 py-3 text-left text-sm text-sub hover:border-indigo/40 hover:bg-paper hover:text-ink"><WalletCards size={17} className="text-indigo" /><span><span className="block font-medium text-ink">Connect wallet</span><span className="mt-0.5 block text-xs text-sub">Connect to use payment features</span></span></button> : <>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-hair bg-paper px-3 py-2.5 text-sm text-ink">
                <WalletCards size={16} className="shrink-0 text-indigo" />
                <span className="flex-1 font-mono text-xs">{walletLabel}</span>
                <button onClick={async () => { if (address) { await navigator.clipboard.writeText(address); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } }} className="text-sub hover:text-indigo" aria-label="Copy wallet address">{copied ? <Check size={15} className="text-okgreen" /> : <Copy size={15} />}</button>
              </div>
              <div className="relative mt-2">
              <button onClick={() => setNetworkOpen((value) => !value)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-sub hover:bg-paper hover:text-ink">
                {ActiveNetworkIcon ? <ActiveNetworkIcon variant="branded" size={16} /> : <span className="h-4 w-4 rounded-full bg-red-200" />}
                <span className="flex-1">{isSwitching ? "Switching network..." : networkLabel}</span>
                <ChevronDown size={14} />
              </button>
              {networkOpen && <div className="absolute left-0 right-0 top-11 z-30 rounded-lg border border-hair bg-panel p-1 shadow-lg">{networks.map((network) => { const Icon = network.icon; return <button key={network.id} disabled={isSwitching} onClick={() => { switchChain({ chainId: network.id }); setNetworkOpen(false); }} className={`flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors ${network.id === chainId ? "bg-indigo/10 text-indigo" : "text-sub hover:bg-paper hover:text-ink"}`}><Icon variant="branded" size={15} /><span className="flex-1">{network.label}</span>{network.id === chainId && <span>✓</span>}</button>; })}</div>}
              </div>
              <button onClick={() => { disconnect(); setOpen(false); }} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-sub hover:bg-paper hover:text-ink"><Unplug size={14} />Disconnect wallet</button>
            </>}
          </div>
          <div className="my-2 border-t border-hair" />
          <button onClick={() => { setOpen(false); setEditProfile(true); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-sub hover:bg-paper hover:text-ink">
            <UserRound size={15} />
            Edit profile
          </button>
          <Link href="/app" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-sub hover:bg-paper hover:text-ink">
            <Repeat2 size={15} />
            Switch workspace
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sub hover:bg-paper hover:text-ink">
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
      <EditProfileModal isOpen={editProfile} userId={userId} initialValues={{ displayName: profile.displayName }} onClose={() => setEditProfile(false)} onSaved={(values) => setProfile({ ...profile, ...values })} />
    </div>
  );
}
