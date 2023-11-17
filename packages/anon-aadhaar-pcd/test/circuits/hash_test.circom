pragma circom 2.1.6; 

include "../../circuits/RSA/hash.circom";

component main { public [ modulus, app_id ] } = HashMessage(64, 32);
