export const TAMARIND_PROOF_ABI = [
  {
    type: "function",
    name: "anchorRoot",
    inputs: [
      { name: "merkleRoot", type: "bytes32" },
      { name: "settlementId", type: "bytes32" },
    ],
    outputs: [{ name: "timestamp", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isAnchored",
    inputs: [{ name: "merkleRoot", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getDocument",
    inputs: [{ name: "merkleRoot", type: "bytes32" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "merkleRoot", type: "bytes32" },
          { name: "settlementId", type: "bytes32" },
          { name: "submitter", type: "address" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRootBySettlement",
    inputs: [{ name: "settlementId", type: "bytes32" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "hasSettlement",
    inputs: [{ name: "settlementId", type: "bytes32" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "RootAnchored",
    inputs: [
      { name: "merkleRoot", type: "bytes32", indexed: true },
      { name: "settlementId", type: "bytes32", indexed: true },
      { name: "submitter", type: "address", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const TAMARIND_PROOF_ADDRESSES: Record<number, `0x${string}`> = {
  84532: "0x8B9394A3046daE653a66Eb342C93D0812C6bD8a7", // Base Sepolia
  10143: "0x5646647B48b5458D8352764F1b697195454D52Bf", // Monad Testnet
};
