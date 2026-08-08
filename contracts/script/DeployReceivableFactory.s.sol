// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ReceivableFactory} from "../src/ReceivableFactory.sol";

contract DeployReceivableFactory is Script {
    function run() external returns (ReceivableFactory factory) {
        uint256 deployerPrivateKey = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address deployer = vm.addr(deployerPrivateKey);
        address token = vm.envAddress("TOKEN_ADDRESS");          // aJPYC on Base Sepolia
        address validator = vm.envAddress("CVI_VALIDATOR_ADDRESS"); // Cleanverse CVI Compliance Validator

        require(token != address(0), "TOKEN_ADDRESS is zero");
        require(validator != address(0), "CVI_VALIDATOR_ADDRESS is zero");

        vm.startBroadcast(deployerPrivateKey);
        factory = new ReceivableFactory(token, validator, deployer);
        vm.stopBroadcast();

        console.log("ReceivableFactory:", address(factory));
        console.log("Token (aJPYC):", token);
        console.log("CVI Validator:", validator);
        console.log("Factory owner:", factory.owner());
        console.log("Chain ID:", block.chainid);
    }
}
