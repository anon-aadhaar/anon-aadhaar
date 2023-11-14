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
    signal input signature[k];
    signal input modulus[k];
    signal input base_message[k];
    signal output hash;

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

    component base_message_hash = Poseidon(1);

    base_message_hash.inputs[0] <== Compress.sha1hash;

    hash <== base_message_hash.out;
}
