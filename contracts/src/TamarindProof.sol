// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TamarindProof
/// @notice Anchors Merkle roots for payment and invoice evidence.
/// @dev Stores hashes and references only. Documents remain off-chain.
///
/// The settlement ID is the hashed reference to an internal Amplify settlement
/// record. The raw Amplify UUID must never be written on-chain. Tamarind should
/// derive it off-chain using:
///
///     bytes32 settlementId = keccak256(
///         abi.encodePacked("TAMARIND_SETTLEMENT:", amplifySettlementId)
///     );
///
/// The same namespaced hash can be reproduced later to resolve the proof back
/// to the private settlement record without exposing the UUID on-chain.
contract TamarindProof {
    event RootAnchored(bytes32 indexed merkleRoot, bytes32 indexed settlementId, address indexed submitter, uint256 timestamp);

    struct DocumentRecord {
        bytes32 merkleRoot;
        bytes32 settlementId;
        address submitter;
        uint256 timestamp;
    }

    // Merkle root -> anchored settlement proof.
    mapping(bytes32 => DocumentRecord) public documents;
    // One settlement maps to exactly one Merkle root.
    mapping(bytes32 => bytes32) public settlementToRoot;

    /// @notice Anchor one settlement's Merkle root.
    /// @dev A root and settlement can each be used only once.
    function anchorRoot(bytes32 merkleRoot, bytes32 settlementId) external returns (uint256 timestamp) {
        require(merkleRoot != bytes32(0), "Zero merkle root");
        require(settlementId != bytes32(0), "Zero settlement ID");
        require(documents[merkleRoot].timestamp == 0, "Root already anchored");
        require(settlementToRoot[settlementId] == bytes32(0), "Settlement already used");

        timestamp = block.timestamp;
        documents[merkleRoot] = DocumentRecord(merkleRoot, settlementId, msg.sender, timestamp);
        settlementToRoot[settlementId] = merkleRoot;
        emit RootAnchored(merkleRoot, settlementId, msg.sender, timestamp);
    }

    function isAnchored(bytes32 merkleRoot) external view returns (bool) {
        return documents[merkleRoot].timestamp != 0;
    }

    function getDocument(bytes32 merkleRoot) external view returns (DocumentRecord memory) {
        require(documents[merkleRoot].timestamp != 0, "Document not found");
        return documents[merkleRoot];
    }

    function getRootBySettlement(bytes32 settlementId) external view returns (bytes32) {
        bytes32 root = settlementToRoot[settlementId];
        require(root != bytes32(0), "No document for this settlement");
        return root;
    }

    function hasSettlement(bytes32 settlementId) external view returns (bool) {
        return settlementToRoot[settlementId] != bytes32(0);
    }
}
