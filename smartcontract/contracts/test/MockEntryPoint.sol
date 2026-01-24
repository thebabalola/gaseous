// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockEntryPoint {
    mapping(address => uint256) public balances;

    function depositTo(address account) public payable {
        balances[account] += msg.value;
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }
    
    function withdrawTo(address payable withdrawAddress, uint256 amount) external {
        require(balances[msg.sender] >= amount, "Insufficient balance");
        balances[msg.sender] -= amount;
        withdrawAddress.transfer(amount);
    }
}
