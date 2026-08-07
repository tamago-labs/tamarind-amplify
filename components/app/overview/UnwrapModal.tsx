"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { ERC20_ABI, ACCESS_CORE_ADDRESS } from "@/lib/tokens";
import { monadTestnet } from "@/lib/wagmi";
import { baseSepolia } from "viem/chains";
import TokenIcon from "../token-registry/TokenIcon";

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

type UnwrapStatus = "idle" | "approving" | "unwrapping" | "success" | "error";

export default function UnwrapModal({ isOpen, onClose, token }: UnwrapModalProps) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<UnwrapStatus>("idle");
  const [error, setError] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const chainId = token?.chain === "base" ? baseSepolia.id : monadTestnet.id;

  const handleUnwrap = async () => {
    if (!token || !address || !amount || !token.originalTokenAddress) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setStatus("approving");
    setError("");

    try {
      const tokenAmount = parseUnits(amount, token.decimals);

      // Step 1: Approve aUSDC for AccessCore
      const approveTx = await writeContractAsync({
        address: token.tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ACCESS_CORE_ADDRESS, tokenAmount],
        chainId,
      });

      // Wait for approval
      setStatus("unwrapping");

      // Step 2: Call withdraw on AccessCore
      const unwrapTx = await writeContractAsync({
        address: ACCESS_CORE_ADDRESS as `0x${string}`,
        abi: [
          "function withdraw(address token, uint256 amount) returns (bool)",
        ],
        functionName: "withdraw",
        args: [token.tokenAddress as `0x${string}`, tokenAmount],
        chainId,
      });

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
                        symbol={token.originalTokenSymbol || "USDC"} 
                        chain={token.chain} 
                        size="md" 
                      />
                      <div>
                        <p className="text-sm font-medium text-ink">{token.originalTokenSymbol || "USDC"}</p>
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

                  <button
                    onClick={handleUnwrap}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Unwrap {token.symbol} to {token.originalTokenSymbol || "USDC"}
                  </button>
                </>
              )}

              {status === "approving" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="mx-auto text-indigo animate-spin mb-4" />
                  <p className="text-ink font-medium">Approving {token.symbol}...</p>
                  <p className="text-sm text-sub mt-1">Please confirm in your wallet</p>
                </div>
              )}

              {status === "unwrapping" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="mx-auto text-indigo animate-spin mb-4" />
                  <p className="text-ink font-medium">Unwrapping tokens...</p>
                  <p className="text-sm text-sub mt-1">Processing your unwrap transaction</p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="mx-auto text-okgreen mb-4" />
                  <p className="text-ink font-medium">Tokens unwrapped!</p>
                  <p className="text-sm text-sub mt-1">
                    {amount} {token.symbol} → {amount} {token.originalTokenSymbol || "USDC"}
                  </p>
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
                  <p className="text-ink font-medium">Unwrap failed</p>
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
