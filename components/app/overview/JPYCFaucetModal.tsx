"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { monadTestnet } from "@/lib/wagmi";
import { baseSepolia } from "viem/chains";
import TokenIcon from "../token-registry/TokenIcon";

interface JPYCFaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: {
    name: string;
    symbol: string;
    icon: string;
    chain: string;
    tokenAddress: string;
    decimals: number;
  } | null;
}

type FaucetStatus = "idle" | "minting" | "success" | "error";

// JPYC mint ABI (public function anyone can call)
const JPYC_MINT_ABI = [
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const MINT_AMOUNT = 1000;

export default function JPYCFaucetModal({ isOpen, onClose, token }: JPYCFaucetModalProps) {
  const [status, setStatus] = useState<FaucetStatus>("idle");
  const [error, setError] = useState<string>("");
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const chainId = token?.chain === "base" ? baseSepolia.id : monadTestnet.id;

  const handleFaucet = async () => {
    if (!token || !address) return;

    setStatus("minting");
    setError("");

    try {
      const mintAmount = parseUnits(String(MINT_AMOUNT), token.decimals);

      // Call mint function directly on JPYC contract
      const tx = await writeContractAsync({
        address: token.tokenAddress as `0x${string}`,
        abi: JPYC_MINT_ABI,
        functionName: "mint",
        args: [address, mintAmount],
        chainId,
      });

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Minting failed");
    }
  };

  const handleClose = () => {
    setStatus("idle");
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
                <h2 className="text-lg font-semibold text-ink">JPYC Faucet</h2>
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-sub">Amount</span>
                      <span className="text-lg font-semibold text-ink">1,000 {token.symbol}</span>
                    </div>
                  </div>

                  <p className="text-xs text-sub mb-6">
                    Free testnet tokens for development. Anyone can mint.
                  </p>

                  <button
                    onClick={handleFaucet}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
                  >
                    <Droplets size={16} />
                    Mint 1,000 {token.symbol}
                  </button>
                </>
              )}

              {status === "minting" && (
                <div className="text-center py-8">
                  <Loader2 size={40} className="mx-auto text-indigo animate-spin mb-4" />
                  <p className="text-ink font-medium">Minting tokens...</p>
                  <p className="text-sm text-sub mt-1">Please confirm in your wallet</p>
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-8">
                  <CheckCircle size={40} className="mx-auto text-okgreen mb-4" />
                  <p className="text-ink font-medium">Tokens minted!</p>
                  <p className="text-sm text-sub mt-1">
                    1,000 {token.symbol} has been sent to your wallet.
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
                  <p className="text-ink font-medium">Minting failed</p>
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
