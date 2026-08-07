"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";
import { ERC20_ABI, TOKEN_ADDRESSES, ACCESS_CORE_ADDRESS } from "@/lib/tokens";
import { monadTestnet } from "@/lib/wagmi";
import { baseSepolia } from "viem/chains";
import TokenIcon from "../token-registry/TokenIcon";

interface WrapModalProps {
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

type WrapStatus = "idle" | "approving" | "wrapping" | "success" | "error";

export default function WrapModal({ isOpen, onClose, token }: WrapModalProps) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<WrapStatus>("idle");
  const [error, setError] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const chainId = token?.chain === "base" ? baseSepolia.id : monadTestnet.id;

  const handleWrap = async () => {
    console.log("Wrap button clicked", { token, address, amount });
    if (!token || !address || !amount || !token.originalTokenAddress) {
      console.log("Missing required data:", { hasToken: !!token, hasAddress: !!address, hasAmount: !!amount, hasOriginal: !!token?.originalTokenAddress });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setStatus("approving");
    setError("");

    try {
      const tokenAmount = parseUnits(amount, token.decimals);
      console.log("Token amount:", tokenAmount.toString());

      // Step 1: Approve original token (USDC) for AccessCore
      console.log("Approving USDC for AccessCore:", { token: token.originalTokenAddress, accessCore: ACCESS_CORE_ADDRESS });
      const approveTx = await writeContractAsync({
        address: token.originalTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ACCESS_CORE_ADDRESS, tokenAmount],
        chainId,
      });
      console.log("Approval tx:", approveTx);

      // Wait for approval
      setStatus("wrapping");

      // Step 2: Transfer USDC to AccessCore (wrap)
      console.log("Transferring USDC to AccessCore");
      const wrapTx = await writeContractAsync({
        address: token.originalTokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [ACCESS_CORE_ADDRESS, tokenAmount],
        chainId,
      });
      console.log("Wrap tx:", wrapTx);

      setStatus("success");
    } catch (err) {
      console.error("Wrap error:", err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Wrap failed");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setAmount("");
    setError("");
    onClose();
  };

  if (!token) return null;

  const originalToken = {
    name: token.originalTokenName || "USDC",
    symbol: token.originalTokenSymbol || "USDC",
    icon: token.originalTokenIcon || token.icon,
    tokenAddress: token.originalTokenAddress || token.tokenAddress,
    decimals: token.decimals,
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
            className="bg-panel border border-hair rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-hair">
              <h2 className="text-lg font-semibold text-ink">Wrap Token</h2>
              <button onClick={handleClose} className="text-sub hover:text-ink transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {status === "idle" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <TokenIcon icon={originalToken.icon} symbol={originalToken.symbol} chain={token.chain} size="md" />
                      <div>
                        <p className="text-sm font-medium text-ink">{originalToken.symbol}</p>
                        <p className="text-xs text-sub capitalize">{token.chain}</p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-sub" />
                    <div className="flex items-center gap-3">
                      <TokenIcon icon={token.icon} symbol={token.symbol} chain={token.chain} size="md" />
                      <div>
                        <p className="text-sm font-medium text-ink">{token.symbol}</p>
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
                    onClick={handleWrap}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Wrap {originalToken.symbol} to {token.symbol}
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

              {status === "wrapping" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="mx-auto text-indigo animate-spin mb-4" />
                  <p className="text-ink font-medium">Wrapping tokens...</p>
                  <p className="text-sm text-sub mt-1">Processing your wrap transaction</p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="mx-auto text-okgreen mb-4" />
                  <p className="text-ink font-medium">Tokens wrapped!</p>
                  <p className="text-sm text-sub mt-1">
                    {amount} {originalToken.symbol} → {amount} {token.symbol}
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
                  <p className="text-ink font-medium">Wrap failed</p>
                  <p className="text-sm text-sub mt-1">{error}</p>
                  <button
                    onClick={handleWrap}
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
