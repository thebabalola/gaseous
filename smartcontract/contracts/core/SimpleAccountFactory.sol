// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import "./SimpleAccount.sol";

/**
 * @title SimpleAccountFactory
 * @notice Factory contract for creating SimpleAccount instances
 * @dev Uses CREATE2 for deterministic addresses
 * 
 * This factory:
 * - Creates new smart accounts for users
 * - Uses CREATE2 for predictable addresses
 * - Allows users to know their account address before deployment
 */
contract SimpleAccountFactory {
    SimpleAccount public immutable accountImplementation;

    constructor(IEntryPoint _entryPoint) {
        accountImplementation = new SimpleAccount(_entryPoint);
    }

    /**
     * @notice Create an account, and return its address.
     * @dev Returns the address even if the account is already deployed.
     * @param owner The owner of the account
     * @param salt Unique salt for CREATE2
     */
    function createAccount(address owner, uint256 salt) public returns (SimpleAccount ret) {
        address addr = getAddress(owner, salt);
        uint256 codeSize = addr.code.length;
        if (codeSize > 0) {
            return SimpleAccount(payable(addr));
        }
        ret = SimpleAccount(payable(new ERC1967Proxy{salt: bytes32(salt)}(
            address(accountImplementation),
            abi.encodeCall(SimpleAccount.initialize, (owner))
        )));
    }

    /**
     * @notice Calculate the counterfactual address of this account as it would be returned by createAccount()
     * @param owner The owner of the account
     * @param salt Unique salt for CREATE2
     */
    function getAddress(address owner, uint256 salt) public view returns (address) {
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(
                address(accountImplementation),
                abi.encodeCall(SimpleAccount.initialize, (owner))
            )
        )));
    }
}
