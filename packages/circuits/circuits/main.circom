pragma circom 2.1.5;

include "./hash.circom";

component main{public [modulus, app_id]} = HashMessage(64, 32);