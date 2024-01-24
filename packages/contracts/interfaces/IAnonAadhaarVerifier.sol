// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

interface IAnonAadhaarVerifier {
    function verifyProof(
        uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[5] calldata _pubSignals
    ) external view returns (bool);
}