"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_TOKENS, SUPPORTED_CHAINS, formatTokenBalance } from "@/config/tokens";
import TokenIcon from "../token-registry/TokenIcon";
import TokenActions from "./TokenActions";
import { useWallet } from "../WalletProvider";
import { useAccount } from "wagmi";
import { networkIcons } from "@web3icons/react";

const client = generateClient<Schema>();

const chainIcons: Record<string, React.ComponentType<any>> = {
  base: networkIcons.NetworkBase,
  monad: networkIcons.NetworkMonad,
};

interface TokenBalance {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  chain: string;
  balance: string;
  decimals: number;
  tokenType: string;
  tokenAddress: string;
}

interface TokenBalancesProps {
  workspaceId: string;
}

export default function TokenBalances({ workspaceId }: TokenBalancesProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChain, setActiveChain] = useState<string>("monad");
  const { chain: walletChain, connected } = useWallet();
  const { chainId } = useAccount();

  useEffect(() => {
    loadBalances();
  }, [workspaceId]);

  useEffect(() => {
    console.log("Chain changed - walletChain:", walletChain, "chainId:", chainId, "connected:", connected);
    
    // Map chainId to our chain names
    let detectedChain: string | null = null;
    if (chainId === 8453 || chainId === 84531 || chainId === 84532) {
      detectedChain = "base";
    } else if (chainId === 10143) {
      detectedChain = "monad";
    }
    
    // When wallet connects or chain changes, switch to connected chain
    if (connected && detectedChain) {
      console.log("Setting active chain to:", detectedChain);
      setActiveChain(detectedChain);
    }
  }, [walletChain, connected, chainId]);

  async function loadBalances() {
    try {
      const { data: workspaceTokens } = await client.models.WorkspaceToken.list({
        filter: { workspaceId: { eq: workspaceId } },
      });

      const allTokens = [
        ...DEFAULT_TOKENS.map((t, i) => ({
          ...t,
          id: `default-${i}`,
          tokenType: t.tokenType,
          tokenAddress: t.tokenAddress,
        })),
        ...(workspaceTokens || []).map((t) => ({
          ...t,
          tokenType: t.tokenType || "ERC20",
        })),
      ];

      const balancesWithPlaceholder = allTokens.map((token) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        icon: token.icon || "",
        chain: token.chain,
        balance: "0",
        decimals: token.decimals,
        tokenType: token.tokenType,
        tokenAddress: token.tokenAddress,
      }));

      setBalances(balancesWithPlaceholder);
    } catch (error) {
      console.error("Error loading balances:", error);
      setBalances(
        DEFAULT_TOKENS.map((t, i) => ({
          id: `default-${i}`,
          name: t.name,
          symbol: t.symbol,
          icon: t.icon,
          chain: t.chain,
          balance: "0",
          decimals: t.decimals,
          tokenType: t.tokenType,
          tokenAddress: t.tokenAddress,
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  function getActions(token: TokenBalance) {
    const actions = [];

    actions.push(
      { label: "Send", onClick: () => console.log("Send", token) },
      { label: "Receive", onClick: () => console.log("Receive", token) }
    );

    if (token.tokenType === "WRAPPED_TOKEN") {
      actions.push(
        { label: "Wrap", onClick: () => console.log("Wrap", token) },
        { label: "Unwrap", onClick: () => console.log("Unwrap", token) }
      );
    }

    return actions;
  }

  const filteredBalances = balances.filter((b) => b.chain === activeChain);

  if (loading) {
    return (
      <div className="bg-white border border-hair rounded-xl p-6">
        <p className="text-sub text-sm">Loading balances...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-hair rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-hair flex items-center justify-between">
        <h3 className="text-lg font-semibold text-ink">Token Balances</h3>
        <div className="flex items-center gap-1 bg-paper rounded-lg p-1">
          {SUPPORTED_CHAINS.map((chain) => {
            const ChainIcon = chainIcons[chain.id];
            return (
              <button
                key={chain.id}
                onClick={() => setActiveChain(chain.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeChain === chain.id
                    ? "bg-white text-ink shadow-sm"
                    : "text-sub hover:text-ink"
                }`}
              >
                {ChainIcon && <ChainIcon size={16} variant="branded" />}
                {chain.name}
              </button>
            );
          })}
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-hair">
            <th className="px-6 py-3 text-left text-sm font-medium text-sub">Token</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-sub">Chain</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-sub">Balance</th>
            <th className="px-6 py-3 text-right text-sm font-medium text-sub">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBalances.map((token) => (
            <tr
              key={`${token.id}-${token.chain}`}
              className="border-b border-hair/50 last:border-0 hover:bg-paper/50"
            >
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
              <td className="px-6 py-4 text-right">
                <TokenActions actions={getActions(token)} />
              </td>
            </tr>
          ))}
          {filteredBalances.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-sub text-sm">
                No tokens found for this network.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
