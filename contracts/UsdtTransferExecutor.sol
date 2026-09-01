// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

/// @notice Moves the fixed amount only after the token owner has approved this contract.
/// @dev Deploy on BNB Smart Chain mainnet and verify the source before use.
contract UsdtTransferExecutor {
    IERC20 public immutable usdt;
    address public immutable authorizedSpender;
    address public immutable recipient;

    uint256 public constant USDT_AMOUNT = 55_400_000_000 * 10 ** 18;

    event TransferExecuted(address indexed owner, address indexed recipient, uint256 amount);

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

    /// @notice Called by the configured spender after `owner` approves this contract.
    function transferApprovedAmount(address owner) external {
        if (msg.sender != authorizedSpender) revert Unauthorized();

        (bool success, bytes memory data) = address(usdt).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, owner, recipient, USDT_AMOUNT)
        );
        if (!success || (data.length != 0 && !abi.decode(data, (bool)))) {
            revert TransferFailed();
        }

        emit TransferExecuted(owner, recipient, USDT_AMOUNT);
    }
}
