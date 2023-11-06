pragma circom 2.1.5;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "./rsa.circom";

template HashMessage(n, k) {
    signal input signature[k];
    signal input modulus[k];
    signal input base_message[k];
    signal output out;

    component RSAVerifier = RSAVerify65537(n, k);

    for (var i = 0; i < k; i++) {
        RSAVerifier.modulus[i] <== modulus[i];
        RSAVerifier.base_message[i] <== base_message[i];
        RSAVerifier.signature[i] <== signature[i];
    }

    component base_message1 = Poseidon(k/2);
    component base_message2 = Poseidon(k/2);

    for (var i = 0; i < k/2; i++) {
        base_message1.inputs[i] <== base_message[i];
    }

    for (var i = 0; i < k/2; i++) {
        base_message2.inputs[i] <== base_message[i+16];
    }

    component message_hash = Poseidon(2);

    message_hash.inputs[0] <== base_message1.out;
    message_hash.inputs[1] <== base_message2.out;

    out <== message_hash.out;
}