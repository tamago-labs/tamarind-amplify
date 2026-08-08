"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, ExternalLink } from "lucide-react";
import { usePublicClient } from "wagmi";
import { TAMARIND_PROOF_ABI, TAMARIND_PROOF_ADDRESSES } from "@/lib/tamarindProof";

interface MerkleVerificationModalProps {
  merkleRoot: string;
  settlementId: string;
  chain: string;
  onClose: () => void;
}

const chainIdMap: Record<string, number> = {
  base: 84532,
  monad: 10143,
};

const chainExplorerMap: Record<number, string> = {
  84532: "https://sepolia.basescan.org/tx/",
  10143: "https://testnet.monadexplorer.com/tx/",
};

export default function MerkleVerificationModal({ merkleRoot, settlementId, chain, onClose }: MerkleVerificationModalProps) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [document, setDocument] = useState<{
    submitter: string;
    timestamp: number;
  } | null>(null);
  const [error, setError] = useState("");

  const chainId = chainIdMap[chain] || 84532;
  const proofAddress = TAMARIND_PROOF_ADDRESSES[chainId];
  const publicClient = usePublicClient({ chainId });

  useEffect(() => {
    async function verify() {
      if (!proofAddress) {
        setError("Contract not deployed on this chain");
        setLoading(false);
        return;
      }

      if (!publicClient) {
        setError("Unable to connect to network");
        setLoading(false);
        return;
      }

      try {

        const isAnchored = await publicClient.readContract({
          address: proofAddress,
          abi: TAMARIND_PROOF_ABI,
          functionName: "isAnchored",
          args: [merkleRoot as `0x${string}`],
        });

        if (isAnchored) {
          const doc = await publicClient.readContract({
            address: proofAddress,
            abi: TAMARIND_PROOF_ABI,
            functionName: "getDocument",
            args: [merkleRoot as `0x${string}`],
          });
          setDocument({
            submitter: doc.submitter,
            timestamp: Number(doc.timestamp),
          });
          setVerified(true);
        } else {
          setError("Merkle root not found on-chain");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [merkleRoot, chainId, proofAddress]);

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
          className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Merkle Verification</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
              <X size={18} />
            </button>
          </div>

          <div className="px-6 py-4">
            {loading ? (
              <div className="py-8 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-500" />
                <p className="mt-3 text-sm text-gray-500">Verifying on-chain...</p>
              </div>
            ) : verified && document ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                  <CheckCircle size={20} className="text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Verified</p>
                    <p className="text-xs text-green-600">Merkle root found on-chain</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Settlement ID</p>
                    <p className="mt-1 font-mono text-xs text-gray-900 break-all">{settlementId}</p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Merkle Root</p>
                    <p className="mt-1 font-mono text-xs text-gray-900 break-all">{merkleRoot}</p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Submitter</p>
                    <p className="mt-1 font-mono text-xs text-gray-900 break-all">{document.submitter}</p>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500">Timestamp</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(document.timestamp * 1000).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end border-t border-gray-100 px-6 py-4">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
