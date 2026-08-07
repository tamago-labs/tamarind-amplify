export interface TokenConfig {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  chain: string;
  tokenType: "ERC20" | "A_TOKEN" | "WRAPPED_TOKEN";
  originalTokenAddress?: string;
  originalTokenName?: string;
  originalTokenSymbol?: string;
  originalTokenDecimals?: number;
  originalTokenIcon?: string;
  isDefault: boolean;
}

export const SUPPORTED_CHAINS = [
  { id: "base", name: "Base", networkId: 8453 },
  { id: "monad", name: "Monad", networkId: 10143 },
] as const;

export const DEFAULT_TOKENS: TokenConfig[] = [
  // JPYC Mock Tokens
  {
    tokenAddress: "0xc4d91b769f0bd8af2bf7f02862cd233e62c139d4",
    name: "JPY Coin Mock",
    symbol: "JPYC",
    decimals: 6,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/40123.png",
    chain: "base",
    tokenType: "ERC20",
    isDefault: true,
  },
  {
    tokenAddress: "0x9465a4C246D44F32F391Ebda165Acb12886746Ca",
    name: "JPY Coin Mock",
    symbol: "JPYC",
    decimals: 6,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/40123.png",
    chain: "monad",
    tokenType: "ERC20",
    isDefault: true,
  },
  // aJPYC (Wrapped A-Token)
  {
    tokenAddress: "0xE91425E3C244AeE3CD940eca7548CFF010b20828",
    name: "aJPYC",
    symbol: "aJPYC",
    decimals: 6,
    icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/40123.png",
    chain: "base",
    tokenType: "WRAPPED_TOKEN",
    originalTokenAddress: "0xc4d91b769f0bd8af2bf7f02862cd233e62c139d4",
    originalTokenName: "JPYC",
    originalTokenSymbol: "JPYC",
    originalTokenDecimals: 6,
    originalTokenIcon: "https://s2.coinmarketcap.com/static/img/coins/64x64/40123.png",
    isDefault: true,
  },  
  // ERC-20 Tokens
  {
    tokenAddress: "0x543b96420d072BF587B63C41C0B0922762E986Ce",
    name: "USDC (Cleanverse)",
    symbol: "USDC",
    decimals: 6,
    icon: "https://images.cleanverse.com/app/token_icon/USDC.svg",
    chain: "base",
    tokenType: "ERC20",
    isDefault: true,
  },
  {
    tokenAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
    name: "USDC (Cleanverse)",
    symbol: "USDC",
    decimals: 6,
    icon: "https://images.cleanverse.com/app/token_icon/USDC.svg",
    chain: "monad",
    tokenType: "ERC20",
    isDefault: true,
  },
  // A-Tokens (Wrapped)
  {
    tokenAddress: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
    name: "aUSDC (Cleanverse)",
    symbol: "aUSDC",
    decimals: 6,
    icon: "https://images.cleanverse.com/app/token_icon/A_USDC.svg",
    chain: "base",
    tokenType: "WRAPPED_TOKEN",
    originalTokenAddress: "0x543b96420d072BF587B63C41C0B0922762E986Ce",
    originalTokenName: "USDC",
    originalTokenSymbol: "USDC",
    originalTokenDecimals: 6,
    originalTokenIcon: "https://images.cleanverse.com/app/token_icon/USDC.svg",
    isDefault: true,
  },
  {
    tokenAddress: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
    name: "aUSDC (Cleanverse)",
    symbol: "aUSDC",
    decimals: 6,
    icon: "https://images.cleanverse.com/app/token_icon/A_USDC.svg",
    chain: "monad",
    tokenType: "WRAPPED_TOKEN",
    originalTokenAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
    originalTokenName: "USDC",
    originalTokenSymbol: "USDC",
    originalTokenDecimals: 6,
    originalTokenIcon: "https://images.cleanverse.com/app/token_icon/USDC.svg",
    isDefault: true,
  }, 
];

export function getTokenTypeLabel(tokenType: string): string {
  switch (tokenType) {
    case "ERC20":
      return "ERC-20";
    case "A_TOKEN":
      return "A-Token";
    case "WRAPPED_TOKEN":
      return "Wrapped A-Token";
    default:
      return tokenType;
  }
}

export function formatTokenBalance(balance: string, decimals: number): string {
  const num = parseFloat(balance);
  if (num === 0) return "0";
  if (num < 0.000001) return "<0.000001";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals > 6 ? 6 : decimals,
  });
}
