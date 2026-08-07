"use client";

import { Trash2 } from "lucide-react";
import TokenIcon from "./TokenIcon";
import { getTokenTypeLabel } from "@/config/tokens";

interface Token {
  id: string;
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  chain: string;
  tokenType: string;
  isDefault: boolean;
}

interface TokenTableProps {
  tokens: Token[];
  onDelete?: (tokenId: string) => void;
  canDelete?: boolean;
}

export default function TokenTable({ tokens, onDelete, canDelete = false }: TokenTableProps) {
  return (
    <div className="bg-white border border-hair rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-hair">
            <th className="px-6 py-4 text-left text-sm font-medium text-sub">Token</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-sub">Type</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-sub">Chain</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-sub">Address</th>
            {canDelete && <th className="px-6 py-4 text-right text-sm font-medium text-sub">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => (
            <tr key={`${token.id}-${token.chain}`} className="border-b border-hair/50 last:border-0">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <TokenIcon icon={token.icon} symbol={token.symbol} chain={token.chain} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-ink">{token.name}</p>
                    <p className="text-xs text-sub">{token.symbol}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-block text-xs font-medium text-sub bg-paper rounded-full px-2.5 py-1">
                  {getTokenTypeLabel(token.tokenType)}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-ink capitalize">{token.chain}</span>
              </td>
              <td className="px-6 py-4">
                <span className="text-xs text-sub font-mono">
                  {token.tokenAddress.slice(0, 6)}...{token.tokenAddress.slice(-4)}
                </span>
              </td>
              {canDelete && (
                <td className="px-6 py-4 text-right">
                  {!token.isDefault && onDelete && (
                    <button
                      onClick={() => onDelete(token.id)}
                      className="text-sub hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
