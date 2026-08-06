// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title InvestmentPositionNFT
/// @notice Non-transferable receipt for one Financial Partner investment lot.
contract InvestmentPositionNFT is ERC721, Ownable {
    struct Position {
        uint256 principal;
        uint256 fundedAt;
    }

    address public immutable manager;
    uint256 public nextTokenId;
    mapping(uint256 => Position) public positions;

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager");
        _;
    }

    constructor(address manager_) ERC721("Tamarind Investment Position", "TINV") Ownable(msg.sender) {
        require(manager_ != address(0), "Manager is zero");
        manager = manager_;
    }

    function mintPosition(address investor, uint256 principal, uint256 fundedAt)
        external
        onlyManager
        returns (uint256 tokenId)
    {
        tokenId = nextTokenId++;
        positions[tokenId] = Position(principal, fundedAt);
        _safeMint(investor, tokenId);
    }

    function burn(uint256 tokenId) external onlyManager {
        require(_ownerOf(tokenId) != address(0), "Position does not exist");
        delete positions[tokenId];
        _burn(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) revert("Position is non-transferable");
        return from;
    }
}
