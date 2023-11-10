pragma circom 2.1.6;

include "../../node_modules/circomlib/circuits/poseidon.circom";

template Nullifier() {
    signal input private_key;
    signal input pdf_hash;
    signal output public_key;
    signal output m;

    component verifier = Poseidon(1);
    verifier.inputs[0] <== private_key;
    public_key <== verifier.out;

    component nullifier_hash = Poseidon(2);

    nullifier_hash.inputs[0] <== private_key;
    nullifier_hash.inputs[1] <== pdf_hash;

    m <== nullifier_hash.out;
}

component main = Nullifier();