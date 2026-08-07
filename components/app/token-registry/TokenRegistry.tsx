"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_TOKENS, TokenConfig } from "@/config/tokens";
import TokenTable from "./TokenTable";
import AddTokenModal, { AddTokenInput } from "./AddTokenModal";

const client = generateClient<Schema>();

interface TokenRegistryProps {
  workspaceId: string;
  userRole: string;
}

export default function TokenRegistry({ workspaceId, userRole }: TokenRegistryProps) {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDefaultTokens, setShowDefaultTokens] = useState(false);

  const canManage = userRole === "admin" || userRole === "company";

  useEffect(() => {
    loadTokens();
  }, [workspaceId]);

  async function loadTokens() {
    try {
      const { data: workspaceTokens } = await client.models.WorkspaceToken.list({
        filter: { workspaceId: { eq: workspaceId } },
      });

      // Merge default tokens with workspace tokens
      // Default tokens from config get isDefault: true on frontend
      const allTokens = [
        ...DEFAULT_TOKENS.map((t, i) => ({ ...t, id: `default-${i}`, isDefault: true })),
        ...(workspaceTokens || []).map((t) => ({ ...t, isDefault: false })),
      ];

      setTokens(allTokens);
    } catch (error) {
      console.error("Error loading tokens:", error);
      // Fallback to default tokens only
      setTokens(DEFAULT_TOKENS.map((t, i) => ({ ...t, id: `default-${i}`, isDefault: true })));
    } finally {
      setLoading(false);
    }
  }

  async function handleAddToken(tokenInput: AddTokenInput) {
    try {
      const { data: newToken } = await client.models.WorkspaceToken.create({
        workspaceId,
        ...tokenInput,
        addedBy: "current-user",
      });

      if (newToken) {
        setTokens([...tokens, { ...newToken, isDefault: false }]);
      }
    } catch (error) {
      console.error("Error adding token:", error);
    }
  }

  async function handleDeleteToken(tokenId: string) {
    if (!confirm("Are you sure you want to remove this token?")) return;

    try {
      await client.models.WorkspaceToken.delete({ id: tokenId });
      setTokens(tokens.filter((t) => t.id !== tokenId));
    } catch (error) {
      console.error("Error deleting token:", error);
    }
  }

  // Filter tokens based on toggle
  const displayTokens = showDefaultTokens
    ? tokens
    : tokens.filter((t) => !t.isDefault);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sub">Loading tokens...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Token Registry</h1>
          <p className="text-sm text-sub mt-1">
            Manage custom tokens for this workspace.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm text-sub">Show default tokens</span>
            <button
              type="button"
              role="switch"
              aria-checked={showDefaultTokens}
              onClick={() => setShowDefaultTokens(!showDefaultTokens)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showDefaultTokens ? "bg-indigo" : "bg-hair"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showDefaultTokens ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </label>
          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all"
            >
              <Plus size={16} />
              Add Token
            </button>
          )}
        </div>
      </div>

      <TokenTable
        tokens={displayTokens}
        onDelete={canManage ? handleDeleteToken : undefined}
        canDelete={canManage}
      />

      <AddTokenModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddToken}
      />
    </div>
  );
}
