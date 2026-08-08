import { createPublicClient as viemCreatePublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

export const RECEIVABLE_FACTORY_ABI = [
  {
    type: "function",
    name: "createReceivable",
    inputs: [
      { name: "fundingTarget", type: "uint256" },
      { name: "repaymentAmount", type: "uint256" },
      { name: "dueAt", type: "uint256" },
      {
        name: "rule",
        type: "tuple",
        components: [
          { name: "allowedGroup", type: "bytes2" },
          { name: "allowedSubGroup", type: "bytes2" },
          { name: "minTier", type: "uint8" },
          { name: "minSubTier", type: "uint8" },
          { name: "poolCountryBitmap", type: "uint256" },
        ],
      },
    ],
    outputs: [{ name: "manager", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getReceivableInfo",
    inputs: [{ name: "managerAddress", type: "address" }],
    outputs: [
      { name: "company", type: "address" },
      { name: "fundingTarget", type: "uint256" },
      { name: "repaymentAmount", type: "uint256" },
      { name: "dueAt", type: "uint256" },
      { name: "totalFunded", type: "uint256" },
      { name: "proofCount", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getManagersByCompany",
    inputs: [{ name: "company", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
] as const;

export const RECEIVABLE_MANAGER_ABI = [
  {
    type: "function",
    name: "addPaymentProof",
    inputs: [
      { name: "proofId", type: "bytes32" },
      { name: "merkleRoot", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "openFunding",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "invest",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ name: "positionId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "repay",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "redeem",
    inputs: [{ name: "positionId", type: "uint256" }],
    outputs: [{ name: "payout", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getReceivableInfo",
    inputs: [],
    outputs: [
      { name: "company", type: "address" },
      { name: "fundingTarget", type: "uint256" },
      { name: "repaymentAmount", type: "uint256" },
      { name: "dueAt", type: "uint256" },
      { name: "totalFunded", type: "uint256" },
      { name: "proofCount", type: "uint256" },
      { name: "status", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPaymentProofs",
    inputs: [],
    outputs: [
      { name: "proofIds", type: "bytes32[]" },
      { name: "merkleRoots", type: "bytes32[]" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getInvestmentInfo",
    inputs: [{ name: "positionId", type: "uint256" }],
    outputs: [
      { name: "principal", type: "uint256" },
      { name: "fundedAt", type: "uint256" },
      { name: "redeemed", type: "bool" },
      { name: "investor", type: "address" },
    ],
    stateMutability: "view",
  },
] as const;

export const RECEIVABLE_STATUS = {
  0: "created",
  1: "funding",
  2: "funded",
  3: "repaid",
  4: "defaulted",
  5: "closed",
} as const;

export const RECEIVABLE_FACTORY_ADDRESSES: Record<number, `0x${string}`> = {
  84532: "0xa141838e38dc7BbF262Fdcefae899A4dDB753C08",
};

export function createPublicClient(chainId: number) {
  const chain = chainId === 84532 ? baseSepolia : baseSepolia;
  const rpcUrl = process.env[`RPC_URL_${chainId}`] || process.env.RPC_URL;

  return viemCreatePublicClient({
    chain,
    transport: rpcUrl ? http(rpcUrl) : http(),
  });
}
