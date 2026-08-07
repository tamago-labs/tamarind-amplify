"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { useWallet } from "../WalletProvider";
import TokenIcon from "../token-registry/TokenIcon";

const client = generateClient<Schema>();

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    name: string;
    symbol: string;
    icon: string;
    chain: string;
    tokenAddress: string;
  } | null;
}

type FaucetStatus = "idle" | "loading" | "success" | "error";

export default function FaucetModal({ isOpen, onClose, token }: FaucetModalProps) {
  const [status, setStatus] = useState<FaucetStatus>("idle");
  const [txHash, setTxHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { address } = useWallet();

  const handleFaucet = async () => {
    if (!token || !address) return;

    setStatus("loading");
    setError("");
    setTxHash("");

    try {
      const { data } = await client.mutations.cleanverseFaucet({
        chain: token.chain,
        depositAddress: address,
        amount: "5",
      });

      if (data?.success) {
        setStatus("success");
        setTxHash(data.txHash || "");
      } else {
        setStatus("error");
        setError(data?.error || "Faucet request failed");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setTxHash("");
    setError("");
    onClose();
  };

  if (!token) return null;

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
            className="bg-panel border border-hair rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-hair">
              <div className="flex items-center gap-3">
                <Droplets size={20} className="text-indigo" />
                <h2 className="text-lg font-semibold text-ink">Faucet</h2>
              </div>
              <button onClick={handleClose} className="text-sub hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {status === "idle" && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <TokenIcon icon={token.icon} symbol={token.symbol} chain={token.chain} size="lg" />
                    <div>
                      <p className="text-lg font-semibold text-ink">{token.symbol}</p>
                      <p className="text-sm text-sub capitalize">{token.chain} Testnet</p>
                    </div>
                  </div>

                  <div className="bg-paper rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-sub">Amount</span>
                      <span className="text-lg font-semibold text-ink">5 {token.symbol}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-sub">To wallet</span>
                      <span className="text-xs text-sub font-mono">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-sub mb-6">
                    Testnet tokens have no real value. Limited to one request per 2 hours per wallet.
                  </p>

                  <button
                    onClick={handleFaucet}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    <Droplets size={16} />
                    Request 5 {token.symbol}
                  </button>
                </>
              )}

              {status === "loading" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="mx-auto text-indigo animate-spin mb-4" />
                  <p className="text-ink font-medium">Requesting tokens...</p>
                  <p className="text-sm text-sub mt-1">Please wait while we process your request.</p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="mx-auto text-okgreen mb-4" />
                  <p className="text-ink font-medium">Tokens received!</p>
                  <p className="text-sm text-sub mt-1">5 {token.symbol} has been sent to your wallet.</p>
                  {txHash && (
                    <a
                      href={`https://testnet.monadscan.com/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-4 text-sm text-indigo hover:text-indigo/80"
                    >
                      View transaction <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className="block w-full mt-6 px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm font-medium text-ink hover:bg-hair/50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-8">
                  <XCircle size={40} className="mx-auto text-red-500 mb-4" />
                  <p className="text-ink font-medium">Request failed</p>
                  <p className="text-sm text-sub mt-1">{error}</p>
                  <button
                    onClick={handleFaucet}
                    className="mt-4 px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm font-medium text-ink hover:bg-hair/50 transition-colors"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleClose}
                    className="block w-full mt-2 px-4 py-2.5 text-sm font-medium text-sub hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
