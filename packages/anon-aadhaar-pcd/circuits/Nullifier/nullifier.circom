pragma circom 2.1.6;


include "../../node_modules/circomlib/circuits/mux1.circom";
include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

// Client create nullifier from sk value sent by server. 
// After receive anon aadhaar prove from client(inlcude m value), 
// Server will update the merkle tree which leaf = hash(sk, m), and sent sk back to client. 

/* 
    Nullifer = hash(pdf, sk). 

    For verify nullifer: client should proof 

    hash(sk, m) belong to server merkle tree. 

    We can add anon aadhar proof if we want 
*/


template Nullifier(n_levels) {
    assert(n_levels < 254);
    signal input sk; // private
    signal input pdf_hash; // private

    signal input path_index[n_levels]; // private
    signal input path_elements[n_levels]; //private
    signal output root; //public
    signal output nullifier; //public

    signal leaf;

    component pdf_hasher = Poseidon(1);
    pdf_hasher.inputs[0] <== pdf_hash;

    component sk_hasher = Poseidon(1);
    sk_hasher.inputs[0] <== sk;

    component leaf_hasher = Poseidon(2);
    leaf_hasher.inputs[0] <== sk_hasher.out;
    leaf_hasher.inputs[1] <== pdf_hasher.out; // m value

    leaf <== leaf_hasher.out;

    signal levelHashes[n_levels + 1];
    levelHashes[0] <== leaf;
    nullifier <== leaf; //

    // don't allow inclusion proof for 0 leaf
    signal leaf_zero <== IsZero()(leaf);
    leaf_zero === 0;

    signal mux[n_levels][2];
    signal hashers[n_levels];
    signal merklePath[n_levels][2][2];
    for (var i = 0; i < n_levels; i++) {
        // Should be 0 or 1
        path_index[i] * (1 - path_index[i]) === 0;

        merklePath[i][0][0] <== levelHashes[i];
        merklePath[i][0][1] <== path_elements[i];
        merklePath[i][1][0] <== path_elements[i];
        merklePath[i][1][1] <== levelHashes[i];
        
        mux[i] <== MultiMux1(2)(merklePath[i], path_index[i]);
        hashers[i] <== Poseidon(2)(mux[i]);

        levelHashes[i + 1] <== hashers[i];
    }

    root <== levelHashes[n_levels];
}


component main = Nullifier(16);