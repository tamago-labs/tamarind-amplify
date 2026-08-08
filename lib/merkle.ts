import { MerkleTree } from "merkletreejs";
import { keccak256, toBytes } from "viem";

function hashValue(value: string): Buffer {
  const hash = keccak256(toBytes(value));
  return Buffer.from(hash.slice(2), "hex");
}

export function buildMerkleTree(values: string[]): MerkleTree {
  const leaves = values.map((v) => hashValue(v));
  return new MerkleTree(leaves, hashValue, { sortPairs: true });
}

export function getMerkleRoot(tree: MerkleTree): `0x${string}` {
  const root = tree.getHexRoot();
  return root as `0x${string}`;
}

export function getMerkleProof(tree: MerkleTree, value: string): string[] {
  const leaf = hashValue(value);
  return tree.getHexProof(leaf);
}

export function verifyMerkleProof(tree: MerkleTree, value: string, proof: string[]): boolean {
  const leaf = hashValue(value);
  return tree.verify(proof, leaf, tree.getHexRoot());
}
