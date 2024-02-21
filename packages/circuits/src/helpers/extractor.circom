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

template QRDataExctractor(maxLen) {
    signal input data[maxLen];
    signal input delimitterIndices[16];

    signal output name;
    signal output dateOfBirth;
    signal output gender;

    component is255[maxLen];
    for (var i = 0; i < maxLen; i++) {
        is255[i] = IsEqual();
        is255[i].in[0] <== 255;
        is255[i].in[1] <== data[i];
    }

    signal dataDelimiterN255[maxLen];
    signal n255Filter[maxLen + 1];
    n255Filter[0] <== 0;
    for (var i = 0; i < maxLen; i++) {
        n255Filter[i + 1] <== is255[i].out * 255 + n255Filter[i];
        dataDelimiterN255[i] <== is255[i].out * n255Filter[i] + data[i];
    }

    var nameDelimiterIndex = nameDelimiterIndex();
    signal nameBytes[31] <== ExtractDataAtDelimiter(maxLen, 31)(dataDelimiterN255, nameDelimiterIndex, delimitterIndices[nameDelimiterIndex], delimitterIndices[nameDelimiterIndex + 1]);
    component outInt = Bytes2Ints(31);
    for (var i = 0; i < 31; i ++) {
        outInt.bytes[i] <== nameBytes[i];
    }
    name <== outInt.ints[0];

    var dobDelimiterIndex = dobDelimiterIndex();
    signal dobBytes[10] <== ExtractDataAtDelimiter(maxLen, 10)(dataDelimiterN255, dobDelimiterIndex, delimitterIndices[dobDelimiterIndex], delimitterIndices[dobDelimiterIndex + 1]);
    
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

    component genderSelector = QuinSelector(maxLen, 16);
    genderSelector.in <== data;
    genderSelector.index <== delimitterIndices[genderDelimiterIndex()];
    gender <== genderSelector.out;
}