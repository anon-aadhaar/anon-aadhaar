pragma solidity >=0.7.0 <0.9.0;

import './interfaces.sol';
import {Groth16Verifier} from './anon-aadhaar-afk-groth16-verifier.sol';

contract AnonAadhaarAFKVerifier is IIssuerVerifier {
    Groth16Verifier public verifier;
    uint256 public pubKeyHash;

    constructor(Groth16Verifier _verifier, uint256 _pubKeyHash) {
        verifier = _verifier;
        pubKeyHash = _pubKeyHash;
    }

    function verifyProof(bytes memory proof) external override returns (uint256, uint256[] memory) {
        (
            uint _pubKeyHash,
            uint nullifier,
            uint timestamp,
            uint countryCommitment,
            uint ageAbove18Commitment,
            uint genderCommitment,
            uint stateCommitment,
            uint pinCodeCommitment,
            uint[8] memory groth16Proof
        ) = abi.decode(proof, (uint, uint, uint, uint, uint, uint, uint, uint, uint[8]));

        require(pubKeyHash == _pubKeyHash, "Invalid pubkey hash");

        verifier.verifyProof(
            [groth16Proof[0], groth16Proof[1]],
            [
                [groth16Proof[2], groth16Proof[3]],
                [groth16Proof[4], groth16Proof[5]]
            ],
            [groth16Proof[6], groth16Proof[7]],
            [
                pubKeyHash,
                nullifier,
                timestamp,
                countryCommitment,
                ageAbove18Commitment,
                genderCommitment,
                stateCommitment,
                pinCodeCommitment
            ]
        );

        uint256[] memory commitments = new uint256[](5);
        commitments[0] = countryCommitment;
        commitments[1] = ageAbove18Commitment;
        commitments[2] = genderCommitment;
        commitments[3] = stateCommitment;
        commitments[4] = pinCodeCommitment;

        return (nullifier, commitments);
    }
 
}
