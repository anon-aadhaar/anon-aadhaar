pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";

function log2(a) {
    if (a == 0) {
        return 0;
    }
    var n = 1;
    var r = 1;
    while (n<a) {
        r++;
        n *= 2;
    }
    return r;
}

// Based on https://demo.hedgedoc.org/s/Le0R3xUhB
// Shifts the input array left by `shift` indices
template VarShiftLeft(in_array_len, out_array_len) {
    var len_bits = log2(in_array_len);
    assert(in_array_len <= (1 << len_bits));
    signal input in[in_array_len]; // x
    signal input shift; // k
    signal input len;

    signal output out[out_array_len]; // y

    component n2b = Num2Bits(len_bits);
    n2b.in <== shift;

    signal tmp[len_bits][in_array_len];
    for (var j = 0; j < len_bits; j++) {
        for (var i = 0; i < in_array_len; i++) {
            var offset = (i + (1 << j)) % in_array_len;
            // Shift left by 2^j indices if bit is 1
            if (j == 0) {
                tmp[j][i] <== n2b.out[j] * (in[offset] - in[i]) + in[i];
            } else {
                tmp[j][i] <== n2b.out[j] * (tmp[j-1][offset] - tmp[j-1][i]) + tmp[j-1][i];
            }
        }
    }

    // Return last row
    component ge_A[out_array_len];
    for (var i = 0; i < out_array_len; i++) {

            ge_A[i] = GreaterThan(len_bits);
            ge_A[i].in[0] <== len;
            ge_A[i].in[1] <== i;

        out[i] <==  ge_A[i].out * tmp[len_bits - 1][i];
    }
}


// Lifted from MACI https://github.com/privacy-scaling-explorations/maci/blob/v1/circuits/circom/trees/incrementalQuinTree.circom#L29
// Bits is ceil(log2 choices)
template QuinSelector(choices, bits) {
    signal input in[choices];
    signal input index;
    signal output out;

    // Ensure that index < choices
    component lessThan = LessThan(bits);
    lessThan.in[0] <== index;
    lessThan.in[1] <== choices;
    lessThan.out === 1;

    component calcTotal = CalculateTotal(choices);
    component eqs[choices];

    // For each item, check whether its index equals the input index.
    for (var i = 0; i < choices; i ++) {
        eqs[i] = IsEqual();
        eqs[i].in[0] <== i;
        eqs[i].in[1] <== index;

        // eqs[i].out is 1 if the index matches. As such, at most one input to
        // calcTotal is not 0.
        calcTotal.nums[i] <== eqs[i].out * in[i];
    }

    // Returns 0 + 0 + ... + item
    out <== calcTotal.sum;
}

template CalculateTotal(n) {
    signal input nums[n];
    signal output sum;

    signal sums[n];
    sums[0] <== nums[0];

    for (var i=1; i < n; i++) {
        sums[i] <== sums[i - 1] + nums[i];
    }

    sum <== sums[n - 1];
}
