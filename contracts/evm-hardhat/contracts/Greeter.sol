// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Greeter {
    string private _greeting;

    event GreetingChanged(string greeting);

    constructor(string memory greeting_) {
        _greeting = greeting_;
        emit GreetingChanged(_greeting);
    }

    function greeting() external view returns (string memory) {
        return _greeting;
    }

    function setGreeting(string calldata greeting_) external {
        _greeting = greeting_;
        emit GreetingChanged(_greeting);
    }
}


