// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/core/BasePaymaster.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title GaslessBasePaymaster
 * @notice ERC-4337 Paymaster that sponsors gas fees for UserOperations
 * @dev Implements BasePaymaster with whitelist and spending limits
 * 
 * This paymaster allows sponsors to:
 * - Pay gas fees for users (gasless transactions)
 * - Set spending limits (daily/monthly caps)
 * - Whitelist specific contracts or users
 * - Track sponsorship analytics
 * 
 * Perfect for onboarding users in Africa and emerging markets where
 * gas fees are a barrier to Web3 adoption.
 */
contract GaslessBasePaymaster is BasePaymaster {
    using ECDSA for bytes32;

    // Sponsorship limits
    uint256 public dailySpendingLimit;
    uint256 public monthlySpendingLimit;
    uint256 public perUserLimit;

    // Tracking
    mapping(uint256 => uint256) public dailySpent; // day => amount spent
    mapping(uint256 => uint256) public monthlySpent; // month => amount spent
    mapping(address => uint256) public userSpent; // user => total spent
    
    // Whitelist/Blacklist
    mapping(address => bool) public whitelistedContracts;
    mapping(address => bool) public whitelistedUsers;
    mapping(address => bool) public blacklistedUsers;
    
    bool public useWhitelist;
    bool public paused;

    // Events
    event SponsoredUserOp(
        address indexed sender,
        uint256 actualGasCost,
        uint256 actualGasUsed
    );
    event SpendingLimitUpdated(
        uint256 dailyLimit,
        uint256 monthlyLimit,
        uint256 perUserLimit
    );
    event ContractWhitelisted(address indexed contractAddress, bool status);
    event UserWhitelisted(address indexed user, bool status);
    event UserBlacklisted(address indexed user, bool status);
    event Deposited(address indexed sender, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);

    constructor(
        IEntryPoint _entryPoint,
        address _owner
    ) BasePaymaster(_entryPoint) {
        _transferOwnership(_owner);
        // Default limits (can be updated by owner)
        dailySpendingLimit = 0.1 ether; // 0.1 ETH per day
        monthlySpendingLimit = 1 ether; // 1 ETH per month
        perUserLimit = 0.01 ether; // 0.01 ETH per user
        useWhitelist = false;
        paused = false;
    }

    /**
     * @notice Validate a UserOperation for gas sponsorship
     * @dev Called by EntryPoint to check if paymaster will sponsor this operation
     */
    function _validatePaymasterUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) internal virtual override returns (bytes memory context, uint256 validationData) {
        // Check if paused
        require(!paused, "Paymaster is paused");

        address sender = userOp.sender;

        // Check blacklist
        require(!blacklistedUsers[sender], "User is blacklisted");

        // Check whitelist if enabled
        if (useWhitelist) {
            require(
                whitelistedUsers[sender] || _isWhitelistedContract(userOp),
                "User or contract not whitelisted"
            );
        }

        // Check spending limits
        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;

        require(
            dailySpent[currentDay] + maxCost <= dailySpendingLimit,
            "Daily spending limit exceeded"
        );
        require(
            monthlySpent[currentMonth] + maxCost <= monthlySpendingLimit,
            "Monthly spending limit exceeded"
        );
        require(
            userSpent[sender] + maxCost <= perUserLimit,
            "Per-user spending limit exceeded"
        );

        // Return context for postOp
        context = abi.encode(sender, maxCost, currentDay, currentMonth);
        validationData = 0; // Valid
    }

    /**
     * @notice Post-operation handler to track spending
     * @dev Called by EntryPoint after UserOperation execution
     */
    function _postOp(
        PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) internal virtual override {
        (address sender, uint256 maxCost, uint256 currentDay, uint256 currentMonth) = 
            abi.decode(context, (address, uint256, uint256, uint256));

        // Update spending trackers
        unchecked {
            dailySpent[currentDay] += actualGasCost;
            monthlySpent[currentMonth] += actualGasCost;
            userSpent[sender] += actualGasCost;
        }

        emit SponsoredUserOp(sender, actualGasCost, actualGasCost / tx.gasprice);
    }

    /**
     * @notice Check if the UserOperation is calling a whitelisted contract
     */
    function _isWhitelistedContract(UserOperation calldata userOp) internal view returns (bool) {
        // Extract the target contract from callData
        // Assuming callData format: execute(address target, uint256 value, bytes data)
        if (userOp.callData.length < 68) return false;
        
        address target;
        bytes calldata callData = userOp.callData;
        assembly {
            target := shr(96, calldataload(add(callData.offset, 16)))
        }
        
        return whitelistedContracts[target];
    }

    // Admin functions

    /**
     * @notice Update spending limits
     */
    function setSpendingLimits(
        uint256 _dailyLimit,
        uint256 _monthlyLimit,
        uint256 _perUserLimit
    ) external onlyOwner {
        dailySpendingLimit = _dailyLimit;
        monthlySpendingLimit = _monthlyLimit;
        perUserLimit = _perUserLimit;
        emit SpendingLimitUpdated(_dailyLimit, _monthlyLimit, _perUserLimit);
    }

    /**
     * @notice Whitelist a contract
     */
    function setContractWhitelist(address contractAddress, bool status) external onlyOwner {
        whitelistedContracts[contractAddress] = status;
        emit ContractWhitelisted(contractAddress, status);
    }

    /**
     * @notice Whitelist a user
     */
    function setUserWhitelist(address user, bool status) external onlyOwner {
        whitelistedUsers[user] = status;
        emit UserWhitelisted(user, status);
    }

    /**
     * @notice Blacklist a user
     */
    function setUserBlacklist(address user, bool status) external onlyOwner {
        blacklistedUsers[user] = status;
        emit UserBlacklisted(user, status);
    }

    /**
     * @notice Toggle whitelist requirement
     */
    function setUseWhitelist(bool _useWhitelist) external onlyOwner {
        useWhitelist = _useWhitelist;
    }

    /**
     * @notice Pause/unpause the paymaster
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    // View functions

    /**
     * @notice Get current day's spending
     */
    function getCurrentDaySpending() external view returns (uint256) {
        return dailySpent[block.timestamp / 1 days];
    }

    /**
     * @notice Get current month's spending
     */
    function getCurrentMonthSpending() external view returns (uint256) {
        return monthlySpent[block.timestamp / 30 days];
    }

    /**
     * @notice Get user's total spending
     */
    function getUserSpending(address user) external view returns (uint256) {
        return userSpent[user];
    }

    /**
     * @notice Check if user can be sponsored for a given amount
     */
    function canSponsor(address user, uint256 amount) external view returns (bool) {
        if (paused) return false;
        if (blacklistedUsers[user]) return false;
        if (useWhitelist && !whitelistedUsers[user]) return false;

        uint256 currentDay = block.timestamp / 1 days;
        uint256 currentMonth = block.timestamp / 30 days;

        return (
            dailySpent[currentDay] + amount <= dailySpendingLimit &&
            monthlySpent[currentMonth] + amount <= monthlySpendingLimit &&
            userSpent[user] + amount <= perUserLimit
        );
    }
}
