pragma solidity >=0.7.0 <0.9.0;

import '../interfaces/IIssuerVerifier.sol';
import {Groth16Verifier} from './anon-aadhaar-afk-groth16-verifier.sol';

contract AnonAadhaarAFKVerifier implements IIssuerVerifier {
    Groth16Verifier public verifier;
    address public pubKeyHash;

    constructor(Groth16Verifier _verifier, address _pubKeyHash) {
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

        assert(pubKeyHash == _pubKeyHash, "Invalid pubkey hash");

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

        return (nullifier, [countryCommitment, ageAbove18Commitment, genderCommitment, stateCommitment, pinCodeCommitment]);
    }
 
}
