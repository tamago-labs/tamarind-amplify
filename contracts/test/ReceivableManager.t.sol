// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../src/ReceivableFactory.sol";
import "../src/ReceivableManager.sol";
import "../src/interfaces/ICleanverseValidator.sol";

contract MockAUSDC {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "allowance");
        require(balanceOf[from] >= amount, "balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract MockValidator is ICleanverseValidator {
    bool public eligible = true;
    uint256 public registrations;

    function setEligible(bool value) external {
        eligible = value;
    }

    function registerV2(address, RuleV2 calldata) external {
        registrations++;
    }

    function registerApass(address, address) external {
        registrations++;
    }

    function registerApass(address, address, address) external {
        registrations++;
    }

    function complianceVerify(address, address) external view returns (bool) {
        return eligible;
    }
}

contract ReceivableManagerTest is Test {
    uint256 constant TARGET = 10_000e6;
    uint256 constant REPAYMENT = 11_000e6;
    address company = address(0xC0FFEE);
    address partnerA = address(0xA11CE);
    address partnerB = address(0xB0B);

    MockAUSDC ausdc;
    MockValidator validator;
    ReceivableFactory factory;
    ReceivableManager manager;

    function setUp() public {
        ausdc = new MockAUSDC();
        validator = new MockValidator();
        factory = new ReceivableFactory(address(ausdc), address(validator), address(this));
        ICleanverseValidator.RuleV2 memory rule = ICleanverseValidator.RuleV2(bytes2(0), bytes2(0), 1, 0, 0);

        vm.prank(company);
        address managerAddress = factory.createReceivable(TARGET, REPAYMENT, block.timestamp + 90 days, rule);
        manager = ReceivableManager(managerAddress);

        assertEq(manager.owner(), company);
        assertEq(factory.managersByCompany(company, 0), managerAddress);

        vm.startPrank(company);
        manager.addSettlementProof(keccak256("settlement-1"), keccak256("invoice-payment-proof-1"));
        manager.addSettlementProof(keccak256("settlement-2"), keccak256("invoice-payment-proof-2"));
        manager.openFunding();
        vm.stopPrank();

        ausdc.mint(partnerA, 10_000e6);
        ausdc.mint(partnerB, 7_500e6);
        vm.prank(partnerA);
        ausdc.approve(address(manager), type(uint256).max);
        vm.prank(partnerB);
        ausdc.approve(address(manager), type(uint256).max);
    }

    function testFactoryRegistersManagerAndSupportsMultiplePartners() public {
        vm.prank(partnerA);
        uint256 positionA = manager.invest(2_500e6);
        vm.warp(block.timestamp + 10 days);
        vm.prank(partnerB);
        uint256 positionB = manager.invest(7_500e6);

        assertEq(positionA, 0);
        assertEq(positionB, 1);
        assertEq(ausdc.balanceOf(company), TARGET);
        assertEq(manager.proofCount(), 2);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(positionA), partnerA);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(positionB), partnerB);
        assertEq(validator.registrations(), 2);
    }

    function testRepeatedInvestmentsCreateSeparateLots() public {
        vm.prank(partnerA);
        uint256 firstPosition = manager.invest(2_500e6);
        vm.warp(block.timestamp + 10 days);
        vm.prank(partnerA);
        uint256 secondPosition = manager.invest(7_500e6);

        assertEq(firstPosition, 0);
        assertEq(secondPosition, 1);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(firstPosition), partnerA);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(secondPosition), partnerA);
    }

    function testTimeWeightedProrataRepayment() public {
        uint256 firstInvestmentTime = block.timestamp;
        vm.prank(partnerA);
        uint256 positionA = manager.invest(2_500e6);
        vm.warp(firstInvestmentTime + 10 days);
        uint256 secondInvestmentTime = block.timestamp;
        vm.prank(partnerB);
        uint256 positionB = manager.invest(7_500e6);
        vm.warp(secondInvestmentTime + 10 days);

        ausdc.mint(company, REPAYMENT);
        vm.prank(company);
        ausdc.approve(address(manager), REPAYMENT);
        vm.prank(company);
        manager.repay();

        uint256 totalWeight = (2_500e6 * 20 days) + (7_500e6 * 10 days);
        uint256 expectedA = 2_500e6 + ((1_000e6 * (2_500e6 * 20 days)) / totalWeight);
        uint256 expectedB = 7_500e6 + ((1_000e6 * (7_500e6 * 10 days)) / totalWeight);
        uint256 partnerABefore = ausdc.balanceOf(partnerA);
        uint256 partnerBBefore = ausdc.balanceOf(partnerB);

        vm.prank(partnerA);
        manager.redeem(positionA);
        vm.prank(partnerB);
        manager.redeem(positionB);

        assertEq(ausdc.balanceOf(partnerA) - partnerABefore, expectedA);
        assertEq(ausdc.balanceOf(partnerB) - partnerBBefore, expectedB);
    }

    function testValidatorCanRejectPartner() public {
        validator.setEligible(false);
        vm.prank(partnerA);
        vm.expectRevert("Partner not eligible");
        manager.invest(2_500e6);
    }

    function testCannotReuseSettlementId() public {
        ICleanverseValidator.RuleV2 memory rule = ICleanverseValidator.RuleV2(bytes2(0), bytes2(0), 1, 0, 0);
        vm.prank(company);
        address secondManager = factory.createReceivable(TARGET, REPAYMENT, block.timestamp + 90 days, rule);
        vm.startPrank(company);
        ReceivableManager(secondManager).addSettlementProof(keccak256("same-settlement"), keccak256("proof-one"));
        vm.expectRevert("Settlement already used");
        ReceivableManager(secondManager).addSettlementProof(keccak256("same-settlement"), keccak256("proof-two"));
        vm.stopPrank();
    }
}
