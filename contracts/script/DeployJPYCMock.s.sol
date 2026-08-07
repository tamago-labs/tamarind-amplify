// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import {JPYCMock} from "../src/mocks/JPYCMock.sol";

/**
 * @title DeployJPYCMock
 * @notice Deploy JPYC mock ERC20 token for testing wrap/unwrap
 * @dev Usage:
 *   forge script script/DeployJPYCMock.s.sol --rpc-url $RPC_URL --broadcast
 */
contract DeployJPYCMock is Script {

    function run() external {
        string memory privateKeyString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey = _parsePrivateKey(privateKeyString);
        address deployer = vm.addr(deployerPrivateKey);

        console.log("===========================================");
        console.log("Deploy JPYC Mock Token");
        console.log("===========================================");
        console.log("Chain ID:", block.chainid);
        console.log("Deployer:", deployer);
        console.log("Block number:", block.number);

        uint256 balance = deployer.balance;
        console.log("Deployer balance:", balance / 1e18, "native tokens");
        require(balance > 0.01 ether, "Insufficient balance for deployment");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy JPYC Mock Token (18 decimals)
        JPYCMock jpycToken = new JPYCMock();
        console.log("\n[1/1] JPYC Mock deployed at:", address(jpycToken));

        vm.stopBroadcast();

        // Verification
        console.log("\n===========================================");
        console.log("Deployment Results");
        console.log("===========================================");
        console.log("JPYC Mock:", address(jpycToken));

        // Sanity checks
        require(address(jpycToken) != address(0), "JPYC deployment failed");

        console.log("\n[OK] JPYC Mock token deployed successfully!");

        console.log("\n===========================================");
        console.log("Update your .env with:");
        console.log("===========================================");
        console.log("JPYC_ADDRESS=%s", address(jpycToken));
        console.log("===========================================");
    }

    function _parsePrivateKey(string memory privateKeyString) internal pure returns (uint256) {
        if (bytes(privateKeyString)[0] == '0' && bytes(privateKeyString)[1] == 'x') {
            return vm.parseUint(privateKeyString);
        } else {
            return vm.parseUint(string(abi.encodePacked("0x", privateKeyString)));
        }
    }
}
