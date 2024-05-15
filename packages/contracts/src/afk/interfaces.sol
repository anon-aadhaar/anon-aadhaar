//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IIssuerVerifier {
    function verifyProof(bytes memory proof) external returns (uint256, uint256[] memory);
}

struct Issuer {
    string name;
    address verifier;
    uint256 claimExpiry;
}
