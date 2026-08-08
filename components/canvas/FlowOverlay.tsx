"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, Pen, Loader2 } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { useAccount, useWriteContract, usePublicClient, useSwitchChain } from "wagmi";
import { erc20Abi, parseUnits, keccak256, toBytes } from "viem";
import { networkIcons } from "@web3icons/react";
import Flag from "react-flagkit";
import type { Schema } from "@/amplify/data/resource";
import { type CanvasNode, type CanvasConnection } from "./types";
import { DEFAULT_TOKENS } from "@/config/tokens";
import { buildMerkleTree, getMerkleRoot } from "@/lib/merkle";
import { TAMARIND_PROOF_ABI, TAMARIND_PROOF_ADDRESSES } from "@/lib/tamarindProof";

const client = generateClient<Schema>();

const chainIdMap: Record<string, number> = {
  base: 84532,
  monad: 10143,
};

interface Run {
  id: string;
  connectionId: string;
  status: string;
}

interface FlowOverlayProps {
  runs: Run[];
  connections: CanvasConnection[];
  nodes: CanvasNode[];
  onSign: (runId: string) => void;
  onClose: () => void;
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
      return "bg-blue-100 text-blue-700";
    case "pendingApproval":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "settled":
      return "Settled";
    case "processing":
      return "Processing";
    case "pendingApproval":
      return "Pending Approval";
    case "failed":
      return "Failed";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

interface TokenRule {
  symbol: string;
  chain: string;
  tokenType: string;
  minTier: number;
  countries: string[];
}

export default function FlowOverlay({ runs, connections, nodes, onSign, onClose }: FlowOverlayProps) {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const { switchChainAsync } = useSwitchChain();
  const [expanded, setExpanded] = useState(true);
  const [tokenRules, setTokenRules] = useState<Record<string, TokenRule>>({});
  const [signingRunId, setSigningRunId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRules() {
      const tokenMap = new Map<string, { symbol: string; chain: string; tokenAddress: string }>();
      
      for (const run of runs) {
        const conn = connections.find((c) => c.id === run.connectionId);
        if (!conn) continue;
        const symbol = conn.currency?.split("-")[0] || "";
        const chain = conn.currency?.split("-")[1] || "base";
        const key = `${symbol}-${chain}`;
        if (!tokenMap.has(key)) {
          const token = DEFAULT_TOKENS.find((t) => t.symbol === symbol && t.chain === chain);
          if (token) {
            tokenMap.set(key, { symbol, chain, tokenAddress: token.tokenAddress });
          }
        }
      }

      const rules: Record<string, TokenRule> = {};
      for (const tokenInfo of Array.from(tokenMap.values())) {
        const token = DEFAULT_TOKENS.find((t) => t.symbol === tokenInfo.symbol && t.chain === tokenInfo.chain);
        let minTier = 0;
        let countries: string[] = [];

        if (token?.tokenType === "WRAPPED_TOKEN") {
          try {
            const { data } = await client.queries.queryTokenRules({
              chain: tokenInfo.chain,
              tokenAddress: tokenInfo.tokenAddress,
            });
            if (data?.success && data?.rules) {
              const parsed = JSON.parse(data.rules);
              if (parsed.length > 0) {
                minTier = parsed[0].min_tier || 0;
                countries = parsed[0].countries || [];
              }
            }
          } catch {}
        }

        const ruleKey = `${tokenInfo.symbol}-${tokenInfo.chain}`;
        rules[ruleKey] = {
          symbol: tokenInfo.symbol,
          chain: tokenInfo.chain,
          tokenType: token?.tokenType || "ERC20",
          minTier,
          countries,
        };
      }

      setTokenRules(rules);
    }
    fetchRules();
  }, [runs, connections]);

  async function handleSign(runId: string) {
    const run = runs.find((r) => r.id === runId);
    if (!run) return;

    const conn = connections.find((c) => c.id === run.connectionId);
    if (!conn) return;

    const symbol = conn.currency?.split("-")[0] || "";
    const chain = conn.currency?.split("-")[1] || "base";
    const token = DEFAULT_TOKENS.find((t) => t.symbol === symbol && t.chain === chain);
    
    if (!token) return;

    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
    const toNode = nodes.find((n) => n.id === conn.toNodeId);
    
    if (!fromNode?.walletAddress || !toNode?.walletAddress) return;

    setSigningRunId(runId);

    try {
      const chainId = chainIdMap[chain] || 84532;
      
      // Step 1: Execute ERC20 transfer
      const amount = parseUnits(conn.fixedAmount || "0", token.decimals);
      const tx = await writeContractAsync({
        address: token.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [toNode.walletAddress as `0x${string}`, amount],
        chainId,
      });

      // Step 2: Build document values for Merkle tree
      const config = conn.configuration ? JSON.parse(String(conn.configuration)) : {};
      const documentValues = [
        fromNode.label || "Company",
        toNode.label || "Recipient",
        conn.fixedAmount || "0",
        symbol,
        new Date().toISOString(),
        tx,
        ...(config.fieldValues ? Object.values(config.fieldValues).map(String) : []),
        ...(config.lineItems ? [JSON.stringify(config.lineItems)] : []),
      ];

      // Step 3: Generate Merkle tree and root
      const tree = buildMerkleTree(documentValues);
      const merkleRoot = getMerkleRoot(tree);

      // Step 4: Generate settlement ID from run ID
      const settlementId = keccak256(toBytes(`TAMARIND_SETTLEMENT:${runId}`));

      // Step 5: Switch to correct chain if needed
      const currentChain = await publicClient?.getChainId();
      if (currentChain !== chainId) {
        await switchChainAsync({ chainId });
      }

      // Step 6: Check if already anchored
      const proofAddress = TAMARIND_PROOF_ADDRESSES[chainId];
      if (proofAddress && publicClient) {
        const alreadyAnchored = await publicClient.readContract({
          address: proofAddress,
          abi: TAMARIND_PROOF_ABI,
          functionName: "isAnchored",
          args: [merkleRoot],
        });

        // Step 7: Anchor Merkle root if not already anchored
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

      // Step 8: Update WorkflowRun with proof data
      await client.models.WorkflowRun.update({
        id: runId,
        status: "settled",
        txHash: tx,
        merkleRoot,
        settlementId,
      });

      onSign(runId);
    } catch (err) {
      console.error("Payment failed:", err);
      await client.models.WorkflowRun.update({
        id: runId,
        status: "failed",
      });
    } finally {
      setSigningRunId(null);
    }
  }

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white shadow-lg"
    >
      <div
        className="flex cursor-pointer items-center justify-between px-4 py-3"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Active Routes</h3>
          <span className="rounded-full bg-indigo/10 px-2 py-0.5 text-[10px] font-medium text-indigo">
            {runs.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={14} />
          </button>
          {expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-[200px] overflow-y-auto px-4 pb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-medium uppercase text-gray-400">
                    <th className="pb-2 pr-3">From</th>
                    <th className="pb-2 pr-3">To</th>
                    <th className="pb-2 pr-3">Token</th>
                    <th className="pb-2 pr-3">Amount</th>
                    <th className="pb-2 pr-3">Restrictions</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => {
                    const conn = connections.find((c) => c.id === run.connectionId);
                    if (!conn) return null;
                    const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
                    const toNode = nodes.find((n) => n.id === conn.toNodeId);
                    const symbol = conn.currency?.split("-")[0] || "";
                    const chain = conn.currency?.split("-")[1] || "base";
                    const ChainIcon = getChainIcon(chain);
                    const token = DEFAULT_TOKENS.find((t) => t.symbol === symbol && t.chain === chain);

                    return (
                      <tr key={run.id} className="border-t border-gray-50">
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1.5">
                            {fromNode?.countries && fromNode.countries.length > 0 && (
                              <Flag country={fromNode.countries[0]} size={10} />
                            )}
                            <div>
                              <p className="text-xs font-medium text-gray-900">{fromNode?.label}</p>
                              <p className="font-mono text-[9px] text-gray-400">{truncateAddress(fromNode?.walletAddress || "")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1.5">
                            {toNode?.countries && toNode.countries.length > 0 && (
                              <Flag country={toNode.countries[0]} size={10} />
                            )}
                            <div>
                              <p className="text-xs font-medium text-gray-900">{toNode?.label}</p>
                              <p className="font-mono text-[9px] text-gray-400">{truncateAddress(toNode?.walletAddress || "")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 pr-3">
                          <div className="flex items-center gap-1">
                            <ChainIcon size={12} />
                            <span className="text-xs text-gray-700">{symbol}</span>
                          </div>
                        </td>
                        <td className="py-2 pr-3 text-xs font-medium text-gray-900">
                          {conn.fixedAmount}
                        </td>
                        <td className="py-2 pr-3">
                          {(() => {
                            const rule = tokenRules[`${symbol}-${chain}`];
                            if (rule && rule.tokenType === "WRAPPED_TOKEN") {
                              return (
                                <div className="text-[9px] text-gray-500">
                                  <p>A-Token · Tier {rule.minTier}+</p>
                                  {rule.countries.length > 0 && (
                                    <p>Approved: {rule.countries.join(", ")}</p>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <div className="text-[9px] text-gray-500">
                                <p>ERC-20</p>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            {run.status === "processing" && address?.toLowerCase() === fromNode?.walletAddress?.toLowerCase() ? (
                              <button 
                                onClick={() => handleSign(run.id)}
                                disabled={signingRunId === run.id}
                                className="flex items-center gap-1 rounded bg-indigo px-2 py-1 text-[10px] font-medium text-white hover:bg-indigo/90 disabled:opacity-50"
                              >
                                {signingRunId === run.id ? (
                                  <Loader2 size={10} className="animate-spin" />
                                ) : (
                                  <Pen size={10} />
                                )}
                                {signingRunId === run.id ? "Signing..." : "Sign"}
                              </button>
                            ) : (
                              <>
                                {getStatusIcon(run.status)}
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(run.status)}`}>
                                  {getStatusLabel(run.status)}
                                </span>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
