// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PaymentProcessor {
    address public admin;
    IERC20 public dai;

    event PaymentDone(
        address clientAddress,
        uint256 totalAmount,
        string paymentId,
        bytes32 blockHash,
        uint256 timestamp
    );

    constructor(address adminAddress, address daiAddress) {
        admin = adminAddress;
        dai = IERC20(daiAddress);
    }

    function pay(uint256 amount, string calldata paymentId) external {
        dai.transferFrom(msg.sender, admin, amount);
        bytes32 blockHash = blockhash(block.number - 1);
        emit PaymentDone(msg.sender, amount, paymentId, blockHash, block.timestamp);
    }
}
