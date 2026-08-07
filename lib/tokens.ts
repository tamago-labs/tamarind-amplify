// Standard ERC-20 ABI for approve, transfer, and balanceOf
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
] as const;

// Common token addresses
export const TOKEN_ADDRESSES = {
  base: {
    USDC: "0x543b96420d072BF587B63C41C0B0922762E986Ce",
    aUSDC: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
  },
  monad: {
    USDC: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
    aUSDC: "0xaC0893567D43C3E7e6e35a72803df05416C1f20D",
  },
} as const;

// AccessCore contract address (same for both chains)
export const ACCESS_CORE_ADDRESS = "0x26e2a3121301D90513823Ad04d0281d547c94Dbe";

// AccessCore ABI (minimal - wrap/unwrap functions)
export const ACCESS_CORE_ABI = [
  "function deposit(address token, uint256 amount) returns (bool)",
  "function withdraw(address token, uint256 amount) returns (bool)",
  "function wrap(address token, uint256 amount) returns (bool)",
  "function unwrap(address token, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getDepositAddress(address user) view returns (address)",
] as const;

export function getTokenAddress(chain: string, tokenType: "USDC" | "aUSDC"): string {
  const chainKey = chain.toLowerCase() as keyof typeof TOKEN_ADDRESSES;
  return TOKEN_ADDRESSES[chainKey]?.[tokenType] || "";
}

export function getAccessCoreAddress(): string {
  return ACCESS_CORE_ADDRESS;
}
