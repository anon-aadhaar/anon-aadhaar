pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "../helpers/constants.circom";

/// @title IdentityNullifier
/// @notice Computes the identityNullifier - hash(name, dateOfBirth, gender)
/// @input name The name of the user
/// @input dateOfBirth The date of birth of the user
/// @input gender Gender of the user
/// @output userNullifier hash(photo)
template IdentityNullifier() {
    signal input name;
    signal input dateOfBirth;
    signal input gender;

    signal output out;

    // TODO: Make signal part of nullifier?
    out <== Poseidon(3)([name, dateOfBirth, gender]);
}

/// @title UserNullifier
/// @notice Computes the userNullifier for an Aadhaar identity - hash(photo)
/// @input photo The photo of the user
/// @output userNullifier hash(photo)
template UserNullifier() {
    signal input photo[photoPackSize()];

    signal output out;

    // TODO: Is it significantly cheaper to extract fewer bytes of photo since we only use 16
    signal userNullifierHasherInput[16];
    for (var i = 0; i < 16; i++) {
        userNullifierHasherInput[i] <== photo[i];
    }
    out <== Poseidon(16)(userNullifierHasherInput);
}
