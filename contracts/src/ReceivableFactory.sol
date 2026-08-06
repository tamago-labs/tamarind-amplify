// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReceivableManager} from "./ReceivableManager.sol";
import {ICleanverseValidator} from "./interfaces/ICleanverseValidator.sol";

/// @title ReceivableFactory
/// @notice Deploys and registers one ReceivableManager per Company receivable.
contract ReceivableFactory is Ownable {
    address public immutable ausdc;
    ICleanverseValidator public immutable validator;
    address[] public managers;
    mapping(address => address[]) public managersByCompany;

    event ReceivableManagerCreated(address indexed manager, address indexed company, uint256 indexed index);

    constructor(address ausdcAddress, address validatorAddress, address owner_) Ownable(owner_) {
        require(ausdcAddress != address(0) && validatorAddress != address(0), "Zero dependency");
        ausdc = ausdcAddress;
        validator = ICleanverseValidator(validatorAddress);
    }

    function createReceivable(
        uint256 fundingTarget,
        uint256 repaymentAmount,
        uint256 dueAt,
        ICleanverseValidator.RuleV2 calldata rule
    ) external returns (address manager) {
        ReceivableManager created = new ReceivableManager(
            ausdc, address(validator), msg.sender, fundingTarget, repaymentAmount, dueAt
        );
        manager = address(created);
        // Factory must hold Cleanverse REGISTER_ROLE before this operation is used.
        validator.registerV2(manager, rule);
        validator.registerApass(manager, ausdc);
        managers.push(manager);
        managersByCompany[msg.sender].push(manager);
        emit ReceivableManagerCreated(manager, msg.sender, managers.length - 1);
    }

    function getManagers() external view returns (address[] memory) {
        return managers;
    }

    function getManagersByCompany(address company) external view returns (address[] memory) {
        return managersByCompany[company];
    }
}
