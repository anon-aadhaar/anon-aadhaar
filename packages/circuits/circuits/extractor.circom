pragma circom 2.1.6; 

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";


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

/**
    return 1 if  left <= element <= right 
    else return 0;
**/
template InRange(n) {
    signal input left;
    signal input right; 
    signal input element; 

    signal output out; 

    component l = GreaterEqThan(n);
    component r = GreaterEqThan(n);

    l.in[0] <== element; 
    l.in[1] <== left;

    r.in[0] <== right;
    r.in[1] <== element;

    out <== l.out * r.out;
}


template VerifyFieldPosition(max_num_bytes) {
    signal input dataLen;
    signal input data[max_num_bytes];
    signal input filter[max_num_bytes];

    signal output photoPosition[2]; 

    signal numberElementLessThan16[max_num_bytes]; 
    numberElementLessThan16[0] <== 0;
    signal lessThan[max_num_bytes - 1];
    for (var i = 1; i < max_num_bytes; i++) {
        lessThan[i - 1] <== LessThan(8)([filter[i], 16]);
        numberElementLessThan16[i] <== numberElementLessThan16[i - 1] + lessThan[i  -1 ];
    }
    
    signal totalBasicFieldsSize <== numberElementLessThan16[max_num_bytes - 1];

    photoPosition[0] <== totalBasicFieldsSize + 1;

    signal index[max_num_bytes];
    signal equals[max_num_bytes];
    signal acctualLen[max_num_bytes];
    signal tmp[max_num_bytes - 1];

    index[0] <== 0;
    acctualLen[0] <== 0;
    equals[0] <== 0;

    for (var i = 1; i < max_num_bytes; i++) {
        index[i] <== index[i - 1] + 1;
        equals[i] <== IsEqual()([index[i], dataLen - 1]);
        tmp[i - 1] <== data[i - 1] * 256  + data[i];
        acctualLen[i] <== (tmp[i - 1] - acctualLen[i - 1]) * equals[i] + acctualLen[i - 1];  
        
    } 

    photoPosition[1] <== acctualLen[max_num_bytes - 1]/8 - 65;
}


template Extractor(max_num_bytes) {
    signal input data[max_num_bytes]; // private input;
    signal input dataLen; 
    signal input selector[16];

    signal output photoHash;
    
    signal output email_or_phone; 
    signal output four_digit[4];
    signal output reveal_data[max_num_bytes];


    signal s_data[max_num_bytes];
 
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

    component verifyFieldPosition = VerifyFieldPosition(max_num_bytes);
    verifyFieldPosition.dataLen <== dataLen;
    verifyFieldPosition.filter <== s_data;
    verifyFieldPosition.data <== data;

    signal photoPosition[2] <== verifyFieldPosition.photoPosition;

    signal photoHashSteps[max_num_bytes];

    component hasher[max_num_bytes - 1];


    photoHashSteps[0] <== 0;

    component inRange[max_num_bytes - 1];
    for (var i = 1; i < max_num_bytes; i++) {
        // should be optimize in other PR;
        // we can compute Poseidon hash of > 2 values   
        hasher[i - 1] = Poseidon(2); 
        hasher[i - 1].inputs[0] <== photoHashSteps[i - 1];
        hasher[i - 1].inputs[1] <== data[i];
        inRange[i - 1] = InRange(12);
        inRange[i - 1].left <== photoPosition[0]; 
        inRange[i - 1].right <== photoPosition[1];
        inRange[i - 1].element <== i;
        photoHashSteps[i] <== (hasher[i - 1].out - photoHashSteps[i - 1]) * inRange[i - 1].out  + photoHashSteps[i - 1];
    }

    photoHash <== photoHashSteps[max_num_bytes  - 1];
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
}