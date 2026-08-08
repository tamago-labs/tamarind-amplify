"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, AlertTriangle } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import { networkIcons } from "@web3icons/react";
import Flag from "react-flagkit";
import type { Schema } from "@/amplify/data/resource";
import { type CanvasNode, type CanvasConnection } from "./types";
import { DEFAULT_TOKENS } from "@/config/tokens";

const client = generateClient<Schema>();

interface Route {
  connection: CanvasConnection;
  fromNode: CanvasNode | undefined;
  toNode: CanvasNode | undefined;
}

interface PreviewRoutesModalProps {
  routes: Route[];
  onStart: () => void;
  onClose: () => void;
}

function countryFlag(code: string) {
  if (!code || code.length !== 2) return "";
  return String.fromCodePoint(...code.toUpperCase().split("").map((char) => 127397 + char.charCodeAt(0)));
}

function getChainIcon(chain?: string) {
  if (chain === "monad") return networkIcons.NetworkMonad;
  return networkIcons.NetworkBase;
}

function getTokenInfo(symbol: string, chain: string) {
  const token = DEFAULT_TOKENS.find((t) => t.symbol === symbol && t.chain === chain);
  return token;
}

function truncateAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

interface TokenRule {
  symbol: string;
  chain: string;
  name: string;
  tokenType: string;
  tokenAddress: string;
  minTier: number;
  countries: string[];
}

export default function PreviewRoutesModal({ routes, onStart, onClose }: PreviewRoutesModalProps) {
  const [tokenRules, setTokenRules] = useState<TokenRule[]>([]);

  useEffect(() => {
    async function fetchRules() {
      const tokenMap = new Map<string, { symbol: string; chain: string; tokenAddress: string }>();
      
      for (const route of routes) {
        const symbol = route.connection.currency?.split("-")[0] || "";
        const chain = route.connection.currency?.split("-")[1] || "base";
        const key = `${symbol}-${chain}`;
        if (!tokenMap.has(key)) {
          const token = getTokenInfo(symbol, chain);
          if (token) {
            tokenMap.set(key, { symbol, chain, tokenAddress: token.tokenAddress });
          }
        }
      }

      const rules: TokenRule[] = [];
      for (const tokenInfo of Array.from(tokenMap.values())) {
        const token = getTokenInfo(tokenInfo.symbol, tokenInfo.chain);
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

        rules.push({
          symbol: tokenInfo.symbol,
          chain: tokenInfo.chain,
          name: token?.name || tokenInfo.symbol,
          tokenType: token?.tokenType || "ERC20",
          tokenAddress: tokenInfo.tokenAddress,
          minTier,
          countries,
        });
      }

      setTokenRules(rules);
    }
    fetchRules();
  }, [routes]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Preview Routes</h2>
              <p className="text-sm text-gray-500">{routes.length} route{routes.length !== 1 ? "s" : ""} will be executed</p>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium text-gray-500">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">From</th>
                    <th className="pb-3 pr-4">To</th>
                    <th className="pb-3 pr-4">Token</th>
                    <th className="pb-3 pr-4">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, i) => {
                    const symbol = route.connection.currency?.split("-")[0] || "";
                    const chain = route.connection.currency?.split("-")[1] || "base";
                    const ChainIcon = getChainIcon(chain);
                    return (
                      <tr key={route.connection.id} className="border-b border-gray-50">
                        <td className="py-4 pr-4 text-gray-400">{i + 1}</td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo/10">
                              <span className="text-xs font-medium text-indigo">{route.fromNode?.nodeRole === "company" ? "C" : "D"}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{route.fromNode?.label}</p>
                              {route.fromNode?.countries && route.fromNode.countries.length > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Flag country={route.fromNode.countries[0]} size={10} />
                                  <span className="text-[10px] text-gray-500">
                                    Tier {route.fromNode.tier || "N/A"} · {route.fromNode.countries[0]}
                                  </span>
                                </div>
                              )}
                              <p className="font-mono text-[10px] text-gray-400">{truncateAddress(route.fromNode?.walletAddress || "")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                              <span className="text-xs font-medium text-green-600">{route.toNode?.nodeRole === "company" ? "C" : "R"}</span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{route.toNode?.label}</p>
                              {route.toNode?.countries && route.toNode.countries.length > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Flag country={route.toNode.countries[0]} size={10} />
                                  <span className="text-[10px] text-gray-500">
                                    Tier {route.toNode.tier || "N/A"} · {route.toNode.countries[0]}
                                  </span>
                                </div>
                              )}
                              <p className="font-mono text-[10px] text-gray-400">{truncateAddress(route.toNode?.walletAddress || "")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-1.5">
                            <ChainIcon size={14} />
                            <div>
                              <p className="font-medium text-gray-900">{symbol}</p>
                              <p className="text-[10px] text-gray-500">{chain === "monad" ? "Monad" : "Base"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-medium text-gray-900">
                          {route.connection.fixedAmount || "0"}
                        </td>
                        <td className="py-4">
                          <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-medium text-green-700">
                            Ready
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {tokenRules.length > 0 && (
            <div className="mx-6 mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} className="mt-0.5 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Token Transfer Restrictions</p>
                  <div className="mt-2 space-y-3">
                    {tokenRules.map((token) => (
                      <div key={`${token.symbol}-${token.chain}`} className="text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{token.symbol}</span>
                          <span className="text-gray-400">·</span>
                          <span>{token.tokenType === "WRAPPED_TOKEN" ? "Wrapped A-Token" : "ERC-20"}</span>
                          <span className="text-gray-400">·</span>
                          <span>{token.chain === "monad" ? "Monad" : "Base"}</span>
                        </div>
                        {token.tokenType === "WRAPPED_TOKEN" && (
                          <div className="mt-1 flex items-center gap-2 text-gray-500">
                            <span>Min Tier: {token.minTier}+</span>
                            {token.countries.length > 0 && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span>Approved: {token.countries.join(", ")}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button onClick={onClose} className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={onStart} className="flex items-center gap-2 rounded-lg bg-indigo px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
              <Play size={14} />
              Start Flow
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
