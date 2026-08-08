"use client";

import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { DEFAULT_TOKENS, SUPPORTED_CHAINS, formatTokenBalance, calculateTokenValue, getTokenTypeLabel } from "@/config/tokens";
import TokenIcon from "../token-registry/TokenIcon";
import TokenActions from "./TokenActions";
import FaucetModal from "./FaucetModal";
import JPYCFaucetModal from "./JPYCFaucetModal";
import WrapModal from "./WrapModal";
import UnwrapModal from "./UnwrapModal";
import { useWallet } from "../WalletProvider";
import { useAccount, useReadContracts } from "wagmi";
import { networkIcons } from "@web3icons/react";
import { erc20Abi, formatUnits } from "viem";
import { monadTestnet } from "@/lib/wagmi";
import { baseSepolia } from "viem/chains";
import { Droplets } from "lucide-react";

const client = generateClient<Schema>();

const chainIcons: Record<string, React.ComponentType<any>> = {
  base: networkIcons.NetworkBase,
  monad: networkIcons.NetworkMonad,
};

const chainIdMap: Record<string, number> = {
  base: baseSepolia.id,
  monad: monadTestnet.id,
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
  value: string;
  originalTokenAddress?: string;
  originalTokenName?: string;
  originalTokenSymbol?: string;
  originalTokenIcon?: string;
  isWhitelisted?: boolean;
  eligibility?: {
    minTier: number;
    countries: string[];
  };
}

interface TokenBalancesProps {
  workspaceId: string;
}

function BalanceFetcher({
  tokens,
  onBalancesFetched,
}: {
  tokens: TokenBalance[];
  onBalancesFetched: (balances: Record<string, string>) => void;
}) {
  const { address } = useWallet();
  const { chainId } = useAccount();

  const contracts = tokens
    .filter((t) => t.chain === (chainId === 8453 || chainId === 84531 || chainId === 84532 ? "base" : "monad"))
    .map((token) => ({
      address: token.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [address as `0x${string}`],
      chainId: chainIdMap[token.chain] || monadTestnet.id,
    }));

  const { data } = useReadContracts({
    contracts,
    query: { 
      enabled: !!address && contracts.length > 0,
      refetchInterval: 60000, // Refetch every 60 seconds to avoid rate limits
    },
  });

  useEffect(() => {
    if (data) {
      const balanceMap: Record<string, string> = {};
      const filteredTokens = tokens.filter(
        (t) => t.chain === (chainId === 8453 || chainId === 84531 || chainId === 84532 ? "base" : "monad")
      );
      data.forEach((result, index) => {
        if (result.status === "success" && filteredTokens[index]) {
          const token = filteredTokens[index];
          const rawBalance = result.result as bigint;
          balanceMap[`${token.tokenAddress}-${token.chain}`] = formatUnits(rawBalance, token.decimals);
        }
      });
      onBalancesFetched(balanceMap);
    }
  }, [data]);

  return null;
}

export default function TokenBalances({ workspaceId }: TokenBalancesProps) {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChain, setActiveChain] = useState<string>("monad");
  const [faucetToken, setFaucetToken] = useState<TokenBalance | null>(null);
  const [showFaucetModal, setShowFaucetModal] = useState(false);
  const [wrapToken, setWrapToken] = useState<TokenBalance | null>(null);
  const [showWrapModal, setShowWrapModal] = useState(false);
  const [unwrapToken, setUnwrapToken] = useState<TokenBalance | null>(null);
  const [showUnwrapModal, setShowUnwrapModal] = useState(false);
  const [jpycToken, setJpycToken] = useState<TokenBalance | null>(null);
  const [showJpycFaucetModal, setShowJpycFaucetModal] = useState(false);
  const { chain: walletChain, connected, address } = useWallet();
  const { chainId } = useAccount();

  useEffect(() => {
    loadTokens();
  }, [workspaceId]);

  useEffect(() => {
    let detectedChain: string | null = null;
    if (chainId === 8453 || chainId === 84531 || chainId === 84532) {
      detectedChain = "base";
    } else if (chainId === 10143) {
      detectedChain = "monad";
    }
    if (connected && detectedChain) {
      setActiveChain(detectedChain);
    }
  }, [walletChain, connected, chainId]);

  async function loadTokens() {
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

      const tokensWithBalance = allTokens.map((token) => ({
        id: token.id,
        name: token.name,
        symbol: token.symbol,
        icon: token.icon || "",
        chain: token.chain,
        balance: "0",
        decimals: token.decimals,
        tokenType: token.tokenType,
        tokenAddress: token.tokenAddress,
        value: "$0.00",
        originalTokenAddress: token.originalTokenAddress || undefined,
        originalTokenName: token.originalTokenName || undefined,
        originalTokenSymbol: token.originalTokenSymbol || undefined,
        originalTokenIcon: token.originalTokenIcon || undefined,
      }));

      setBalances(tokensWithBalance);

      // Fetch whitelist and eligibility data for each token
      await fetchTokenMetadata(tokensWithBalance);
    } catch (error) {
      console.error("Error loading tokens:", error);
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
          value: "$0.00",
        }))
      );
    } finally {
      setLoading(false);
    }
  }

  const handleBalancesFetched = useCallback((balanceMap: Record<string, string>) => {
    setBalances((prev) =>
      prev.map((token) => {
        const key = `${token.tokenAddress}-${token.chain}`;
        const balance = balanceMap[key];
        if (balance !== undefined) {
          return {
            ...token,
            balance,
            value: calculateTokenValue(balance, token.symbol),
          };
        }
        return token;
      })
    );
  }, []);

  async function fetchTokenMetadata(tokens: TokenBalance[]) {
    // Fetch whitelist entries for this workspace
    const { data: whitelistEntries } = await client.models.WhitelistEntry.list({
      filter: {
        workspaceId: { eq: workspaceId },
        status: { eq: "active" },
      },
    });

    // Fetch eligibility rules for each wrapped token
    const wrappedTokens = tokens.filter((t) => t.tokenType === "WRAPPED_TOKEN");
    const eligibilityMap: Record<string, { minTier: number; countries: string[] }> = {};

    for (const token of wrappedTokens) {
      try {
        const { data: rulesData } = await client.queries.queryTokenRules({
          chain: token.chain,
          tokenAddress: token.tokenAddress,
        });

        if (rulesData?.success && rulesData?.rules) {
          const rules = JSON.parse(rulesData.rules);
          if (rules.length > 0) {
            eligibilityMap[token.tokenAddress] = {
              minTier: rules[0].min_tier || 0,
              countries: rules[0].countries || [],
            };
          }
        }
      } catch (err) {
        console.error("Error fetching rules for", token.symbol, err);
      }
    }

    // Update balances with whitelist and eligibility status
    setBalances((prev) =>
      prev.map((token) => {
        const isWhitelisted = (whitelistEntries || []).some(
          (entry) =>
            entry.walletAddress?.toLowerCase() === address?.toLowerCase() &&
            entry.chain === token.chain &&
            entry.tokenAddress === token.originalTokenAddress
        );

        const eligibility = eligibilityMap[token.tokenAddress];

        return {
          ...token,
          isWhitelisted,
          eligibility,
        };
      })
    );
  }

  function getActions(token: TokenBalance) {
    const actions = [];

    if (token.tokenType === "WRAPPED_TOKEN") {
      actions.push(
        { 
          label: "Wrap", 
          onClick: () => {
            setWrapToken(token);
            setShowWrapModal(true);
          } 
        },
        { 
          label: "Unwrap", 
          onClick: () => {
            setUnwrapToken(token);
            setShowUnwrapModal(true);
          } 
        }
      );
    }

    return actions;
  }

  const filteredBalances = balances
    .filter((b) => b.chain === activeChain)
    .sort((a, b) => {
      // Sort by type: A_TOKEN first, then WRAPPED_TOKEN, then ERC20
      const typeOrder: Record<string, number> = { A_TOKEN: 0, WRAPPED_TOKEN: 1, ERC20: 2 };
      return (typeOrder[a.tokenType] ?? 3) - (typeOrder[b.tokenType] ?? 3);
    });

  if (loading) {
    return (
      <div className="bg-white border border-hair rounded-xl p-6">
        <p className="text-sub text-sm">Loading balances...</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-hair rounded-xl overflow-hidden">
      <BalanceFetcher tokens={balances} onBalancesFetched={handleBalancesFetched} />

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
              <th className="px-6 py-3 text-left text-sm font-medium text-sub">Type</th>
              <th className="px-6 py-3 text-center text-sm font-medium text-sub">Eligibility</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-sub">Balance</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-sub">Value</th>
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
                  <span className="inline-block text-xs font-medium text-sub bg-paper rounded-full px-2.5 py-1">
                    {getTokenTypeLabel(token.tokenType)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {token.tokenType === "WRAPPED_TOKEN" ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          token.isWhitelisted ? "bg-okgreen" : "bg-yellow-500"
                        }`}
                        title={
                          token.isWhitelisted
                            ? "Your account is whitelisted for wrap/unwrap operations"
                            : "Your account is not whitelisted for wrap/unwrap operations"
                        }
                      />
                      {token.eligibility ? (
                        <span className="text-xs text-sub">
                          Tier {token.eligibility.minTier}+
                          {token.eligibility.countries.length > 0 && (
                            <span className="ml-1">({token.eligibility.countries.join(", ")})</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-xs text-sub">Whitelisted</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-sub">—</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-ink">
                    {formatTokenBalance(token.balance, token.decimals)} {token.symbol}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-medium text-ink">{token.value}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {token.name === "USDC (Cleanverse)" && (
                      <button
                        onClick={() => {
                          setFaucetToken(token);
                          setShowFaucetModal(true);
                        }}
                        className="flex items-center gap-1 text-sm text-indigo hover:text-indigo/80 transition-colors"
                        title="Get testnet USDC"
                      >
                        <Droplets size={14} />
                        Faucet
                      </button>
                    )}
                    {token.name === "JPY Coin" && (
                      <button
                        onClick={() => {
                          setJpycToken(token);
                          setShowJpycFaucetModal(true);
                        }}
                        className="flex items-center gap-1 text-sm text-indigo hover:text-indigo/80 transition-colors"
                        title="Get testnet JPYC"
                      >
                        <Droplets size={14} />
                        Faucet
                      </button>
                    )}
                    <TokenActions actions={getActions(token)} />
                  </div>
                </td>
              </tr>
            ))}
            {filteredBalances.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sub text-sm">
                  No tokens found for this network.
                </td>
              </tr>
            )}
          </tbody>
        </table>

      <FaucetModal
        isOpen={showFaucetModal}
        onClose={() => {
          setShowFaucetModal(false);
          setFaucetToken(null);
        }}
        token={faucetToken}
      />

      <JPYCFaucetModal
        isOpen={showJpycFaucetModal}
        onClose={() => {
          setShowJpycFaucetModal(false);
          setJpycToken(null);
        }}
        token={jpycToken}
      />

      <WrapModal
        isOpen={showWrapModal}
        onClose={() => {
          setShowWrapModal(false);
          setWrapToken(null);
        }}
        token={wrapToken}
      />

      <UnwrapModal
        isOpen={showUnwrapModal}
        onClose={() => {
          setShowUnwrapModal(false);
          setUnwrapToken(null);
        }}
        token={unwrapToken}
      />
    </div>
  );
}
