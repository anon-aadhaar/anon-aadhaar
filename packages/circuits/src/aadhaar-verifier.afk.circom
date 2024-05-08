pragma circom 2.1.6;

include "@anon-aadhaar/circuits/src/aadhaar-verifier.circom";
include "circomlib/circuits/poseidon.circom";
include "./constants.circom";

template AFKAadhaarVerifier(n, k, maxDataLength) {
    signal input qrDataPadded[maxDataLength];
    signal input qrDataPaddedLength;
    signal input nonPaddedDataLength;
    signal input delimiterIndices[18];
    signal input signature[k];
    signal input pubKey[k];
    signal input secret;

    signal output pubkeyHash;
    signal output nullifier;
    signal output timestamp;
    signal output countryCommitment;
    signal output ageAbove18Commitment;
    signal output genderCommitment;
    signal output stateCommitment;
    signal output pinCodeCommitment;

    component aadhaarVerifier = AadhaarVerifier(n, k, maxDataLength); 
    aadhaarVerifier.qrDataPadded <== qrDataPadded;
    aadhaarVerifier.qrDataPaddedLength <== qrDataPaddedLength;
    aadhaarVerifier.nonPaddedDataLength <== nonPaddedDataLength;
    aadhaarVerifier.delimiterIndices <== delimiterIndices;
    aadhaarVerifier.signature <== signature;
    aadhaarVerifier.pubKey <== pubKey;
    aadhaarVerifier.nullifierSeed <== issuerScope();
    aadhaarVerifier.signalHash <== issuerScope();
    aadhaarVerifier.revealAgeAbove18 <== 1;
    aadhaarVerifier.revealGender <== 1;
    aadhaarVerifier.revealState <== 1;
    aadhaarVerifier.revealPinCode <== 1;

    pubkeyHash <== aadhaarVerifier.pubkeyHash;
    nullifier <== aadhaarVerifier.nullifier;
    timestamp <== aadhaarVerifier.timestamp;

    var anonAadhharIssuerId = 37977685;
    var countryNamePacked = 418380017225; // "India"

    genderCommitment <== Poseidon(4)([
        secret,
        anonAadhharIssuerId,
        claimKey_BioGender(),
        aadhaarVerifier.gender
    ]);
    countryCommitment <== Poseidon(4)([
        secret,
        anonAadhharIssuerId,
        claimKey_BioCountry(),
        countryNamePacked
    ]);
    stateCommitment <== Poseidon(4)([
        secret,
        anonAadhharIssuerId,
        claimKey_AddressState(),
        aadhaarVerifier.state
    ]);
    pinCodeCommitment <== Poseidon(4)([
        secret,
        anonAadhharIssuerId,
        claimKey_AddressZipCode(),
        aadhaarVerifier.pinCode
    ]);
    ageAbove18Commitment <== Poseidon(4)([
        secret, 
        anonAadhharIssuerId,
        claimKey_KycAgeAbove18(), 
        aadhaarVerifier.ageAbove18
    ]);
}

component main = AFKAadhaarVerifier(121, 17, 512 * 3);
