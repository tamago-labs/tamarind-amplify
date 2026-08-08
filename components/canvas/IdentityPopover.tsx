"use client";

import { useEffect, useState } from "react";
import { X, Building2, User, Briefcase, Search } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { networkIcons } from "@web3icons/react";
import Flag from "react-flagkit";
import type { Schema } from "@/amplify/data/resource";
import type { NodeRole } from "./types";

const client = generateClient<Schema>();

interface IdentityItem {
  id: string;
  label: string;
  walletAddress: string;
  chain: string;
  countries?: string[];
  tier?: string;
  expirationTime?: number;
}

interface IdentityPopoverProps {
  role: NodeRole;
  workspaceId: string;
  onSelect: (item: IdentityItem) => void;
  onClose: () => void;
}

const ROLE_CONFIG: Record<NodeRole, { icon: typeof Building2; title: string; description: string; color: string }> = {
  company: { icon: Building2, title: "Company A-Pass", description: "Select a company identity", color: "#6366f1" },
  recipient: { icon: User, title: "Recipient Identity", description: "Select a counter-party identity", color: "#10b981" },
  deposit: { icon: Briefcase, title: "Deposit Identity", description: "Select a client identity", color: "#f59e0b" },
};

function getChainIcon(chain: string) {
  if (chain === "monad") return networkIcons.NetworkMonad;
  return networkIcons.NetworkBase;
}

function getChainLabel(chain: string) {
  if (chain === "monad") return "Monad";
  return "Base";
}

function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
}

function formatExpiration(expirationTime?: number) {
  if (!expirationTime) return "";
  const date = new Date(expirationTime * 1000);
  return date.toLocaleDateString("en", { month: "short", year: "numeric" });
}

export default function IdentityPopover({ role, workspaceId, onSelect, onClose }: IdentityPopoverProps) {
  const [items, setItems] = useState<IdentityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  useEffect(() => {
    async function load() {
      setLoading(true);
      if (role === "company") {
        const { data } = await client.models.OrganizationIdentity.list({
          filter: { workspaceId: { eq: workspaceId } },
        });
        const itemsWithApass = await Promise.all(
          (data || []).map(async (item) => {
            let countries: string[] = [];
            let tier = "";
            let expirationTime: number | undefined;
            let displayName = "Company Wallet";
            try {
              const { data: profiles } = await client.models.UserProfile.list({ filter: { userId: { eq: item.createdBy } } });
              if (profiles?.[0]?.displayName) displayName = profiles[0].displayName;
            } catch {}
            try {
              const { data: apass } = await client.queries.queryOrganizationApass({ workspaceId, organizationIdentityId: item.id });
              if (apass?.countries) countries = apass.countries.filter((c): c is string => c !== null);
              if (apass?.tier) tier = apass.tier;
              if (apass?.expirationTime) expirationTime = apass.expirationTime;
            } catch {}
            return {
              id: item.id,
              label: displayName,
              walletAddress: item.walletAddress,
              chain: item.chain,
              countries,
              tier,
              expirationTime,
            };
          })
        );
        setItems(itemsWithApass);
      } else {
        const { data } = await client.models.WorkspaceIdentity.list({
          filter: { workspaceId: { eq: workspaceId } },
        });
        const itemsWithApass = await Promise.all(
          (data || []).map(async (item) => {
            let countries: string[] = [];
            let tier = "";
            let expirationTime: number | undefined;
            let displayName = "Recipient";
            try {
              const { data: profiles } = await client.models.UserProfile.list({ filter: { userId: { eq: item.userId } } });
              if (profiles?.[0]?.displayName) displayName = profiles[0].displayName;
            } catch {}
            try {
              const { data: apass } = await client.queries.queryApass({ workspaceId, workspaceIdentityId: item.id });
              if (apass?.countries) countries = apass.countries.filter((c): c is string => c !== null);
              if (apass?.tier) tier = apass.tier;
              if (apass?.expirationTime) expirationTime = apass.expirationTime;
            } catch {}
            return {
              id: item.id,
              label: displayName,
              walletAddress: "",
              chain: "",
              countries,
              tier,
              expirationTime,
            };
          })
        );
        setItems(itemsWithApass);
      }
      setLoading(false);
    }
    load();
  }, [role, workspaceId]);

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.walletAddress.toLowerCase().includes(search.toLowerCase()) ||
      item.chain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${config.color}15` }}>
              <Icon size={20} style={{ color: config.color }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">{config.title}</h3>
              <p className="text-xs text-gray-500">{config.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by address or network..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-indigo-400 focus:bg-white"
            />
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
              <p className="mt-3 text-sm text-gray-500">Loading identities...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Icon size={32} className="mx-auto text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No identities found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((item) => {
                const ChainIcon = getChainIcon(item.chain);
                const expiry = formatExpiration(item.expirationTime);
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="flex w-full items-center gap-3 rounded-xl border border-gray-100 p-3 text-left transition-all hover:border-indigo-200 hover:bg-indigo-50/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${config.color}10` }}>
                      <Icon size={18} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                      </div>
                      {item.walletAddress && (
                        <p className="mt-0.5 font-mono text-xs text-gray-500">{truncateAddress(item.walletAddress)}</p>
                      )}
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-gray-500">
                        <div className="flex items-center gap-1">
                          <ChainIcon size={12} />
                          <span>{getChainLabel(item.chain)}</span>
                        </div>
                        {item.countries && item.countries.length > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Flag country={item.countries[0]} size={12} />
                            <span>{item.countries[0]}</span>
                          </div>
                        )}
                        {item.tier && (
                          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                            Tier {item.tier}
                          </span>
                        )}
                        {expiry && (
                          <span className="text-gray-400">Expires {expiry}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-300">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
