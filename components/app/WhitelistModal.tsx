"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, CheckCircle, XCircle, Loader2, Plus, Trash2 } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_TOKENS } from "@/config/tokens";

const client = generateClient<Schema>();

interface WhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
  chain: string;
  workspaceId: string;
}

type WhitelistStatus = "idle" | "loading" | "adding" | "removing" | "success" | "error";

interface WhitelistEntry {
  id: string;
  tokenAddress: string;
  tokenSymbol: string | null;
  status: string | null;
}

export default function WhitelistModal({ isOpen, onClose, walletAddress, chain, workspaceId }: WhitelistModalProps) {
  const [status, setStatus] = useState<WhitelistStatus>("idle");
  const [error, setError] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState("");
  const [entries, setEntries] = useState<WhitelistEntry[]>([]);

  // Get WRAPPED_TOKEN tokens that can be whitelisted
  // Use originalTokenAddress (e.g., JPYC) for whitelist
  const availableTokens = DEFAULT_TOKENS.filter(
    (t) => t.chain === chain && t.tokenType === "WRAPPED_TOKEN"
  );

  // Get the original token address for whitelist
  function getWhitelistAddress(token: typeof availableTokens[0]): string {
    return token.originalTokenAddress || token.tokenAddress;
  }

  useEffect(() => {
    if (isOpen && walletAddress) {
      loadEntries();
    }
  }, [isOpen, walletAddress]);

  async function loadEntries() {
    setStatus("loading");
    try {
      // Normalize wallet address for comparison
      const normalizedAddress = walletAddress.toLowerCase();
      
      const { data } = await client.models.WhitelistEntry.list({
        filter: {
          walletAddress: { eq: walletAddress },
          chain: { eq: chain },
          status: { eq: "active" },
        },
      });

      // Also check with lowercase address
      const { data: lowercaseData } = await client.models.WhitelistEntry.list({
        filter: {
          walletAddress: { eq: normalizedAddress },
          chain: { eq: chain },
          status: { eq: "active" },
        },
      });

      // Merge and deduplicate
      const allEntries = [...(data || []), ...(lowercaseData || [])];
      const uniqueEntries = allEntries.filter((entry, index, self) =>
        index === self.findIndex((e) => e.id === entry.id)
      );

      setEntries(uniqueEntries);
    } catch (err) {
      console.error("Error loading entries:", err);
    } finally {
      setStatus("idle");
    }
  }

  const handleAdd = async () => {
    if (!selectedToken) return;

    setStatus("adding");
    setError("");

    try {
      const token = availableTokens.find((t) => t.tokenAddress === selectedToken);
      if (!token) {
        setStatus("error");
        setError("Token not found");
        return;
      }

      // Get the address to whitelist (original token for wrapped, token address for ERC-20)
      const whitelistAddress = getWhitelistAddress(token);

      const { data, errors } = await client.mutations.addWhitelist({
        chain,
        tokenAddress: whitelistAddress,
        tokenSymbol: token.originalTokenSymbol || token.symbol,
        walletAddresses: [walletAddress],
      });

      if (errors?.length) {
        setStatus("error");
        setError(errors[0].message);
      } else if (data?.success) {
        // Save to database
        await client.models.WhitelistEntry.create({
          workspaceId,
          walletAddress,
          chain,
          tokenAddress: whitelistAddress,
          tokenSymbol: token.symbol,
          status: "active",
          addedAt: new Date().toISOString(),
          addedBy: "current-user",
        });

        await loadEntries();
        setSelectedToken("");
        setStatus("success");
      } else {
        setStatus("error");
        setError(data?.error || "Failed to add to whitelist");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleRemove = async (entry: WhitelistEntry) => {
    setStatus("removing");
    setError("");

    try {
      const { data, errors } = await client.mutations.removeWhitelist({
        chain,
        tokenAddress: entry.tokenAddress,
        tokenSymbol: entry.tokenSymbol || "",
        walletAddresses: [walletAddress],
        removeReason: "Removed by admin",
      });

      if (errors?.length) {
        setStatus("error");
        setError(errors[0].message);
      } else if (data?.success) {
        // Update database
        await client.models.WhitelistEntry.update({
          id: entry.id,
          status: "removed",
          removedAt: new Date().toISOString(),
          removedBy: "current-user",
        });

        await loadEntries();
        setStatus("success");
      } else {
        setStatus("error");
        setError(data?.error || "Failed to remove from whitelist");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setError("");
    setSelectedToken("");
    onClose();
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
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-panel border border-hair rounded-xl w-full max-w-lg mx-4 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-hair">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-indigo" />
                <h2 className="text-lg font-semibold text-ink">Manage Whitelist</h2>
              </div>
              <button onClick={handleClose} className="text-sub hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {/* Wallet Info */}
              <div className="mb-4">
                <p className="text-xs text-sub mb-1">Wallet Address</p>
                <p className="font-mono text-sm text-ink break-all">{walletAddress}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-sub mb-1">Chain</p>
                <p className="text-sm text-ink capitalize">{chain}</p>
              </div>

              {/* Add to Whitelist */}
              <div className="bg-paper rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-ink mb-3">Add to Whitelist</p>
                <div className="flex gap-2">
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="flex-1 px-3 py-2 bg-panel border border-hair rounded-lg text-sm text-ink focus:outline-none focus:border-indigo"
                  >
                    <option value="">Select token...</option>
                    {availableTokens.map((token) => (
                      <option key={token.tokenAddress} value={token.tokenAddress}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAdd}
                    disabled={!selectedToken || status === "adding"}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all disabled:opacity-50"
                  >
                    {status === "adding" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Plus size={14} />
                    )}
                    Add
                  </button>
                </div>
              </div>

              {/* Current Whitelist */}
              <div>
                <p className="text-sm font-medium text-ink mb-3">
                  Whitelisted Tokens ({entries.length})
                </p>
                {status === "loading" ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={20} className="animate-spin text-sub" />
                  </div>
                ) : entries.length === 0 ? (
                  <p className="text-sm text-sub py-4 text-center">
                    No tokens whitelisted for this wallet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between bg-paper rounded-lg px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {entry.tokenSymbol}
                          </p>
                          <p className="text-xs text-sub font-mono">
                            {entry.tokenAddress.slice(0, 10)}...{entry.tokenAddress.slice(-8)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemove(entry)}
                          disabled={status === "removing"}
                          className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {status === "removing" ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Messages */}
              {status === "success" && (
                <div className="mt-4 flex items-center gap-2 text-sm text-okgreen">
                  <CheckCircle size={16} />
                  <span>Operation completed successfully</span>
                </div>
              )}

              {status === "error" && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-500">
                  <XCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
