"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { networkIcons } from "@web3icons/react";
import Flag from "react-flagkit";
import { FileText, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle, Shield, X } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_TOKENS } from "@/config/tokens";
import MerkleVerificationModal from "@/components/app/MerkleVerificationModal";

const client = generateClient<Schema>();

interface PaymentRun {
  id: string;
  workflowId: string;
  connectionId: string;
  flowType: string;
  status: string;
  amount: string;
  currency: string;
  chain: string;
  txHash?: string;
  merkleRoot?: string;
  settlementId?: string;
  sourceWalletAddress?: string;
  targetWalletAddress?: string;
  createdAt?: string;
  configuration?: string;
  fromNode?: {
    label: string;
    walletAddress: string;
    countries?: string[];
    tier?: string;
  };
  toNode?: {
    label: string;
    walletAddress: string;
    countries?: string[];
    tier?: string;
  };
}

function getChainIcon(chain?: string) {
  if (chain === "monad") return networkIcons.NetworkMonad;
  return networkIcons.NetworkBase;
}

function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getStatusIcon(status: string) {
  switch (status) {
    case "settled":
      return <CheckCircle size={14} className="text-green-500" />;
    case "processing":
      return <Clock size={14} className="text-blue-500" />;
    case "failed":
      return <AlertCircle size={14} className="text-red-500" />;
    default:
      return <Clock size={14} className="text-gray-400" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "settled":
      return "bg-green-100 text-green-700";
    case "processing":
      return "bg-blue-100 text-blue-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function PaymentsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { address } = useAccount();
  const [runs, setRuns] = useState<PaymentRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [selectedRun, setSelectedRun] = useState<PaymentRun | null>(null);
  const [verifyRun, setVerifyRun] = useState<PaymentRun | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await client.models.WorkflowRun.list({
      filter: { workspaceId: { eq: workspaceId }, flowType: { eq: "payment" } },
    });

    const enrichedRuns = await Promise.all(
      (data || []).map(async (run) => {
        let fromNode = undefined;
        let toNode = undefined;

        try {
          if (run.sourceIdentityId) {
            const { data: identity } = await client.models.OrganizationIdentity.get({ id: run.sourceIdentityId });
            if (identity) {
              fromNode = {
                label: "Company",
                walletAddress: identity.walletAddress,
              };
            }
          }
          if (run.targetIdentityId) {
            const { data: identity } = await client.models.WorkspaceIdentity.get({ id: run.targetIdentityId });
            if (identity?.walletIdentityId) {
              const { data: wallet } = await client.models.WalletIdentity.get({ id: identity.walletIdentityId });
              if (wallet) {
                toNode = {
                  label: "Recipient",
                  walletAddress: wallet.walletAddress,
                };
              }
            }
          }
        } catch {}

        // Fetch connection configuration
        let configuration = undefined;
        try {
          const { data: connection } = await client.models.WorkflowConnection.get({ id: run.connectionId });
          if (connection?.configuration) {
            configuration = String(connection.configuration);
          }
        } catch {}

        return {
          id: run.id,
          workflowId: run.workflowId,
          connectionId: run.connectionId,
          flowType: run.flowType || "payment",
          status: run.status || "draft",
          amount: run.amount || "0",
          currency: run.currency || "",
          chain: run.chain || "base",
          txHash: run.txHash || undefined,
          merkleRoot: run.merkleRoot || undefined,
          settlementId: run.settlementId || undefined,
          sourceWalletAddress: run.sourceWalletAddress || undefined,
          targetWalletAddress: run.targetWalletAddress || undefined,
          createdAt: run.createdAt || undefined,
          configuration,
          fromNode,
          toNode,
        };
      })
    );

    setRuns(enrichedRuns);
    setLoading(false);
  }

  useEffect(() => {
    if (workspaceId) load();
  }, [workspaceId]);

  const incoming = runs.filter((r) => r.toNode?.walletAddress?.toLowerCase() === address?.toLowerCase());
  const outgoing = runs.filter((r) => r.fromNode?.walletAddress?.toLowerCase() === address?.toLowerCase());
  const displayedRuns = activeTab === "incoming" ? incoming : outgoing;

  if (!address) {
    return (
      <div>
        <div className="mb-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Payments</h1>
          <p className="mt-1 text-sm text-sub">View your payment transactions and verify Merkle proofs.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center">
          <FileText size={28} className="mx-auto text-indigo" />
          <h2 className="mt-4 text-lg font-semibold text-ink">Connect your wallet</h2>
          <p className="mt-2 text-sm text-sub">Connect your wallet to view payment transactions.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Payments</h1>
        <p className="mt-1 text-sm text-sub">View your payment transactions and verify Merkle proofs.</p>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setActiveTab("incoming")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "incoming" ? "bg-indigo text-white" : "bg-panel border border-hair text-sub hover:text-ink"
          }`}
        >
          <ArrowDownLeft size={14} />
          Incoming ({incoming.length})
        </button>
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "outgoing" ? "bg-indigo text-white" : "bg-panel border border-hair text-sub hover:text-ink"
          }`}
        >
          <ArrowUpRight size={14} />
          Outgoing ({outgoing.length})
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-hair bg-panel p-10 text-center text-sm text-sub">
          Loading payments...
        </div>
      ) : displayedRuns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center">
          <FileText size={28} className="mx-auto text-indigo" />
          <h2 className="mt-4 text-lg font-semibold text-ink">No payments yet</h2>
          <p className="mt-2 text-sm text-sub">
            {activeTab === "incoming" ? "No incoming payments found." : "No outgoing payments found."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-hair bg-panel">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hair text-left text-[10px] font-medium uppercase text-sub">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">{activeTab === "incoming" ? "From" : "To"}</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Token</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedRuns.map((run, i) => {
                const node = activeTab === "incoming" ? run.fromNode : run.toNode;
                const symbol = run.currency?.split("-")[0] || "";
                const chain = run.currency?.split("-")[1] || run.chain;
                const ChainIcon = getChainIcon(chain);
                const token = DEFAULT_TOKENS.find((t) => t.symbol === symbol && t.chain === chain);

                return (
                  <tr
                    key={run.id}
                    className="cursor-pointer border-b border-hair/50 hover:bg-indigo/5"
                    onClick={() => setSelectedRun(run)}
                  >
                    <td className="px-4 py-3 text-sub">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo/10">
                          <span className="text-xs font-medium text-indigo">
                            {activeTab === "incoming" ? "S" : "R"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ink">{node?.label || "Unknown"}</p>
                          {node?.countries && node.countries.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <Flag country={node.countries[0]} size={10} />
                              <span className="text-[10px] text-sub">
                                Tier {node.tier || "N/A"}
                              </span>
                            </div>
                          )}
                          <p className="font-mono text-[10px] text-sub">{truncateAddress(node?.walletAddress || "")}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-ink">{run.amount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <ChainIcon size={12} />
                        <span className="text-sm text-ink">{symbol}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-sub">
                      {run.createdAt ? new Date(run.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(run.status)}
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(run.status)}`}>
                          {run.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {run.status === "settled" && run.merkleRoot && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setVerifyRun(run);
                          }}
                          className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100"
                        >
                          <Shield size={10} />
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {selectedRun && (
          <PaymentDetailDrawer
            run={selectedRun}
            onClose={() => setSelectedRun(null)}
          />
        )}
      </AnimatePresence>

      {verifyRun && (
        <MerkleVerificationModal
          merkleRoot={verifyRun.merkleRoot || ""}
          settlementId={verifyRun.settlementId || ""}
          chain={verifyRun.chain}
          onClose={() => setVerifyRun(null)}
        />
      )}
    </div>
  );
}

function PaymentDetailDrawer({ run, onClose }: { run: PaymentRun; onClose: () => void }) {
  const symbol = run.currency?.split("-")[0] || "";
  const chain = run.currency?.split("-")[1] || run.chain;
  const ChainIcon = getChainIcon(chain);

  // Parse configuration to get field values
  const config = run.configuration ? JSON.parse(String(run.configuration)) : {};
  const fieldValues = config.fieldValues || {};

  const previewHtml = `<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
  h1 { border-bottom: 2px solid #7FD9B0; padding-bottom: 10px; margin-bottom: 20px; font-size: 20px; }
  .subtitle { color: #666; margin-bottom: 30px; }
  .section { margin: 20px 0; }
  .section-title { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
  .field { margin: 12px 0; }
  .label { color: #666; font-size: 12px; }
  .value { font-size: 16px; color: #333; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
</style>
</head>
<body>
  <h1>${fieldValues.companyName || "Payment Receipt"}</h1>
  <div class="subtitle">Payment Receipt</div>
  
  <div class="section">
    <div class="section-title">Details</div>
    <div class="field"><div class="label">From</div><div class="value">${run.fromNode?.label || "Sender"}</div></div>
    <div class="field"><div class="label">To</div><div class="value">${run.toNode?.label || "Recipient"}</div></div>
    <div class="field"><div class="label">Amount</div><div class="value">${run.amount} ${symbol}</div></div>
    <div class="field"><div class="label">Date</div><div class="value">${run.createdAt ? new Date(run.createdAt).toLocaleDateString() : "-"}</div></div>
  </div>

  <div class="section">
    <div class="section-title">Additional Information</div>
    <div class="field"><div class="label">Company name</div><div class="value">${fieldValues.companyName || "-"}</div></div>
    <div class="field"><div class="label">Sender</div><div class="value">${fieldValues.senderName || run.fromNode?.label || "-"}</div></div>
    <div class="field"><div class="label">Recipient</div><div class="value">${fieldValues.recipientName || run.toNode?.label || "-"}</div></div>
    ${fieldValues.notes ? `<div class="field"><div class="label">Notes</div><div class="value">${fieldValues.notes}</div></div>` : ""}
  </div>

  <div class="footer">
    <div class="field"><div class="label">Network</div><div class="value">${chain === "monad" ? "Monad Testnet" : "Base Sepolia"}</div></div>
    ${run.txHash ? `<div class="field"><div class="label">Transaction Hash</div><div class="value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${run.txHash}</div></div>` : `<div class="field"><div class="label">Transaction Hash</div><div class="value">Pending...</div></div>`}
    ${run.merkleRoot ? `<div class="field"><div class="label">Merkle Root</div><div class="value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${run.merkleRoot}</div></div>` : ""}
    <div style="margin-top: 20px">Generated by Tamarind</div>
  </div>
</body>
</html>`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/30" />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative flex h-full w-[600px] flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-xs font-medium text-gray-500">Payment Details</p>
            <h2 className="text-base font-semibold text-gray-900">
              {run.fromNode?.label} → {run.toNode?.label}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Amount</p>
              <div className="mt-1 flex items-center gap-2">
                <ChainIcon size={16} />
                <p className="text-lg font-semibold text-gray-900">{run.amount} {symbol}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-2 flex items-center gap-2">
                {getStatusIcon(run.status)}
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(run.status)}`}>
                  {run.status}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2">
              <p className="text-xs font-medium text-gray-700">Document Preview</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const printWindow = window.open("", "_blank");
                    if (printWindow) {
                      printWindow.document.write(previewHtml);
                      printWindow.document.close();
                      printWindow.print();
                    }
                  }}
                  className="rounded px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-200"
                >
                  Print
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([previewHtml], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `payment-receipt-${run.id.slice(0, 8)}.html`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="rounded px-2 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-200"
                >
                  Download
                </button>
              </div>
            </div>
            <iframe
              srcDoc={previewHtml}
              className="w-full bg-white"
              style={{ minHeight: 400 }}
              title="Payment Receipt"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
