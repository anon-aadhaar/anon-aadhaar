//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import "../interfaces/IAnonAadhaarVerifier.sol";
import "../interfaces/IAnonAadhaar.sol";

contract AnonAadhaar is IAnonAadhaar {
    address public verifier;
    uint256 public pubkeyHash;

    constructor(address _verifier, uint256 _pubkeyHash) {
        verifier = _verifier;
        pubkeyHash = _pubkeyHash;
    }

    /// @dev Verifies that the public key received is corresponding with the one stored in the contract.
    /// @param _receivedpubkeyHash: Public key received.
    /// @return Verified bool
    function verifyPublicKey(uint256 _receivedpubkeyHash) private view returns (bool) {
        return pubkeyHash == _receivedpubkeyHash;
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
    /// @param a: a.
    /// @param b: b.
    /// @param c: c.
    /// @param publicInputs: Public inputs.
    /// @param signal: Signal.
    /// @return Verified bool
    function verifyAnonAadhaarProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[5] calldata publicInputs,
        uint256 signal
    ) public view returns (bool) {
        // Verifying that the pubkey is corresponding to the UIDAI public key
        require(verifyPublicKey(publicInputs[3]) == true, "[AnonAadhaarVerifier]: wrong issuer public key");
        require(verifySignalHash(signal ,publicInputs[4]) == true, "[AnonAadhaarVerifier]: wrong signal received");
        return IAnonAadhaarVerifier(verifier).verifyProof(a, b, c, publicInputs);
    }

    /// @dev Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
    /// @param message: Message to be hashed.
    /// @return Message digest.
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}