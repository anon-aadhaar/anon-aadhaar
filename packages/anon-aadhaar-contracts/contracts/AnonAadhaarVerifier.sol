//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract AnonAadhaarVerifier {
    address public verifierAddr;
    uint256 public appId;

    constructor(address _verifierAddr, uint256 _appId) {
        verifierAddr = _verifierAddr;
        appId = _appId;
    }

    function verifyProof(
        uint[2] calldata a, 
        uint[2][2] calldata b, 
        uint[2] calldata c, 
        uint[34] calldata input
    ) public view returns (bool) {
        require(input[input.length - 1] == appId, "Wrong app ID");
        return IAnonAadhaarVerifier(verifierAddr).verifyProof(a, b, c, input);
    }
}