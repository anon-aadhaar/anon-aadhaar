pragma circom 2.1.6; 

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/poseidon.circom";


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


template PhotoPositionComputation(MAX_NUMBER_BYTES) {
    signal input dataLen;
    signal input data[MAX_NUMBER_BYTES];
    signal input filter[MAX_NUMBER_BYTES];

    signal output photoPosition[2]; 

    signal numberElementLessThan16[MAX_NUMBER_BYTES]; 
    numberElementLessThan16[0] <== 0;
    signal lessThan[MAX_NUMBER_BYTES - 1];
    for (var i = 1; i < MAX_NUMBER_BYTES; i++) {
        lessThan[i - 1] <== LessThan(8)([filter[i], 16]);
        numberElementLessThan16[i] <== numberElementLessThan16[i - 1] + lessThan[i  -1 ];
    }
    
    signal totalBasicFieldsSize <== numberElementLessThan16[MAX_NUMBER_BYTES - 1];

    photoPosition[0] <== totalBasicFieldsSize + 1;

    signal index[MAX_NUMBER_BYTES];
    signal equals[MAX_NUMBER_BYTES];
    signal acctualLen[MAX_NUMBER_BYTES];
    signal tmp[MAX_NUMBER_BYTES - 1];

    index[0] <== 0;
    acctualLen[0] <== 0;
    equals[0] <== 0;

    for (var i = 1; i < MAX_NUMBER_BYTES; i++) {
        index[i] <== index[i - 1] + 1;
        equals[i] <== IsEqual()([index[i], dataLen - 1]);
        tmp[i - 1] <== data[i - 1] * 256  + data[i];
        acctualLen[i] <== (tmp[i - 1] - acctualLen[i - 1]) * equals[i] + acctualLen[i - 1];  
    } 

    photoPosition[1] <== acctualLen[MAX_NUMBER_BYTES - 1]/8 - 65;

}


template Extractor(MAX_NUMBER_BYTES) {
    signal input data[MAX_NUMBER_BYTES];
    signal input dataLen; 

    signal output photoHash;

    signal output basicIdentityHash; 

    signal output four_digit[4];
    
    signal s_data[MAX_NUMBER_BYTES];
 
    component data_is255[MAX_NUMBER_BYTES - 1]; 

    s_data[0] <== 0;
 
    for (var i = 0; i < MAX_NUMBER_BYTES - 1; i++) {
        data_is255[i] = IsEqual();
        data_is255[i].in[0] <== 255;
        data_is255[i].in[1] <== data[i + 1]; 
        s_data[i + 1] <== s_data[i] + data_is255[i].out;        
    } 


    component photoPositionComputation = PhotoPositionComputation(MAX_NUMBER_BYTES);
    photoPositionComputation.dataLen <== dataLen;
    photoPositionComputation.filter <== s_data;
    photoPositionComputation.data <== data;

    signal photoPosition[2] <== photoPositionComputation.photoPosition;

    signal photoFlag[MAX_NUMBER_BYTES];
    for (var i = 0; i < MAX_NUMBER_BYTES; i++) {
        photoFlag[i] <== InRange(12)(photoPosition[0], photoPosition[1], i);
    }

    photoHash <== HashChain(MAX_NUMBER_BYTES)(photoFlag, data);

    signal basicIdentityFlag[MAX_NUMBER_BYTES];
    signal pincodeFlag[MAX_NUMBER_BYTES];
    signal identityFlag[MAX_NUMBER_BYTES];

    for (var i = 0; i < MAX_NUMBER_BYTES; i++) {
        basicIdentityFlag[i] <== InRange(12)(2, 4, s_data[i]);
        pincodeFlag[i] <== IsEqual()([10, s_data[i]]);   
        identityFlag[i] <== basicIdentityFlag[i] + pincodeFlag[i] - basicIdentityFlag[i] * pincodeFlag[i]; 
    }

    basicIdentityHash <== HashChain(MAX_NUMBER_BYTES)(identityFlag, data);  

    // extract last fordigit; 
    for (var i = 0; i < 4; i++) {
        four_digit[i] <== data[i + 2];
    }
}

template HashChain(MAX_NUMBER_BYTES) {
    signal input flag[MAX_NUMBER_BYTES];
    signal input data[MAX_NUMBER_BYTES]; 

    signal output hash;

    signal hashChain[MAX_NUMBER_BYTES];

    component hasher[MAX_NUMBER_BYTES - 1];
    // We always skip the first element, since email_or_phone unnessanary when compute nullifier;
    hashChain[0] <== 0;

    for (var i = 0; i < MAX_NUMBER_BYTES - 1; i++) {
        hasher[i] = Poseidon(2); 
        hasher[i].inputs[0] <== hashChain[i];
        hasher[i].inputs[1] <== data[i + 1];
        hashChain[i + 1] <== (hasher[i].out - hashChain[i]) * flag[i + 1]  + hashChain[i];       
    }
    
    hash <== hashChain[MAX_NUMBER_BYTES - 1];
}
