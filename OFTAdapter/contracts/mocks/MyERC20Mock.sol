// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// @dev WARNING: This is for testing purposes only
contract MyERC20Mock is ERC20 {
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) {
        _mint(msg.sender, 100 * 1e18);
    }

    function mint(address _to, uint256 _amount) public {
        _mint(_to, _amount);
    }
}
