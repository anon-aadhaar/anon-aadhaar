pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "./helpers/signature.circom";
include "./helpers/extractor.circom";
include "./helpers/nullifier.circom";


/// @title AadhaarVerifier
/// @notice This circuit verifies the Aadhaar QR data using RSA signature
/// @param n - RSA pubic key size per chunk
/// @param k - Number of chunks the RSA public key is split into
/// @param maxDataLength - Maximum length of the data
/// @input qrDataPadded - QR data without the signature; each number represent ascii byte; remaining space is padded with 0
/// @input qrDataPaddedLength - Length of padded QR data
/// @input nonPaddedDataLength - Length of actual data without padding
/// @input delimiterIndices - Indices of delimiters (255) in the QR text data. 18 delimiters including photo
/// @input signature - RSA signature
/// @input pubKey - RSA public key (of the government)
/// @input nullifierSeed - A random value that is part of the nullifier; for example: applicationId, actionId
/// @input public signalHash - An external signal to make it part of the proof
/// @output nullifier - A unique value derived from nullifierSeed and Aadhaar data to nullify the proof/user
/// @output timestamp - Timestamp of when the data was signed - extracted and converted to Unix timestamp
/// @output pubkeyHash - Poseidon hash of the RSA public key
template AadhaarVerifier(n, k, maxDataLength) {
    signal input qrDataPadded[maxDataLength];
    signal input qrDataPaddedLength;
    signal input nonPaddedDataLength;
    signal input delimiterIndices[18];
    signal input signature[k];
    signal input pubKey[k];

    // Public inputs
    signal input nullifierSeed;
    signal input signalHash;
    signal input revealAgeAbove18;
    signal input revealGender;
    signal input revealState;
    signal input revealPinCode;

    signal output pubkeyHash;
    signal output nullifier;
    signal output timestamp;
    signal output ageAbove18;
    signal output gender;
    signal output state;
    signal output pinCode;


    // Verify the RSA signature
    component signatureVerifier = SignatureVerifier(n, k, maxDataLength);
    signatureVerifier.qrDataPadded <== qrDataPadded;
    signatureVerifier.qrDataPaddedLength <== qrDataPaddedLength;
    signatureVerifier.pubKey <== pubKey;
    signatureVerifier.signature <== signature;
    pubkeyHash <== signatureVerifier.pubkeyHash;
    

    // Extract data from QR and compute nullifiers
    component qrDataExtractor = QRDataExtractor(maxDataLength);
    qrDataExtractor.data <== qrDataPadded;
    qrDataExtractor.nonPaddedDataLength <== nonPaddedDataLength;
    qrDataExtractor.delimiterIndices <== delimiterIndices;

    // Reveal extracted data
    timestamp <== qrDataExtractor.timestamp;
    ageAbove18 <== revealAgeAbove18 * qrDataExtractor.ageAbove18;
    gender <== revealGender * qrDataExtractor.gender;
    state <== revealState * qrDataExtractor.state;
    pinCode <== revealPinCode * qrDataExtractor.pinCode;


    // Calculate nullifier
    signal photo[photoPackSize()] <== qrDataExtractor.photo;
    nullifier <== Nullifier()(nullifierSeed, photo);

    
    // Dummy square to prevent singal tampering (in rare cases where non-constrained inputs are ignored)
    signal signalHashSquare <== signalHash * signalHash;
}


component main { public [nullifierSeed, signalHash] } = AadhaarVerifier(121, 17, 512 * 3);
