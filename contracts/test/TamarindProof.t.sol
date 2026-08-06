// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/TamarindProof.sol";

contract TamarindProofTest is Test {
    TamarindProof public proof;
    bytes32 public rootOne = keccak256("invoice-one");
    bytes32 public rootTwo = keccak256("invoice-two");
    bytes32 public settlementOne = keccak256("settlement-one");
    bytes32 public settlementTwo = keccak256("settlement-two");

    function setUp() public {
        proof = new TamarindProof();
    }

    function test_anchorOneProofPerSettlement() public {
        proof.anchorRoot(rootOne, settlementOne);
        proof.anchorRoot(rootTwo, settlementTwo);

        assertTrue(proof.isAnchored(rootOne));
        assertTrue(proof.isAnchored(rootTwo));
        assertEq(proof.getRootBySettlement(settlementOne), rootOne);
        assertEq(proof.getRootBySettlement(settlementTwo), rootTwo);
    }

    function test_documentStoresSubmitterAndTimestamp() public {
        uint256 timestamp = proof.anchorRoot(rootOne, settlementOne);
        TamarindProof.DocumentRecord memory record = proof.getDocument(rootOne);

        assertEq(record.merkleRoot, rootOne);
        assertEq(record.settlementId, settlementOne);
        assertEq(record.submitter, address(this));
        assertEq(record.timestamp, timestamp);
    }

    function test_revertOnDuplicateRoot() public {
        proof.anchorRoot(rootOne, settlementOne);
        vm.expectRevert("Root already anchored");
        proof.anchorRoot(rootOne, settlementTwo);
    }

    function test_revertOnDuplicateSettlement() public {
        proof.anchorRoot(rootOne, settlementOne);
        vm.expectRevert("Settlement already used");
        proof.anchorRoot(rootTwo, settlementOne);
    }

    function test_revertOnZeroValues() public {
        vm.expectRevert("Zero merkle root");
        proof.anchorRoot(bytes32(0), settlementOne);

        vm.expectRevert("Zero settlement ID");
        proof.anchorRoot(rootOne, bytes32(0));
    }
}
