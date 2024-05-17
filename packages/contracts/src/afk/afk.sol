//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Groth16Verifier} from './afk-groth16-verifier.sol';
import './interfaces.sol';


contract AFK {
    address public verifier;

    mapping(uint32 => Issuer) issuers;

    mapping(uint256 => uint256) expiryOfClaimCommitment;

    mapping(uint256 => bool) nullifiers;

    constructor(address _verifier) {
        verifier = _verifier;
    }

    function addIssuer(
        uint32 issuerId,
        string memory name,
        address verifierAddr,
        uint256 claimExpiry
    ) public {
        issuers[issuerId] = Issuer(name, verifierAddr, claimExpiry);
    }

    function addClaims(uint32 source, bytes calldata proof) public {
        Issuer memory issuer = issuers[source];

        require(issuer.verifier != address(0));

        (uint256 nullifier, uint256[] memory claims) = IIssuerVerifier(issuer.verifier).verifyProof(
            proof
        );

        require(!nullifiers[nullifier], 'Nullifier already used');

        nullifiers[nullifier] = true;

        uint256 expiry = block.timestamp + issuer.claimExpiry;

        for (uint i = 0; i < claims.length; i++) {
            expiryOfClaimCommitment[claims[i]] = expiry;
        }
    }

    function verifyClaims(
        uint32[] memory claimKeys,
        uint256[] memory claimValues,
        uint256[] memory claimCommitments,
        uint256 nullifier,
        uint256 scope,
        uint256 message,
        uint256[8] memory groth16Proof
    ) view public returns (bool) {
        require(claimKeys.length <= 5, 'Too many claims');
        require(
            claimKeys.length == claimValues.length,
            'Claim keys and values length mismatch'
        );
        require(
            claimKeys.length == claimCommitments.length,
            'Claim keys and commitments length mismatch'
        );

        for (uint i = 0; i < claimKeys.length; i++) {
            require(
                expiryOfClaimCommitment[claimCommitments[i]] > block.timestamp,
                'Invalid or expired claimCommitment'
            );
        }

        return Groth16Verifier(verifier).verifyProof(
            [groth16Proof[0], groth16Proof[1]],
            [
                [groth16Proof[2], groth16Proof[3]],
                [groth16Proof[4], groth16Proof[5]]
            ],
            [groth16Proof[6], groth16Proof[7]],
            // public inputs
            [
                nullifier,
                claimCommitments[0],
                claimCommitments[1],
                claimCommitments[2],
                claimCommitments[3],
                claimCommitments[4],
                claimKeys[0],
                claimKeys[1],
                claimKeys[2],
                claimKeys[3],
                claimKeys[4],
                claimValues[0],
                claimValues[1],
                claimValues[2],
                claimValues[3],
                claimValues[4],
                scope,
                message
            ]
        );
    }
}
