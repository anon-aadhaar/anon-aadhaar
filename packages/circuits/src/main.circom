pragma circom 2.1.6;

include "./aadhaar-verifier.circom";

component main { public [nullifierSeed, signalHash] } = AadhaarVerifier(121, 17, 512 * 3);
