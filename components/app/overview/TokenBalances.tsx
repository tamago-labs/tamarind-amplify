"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_TOKENS, formatTokenBalance } from "@/config/tokens";
import TokenIcon from "../token-registry/TokenIcon";

const client = generateClient<Schema>();

interface TokenBalance {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  chain: string;
  balance: string;
  decimals: number;
}

interface TokenBalancesProps {
  workspaceId: string;
  walletAddress?: string;
}

export default function TokenBalances({ workspaceId, walletAddress }: TokenBalancesProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalances();
  }, [workspaceId, walletAddress]);

  async function loadBalances() {
    try {
      // Get workspace tokens
      const { data: workspaceTokens } = await client.models.WorkspaceToken.list({
        filter: { workspaceId: { eq: workspaceId } },
      });

      // Merge with default tokens
      const allTokens = [
        ...DEFAULT_TOKENS.map((t, i) => ({ ...t, id: `default-${i}` })),
        ...(workspaceTokens || []),
      ];

      // In production, fetch real balances from blockchain via RPC
      // For now, simulate with placeholder data
      const balancesWithPlaceholder = allTokens.map((token) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        icon: token.icon,
        chain: token.chain,
        balance: "0",
        decimals: token.decimals,
      }));

      setBalances(balancesWithPlaceholder);
    } catch (error) {
      console.error("Error loading balances:", error);
      // Fallback to default tokens
      setBalances(
        DEFAULT_TOKENS.map((t, i) => ({
          id: `default-${i}`,
          name: t.name,
          symbol: t.symbol,
          icon: t.icon,
          chain: t.chain,
          balance: "0",
          decimals: t.decimals,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-hair rounded-xl p-6">
        <p className="text-sub text-sm">Loading balances...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-hair rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-hair">
        <h3 className="text-lg font-semibold text-ink">Token Balances</h3>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-hair">
            <th className="px-6 py-3 text-left text-sm font-medium text-sub">Token</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-sub">Chain</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-sub">Balance</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((token) => (
            <tr key={`${token.id}-${token.chain}`} className="border-b border-hair/50 last:border-0 hover:bg-paper/50">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <TokenIcon icon={token.icon} symbol={token.symbol} chain={token.chain} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-ink">{token.symbol}</p>
                    <p className="text-xs text-sub">{token.name}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-ink capitalize">{token.chain}</span>
              </td>
              <td className="px-6 py-4 text-right">
                <span className="text-sm font-medium text-ink">
                  {formatTokenBalance(token.balance, token.decimals)} {token.symbol}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
