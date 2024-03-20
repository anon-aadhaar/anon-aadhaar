pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "../helpers/constants.circom";


/// @title Nullifier
/// @notice Computes the userNullifier for an Aadhaar identity
/// @input photo The photo of the user
/// @output userNullifier = hash(nullifierSeed, hash(photo[0:15]), hash(photo[16:31]))
/// @dev Poseidon template only support 16 inputs
template Nullifier() {
    signal input nullifierSeed;
    signal input photo[photoPackSize()]; // 32 elements

    signal output out;

    signal first16Hasher <== Poseidon(16);
    for (var i = 0; i < 16; i++) {
        first16Hasher.inputs[i] <== photo[i];
    }

    signal last16Hasher <== Poseidon(16);
    for (var i = 0; i < 16; i++) {
        last16Hasher.inputs[i] <== photo[i + 16];
    }

    signal hasher <== Poseidon(3)(nullifierSeed, first16Hasher, last16Hasher);
    
    out <== hasher.out;
}
