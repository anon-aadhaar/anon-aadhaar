pragma circom 2.1.6;

include "./rsa.circom";
include "../sha256-var-circom/circuits/sha256Var.circom";


template QR_Verify(n, k, len) {
    signal input inp[len];
    signal input signature[k]; //private
    signal input base_message[k]; //private
    signal input modulus[k]; //public

    component RSAVerifier = RSAVerify65537(n, k);

    for (var i = 0; i < k; i++) {
        RSAVerifier.modulus[i] <== modulus[i];
        RSAVerifier.base_message[i] <== base_message[i];
        RSAVerifier.signature[i] <== signature[i];
    }
    
}

component main = QR_Verify(64, 32, 1000);