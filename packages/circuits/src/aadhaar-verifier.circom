pragma circom 2.1.6;

include "./rsa.circom";
include "./sha.circom";
include "./extractor.circom";
include "../helpers/timestamp.circom";


template AadhaarVerifier(n, k, len) {
    signal input padded_message[len]; // private
    signal input message_len; // private 
    signal input signature[k]; //private
    signal input modulus[k]; //public

    signal output identityNullifier; 
    signal output userNullifier; 
    signal output timestamp;
    signal output pubkeyHash;

    component shaHasher = Sha256Bytes(len);

    shaHasher.in_padded <== padded_message;
    shaHasher.in_len_padded_bytes <== message_len;

    signal sha[256];

    sha <== shaHasher.out;
    component rsa = RSAVerify65537(n, k);

    var msg_len = (256 + n) \ n;

    component base_msg[msg_len];
    for (var i = 0; i < msg_len; i++) {
        base_msg[i] = Bits2Num(n);
    }
    for (var i = 0; i < 256; i++) {
        base_msg[i \ n].in[i % n] <== sha[255 - i];
    }
    for (var i = 256; i < n * msg_len; i++) {
        base_msg[i \ n].in[i % n] <== 0;
    }

    for (var i = 0; i < msg_len; i++) {
        rsa.base_message[i] <== base_msg[i].out;
    }
    for (var i = msg_len; i < k; i++) {
        rsa.base_message[i] <== 0;
    }

    for (var i = 0; i < k; i++) {
        rsa.modulus[i] <== modulus[i];
        rsa.signature[i] <== signature[i];
    }
    
    component extractor = Extractor(len);

    extractor.dataLen <== message_len;
    extractor.data <== padded_message;

    signal four_digit[4] <== extractor.four_digit;

    signal photoHash <== extractor.photoHash;
    signal basicIdentityHash <== extractor.basicIdentityHash;

    component poseidonHasher[2]; 

    poseidonHasher[0] = Poseidon(5); 
    poseidonHasher[0].inputs <== [four_digit[0], four_digit[1], four_digit[2], four_digit[3], photoHash];

    poseidonHasher[1] = Poseidon(5); 
    poseidonHasher[1].inputs <== [four_digit[0], four_digit[1], four_digit[2], four_digit[3], basicIdentityHash];

    userNullifier <== poseidonHasher[0].out;
    identityNullifier <== poseidonHasher[1].out;

    // Output the timestamp rounded to nearest hour
    component date_to_timestamp = DateStringToTimestamp(2030, 1, 0, 0);
    for (var i = 0; i < 14; i++) {
        date_to_timestamp.in[i] <== padded_message[i + 6];
    }
    timestamp <== date_to_timestamp.out - 19800; // 19800 is the offset for IST

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
            pubkeyHasherInput[i] <== modulus[i * 2];
        } else {
            pubkeyHasherInput[i] <== modulus[i * 2] + (1 << n) * modulus[i * 2 + 1];
        }
    }
    component pubkeyHasher = Poseidon(poseidonInputSize);
    pubkeyHasher.inputs <== pubkeyHasherInput;
    pubkeyHash <== pubkeyHasher.out;
}


component main{public [modulus]} = AadhaarVerifier(64, 32, 512 * 3);