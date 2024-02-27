pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "../helpers/constants.circom";


/// @title IdentityNullifier
/// @notice Computes the identityNullifier - hash(name, dateOfBirth, gender)
/// @input appId The application id
/// @input last4Digits The last 4 digits of the Aadhaar number
/// @input name The name of the user
/// @input dateOfBirth The date of birth of the user
/// @input gender Gender of the user
/// @output userNullifier hash(photo)
template IdentityNullifier() {
    signal input appId;
    signal input last4Digits;
    signal input name;
    signal input dateOfBirth;
    signal input gender;

    signal output out;

    out <== Poseidon(5)([appId, last4Digits, name, dateOfBirth, gender]);
}


/// @title UserNullifier
/// @notice Computes the userNullifier for an Aadhaar identity - hash(photo)
/// @input photo The photo of the user
/// @output userNullifier hash(photo)
template UserNullifier() {
    signal input photo[photoPackSize()];

    signal output out;

    signal hashChain[photoPackSize() - 1];
    hashChain[0] <== Poseidon(2)([photo[0], photo[1]]);

    for (var i = 1; i < photoPackSize() - 1; i++) {
        hashChain[i] <== Poseidon(2)([hashChain[i - 1], photo[i + 1]]);
    }

    out <== hashChain[photoPackSize() - 2];
}
