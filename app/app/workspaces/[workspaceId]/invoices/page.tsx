"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import { useParams } from "next/navigation";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { erc20Abi, parseUnits, keccak256, toBytes } from "viem";
import { networkIcons } from "@web3icons/react";
import Flag from "react-flagkit";
import { FileText, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, AlertCircle, Shield, Pen, Loader2, X } from "lucide-react";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_TOKENS } from "@/config/tokens";
import { buildMerkleTree, getMerkleRoot } from "@/lib/merkle";
import { TAMARIND_PROOF_ABI, TAMARIND_PROOF_ADDRESSES } from "@/lib/tamarindProof";
import MerkleVerificationModal from "@/components/app/MerkleVerificationModal";

const client = generateClient<Schema>();

interface InvoiceRun {
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

const chainIdMap: Record<string, number> = {
  base: 84532,
  monad: 10143,
};

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
    case "pendingApproval":
      return <Clock size={14} className="text-blue-500" />;
    case "failed":
    case "rejected":
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
    case "pendingApproval":
      return "bg-blue-100 text-blue-700";
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function InvoicesPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [runs, setRuns] = useState<InvoiceRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">("incoming");
  const [selectedRun, setSelectedRun] = useState<InvoiceRun | null>(null);
  const [verifyRun, setVerifyRun] = useState<InvoiceRun | null>(null);
  const [signingRunId, setSigningRunId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await client.models.WorkflowRun.list({
      filter: { workspaceId: { eq: workspaceId }, flowType: { eq: "invoice" } },
    });

    const enrichedRuns = await Promise.all(
      (data || []).map(async (run) => {
        let fromNode = undefined;
        let toNode = undefined;

        try {
          if (run.sourceIdentityId) {
            const { data: identity } = await client.models.WorkspaceIdentity.get({ id: run.sourceIdentityId });
            if (identity?.walletIdentityId) {
              const { data: wallet } = await client.models.WalletIdentity.get({ id: identity.walletIdentityId });
              if (wallet) {
                fromNode = {
                  label: "Deposit",
                  walletAddress: wallet.walletAddress,
                };
              }
            }
          }
          if (run.targetIdentityId) {
            const { data: identity } = await client.models.OrganizationIdentity.get({ id: run.targetIdentityId });
            if (identity) {
              toNode = {
                label: "Company",
                walletAddress: identity.walletAddress,
              };
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
          flowType: run.flowType || "invoice",
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

  // Invoice flow: Company sends invoice (fromNode) → Counter-party receives and pays (toNode)
  // Company sees in "outgoing" (they sent it)
  // Counter-party sees in "incoming" (they need to pay)
  const incoming = runs.filter((r) => r.fromNode?.walletAddress?.toLowerCase() === address?.toLowerCase());
  const outgoing = runs.filter((r) => r.toNode?.walletAddress?.toLowerCase() === address?.toLowerCase());
  const displayedRuns = activeTab === "incoming" ? incoming : outgoing;

  async function handleApprove(run: InvoiceRun) {
    setSigningRunId(run.id);

    try {
      const symbol = run.currency?.split("-")[0] || "";
      const chain = run.currency?.split("-")[1] || run.chain;
      const token = DEFAULT_TOKENS.find((t) => t.symbol === symbol && t.chain === chain);
      
      if (!token) throw new Error("Token not found");

      const chainId = chainIdMap[chain] || 84532;

      // Execute payment - Counter-party pays Company
      const amount = parseUnits(run.amount || "0", token.decimals);
      const tx = await writeContractAsync({
        address: token.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [run.toNode?.walletAddress as `0x${string}`, amount],
        chainId,
      });

      // Generate Merkle proof
      const config = run.configuration ? JSON.parse(String(run.configuration)) : {};
      const documentValues = [
        run.fromNode?.label || "Deposit",
        run.toNode?.label || "Company",
        run.amount || "0",
        symbol,
        new Date().toISOString(),
        tx,
        ...(config.fieldValues ? Object.values(config.fieldValues).map(String) : []),
        ...(config.lineItems ? [JSON.stringify(config.lineItems)] : []),
      ];

      const tree = buildMerkleTree(documentValues);
      const merkleRoot = getMerkleRoot(tree);
      const settlementId = keccak256(toBytes(`TAMARIND_SETTLEMENT:${run.id}`));

      // Anchor on-chain
      const proofAddress = TAMARIND_PROOF_ADDRESSES[chainId];
      if (proofAddress && publicClient) {
        const alreadyAnchored = await publicClient.readContract({
          address: proofAddress,
          abi: TAMARIND_PROOF_ABI,
          functionName: "isAnchored",
          args: [merkleRoot],
        });

          if (!alreadyAnchored) {
            const { request } = await publicClient.simulateContract({
              address: proofAddress,
              abi: TAMARIND_PROOF_ABI,
              functionName: "anchorRoot",
              args: [merkleRoot, settlementId],
              account: address,
            });
            await writeContractAsync(request);
          }
      }

      // Update run
      await client.models.WorkflowRun.update({
        id: run.id,
        status: "settled",
        txHash: tx,
        merkleRoot,
        settlementId,
      });

      await load();
    } catch (err) {
      console.error("Approval failed:", err);
      await client.models.WorkflowRun.update({
        id: run.id,
        status: "failed",
      });
    } finally {
      setSigningRunId(null);
    }
  }

  if (!address) {
    return (
      <div>
        <div className="mb-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Invoices</h1>
          <p className="mt-1 text-sm text-sub">Review and approve invoices, generate Merkle proofs.</p>
        </div>
        <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center">
          <FileText size={28} className="mx-auto text-indigo" />
          <h2 className="mt-4 text-lg font-semibold text-ink">Connect your wallet</h2>
          <p className="mt-2 text-sm text-sub">Connect your wallet to view and approve invoices.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-sub">Workspace</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Invoices</h1>
        <p className="mt-1 text-sm text-sub">Review and approve invoices, generate Merkle proofs.</p>
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
          Loading invoices...
        </div>
      ) : displayedRuns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-hair bg-panel p-12 text-center">
          <FileText size={28} className="mx-auto text-indigo" />
          <h2 className="mt-4 text-lg font-semibold text-ink">No invoices yet</h2>
          <p className="mt-2 text-sm text-sub">
            {activeTab === "incoming" ? "No incoming invoices found." : "No outgoing invoices found."}
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
                // Invoice flow: fromNode = counter-party, toNode = company
                // Incoming (counter-party): show company (toNode) who sent invoice
                // Outgoing (company): show counter-party (fromNode) who received
                const node = activeTab === "incoming" ? run.toNode : run.fromNode;
                const symbol = run.currency?.split("-")[0] || "";
                const chain = run.currency?.split("-")[1] || run.chain;
                const ChainIcon = getChainIcon(chain);

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
                            {activeTab === "incoming" ? "D" : "C"}
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
                      <div className="flex items-center gap-2">
                        {run.status === "pendingApproval" && activeTab === "incoming" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(run);
                            }}
                            disabled={signingRunId === run.id}
                            className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-medium text-green-700 hover:bg-green-100 disabled:opacity-50"
                          >
                            {signingRunId === run.id ? (
                              <Loader2 size={10} className="animate-spin" />
                            ) : (
                              <Pen size={10} />
                            )}
                            {signingRunId === run.id ? "Paying..." : "Approve & Pay"}
                          </button>
                        )}
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
                      </div>
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
          <InvoiceDetailDrawer
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

function InvoiceDetailDrawer({ run, onClose }: { run: InvoiceRun; onClose: () => void }) {
  const symbol = run.currency?.split("-")[0] || "";
  const chain = run.currency?.split("-")[1] || run.chain;
  const ChainIcon = getChainIcon(chain);

  // Parse configuration to get field values and line items
  const config = run.configuration ? JSON.parse(String(run.configuration)) : {};
  const fieldValues = config.fieldValues || {};
  const lineItems = config.lineItems || [];

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
  .textarea { background: #f9f9f9; padding: 12px; border-radius: 6px; min-height: 60px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th, td { border: 1px solid #eee; padding: 8px; text-align: left; font-size: 12px; }
  th { background: #f9f9f9; }
</style>
</head>
<body>
  <h1>${fieldValues.invoiceNumber || "Invoice"}</h1>
  <div class="subtitle">Invoice</div>
  
  <div class="section">
    <div class="section-title">Details</div>
    <div class="field"><div class="label">From (Deposit)</div><div class="value">${run.fromNode?.label || "Deposit Wallet"}</div></div>
    <div class="field"><div class="label">To (Company)</div><div class="value">${run.toNode?.label || "Company"}</div></div>
    <div class="field"><div class="label">Amount</div><div class="value">${run.amount} ${symbol}</div></div>
    <div class="field"><div class="label">Date</div><div class="value">${run.createdAt ? new Date(run.createdAt).toLocaleDateString() : "-"}</div></div>
  </div>

  ${lineItems.length > 0 ? `
  <div class="section">
    <div class="section-title">Line Items</div>
    <table>
      <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
      ${lineItems.map((item: any) => `<tr><td>${item.description || "-"}</td><td>${item.quantity || "0"}</td><td>${item.unitPrice || "0"}</td><td>${item.amount || "0"}</td></tr>`).join("")}
    </table>
  </div>` : ""}

  <div class="section">
    <div class="section-title">Additional Information</div>
    <div class="field"><div class="label">Company name</div><div class="value">${fieldValues.companyName || "-"}</div></div>
    <div class="field"><div class="label">Invoice number</div><div class="value">${fieldValues.invoiceNumber || "-"}</div></div>
    <div class="field"><div class="label">Sender</div><div class="value">${fieldValues.senderName || "-"}</div></div>
    <div class="field"><div class="label">Recipient</div><div class="value">${fieldValues.recipientName || "-"}</div></div>
    <div class="field"><div class="label">Issue date</div><div class="value">${fieldValues.issueDate || "-"}</div></div>
    <div class="field"><div class="label">Due date</div><div class="value">${fieldValues.dueDate || "-"}</div></div>
    <div class="field"><div class="label">Subtotal</div><div class="value">${fieldValues.subtotal || run.amount} ${symbol}</div></div>
  </div>

  <div class="footer">
    <div class="field"><div class="label">Network</div><div class="value">${chain === "monad" ? "Monad Testnet" : "Base Sepolia"}</div></div>
    ${run.txHash ? `<div class="field"><div class="label">Transaction Hash</div><div class="value" style="font-family: monospace; font-size: 12px; word-break: break-all;">${run.txHash}</div></div>` : `<div class="field"><div class="label">Transaction Hash</div><div class="value">Pending...</div></div>`}
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
            <p className="text-xs font-medium text-gray-500">Invoice Details</p>
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
              <p className="text-xs font-medium text-gray-700">Invoice Preview</p>
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
                    a.download = `invoice-${run.id.slice(0, 8)}.html`;
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
              title="Invoice Preview"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
