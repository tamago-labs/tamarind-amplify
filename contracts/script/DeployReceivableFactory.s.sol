// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ReceivableFactory} from "../src/ReceivableFactory.sol";

contract DeployReceivableFactory is Script {
    function run() external returns (ReceivableFactory factory) {
        uint256 deployerPrivateKey = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address deployer = vm.addr(deployerPrivateKey);
        address token = vm.envAddress("TOKEN_ADDRESS"); // aJPYC on Base Sepolia

        require(token != address(0), "TOKEN_ADDRESS is zero");

        // Validator is optional — can be set later via setValidator()
        address validator;
        try vm.envAddress("CVI_VALIDATOR_ADDRESS") returns (address v) {
            validator = v;
        } catch {
            validator = address(0);
        }

        vm.startBroadcast(deployerPrivateKey);
        factory = new ReceivableFactory(token, validator, deployer);
        vm.stopBroadcast();

        console.log("ReceivableFactory:", address(factory));
        console.log("Token (aJPYC):", token);
        console.log("CVI Validator:", validator == address(0) ? "not set (use setValidator later)" : vm.toString(validator));
        console.log("Factory owner:", factory.owner());
        console.log("Chain ID:", block.chainid);
    }
}
