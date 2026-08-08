export const RECEIVABLE_FACTORY_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "tokenAddress", type: "address" },
      { name: "validatorAddress", type: "address" },
      { name: "owner_", type: "address" },
    ],
  },
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
    name: "setValidator",
    inputs: [{ name: "validatorAddress", type: "address" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getManagersByCompany",
    inputs: [{ name: "company", type: "address" }],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReceivableCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
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
    type: "event",
    name: "ReceivableManagerCreated",
    inputs: [
      { name: "manager", type: "address", indexed: true },
      { name: "company", type: "address", indexed: true },
      { name: "index", type: "uint256", indexed: true },
    ],
  },
  {
    type: "event",
    name: "ValidatorUpdated",
    inputs: [
      { name: "oldValidator", type: "address", indexed: true },
      { name: "newValidator", type: "address", indexed: true },
    ],
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
  {
    type: "function",
    name: "proofCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalFunded",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "status",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "positionNFT",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "PaymentProofAdded",
    inputs: [
      { name: "proofId", type: "bytes32", indexed: true },
      { name: "merkleRoot", type: "bytes32", indexed: true },
    ],
  },
  {
    type: "event",
    name: "FundingOpened",
    inputs: [],
  },
  {
    type: "event",
    name: "Invested",
    inputs: [
      { name: "positionId", type: "uint256", indexed: true },
      { name: "partner", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "fundedAt", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Repaid",
    inputs: [
      { name: "amount", type: "uint256", indexed: false },
      { name: "interestAsOf", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Redeemed",
    inputs: [
      { name: "positionId", type: "uint256", indexed: true },
      { name: "investor", type: "address", indexed: true },
      { name: "payout", type: "uint256", indexed: false },
    ],
  },
] as const;

export const INVESTMENT_POSITION_NFT_ABI = [
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "positions",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "principal", type: "uint256" },
          { name: "fundedAt", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

export const RECEIVABLE_FACTORY_ADDRESSES: Record<number, `0x${string}`> = {
  84532: "0xa141838e38dc7BbF262Fdcefae899A4dDB753C08", // Base Sepolia
};

export const RECEIVABLE_STATUS = {
  0: "created",
  1: "funding",
  2: "funded",
  3: "repaid",
  4: "defaulted",
  5: "closed",
} as const;
