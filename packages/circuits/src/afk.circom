pragma circom 2.1.6;

include "@anon-aadhaar/circuits/src/aadhaar-verifier.circom";
include "circomlib/circuits/poseidon.circom";

template AFKVerifier(MAX_CLAIMS) {
  signal input secret;
  signal input issuerIds[MAX_CLAIMS];
  signal input claimKeys[MAX_CLAIMS];
  signal input claimValues[MAX_CLAIMS];
  signal input scope;
  signal input message;
  
  signal output nullifier <== Poseidon(2)([secret, scope]);
  signal output claimCommitments[MAX_CLAIMS];
  
  for(var i = 0; i < MAX_CLAIMS; i++) {
    claimCommitments[i] <== Poseidon(4)([
      secret,
      issuerIds[i],
      claimKeys[i],
      claimValues[i]
    ]);
  }

  signal dummySquare <== message * message;
}

component main { public [claimKeys, claimValues, scope, message] } = AFKVerifier(5);
