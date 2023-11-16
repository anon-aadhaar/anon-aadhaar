pragma circom 2.1.5;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "./rsa.circom";

template BigintStringsHashToBigInt(k) {
    signal input base_message[k];
    signal output sha1hash;

    signal accum[3];

    for (var i = 0; i < 3; i++) {
        var exponent = 64*i;
        var multiplicator = 2**exponent;
        accum[i] <== base_message[i] * multiplicator;
    }

    var temp;

    for (var i = 0; i < 3; i++) {
        temp = temp + accum[i];
    }

    sha1hash <== temp;
}

template HashMessage(n, k) {
    signal input signature[k]; //private
    signal input base_message[k]; //private
    signal input modulus[k]; //public
    signal input app_id; //public
    signal output nullifier;

    component RSAVerifier = RSAVerify65537(n, k);

    for (var i = 0; i < k; i++) {
        RSAVerifier.modulus[i] <== modulus[i];
        RSAVerifier.base_message[i] <== base_message[i];
        RSAVerifier.signature[i] <== signature[i];
    }

    component Compress = BigintStringsHashToBigInt(k);

    for (var i = 0; i < k; i++) {
        Compress.base_message[i] <== base_message[i];
    }

    component nullify = Poseidon(2);

    nullify.inputs[0] <== Compress.sha1hash;
    nullify.inputs[1] <== app_id;

    nullifier <== nullify.out;
}
