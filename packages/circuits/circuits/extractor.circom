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

template Extractor(max_num_bytes) {
    signal input data[max_num_bytes]; // private input;
    signal input selector[16]; // public input;
    signal input reveal_timestamp;

    signal output email_or_phone; 

    signal output four_digit[4];
    signal output timestamp[14];
 
    signal output reveal_data[max_num_bytes];

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

    reveal_timestamp * (1 - reveal_timestamp) === 0;
    for (var i = 0; i < 16; i++) {
        selector[i] * (1 - selector[i]) === 0;
    }


    component inset[max_num_bytes];
    signal selected[max_num_bytes];
    for (var i = 0; i < max_num_bytes; i++) {
        inset[i] = InSet();
        inset[i].element <== s_data[i];
        inset[i].selector <== selector;
        selected[i] <== (1 - data_is255[i].out) * inset[i].out;
        reveal_data[i] <== data[i] * (selected[i]  + data_is255[i].out);
    }

    email_or_phone <== data[0] * selector[0];
    for (var i = 0; i < 4; i++) {
        four_digit[i] <== data[i + 2] * selector[1];
    }

    for (var i = 0; i < 14; i++) {
        timestamp[i] <== data[i + 6] * reveal_timestamp;
    }
}