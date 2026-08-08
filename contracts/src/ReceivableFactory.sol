// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReceivableManager} from "./ReceivableManager.sol";
import {ICleanverseValidator} from "./interfaces/ICleanverseValidator.sol";

/// @title ReceivableFactory
/// @notice Deploys and registers one ReceivableManager per Company receivable.
contract ReceivableFactory is Ownable {
    address public immutable token;
    ICleanverseValidator public validator;
    address[] public managers;
    mapping(address => address[]) public managersByCompany;

    event ReceivableManagerCreated(address indexed manager, address indexed company, uint256 indexed index);
    event ValidatorUpdated(address indexed oldValidator, address indexed newValidator);

    constructor(address tokenAddress, address validatorAddress, address owner_) Ownable(owner_) {
        require(tokenAddress != address(0), "Zero token");
        token = tokenAddress;
        if (validatorAddress != address(0)) {
            validator = ICleanverseValidator(validatorAddress);
        }
    }

    function setValidator(address validatorAddress) external onlyOwner {
        require(validatorAddress != address(0), "Zero validator");
        address old = address(validator);
        validator = ICleanverseValidator(validatorAddress);
        emit ValidatorUpdated(old, validatorAddress);
    }

    function createReceivable(
        uint256 fundingTarget,
        uint256 repaymentAmount,
        uint256 dueAt,
        ICleanverseValidator.RuleV2 calldata rule
    ) external returns (address manager) {
        require(address(validator) != address(0), "Validator not set");
        ReceivableManager created = new ReceivableManager(
            token, address(validator), msg.sender, fundingTarget, repaymentAmount, dueAt
        );
        manager = address(created);
        // Factory must hold Cleanverse REGISTER_ROLE before this operation is used.
        validator.registerV2(manager, rule);
        validator.registerApass(manager, token);
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

    function getReceivableCount() external view returns (uint256) {
        return managers.length;
    }

    function getReceivableInfo(address managerAddress)
        external
        view
        returns (
            address company,
            uint256 fundingTarget,
            uint256 repaymentAmount,
            uint256 dueAt,
            uint256 totalFunded,
            uint256 proofCount,
            ReceivableManager.Status status
        )
    {
        ReceivableManager manager = ReceivableManager(managerAddress);
        return manager.getReceivableInfo();
    }
}
