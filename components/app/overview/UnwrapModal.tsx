"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits, erc20Abi } from "viem";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { monadTestnet } from "@/lib/wagmi";
import { baseSepolia } from "viem/chains";
import TokenIcon from "../token-registry/TokenIcon";

const client = generateClient<Schema>();

interface UnwrapModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    name: string;
    symbol: string;
    icon: string;
    chain: string;
    tokenAddress: string;
    decimals: number;
    originalTokenAddress?: string | null;
    originalTokenName?: string | null;
    originalTokenSymbol?: string | null;
    originalTokenIcon?: string | null;
  } | null;
}

type UnwrapStatus = "idle" | "querying" | "transferring" | "success" | "error";

export default function UnwrapModal({ isOpen, onClose, token }: UnwrapModalProps) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<UnwrapStatus>("idle");
  const [error, setError] = useState<string>("");
  const [txHash, setTxHash] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const chainId = token?.chain === "base" ? baseSepolia.id : monadTestnet.id;

  const handleUnwrap = async () => {
    if (!token || !address || !amount) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setStatus("querying");
    setError("");

    try {
      // Step 1: Query deposit address from API
      const { data: depositData, errors: depositErrors } = await client.queries.queryDepositAddress({
        chain: token.chain,
        address: address,
      });

      if (depositErrors?.length) {
        setStatus("error");
        setError(depositErrors[0].message);
        return;
      }

      if (!depositData?.success || !depositData?.depositAddress) {
        setStatus("error");
        setError(depositData?.error || "Failed to get deposit address");
        return;
      }

      const depositAddress = depositData.depositAddress;
      console.log("Deposit address:", depositAddress);

      setStatus("transferring");

      // Step 2: Transfer aToken to deposit address
      const tokenAmount = parseUnits(amount, token.decimals);
      const tx = await writeContractAsync({
        address: token.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "transfer",
        args: [depositAddress as `0x${string}`, tokenAmount],
        chainId,
      });

      setTxHash(tx);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unwrap failed");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setAmount("");
    setError("");
    setTxHash("");
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
              <h2 className="text-lg font-semibold text-ink">Unwrap Token</h2>
              <button onClick={handleClose} className="text-sub hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {status === "idle" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <TokenIcon icon={token.icon} symbol={token.symbol} chain={token.chain} size="md" />
                      <div>
                        <p className="text-sm font-medium text-ink">{token.symbol}</p>
                        <p className="text-xs text-sub capitalize">{token.chain}</p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-sub" />
                    <div className="flex items-center gap-3">
                      <TokenIcon
                        icon={token.originalTokenIcon || token.icon}
                        symbol={token.originalTokenSymbol || "JPYC"}
                        chain={token.chain}
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">{token.originalTokenSymbol || "JPYC"}</p>
                        <p className="text-xs text-sub capitalize">{token.chain}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-ink mb-2">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo"
                    />
                  </div>

                  <p className="text-xs text-sub mb-4">
                    Transfer {token.symbol} to the deposit address. {token.originalTokenSymbol || "JPYC"} will arrive in ~1 minute.
                  </p>

                  <button
                    onClick={handleUnwrap}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unwrap {token.symbol} to {token.originalTokenSymbol || "JPYC"}
                  </button>
                </>
              )}

              {status === "querying" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="mx-auto text-indigo animate-spin mb-4" />
                  <p className="text-ink font-medium">Querying deposit address...</p>
                  <p className="text-sm text-sub mt-1">Please wait</p>
                </div>
              )}

              {status === "transferring" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="mx-auto text-indigo animate-spin mb-4" />
                  <p className="text-ink font-medium">Transferring tokens...</p>
                  <p className="text-sm text-sub mt-1">Please confirm in your wallet</p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="mx-auto text-okgreen mb-4" />
                  <p className="text-ink font-medium">Transfer submitted!</p>
                  <p className="text-sm text-sub mt-1">
                    {amount} {token.symbol} sent to deposit address.
                  </p>
                  <p className="text-sm text-sub mt-2">
                    {token.originalTokenSymbol || "JPYC"} will arrive in ~1 minute.
                  </p>
                  {txHash && (
                    <a
                      href={`https://sepolia.basescan.org/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-indigo hover:text-indigo/80"
                    >
                      View transaction <ExternalLink size={14} />
                    </a>
                  )}
                  <button
                    onClick={handleClose}
                    className="mt-6 w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm font-medium text-ink hover:bg-hair/50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-8">
                  <XCircle size={40} className="mx-auto text-red-500 mb-4" />
                  <p className="text-ink font-medium">Transfer failed</p>
                  <p className="text-sm text-sub mt-1">{error}</p>
                  <button
                    onClick={handleUnwrap}
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
