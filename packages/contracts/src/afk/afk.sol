//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.19;

import '../interfaces/IAnonAadhaarGroth16Verifier.sol';
import '../interfaces/IAnonAadhaar.sol';
import {Groth16Verifier} from './afk-groth16-verifier.sol';


contract AFK {
    address public verifier;

    mapping(uint32 => Issuer) issuers;

    mapping(uint256 => uint256) expiryOfClaimCommitment;

    constructor(address _verifier) {
        verifier = _verifier;
    }

    function addIssuer(
        uint32 issuerId,
        string name,
        address verifier,
        uint256 claimExpiry
    ) {
        issuers[issuerId] = Issuer(name, verifier, claimExpiry);
    }

    function addClaims(uint32 source, bytes proof) {
        Issuer memory issuer = issuers[source];

        assert(issuer.verifier != address(0));

        uint256[] memory claim = IIssuerVerifier(issuer.verifier).verifyProof(
            proof
        );

        uint256 expiry = block.timestamp + issuer.claimExpiry;

        for (uint i = 0; i < claim.length; i++) {
            expiryOfClaimCommitment[claim[i]] = expiry;
        }
    }

    function verifyClaims(
        uint32[] claimKeys,
        uint256[] claimValues,
        uint256[] claimCommitments,
        uint256 nullifier,
        uint256 scope,
        uint256 message,
        uint256[8] memory groth16Proof
    ) view returns (bool) {
        assert(claimKeys.length <= 5, 'Too many claims');
        assert(
            claimKeys.length == claimValues.length,
            'Claim keys and values length mismatch'
        );
        assert(
            claimKeys.length == claimCommitments.length,
            'Claim keys and commitments length mismatch'
        );

        for (uint i = 0; i < claimKeys.length; i++) {
            require(
                expiryOfClaimCommitment[claimCommitments[i]] > block.timestamp,
                'Invalid or expired claimCommitment'
            );
        }

        return verifier.verifyProof(
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
