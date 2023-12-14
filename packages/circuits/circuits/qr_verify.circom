pragma circom 2.1.6;

include "./rsa.circom";
include "./sha.circom";


template QR_Verify(n, k, len) {
    signal input padded_message[len]; // private
    signal input message_len; // private 
    signal input signature[k]; //private
    signal input modulus[k]; //public

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
    
}

component main{public [modulus]} = QR_Verify(64, 32, 512 * 3);