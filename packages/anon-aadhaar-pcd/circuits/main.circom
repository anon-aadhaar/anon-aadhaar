pragma circom 2.1.5;

include "./hash.circom";

component main{public [modulus]} = ProcessProof(64, 32);