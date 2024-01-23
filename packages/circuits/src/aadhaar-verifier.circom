pragma circom 2.1.6;

include "./helpers/rsa.circom";
include "./helpers/sha.circom";
include "./helpers/timestamp.circom";
include "./extractor.circom";

// Circuit to verify Aadhaar signature
// n: RSA pubic key size per chunk
// k: Number of chunks the RSA public key is split into
// maxDataLength: Maximum length of the data
template AadhaarVerifier(n, k, maxDataLength) {
    signal input aadhaarData[maxDataLength];    // Aadhaar data padded (the data that is SHA hashed and signed)
    signal input aadhaarDataLength;             // length of the padded data
    signal input signature[k];                  // RSA signature
    signal input pubKey[k];                     // RSA public key (of the government)
    signal input signalHash;

    signal output identityNullifier;            // Hash of last 4 digits of Aadhaar number, name, DOB, gender and pin code
    signal output userNullifier;                // Hash of last 4 digits of Aadhaar number and photo
    signal output timestamp;                    // Timestamp of when the data was signed - extracted and converted to Unix timestamp
    signal output pubkeyHash;                   // Poseidon hash of the RSA public key


    component shaHasher = Sha256Bytes(maxDataLength);
    shaHasher.in_padded <== aadhaarData;
    shaHasher.in_len_padded_bytes <== aadhaarDataLength;
    signal sha[256];
    sha <== shaHasher.out;


    component rsa = RSAVerify65537(n, k);
    var rsaMsgLength = (256 + n) \ n;
    component rsaBaseMsg[rsaMsgLength];
    for (var i = 0; i < rsaMsgLength; i++) {
        rsaBaseMsg[i] = Bits2Num(n);
    }
    for (var i = 0; i < 256; i++) {
        rsaBaseMsg[i \ n].in[i % n] <== sha[255 - i];
    }
    for (var i = 256; i < n * rsaMsgLength; i++) {
        rsaBaseMsg[i \ n].in[i % n] <== 0;
    }

    for (var i = 0; i < rsaMsgLength; i++) {
        rsa.base_message[i] <== rsaBaseMsg[i].out;
    }
    for (var i = rsaMsgLength; i < k; i++) {
        rsa.base_message[i] <== 0;
    }

    for (var i = 0; i < k; i++) {
        rsa.modulus[i] <== pubKey[i];
        rsa.signature[i] <== signature[i];
    }
    

    component extractor = Extractor(maxDataLength);
    extractor.dataLen <== aadhaarDataLength;
    extractor.data <== aadhaarData;

    signal last4Digits[4] <== extractor.last4Digits;
    signal photoHash <== extractor.photoHash;
    signal basicIdentityHash <== extractor.basicIdentityHash;

    component poseidonHasher[2]; 
    poseidonHasher[0] = Poseidon(5); 
    poseidonHasher[0].inputs <== [last4Digits[0], last4Digits[1], last4Digits[2], last4Digits[3], photoHash];

    poseidonHasher[1] = Poseidon(5); 
    poseidonHasher[1].inputs <== [last4Digits[0], last4Digits[1], last4Digits[2], last4Digits[3], basicIdentityHash];

    userNullifier <== poseidonHasher[0].out;
    identityNullifier <== poseidonHasher[1].out;


    // Output the timestamp rounded to nearest hour
    component dateToUnixTime = DateStringToTimestamp(2030, 1, 0, 0);
    for (var i = 0; i < 14; i++) {
        dateToUnixTime.in[i] <== aadhaarData[i + 6];
    }
    timestamp <== dateToUnixTime.out - 19800; // 19800 is the offset for IST


    // Calculate Poseidon hash of the public key.
    // Poseidon component can take only 16 inputs, so we convert k chunks to k/2 chunks.
    // We are assuming k is  > 16 and <= 32 (i.e we merge two consecutive item in array to bring down the size)
    var poseidonInputSize = k \ 2;
    if (k % 2 == 1) {
        poseidonInputSize++;
    }
    assert(poseidonInputSize <= 16);
    signal pubkeyHasherInput[poseidonInputSize];
    for (var i = 0; i < poseidonInputSize; i++) {
        if (i == poseidonInputSize - 1 && poseidonInputSize % 2 == 1) {
            pubkeyHasherInput[i] <== pubKey[i * 2];
        } else {
            pubkeyHasherInput[i] <== pubKey[i * 2] + (1 << n) * pubKey[i * 2 + 1];
        }
    }
    component pubkeyHasher = Poseidon(poseidonInputSize);
    pubkeyHasher.inputs <== pubkeyHasherInput;
    pubkeyHash <== pubkeyHasher.out;


    signal signalHashSquare; 
    signalHashSquare <== signalHash * signalHash;
}


component main { public [signalHash] } = AadhaarVerifier(64, 32, 512 * 3);