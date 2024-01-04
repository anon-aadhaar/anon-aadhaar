pragma circom 2.1.6; 

include "circomlib/circuits/comparators.circom";


template Filter(max_num_bytes) {
    signal input data[max_num_bytes];
    signal input filter[max_num_bytes];
    signal output extract_data[max_num_bytes];

    signal s_data[max_num_bytes + 1];
    signal s_filter[max_num_bytes + 1];
    signal zeroOrOne[max_num_bytes];
    component data_is255[max_num_bytes]; 
    component filter_is255[max_num_bytes]; 
    s_data[0] <== 0;
    s_filter[0] <== 0;

    for (var i = 0; i < max_num_bytes; i++) {
        zeroOrOne[i] <== filter[i] * (filter[i] - 1);

        zeroOrOne[i] * (filter[i] - 255) === 0;

        data_is255[i] = IsEqual();
        data_is255[i].in[0] <== 255;
        data_is255[i].in[1] <== data[i]; 
        s_data[i + 1] <== s_data[i] + data_is255[i].out;        

        filter_is255[i] = IsEqual();
        filter_is255[i].in[0] <== 255;
        filter_is255[i].in[1] <== filter[i]; 
        s_filter[i + 1] <== s_filter[i] + filter_is255[i].out;  
    } 

    for (var i = 0; i <= max_num_bytes; i++) {
        (s_filter[i] - 16) * (s_data[i] - s_filter[i]) === 0;
    }

    signal selector[max_num_bytes];
    for (var i = 0; i < max_num_bytes; i++) {
        selector[i] <== filter[i] * (1 - filter_is255[i].out) + filter_is255[i].out;
        extract_data[i] <== selector[i] * data[i];
    }

}