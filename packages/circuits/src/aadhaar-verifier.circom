pragma circom 2.1.6;

include "./aadhaar-qr-verifier.circom";

component main { public [nullifierSeed, signalHash] } = AadhaarQRVerifier(121, 17, 512 * 3);
