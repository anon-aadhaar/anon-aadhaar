//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract AnonAadhaarVerifier {
    IAnonAadhaarVerifier public verifier;
    uint256 public pubkeyHash;

    // uint256 public SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    constructor(IAnonAadhaarVerifier _verifier, uint256 _pubkeyHash) {
        verifier = _verifier;
        pubkeyHash = _pubkeyHash;
    }

    function verifyModulus(uint256 _receivedpubkeyHash) private view returns (bool) {
        return pubkeyHash == _receivedpubkeyHash;
    }

    function slice(uint256[34] memory data, uint256 start) private pure returns (uint256[] memory) {
        uint256[] memory sliced = new uint256[](32);
        
        for (uint256 i = 0; i < 32; i++) {
            sliced[i] = data[start + i];
        }
        
        return sliced;
    }

    function verifyProof(
        uint[2] calldata a, 
        uint[2][2] calldata b, 
        uint[2] calldata c, 
        uint[34] calldata input
    ) public view returns (bool) {
        require(verifyModulus(input[1]) == true, "AnonAadhaarVerifier: wrong issuer public key");
        return verifier.verifyProof(a, b, c, input);
    }
}