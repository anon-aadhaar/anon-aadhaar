pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "../helpers/constants.circom";
include "../utils/timestamp.circom";
include "../utils/utils.circom";
include "../utils/shift.circom";
include "../utils/pack.circom";

template ExtractDataAtDelimiter(maxDataLength, maxExtractedDataLength) {
    signal input data[maxDataLength];
    signal input delimiterIndex;
    signal input dataStartIndex;
    signal input dataEndIndex;

    signal output outBytes[maxExtractedDataLength];

    signal shiftedBytes[maxExtractedDataLength + 1] <== VarShiftLeft(maxDataLength, maxExtractedDataLength + 1)(data, dataStartIndex, dataEndIndex - dataStartIndex);
    shiftedBytes[0] === (delimiterIndex + 1) * 255;

    for (var i = 1; i <= maxExtractedDataLength; i++) {
        assert(shiftedBytes[i] < 255);
        outBytes[i - 1] <== shiftedBytes[i];
    }
}

// Extract name from the data
// Returns single field (int) element representing the name in little endian order
// Assumes that name can fit in 31 bytes
template NameExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];  // QR data where each delimiter is 255 * n where n is order of the data
    signal input nameDelimiterIndex;    // index of the delimiter after which the name start
    signal input nameEndIndex;  // index of the last byte of the name

    signal output name;
    
    var nameMaxLength = nameMaxLength();
    var byteLength = nameMaxLength() + 1; // +1 for the delimiter
    
    // Shift the data to the right to until the name delimiter start
    component shifter = VarShiftLeft(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.shift <== nameDelimiterIndex; // We want delimiter to be the first byte
    shifter.len <== nameEndIndex - nameDelimiterIndex;
    shiftedBytes[byteLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of name field)
    shiftedBytes[0] === namePosition() * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    component outInt = Bytes2Ints(nameMaxLength);
    for (var i = 0; i < nameMaxLength; i ++) {
        outInt.bytes[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter

        // Assert that each value is less than 255
        // This will prevent two fields being merged by tampering with delimiterIndices input
        assert(shiftedBytes[i + 1] < 255);
    }

    name <== outInt.ints[0];
}

template QRDataExctractor(maxDataLength) {
    signal input data[maxDataLength];
    signal input delimitterIndices[16];

    signal output name;
    signal output dateOfBirth;
    signal output gender;

    // Create `nDelimitedData` - same as `data` but each delimiter replaces with n * 255
    // where n is the nth occurance of 255
    component is255[maxDataLength];
    signal nDelimitedData[maxDataLength];
    signal n255Filter[maxDataLength + 1];

    n255Filter[0] <== 0;
    for (var i = 0; i < maxDataLength; i++) {
        is255[i] = IsEqual();
        is255[i].in[0] <== 255;
        is255[i].in[1] <== data[i];

        n255Filter[i + 1] <== is255[i].out * 255 + n255Filter[i];
        nDelimitedData[i] <== is255[i].out * n255Filter[i] + data[i];
    }

    // Extract name
    var nameDelimiterIndex = nameDelimiterIndex();
    component nameExtractor = NameExtractor(maxDataLength);
    nameExtractor.nDelimitedData <== nDelimitedData;
    nameExtractor.nameDelimiterIndex <== delimitterIndices[nameDelimiterIndex];
    nameExtractor.nameEndIndex <== delimitterIndices[nameDelimiterIndex + 1];
    name <== nameExtractor.name;

   
    // Extract date of birth
    var dobDelimiterIndex = dobDelimiterIndex();
    signal dobBytes[10] <== ExtractDataAtDelimiter(maxDataLength, 10)(nDelimitedData, dobDelimiterIndex, delimitterIndices[dobDelimiterIndex], delimitterIndices[dobDelimiterIndex + 1]);
    
    // Convert dod bytes to unix timestamp
    component dobToUnixTime = DateStringToTimestamp(2030, 0, 0, 0);
    dobToUnixTime.in[0] <== dobBytes[6];
    dobToUnixTime.in[1] <== dobBytes[7];
    dobToUnixTime.in[2] <== dobBytes[8];
    dobToUnixTime.in[3] <== dobBytes[9];
    dobToUnixTime.in[4] <== dobBytes[3];
    dobToUnixTime.in[5] <== dobBytes[4];
    dobToUnixTime.in[6] <== dobBytes[0];
    dobToUnixTime.in[7] <== dobBytes[1];
    dateOfBirth <== dobToUnixTime.out;

    component genderSelector = QuinSelector(maxDataLength, 16);
    genderSelector.in <== data;
    genderSelector.index <== delimitterIndices[genderDelimiterIndex()];
    gender <== genderSelector.out;
}