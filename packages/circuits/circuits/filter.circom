pragma circom 2.1.6; 

include "circomlib/circuits/comparators.circom";

// input selector and element
// if selector[i] == 1 and element = i then return 1. 
// We can optimize this template by precompute isOne array;
template InSet() {
    signal input selector[16];
    signal input element; 
    signal inside[16]; 
    signal output out;
    component isOne[16];
    component equal[16];
    for (var i = 0; i < 16; i++) {
        isOne[i] = IsEqual();
        isOne[i].in[0] <== selector[i];
        isOne[i].in[1] <== 1;

        equal[i] = IsEqual();
        equal[i].in[0] <== element;
        equal[i].in[1] <== i;

        if (i > 0) {
            inside[i] <== inside[i - 1] + isOne[i].out* equal[i].out;
        } else {
            inside[i] <== isOne[i].out * equal[i].out;
        }
    }

    out <== inside[15];
}

template Filter(max_num_bytes) {
    signal input data[max_num_bytes]; // private input;
    signal input selector[16]; // public input;
    signal output extract_data[max_num_bytes];

    signal s_data[max_num_bytes + 1];
 
    component data_is255[max_num_bytes]; 

    s_data[0] <== 0;

    data_is255[0] = IsEqual();
    data_is255[0].in[0] <== 255;
    data_is255[0].in[1] <== data[0]; 

    for (var i = 1; i < max_num_bytes; i++) {
        data_is255[i] = IsEqual();
        data_is255[i].in[0] <== 255;
        data_is255[i].in[1] <== data[i]; 
        s_data[i] <== s_data[i - 1] + data_is255[i].out;        
    } 

    for (var i = 0; i < 16; i++) {
        selector[i] * (1 - selector[i]) === 0;
    }


    component inset[max_num_bytes];
        for (var i = 0; i < max_num_bytes; i++) {
            inset[i] = InSet();
            inset[i].element <== s_data[i];
            inset[i].selector <== selector;
            extract_data[i] <== inset[i].out * data[i];
        }

}