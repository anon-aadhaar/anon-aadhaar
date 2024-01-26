// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

interface IAnonAadhaar {
    function verifyAnonAadhaarProof(
        bytes calldata identityNullifier, bytes calldata userNullifier, bytes calldata timestamp, bytes calldata signalHash, uint[8] memory groth16Proof 
    ) external view returns (bool);
}