//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "../interfaces/IAnonAadhaarVerifier.sol";

contract AnonAadhaar {
    address public verifier;
    uint256 public pubkeyHash;

    constructor(address _verifier, uint256 _pubkeyHash) {
        verifier = _verifier;
        pubkeyHash = _pubkeyHash;
    }

    /// @dev Verifies that the public received is corresponding with the one stored in the contract.
    /// @param _receivedpubkeyHash: Public key received.
    /// @return Verified bool
    function verifyPublicKey(uint256 _receivedpubkeyHash) private view returns (bool) {
        return pubkeyHash == _receivedpubkeyHash;
    }

    /// @dev Verifies that the public received is corresponding with the one stored in the contract.
    /// @param a: Public key received.
    /// @param b: Public key received.
    /// @param c: Public key received.
    /// @param input: Public key received.
    /// @param signal: Public key received.
    /// @return Verified bool
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[5] calldata input,
        uint256 signal
    ) public view returns (bool) {
        // Verifying that the pubkey is corresponding to UIDAI public key
        require(verifyPublicKey(input[3]) == true, "AnonAadhaarVerifier: wrong issuer public key");
        signal = _hash(signal);
        require(input[4] == signal, "AnonAadhaarVerifier: wrong signal received");
        return IAnonAadhaarVerifier(verifier).verifyProof(a, b, c, input);
    }

    /// @dev Creates a keccak256 hash of a message compatible with the SNARK scalar modulus.
    /// @param message: Message to be hashed.
    /// @return Message digest.
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}