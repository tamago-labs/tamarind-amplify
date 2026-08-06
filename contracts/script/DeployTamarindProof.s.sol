// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TamarindProof} from "../src/TamarindProof.sol";

contract DeployTamarindProof is Script {
    function run() external returns (TamarindProof proof) {
        uint256 deployerPrivateKey = vm.parseUint(vm.envString("PRIVATE_KEY"));
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);
        proof = new TamarindProof();
        vm.stopBroadcast();

        console.log("TamarindProof:", address(proof));
        console.log("Deployer:", deployer);
        console.log("Chain ID:", block.chainid);
    }
}
