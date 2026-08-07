"use client";

import { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { CheckCircle2, RefreshCw, ShieldCheck, Shield, X } from "lucide-react";
import { verifyMessage } from "viem";
import { useParams } from "next/navigation";
import type { Schema } from "@/amplify/data/resource";
import WhitelistModal from "./WhitelistModal";

const client = generateClient<Schema>();
const statuses = ["pending", "active", "needsReview", "suspended", "archived"] as const;
type InternalStatus = (typeof statuses)[number];

function dateLabel(value?: number | null) {
  return value
    ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value * 1000))
    : "Not available";
}

function statusLabel(value?: string | null) {
  return value === "needsReview" ? "Needs review" : value ? value[0].toUpperCase() + value.slice(1) : "Pending";
}

function countryFlag(code?: string | null) {
  return code && code.length === 2
    ? String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)))
    : "";
}

function statusClass(value?: string | null) {
  return value === "active"
    ? "bg-okgreen/10 text-okgreen"
    : value === "suspended"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-800";
}

export default function CompanyIdentities() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [rows, setRows] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState<InternalStatus>("pending");
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [whitelistIdentity, setWhitelistIdentity] = useState<any | null>(null);
  const [showWhitelistModal, setShowWhitelistModal] = useState(false);

  async function loadIdentities() {
    setLoading(true);
    const { data: members } = await client.models.WorkspaceMember.list({
      filter: { workspaceId: { eq: workspaceId } },
    });
    const memberMap = new Map<string, string>();
    await Promise.all(
      (members || []).map(async (member) => {
        const { data: profiles } = await client.models.UserProfile.list({
          filter: { userId: { eq: member.userId } },
        });
        memberMap.set(member.userId, profiles?.[0]?.displayName || member.userId);
      })
    );
    const { data: identities } = await client.models.WorkspaceIdentity.list({
      filter: { workspaceId: { eq: workspaceId } },
    });

    // Fetch all whitelist entries for this workspace
    const { data: whitelistEntries } = await client.models.WhitelistEntry.list({
      filter: {
        workspaceId: { eq: workspaceId },
        status: { eq: "active" },
      },
    });

    const nextRows = await Promise.all(
      (identities || []).map(async (identity) => {
        const { data: walletIdentity } = await client.models.WalletIdentity.get({
          id: identity.walletIdentityId,
        });

        // Check if this wallet has any whitelist entries (normalize addresses for comparison)
        const walletAddressLower = walletIdentity?.walletAddress?.toLowerCase();
        console.log("Checking whitelist for wallet:", walletAddressLower);
        console.log("All whitelist entries:", whitelistEntries?.map(e => ({ address: e.walletAddress?.toLowerCase(), chain: e.chain, symbol: e.tokenSymbol })));
        
        const walletWhitelist = (whitelistEntries || []).filter(
          (entry) => entry.walletAddress?.toLowerCase() === walletAddressLower
        );
        console.log("Matching entries:", walletWhitelist.length);

        try {
          const { data: live } = await client.queries.queryApass({
            workspaceId,
            workspaceIdentityId: identity.id,
          });
          return {
            ...walletIdentity,
            ...identity,
            walletAddress: walletIdentity?.walletAddress,
            chain: walletIdentity?.chain,
            live,
            memberName: memberMap.get(identity.userId) || identity.userId,
            whitelistCount: walletWhitelist.length,
            whitelistedTokens: walletWhitelist.map((e) => e.tokenSymbol).join(", "),
          };
        } catch {
          return {
            ...walletIdentity,
            ...identity,
            walletAddress: walletIdentity?.walletAddress,
            chain: walletIdentity?.chain,
            live: null,
            memberName: memberMap.get(identity.userId) || identity.userId,
            whitelistCount: walletWhitelist.length,
            whitelistedTokens: walletWhitelist.map((e) => e.tokenSymbol).join(", "),
          };
        }
      })
    );
    setRows(nextRows);
    setLoading(false);
  }

  useEffect(() => {
    loadIdentities();
  }, [workspaceId]);

  function openReview(identity: any) {
    setSelected(identity);
    setReviewStatus((identity.internalStatus || "pending") as InternalStatus);
    setReviewNote(identity.statusNote || "");
    setMessage("");
  }

  async function saveReview() {
    if (!selected) return;
    setSaving(true);
    const { errors } = await client.mutations.updateWalletIdentityStatus({
      workspaceId,
      workspaceIdentityId: selected.id,
      internalStatus: reviewStatus,
      statusNote: reviewNote || undefined,
    });
    if (errors?.length) {
      setMessage(errors[0].message);
    } else {
      await loadIdentities();
      setSelected(null);
    }
    setSaving(false);
  }

  async function verifyOwnership() {
    if (!selected?.ownershipMessage || !selected?.ownershipSignature) {
      setMessage("No ownership signature is available for this identity.");
      return;
    }
    try {
      const valid = await verifyMessage({
        address: selected.walletAddress,
        message: selected.ownershipMessage,
        signature: selected.ownershipSignature,
      });
      if (!valid) throw new Error("The wallet signature does not match the identity wallet.");
      const { errors } = await client.mutations.verifyWalletIdentity({
        workspaceId,
        workspaceIdentityId: selected.id,
      });
      if (errors?.length) throw new Error(errors[0].message);
      const updated = { ...selected, ownershipVerifiedAt: new Date().toISOString() };
      setSelected(updated);
      setRows((current) =>
        current.map((row) => (row.id === updated.id ? updated : row))
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify wallet ownership.");
    }
  }

  function openWhitelist(identity: any) {
    setWhitelistIdentity(identity);
    setShowWhitelistModal(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">
            Identities
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Workspace identities
          </h1>
          <p className="mt-1 text-sm text-sub">
            Review member wallets and their live Cleanverse A-Pass status.
          </p>
        </div>
        <button
          onClick={loadIdentities}
          className="inline-flex items-center gap-2 rounded-lg border border-hair px-3 py-2 text-sm font-medium text-sub hover:bg-paper hover:text-ink"
        >
          <RefreshCw size={15} />
          Refresh all
        </button>
      </div>

      {message && !selected && (
        <div className="mb-5 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
          {message}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-hair bg-panel">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-hair bg-paper/60 text-xs uppercase tracking-wide text-sub">
            <tr>
              <th className="px-5 py-4 font-medium">Member</th>
              <th className="px-5 py-4 font-medium">Network</th>
              <th className="px-5 py-4 font-medium">Wallet</th>
              <th className="px-5 py-4 font-medium">A-Pass</th>
              <th className="px-5 py-4 font-medium">Internal status</th>
              <th className="px-5 py-4 font-medium">Whitelist</th>
              <th className="px-5 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sub">
                  Loading identities...
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((identity) => (
                <tr key={identity.id} className="border-b border-hair last:border-0">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{identity.memberName}</p>
                    <p className="mt-1 text-xs text-sub">{identity.userId}</p>
                  </td>
                  <td className="px-5 py-4 text-sub">{identity.chain}</td>
                  <td className="px-5 py-4 font-mono text-xs text-ink">
                    {identity.walletAddress?.slice(0, 8)}...{identity.walletAddress?.slice(-6)}
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">
                      {identity.live?.cleanverseStatus === 1
                        ? "Active"
                        : identity.live?.cleanverseStatus === 2
                          ? "Frozen"
                          : "Unavailable"}
                    </p>
                    <p className="mt-1 text-xs text-sub">
                      {countryFlag(identity.live?.countries?.[0])}{" "}
                      {identity.live?.countries?.[0] || "Country unavailable"} · Tier{" "}
                      {identity.live?.tier || "-"}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(identity.internalStatus)}`}
                    >
                      {statusLabel(identity.internalStatus)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {identity.whitelistCount > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-okgreen/15">
                          <CheckCircle2 size={10} className="text-okgreen" />
                        </span>
                        <span className="text-xs text-sub">
                          {identity.whitelistCount} token{identity.whitelistCount > 1 ? "s" : ""}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-sub">Not whitelisted</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openReview(identity)}
                        className="rounded-lg border border-hair px-3 py-2 text-xs font-medium text-ink hover:bg-paper"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => openWhitelist(identity)}
                        className="rounded-lg border border-indigo/30 px-3 py-2 text-xs font-medium text-indigo hover:bg-indigo/10"
                        title="Manage whitelist for token wrapping"
                      >
                        <Shield size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-sub">
                  No member identities have been created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="review-identity-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-hair bg-panel p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wide text-sub">
                  Identity review
                </p>
                <h2
                  id="review-identity-title"
                  className="mt-2 text-xl font-semibold text-ink"
                >
                  {selected.memberName}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1 text-sub hover:text-ink"
                aria-label="Close review"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-paper p-4 text-sm">
              <div>
                <p className="text-xs text-sub">Network</p>
                <p className="mt-1 font-medium text-ink">{selected.chain}</p>
              </div>
              <div>
                <p className="text-xs text-sub">Wallet</p>
                <p className="mt-1 truncate font-mono text-xs text-ink">
                  {selected.walletAddress}
                </p>
              </div>
              <div>
                <p className="text-xs text-sub">Cleanverse status</p>
                <p className="mt-1 font-medium text-ink">
                  {selected.live?.cleanverseStatus === 1
                    ? "Active"
                    : selected.live?.cleanverseStatus === 2
                      ? "Frozen"
                      : "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs text-sub">Country / expiry</p>
                <p className="mt-1 font-medium text-ink">
                  {countryFlag(selected.live?.countries?.[0])}{" "}
                  {selected.live?.countries?.[0] || "-"} ·{" "}
                  {dateLabel(selected.live?.expirationTime)}
                </p>
              </div>
              <div>
                <p className="text-xs text-sub">Tier</p>
                <p className="mt-1 font-medium text-ink">
                  {selected.live?.tier || "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-sub">Sub-tier</p>
                <p className="mt-1 font-medium text-ink">
                  {selected.live?.subTier ?? "-"}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-ink">Wallet ownership</p>
              {selected.ownershipVerifiedAt ? (
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-okgreen">
                  <CheckCircle2 size={16} />
                  Verified
                </p>
              ) : (
                <button
                  onClick={verifyOwnership}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg border border-indigo/30 px-3 py-2 text-sm font-medium text-indigo hover:bg-indigo/10"
                >
                  <ShieldCheck size={16} />
                  Verify ownership
                </button>
              )}
            </div>

            <div className="mt-5">
              <label htmlFor="review-status" className="block text-sm font-medium text-ink">
                Internal status
              </label>
              <select
                id="review-status"
                value={reviewStatus}
                onChange={(event) =>
                  setReviewStatus(event.target.value as InternalStatus)
                }
                className="mt-2 w-full rounded-lg border border-hair bg-panel px-3 py-2.5 text-sm text-ink"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel(status)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="review-note" className="block text-sm font-medium text-ink">
                Internal note{" "}
                <span className="font-normal text-sub">(optional)</span>
              </label>
              <textarea
                id="review-note"
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-hair bg-paper px-3 py-2.5 text-sm text-ink outline-none focus:border-indigo"
                placeholder="Add context for your team..."
              />
            </div>

            {message && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {message}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg border border-hair px-4 py-2.5 text-sm font-medium text-ink"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                onClick={saveReview}
                className="rounded-lg bg-indigo px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Whitelist Modal */}
      <WhitelistModal
        isOpen={showWhitelistModal}
        onClose={() => {
          setShowWhitelistModal(false);
          setWhitelistIdentity(null);
        }}
        walletAddress={whitelistIdentity?.walletAddress || ""}
        chain={whitelistIdentity?.chain || "base"}
        workspaceId={workspaceId}
      />
    </div>
  );
}
