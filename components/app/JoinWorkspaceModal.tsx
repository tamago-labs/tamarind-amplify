"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface JoinWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inviteCode: string) => void;
}

export default function JoinWorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
}: JoinWorkspaceModalProps) {
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      onSubmit(inviteCode.trim());
      setInviteCode("");
      onClose();
    }
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
            className="bg-panel border border-hair rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-hair">
              <h2 className="text-lg font-semibold text-ink">Join Workspace</h2>
              <button
                onClick={onClose}
                className="text-sub hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  Invite Code *
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter the invite code from your company"
                  className="w-full px-4 py-2.5 bg-paper border border-hair rounded-lg text-sm text-ink placeholder:text-sub/50 focus:outline-none focus:border-indigo font-mono"
                  required
                />
                <p className="mt-2 text-xs text-sub">
                  Ask your workspace admin for the invite code.
                </p>
              </div>

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
                  Join
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
