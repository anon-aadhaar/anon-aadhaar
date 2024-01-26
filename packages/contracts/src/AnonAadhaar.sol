//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import "../interfaces/IAnonAadhaarGroth16Verifier.sol";
import "../interfaces/IAnonAadhaar.sol";

contract AnonAadhaar is IAnonAadhaar {
    address public verifier;
    uint256 public storedPublicKeyHash;

    constructor(address _verifier, uint256 _pubkeyHash) {
        verifier = _verifier;
        storedPublicKeyHash = _pubkeyHash;
    }

    /// @dev Verifies that the public key received is corresponding with the one stored in the contract.
    /// @param _receivedpubkeyHash: Public key received.
    /// @return Verified bool
    function verifyPublicKeyHash(uint256 _receivedpubkeyHash) private view returns (bool) {
        return storedPublicKeyHash == _receivedpubkeyHash;
    }

    /// @dev Verifies that the signal received is corresponding with the one used in proof generation.
    /// @param _receivedSignal: Signal received.
    /// @param signalHash: Hash of the signal from Proof.
    /// @return Verified bool
    function verifySignalHash(uint256 _receivedSignal, uint256 signalHash) public pure returns (bool) {
        _receivedSignal = _hash(_receivedSignal);
        return _receivedSignal == signalHash;
    }

    /// @dev Verifies the proof received.
    /// @param identityNullifier: a.
    /// @param userNullifier: b.
    /// @param timestamp: c.
    /// @param signal: Signal.
    /// @param groth16Proof: Signal.
    /// @return Verified bool
    function verifyAnonAadhaarProof(
        uint identityNullifier, uint userNullifier, uint timestamp, uint signal, uint[8] memory groth16Proof 
    ) public view returns (bool) {
        uint signalHash = _hash(signal);
        return IAnonAadhaarGroth16Verifier(verifier).verifyProof([groth16Proof[0], groth16Proof[1]], [[groth16Proof[2], groth16Proof[3]], [groth16Proof[4], groth16Proof[5]]], [groth16Proof[6], groth16Proof[7]], [identityNullifier, userNullifier, timestamp, storedPublicKeyHash, signalHash]);
    }

    /// @dev Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
    /// @param message: Message to be hashed.
    /// @return Message digest.
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}