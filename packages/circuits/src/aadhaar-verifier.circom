pragma circom 2.1.6;

include "circomlib/circuits/poseidon.circom";
include "./helpers/signature.circom";
include "./helpers/nullifier.circom";
include "./helpers/extractor.circom";


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
/// @input appId - Application ID which will be included in identityNullifier
/// @input public signalHash - An external signal to make it part of the proof
/// @output identityNullifier - PosidonHash(name, dob, gender)
/// @output userNullifier - PosidonHash(photo)
/// @output timestamp - Timestamp of when the data was signed - extracted and converted to Unix timestamp
/// @output pubkeyHash - Poseidon hash of the RSA public key
template AadhaarVerifier(n, k, maxDataLength) {
    signal input qrDataPadded[maxDataLength];
    signal input qrDataPaddedLength;
    signal input nonPaddedDataLength;
    signal input delimiterIndices[18];
    signal input signature[k];
    signal input pubKey[k];
    signal input appId;
    signal input signalHash;

    signal output identityNullifier;
    signal output userNullifier;
    signal output timestamp;
    signal output pubkeyHash;


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

    signal name <== qrDataExtractor.name;
    signal dateOfBirth <== qrDataExtractor.dateOfBirth;
    signal gender <== qrDataExtractor.gender;
    signal photo[photoPackSize()] <== qrDataExtractor.photo;
    signal last4Digits <== qrDataExtractor.last4Digits;
    timestamp <== qrDataExtractor.timestamp;

    identityNullifier <== IdentityNullifier()(appId, last4Digits, name, dateOfBirth, gender);
    userNullifier <== UserNullifier()(photo);

    
    // Dummy square to prevent singal tampering (in case when using different prover)
    signal signalHashSquare <== signalHash * signalHash;
}


component main { public [signalHash] } = AadhaarVerifier(64, 32, 512 * 3);
