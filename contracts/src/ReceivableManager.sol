// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {InvestmentPositionNFT} from "./InvestmentPositionNFT.sol";
import {ICleanverseValidator} from "./interfaces/ICleanverseValidator.sol";

/// @title ReceivableManager
/// @notice Manages one Company receivable funded by multiple Financial Partners.
/// @dev Cleanverse Validator rules replace a local Financial Partner allowlist.
contract ReceivableManager is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Status {
        Created,
        Funding,
        Funded,
        Repaid,
        Defaulted,
        Closed
    }

    struct InvestmentLot {
        uint256 principal;
        uint256 fundedAt;
        bool redeemed;
    }

    IERC20 public immutable token;
    ICleanverseValidator public immutable validator;
    InvestmentPositionNFT public immutable positionNFT;
    uint256 public immutable fundingTarget;
    uint256 public immutable repaymentAmount;
    uint256 public immutable dueAt;
    uint256 public totalFunded;
    uint256 public totalInvestmentWeight;
    uint256 public weightedFundedAt;
    uint256 public interestAsOf;
    uint256 public proofCount;
    Status public status;

    mapping(bytes32 => bool) public proofExists;
    mapping(bytes32 => bytes32) public proofToRoot;
    mapping(uint256 => InvestmentLot) public investmentLots;

    event PaymentProofAdded(bytes32 indexed proofId, bytes32 indexed merkleRoot);
    event FundingOpened();
    event Invested(uint256 indexed positionId, address indexed partner, uint256 amount, uint256 fundedAt);
    event Repaid(uint256 amount, uint256 interestAsOf);
    event Redeemed(uint256 indexed positionId, address indexed investor, uint256 payout);
    event StatusUpdated(Status status);

    constructor(
        address tokenAddress,
        address validatorAddress,
        address company,
        uint256 fundingTarget_,
        uint256 repaymentAmount_,
        uint256 dueAt_
    ) Ownable(company) {
        require(tokenAddress != address(0) && validatorAddress != address(0), "Zero dependency");
        require(fundingTarget_ > 0 && repaymentAmount_ >= fundingTarget_, "Invalid terms");
        require(dueAt_ > block.timestamp, "Invalid due date");
        token = IERC20(tokenAddress);
        validator = ICleanverseValidator(validatorAddress);
        positionNFT = new InvestmentPositionNFT(address(this));
        fundingTarget = fundingTarget_;
        repaymentAmount = repaymentAmount_;
        dueAt = dueAt_;
        status = Status.Created;
    }

    function addPaymentProof(bytes32 proofId, bytes32 merkleRoot) external onlyOwner {
        require(status == Status.Created, "Proofs closed");
        require(proofId != bytes32(0) && merkleRoot != bytes32(0), "Zero proof value");
        require(!proofExists[proofId], "Proof already used");
        proofExists[proofId] = true;
        proofToRoot[proofId] = merkleRoot;
        proofCount++;
        emit PaymentProofAdded(proofId, merkleRoot);
    }

    function openFunding() external onlyOwner {
        require(status == Status.Created && proofCount > 0, "Invalid funding state");
        status = Status.Funding;
        emit FundingOpened();
    }

    function invest(uint256 amount) external nonReentrant returns (uint256 positionId) {
        require(status == Status.Funding, "Funding not open");
        require(amount > 0 && totalFunded + amount <= fundingTarget, "Invalid investment");
        require(validator.complianceVerify(address(this), msg.sender), "Partner not eligible");

        uint256 fundedAt = block.timestamp;
        token.safeTransferFrom(msg.sender, owner(), amount);
        positionId = positionNFT.mintPosition(msg.sender, amount, fundedAt);
        investmentLots[positionId] = InvestmentLot(amount, fundedAt, false);
        totalFunded += amount;
        weightedFundedAt += amount * fundedAt;
        emit Invested(positionId, msg.sender, amount, fundedAt);
        if (totalFunded == fundingTarget) status = Status.Funded;
    }

    function repay() external onlyOwner nonReentrant {
        require(status == Status.Funded, "Not fully funded");
        uint256 repaymentTime = block.timestamp < dueAt ? block.timestamp : dueAt;
        totalInvestmentWeight = (totalFunded * repaymentTime) - weightedFundedAt;
        require(totalInvestmentWeight > 0, "Zero investment duration");
        token.safeTransferFrom(msg.sender, address(this), repaymentAmount);
        interestAsOf = repaymentTime;
        status = Status.Repaid;
        emit Repaid(repaymentAmount, repaymentTime);
    }

    function redeem(uint256 positionId) external nonReentrant returns (uint256 payout) {
        InvestmentLot storage lot = investmentLots[positionId];
        require(!lot.redeemed, "Already redeemed");
        require(positionNFT.ownerOf(positionId) == msg.sender, "Not position owner");
        require(status == Status.Repaid, "Not repaid");
        uint256 lotWeight = lot.principal * (interestAsOf - lot.fundedAt);
        uint256 interestPool = repaymentAmount - fundingTarget;
        uint256 interest = (interestPool * lotWeight) / totalInvestmentWeight;
        payout = lot.principal + interest;
        lot.redeemed = true;
        positionNFT.burn(positionId);
        token.safeTransfer(msg.sender, payout);
        emit Redeemed(positionId, msg.sender, payout);
    }

    function markDefaulted() external onlyOwner {
        require(status == Status.Funded, "Not funded");
        status = Status.Defaulted;
        emit StatusUpdated(status);
    }

    function close() external onlyOwner {
        require(status == Status.Repaid, "Not repaid");
        status = Status.Closed;
        emit StatusUpdated(status);
    }

    function getReceivableInfo()
        external
        view
        returns (
            address company,
            uint256 fundingTarget_,
            uint256 repaymentAmount_,
            uint256 dueAt_,
            uint256 totalFunded_,
            uint256 proofCount_,
            Status status_
        )
    {
        return (
            owner(),
            fundingTarget,
            repaymentAmount,
            dueAt,
            totalFunded,
            proofCount,
            status
        );
    }

    function getPaymentProofs() external view returns (bytes32[] memory proofIds, bytes32[] memory merkleRoots) {
        proofIds = new bytes32[](proofCount);
        merkleRoots = new bytes32[](proofCount);
        uint256 index;
        for (uint256 i; i < proofCount; i++) {
            bytes32 proofId = keccak256(abi.encodePacked("proof", i));
            if (proofExists[proofId]) {
                proofIds[index] = proofId;
                merkleRoots[index] = proofToRoot[proofId];
                index++;
            }
        }
    }

    function getInvestmentInfo(uint256 positionId)
        external
        view
        returns (
            uint256 principal,
            uint256 fundedAt,
            bool redeemed,
            address investor
        )
    {
        InvestmentLot storage lot = investmentLots[positionId];
        return (lot.principal, lot.fundedAt, lot.redeemed, positionNFT.ownerOf(positionId));
    }
}
