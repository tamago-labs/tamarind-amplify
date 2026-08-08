// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../src/ReceivableFactory.sol";
import "../src/ReceivableManager.sol";
import "../src/interfaces/ICleanverseValidator.sol";

contract MockToken {
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
    uint256 constant TARGET = 10_000e18;
    uint256 constant REPAYMENT = 11_000e18;
    address company = address(0xC0FFEE);
    address partnerA = address(0xA11CE);
    address partnerB = address(0xB0B);

    MockToken token;
    MockValidator validator;
    ReceivableFactory factory;
    ReceivableManager manager;

    function setUp() public {
        token = new MockToken();
        validator = new MockValidator();
        factory = new ReceivableFactory(address(token), address(validator), address(this));
        ICleanverseValidator.RuleV2 memory rule = ICleanverseValidator.RuleV2(bytes2(0), bytes2(0), 1, 0, 0);

        vm.prank(company);
        address managerAddress = factory.createReceivable(TARGET, REPAYMENT, block.timestamp + 90 days, rule);
        manager = ReceivableManager(managerAddress);

        assertEq(manager.owner(), company);
        assertEq(factory.managersByCompany(company, 0), managerAddress);

        vm.startPrank(company);
        manager.addPaymentProof(keccak256("proof-1"), keccak256("invoice-payment-proof-1"));
        manager.addPaymentProof(keccak256("proof-2"), keccak256("invoice-payment-proof-2"));
        manager.openFunding();
        vm.stopPrank();

        token.mint(partnerA, 10_000e18);
        token.mint(partnerB, 7_500e18);
        vm.prank(partnerA);
        token.approve(address(manager), type(uint256).max);
        vm.prank(partnerB);
        token.approve(address(manager), type(uint256).max);
    }

    function testFactoryRegistersManagerAndSupportsMultiplePartners() public {
        vm.prank(partnerA);
        uint256 positionA = manager.invest(2_500e18);
        vm.warp(block.timestamp + 10 days);
        vm.prank(partnerB);
        uint256 positionB = manager.invest(7_500e18);

        assertEq(positionA, 0);
        assertEq(positionB, 1);
        assertEq(token.balanceOf(company), TARGET);
        assertEq(manager.proofCount(), 2);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(positionA), partnerA);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(positionB), partnerB);
        assertEq(validator.registrations(), 2);
    }

    function testRepeatedInvestmentsCreateSeparateLots() public {
        vm.prank(partnerA);
        uint256 firstPosition = manager.invest(2_500e18);
        vm.warp(block.timestamp + 10 days);
        vm.prank(partnerA);
        uint256 secondPosition = manager.invest(7_500e18);

        assertEq(firstPosition, 0);
        assertEq(secondPosition, 1);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(firstPosition), partnerA);
        assertEq(IERC721(address(manager.positionNFT())).ownerOf(secondPosition), partnerA);
    }

    function testTimeWeightedProrataRepayment() public {
        uint256 firstInvestmentTime = block.timestamp;
        vm.prank(partnerA);
        uint256 positionA = manager.invest(2_500e18);
        vm.warp(firstInvestmentTime + 10 days);
        uint256 secondInvestmentTime = block.timestamp;
        vm.prank(partnerB);
        uint256 positionB = manager.invest(7_500e18);
        vm.warp(secondInvestmentTime + 10 days);

        token.mint(company, REPAYMENT);
        vm.prank(company);
        token.approve(address(manager), REPAYMENT);
        vm.prank(company);
        manager.repay();

        uint256 totalWeight = (2_500e18 * 20 days) + (7_500e18 * 10 days);
        uint256 expectedA = 2_500e18 + ((1_000e18 * (2_500e18 * 20 days)) / totalWeight);
        uint256 expectedB = 7_500e18 + ((1_000e18 * (7_500e18 * 10 days)) / totalWeight);
        uint256 partnerABefore = token.balanceOf(partnerA);
        uint256 partnerBBefore = token.balanceOf(partnerB);

        vm.prank(partnerA);
        manager.redeem(positionA);
        vm.prank(partnerB);
        manager.redeem(positionB);

        assertEq(token.balanceOf(partnerA) - partnerABefore, expectedA);
        assertEq(token.balanceOf(partnerB) - partnerBBefore, expectedB);
    }

    function testValidatorCanRejectPartner() public {
        validator.setEligible(false);
        vm.prank(partnerA);
        vm.expectRevert("Partner not eligible");
        manager.invest(2_500e18);
    }

    function testCannotReuseProofId() public {
        ICleanverseValidator.RuleV2 memory rule = ICleanverseValidator.RuleV2(bytes2(0), bytes2(0), 1, 0, 0);
        vm.prank(company);
        address secondManager = factory.createReceivable(TARGET, REPAYMENT, block.timestamp + 90 days, rule);
        vm.startPrank(company);
        ReceivableManager(secondManager).addPaymentProof(keccak256("same-proof"), keccak256("proof-one"));
        vm.expectRevert("Proof already used");
        ReceivableManager(secondManager).addPaymentProof(keccak256("same-proof"), keccak256("proof-two"));
        vm.stopPrank();
    }

    function testGetReceivableInfo() public {
        (
            address companyAddr,
            uint256 fundingTarget_,
            uint256 repaymentAmount_,
            uint256 dueAt_,
            uint256 totalFunded_,
            uint256 proofCount_,
            ReceivableManager.Status status_
        ) = manager.getReceivableInfo();

        assertEq(companyAddr, company);
        assertEq(fundingTarget_, TARGET);
        assertEq(repaymentAmount_, REPAYMENT);
        assertEq(totalFunded_, 0);
        assertEq(proofCount_, 2);
        assertEq(uint8(status_), uint8(ReceivableManager.Status.Funding));
    }

    function testGetPaymentProofs() public {
        (bytes32[] memory proofIds, bytes32[] memory merkleRoots) = manager.getPaymentProofs();
        assertEq(proofIds.length, 2);
        assertEq(merkleRoots.length, 2);
    }

    function testGetInvestmentInfo() public {
        vm.prank(partnerA);
        uint256 positionId = manager.invest(2_500e18);

        (uint256 principal, uint256 fundedAt, bool redeemed, address investor) = manager.getInvestmentInfo(positionId);
        assertEq(principal, 2_500e18);
        assertEq(fundedAt, block.timestamp);
        assertFalse(redeemed);
        assertEq(investor, partnerA);
    }

    function testDefaultScenario() public {
        vm.prank(partnerA);
        manager.invest(2_500e18);
        vm.warp(block.timestamp + 10 days);
        vm.prank(partnerB);
        manager.invest(7_500e18);

        vm.prank(company);
        manager.markDefaulted();

        (, , , , , , ReceivableManager.Status status_) = manager.getReceivableInfo();
        assertEq(uint8(status_), uint8(ReceivableManager.Status.Defaulted));
    }

    function testCloseAfterRepay() public {
        vm.prank(partnerA);
        manager.invest(10_000e18);
        vm.warp(block.timestamp + 30 days);

        token.mint(company, REPAYMENT);
        vm.prank(company);
        token.approve(address(manager), REPAYMENT);
        vm.prank(company);
        manager.repay();

        vm.prank(company);
        manager.close();

        (, , , , , , ReceivableManager.Status status_) = manager.getReceivableInfo();
        assertEq(uint8(status_), uint8(ReceivableManager.Status.Closed));
    }

    function testProofCountIncrements() public {
        ICleanverseValidator.RuleV2 memory rule = ICleanverseValidator.RuleV2(bytes2(0), bytes2(0), 1, 0, 0);
        vm.prank(company);
        address managerAddr = factory.createReceivable(TARGET, REPAYMENT, block.timestamp + 90 days, rule);
        ReceivableManager newManager = ReceivableManager(managerAddr);

        assertEq(newManager.proofCount(), 0);

        vm.startPrank(company);
        newManager.addPaymentProof(keccak256("proof-a"), keccak256("root-a"));
        assertEq(newManager.proofCount(), 1);

        newManager.addPaymentProof(keccak256("proof-b"), keccak256("root-b"));
        assertEq(newManager.proofCount(), 2);
        vm.stopPrank();
    }

    function testSetValidator() public {
        MockValidator newValidator = new MockValidator();
        address newValidatorAddr = address(newValidator);

        factory.setValidator(newValidatorAddr);

        assertEq(address(factory.validator()), newValidatorAddr);
    }

    function testSetValidatorRevertsForNonOwner() public {
        MockValidator newValidator = new MockValidator();

        vm.prank(partnerA);
        vm.expectRevert();
        factory.setValidator(address(newValidator));
    }

    function testDeployWithZeroValidator() public {
        ICleanverseValidator.RuleV2 memory rule = ICleanverseValidator.RuleV2(bytes2(0), bytes2(0), 1, 0, 0);

        ReceivableFactory noValidatorFactory = new ReceivableFactory(address(token), address(0), address(this));
        assertEq(address(noValidatorFactory.validator()), address(0));

        vm.expectRevert("Validator not set");
        noValidatorFactory.createReceivable(TARGET, REPAYMENT, block.timestamp + 90 days, rule);

        MockValidator newValidator = new MockValidator();
        noValidatorFactory.setValidator(address(newValidator));

        vm.prank(company);
        noValidatorFactory.createReceivable(TARGET, REPAYMENT, block.timestamp + 90 days, rule);
        assertEq(noValidatorFactory.getReceivableCount(), 1);
    }
}
