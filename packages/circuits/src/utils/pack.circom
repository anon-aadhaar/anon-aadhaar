pragma circom 2.1.6;

function constPackSize() {
    return 31;
}

function computeIntSize(bytes_size) {
    var pack_bytes = constPackSize();
    var remain = bytes_size % pack_bytes;
    var num_chunk = (bytes_size - remain) / pack_bytes;
    if(remain>0) {
        num_chunk += 1;
    }
    return num_chunk;
}

template Bytes2Ints(bytes_size) {
    var num_chunk = computeIntSize(bytes_size);
    signal input bytes[bytes_size];
    signal output ints[num_chunk];

    var pack_bytes = constPackSize();
    signal ints_sums[num_chunk][pack_bytes];
    for(var i=0; i<num_chunk; i++) {
        for(var j=0; j<pack_bytes; j++) {
            var idx = pack_bytes*i+j;
            if(idx>=bytes_size) {
                ints_sums[i][j] <== ints_sums[i][j-1];
            } else if (j==0){
                ints_sums[i][j] <== bytes[idx];
            } else {
                ints_sums[i][j] <== ints_sums[i][j-1] + (1<<(8*j)) * bytes[idx];
            }
        }
    }
    for(var i=0; i<num_chunk; i++) {
        ints[i] <== ints_sums[i][pack_bytes-1];
    }
}