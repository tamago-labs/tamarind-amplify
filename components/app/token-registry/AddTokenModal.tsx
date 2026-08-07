"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { SUPPORTED_CHAINS } from "@/config/tokens";

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (token: AddTokenInput) => void;
}

export interface AddTokenInput {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  chain: string;
  tokenType: "ERC20" | "A_TOKEN" | "WRAPPED_TOKEN";
  originalTokenAddress?: string;
  originalTokenName?: string;
  originalTokenSymbol?: string;
  originalTokenDecimals?: number;
  originalTokenIcon?: string;
}

export default function AddTokenModal({ isOpen, onClose, onSubmit }: AddTokenModalProps) {
  const [tokenType, setTokenType] = useState<"ERC20" | "A_TOKEN" | "WRAPPED_TOKEN">("ERC20");
  const [chain, setChain] = useState("base");
  const [tokenAddress, setTokenAddress] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState("6");
  const [icon, setIcon] = useState("");

  // Wrapped token fields
  const [originalTokenAddress, setOriginalTokenAddress] = useState("");
  const [originalTokenName, setOriginalTokenName] = useState("");
  const [originalTokenSymbol, setOriginalTokenSymbol] = useState("");
  const [originalTokenDecimals, setOriginalTokenDecimals] = useState("6");
  const [originalTokenIcon, setOriginalTokenIcon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tokenAddress,
      name,
      symbol,
      decimals: parseInt(decimals),
      icon,
      chain,
      tokenType,
      ...(tokenType === "WRAPPED_TOKEN" && {
        originalTokenAddress,
        originalTokenName,
        originalTokenSymbol,
        originalTokenDecimals: parseInt(originalTokenDecimals),
        originalTokenIcon,
      }),
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setTokenType("ERC20");
    setChain("base");
    setTokenAddress("");
    setName("");
    setSymbol("");
    setDecimals("6");
    setIcon("");
    setOriginalTokenAddress("");
    setOriginalTokenName("");
    setOriginalTokenSymbol("");
    setOriginalTokenDecimals("6");
    setOriginalTokenIcon("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-panel border border-hair rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-hair">
              <h2 className="text-lg font-semibold text-ink">Add Custom Token</h2>
              <button onClick={onClose} className="text-sub hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Token Type */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Token Type *</label>
                <select
                  value={tokenType}
                  onChange={(e) => setTokenType(e.target.value as any)}
                  className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink focus:outline-none focus:border-indigo"
                >
                  <option value="ERC20">ERC-20</option>
                  <option value="A_TOKEN">A-Token</option>
                  <option value="WRAPPED_TOKEN">Wrapped A-Token</option>
                </select>
              </div>

              {/* Chain */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Chain *</label>
                <select
                  value={chain}
                  onChange={(e) => setChain(e.target.value)}
                  className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink focus:outline-none focus:border-indigo"
                >
                  {SUPPORTED_CHAINS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Token Address */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Token Address *</label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo font-mono"
                  required
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., USDC"
                  className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                  required
                />
              </div>

              {/* Symbol & Decimals */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Symbol *</label>
                  <input
                    type="text"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    placeholder="e.g., USDC"
                    className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Decimals *</label>
                  <input
                    type="number"
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    placeholder="6"
                    className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                    required
                  />
                </div>
              </div>

              {/* Icon URL */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Icon URL</label>
                <input
                  type="url"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                />
              </div>

              {/* Original Token Fields (for Wrapped Tokens) */}
              {tokenType === "WRAPPED_TOKEN" && (
                <div className="pt-4 border-t border-hair space-y-4">
                  <p className="text-sm font-medium text-ink">Original Token Details</p>

                  <div>
                    <label className="block text-sm font-medium text-ink mb-2">Original Token Address *</label>
                    <input
                      type="text"
                      value={originalTokenAddress}
                      onChange={(e) => setOriginalTokenAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo font-mono"
                      required={tokenType === "WRAPPED_TOKEN"}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Original Name *</label>
                      <input
                        type="text"
                        value={originalTokenName}
                        onChange={(e) => setOriginalTokenName(e.target.value)}
                        placeholder="e.g., USDC"
                        className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                        required={tokenType === "WRAPPED_TOKEN"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Original Symbol *</label>
                      <input
                        type="text"
                        value={originalTokenSymbol}
                        onChange={(e) => setOriginalTokenSymbol(e.target.value)}
                        placeholder="e.g., usdc"
                        className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                        required={tokenType === "WRAPPED_TOKEN"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Original Decimals *</label>
                      <input
                        type="number"
                        value={originalTokenDecimals}
                        onChange={(e) => setOriginalTokenDecimals(e.target.value)}
                        placeholder="6"
                        className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                        required={tokenType === "WRAPPED_TOKEN"}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink mb-2">Original Icon URL</label>
                      <input
                        type="url"
                        value={originalTokenIcon}
                        onChange={(e) => setOriginalTokenIcon(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm font-medium text-ink hover:bg-hair/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-indigo text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
                >
                  Add Token
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
