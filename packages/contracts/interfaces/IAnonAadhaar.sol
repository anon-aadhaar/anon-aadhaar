// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

interface IAnonAadhaar {
    function verifyAnonAadhaarProof(
        uint identityNullifier, uint userNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof 
    ) external view returns (bool);
}