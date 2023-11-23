//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract AnonAadhaarVerifier {
    address public verifierAddr;
    uint256 public appId;

    uint256 public SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    constructor(address _verifierAddr, uint256 _appId) {
        require(_appId < SNARK_SCALAR_FIELD, "AnonAadhaarVerifier: group id must be < SNARK_SCALAR_FIELD");
        appId = _appId;
        verifierAddr = _verifierAddr;
    }

    function verifyProof(
        uint[2] calldata a, 
        uint[2][2] calldata b, 
        uint[2] calldata c, 
        uint[34] calldata input
    ) public view returns (bool) {
        require(input[input.length - 1] == appId, "AnonAadhaarVerifier: wrong app ID");
        return IAnonAadhaarVerifier(verifierAddr).verifyProof(a, b, c, input);
    }
}