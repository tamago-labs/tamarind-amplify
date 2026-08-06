// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ReceivableFactory} from "../src/ReceivableFactory.sol";

contract DeployReceivableFactory is Script {
    function run() external returns (ReceivableFactory factory) {
        uint256 deployerPrivateKey = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address deployer = vm.addr(deployerPrivateKey);
        address ausdc = vm.envAddress("AUSDC_ADDRESS");
        address validator = vm.envAddress("CLEANVERSE_VALIDATOR_ADDRESS");

        require(ausdc != address(0), "AUSDC_ADDRESS is zero");
        require(validator != address(0), "CLEANVERSE_VALIDATOR_ADDRESS is zero");

        vm.startBroadcast(deployerPrivateKey);
        factory = new ReceivableFactory(ausdc, validator, deployer);
        vm.stopBroadcast();

        console.log("ReceivableFactory:", address(factory));
        console.log("aUSDC:", ausdc);
        console.log("Validator:", validator);
        console.log("Factory owner:", factory.owner());
        console.log("Chain ID:", block.chainid);
    }
}
