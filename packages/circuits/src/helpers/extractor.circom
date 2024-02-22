pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "../helpers/constants.circom";
include "../utils/timestamp.circom";
include "../utils/utils.circom";
include "../utils/shift.circom";
include "../utils/pack.circom";


/// @title NameExtractor
/// @notice Extracts the name from the Aadhaar QR data and return a single number representing name
/// @notice Assumes that name can fit in 31 bytes
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after which the name start
/// @input endDelimiterIndex - index of the delimiter up to which the name is present
/// @output name - single field (int) element representing the name in little endian order
template NameExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;
    signal input endDelimiterIndex;

    signal output out;
    
    var nameMaxLength = nameMaxLength();
    var byteLength = nameMaxLength() + 1;
    
    // Shift the data to the right to until the name delimiter start
    component shifter = VarShiftLeft(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.shift <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.len <== endDelimiterIndex - startDelimiterIndex;
    
    signal shiftedBytes[byteLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of name field)
    shiftedBytes[0] === namePosition() * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    component outInt = Bytes2Ints(nameMaxLength);
    for (var i = 0; i < nameMaxLength; i ++) {
        outInt.bytes[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter

        // Assert that each value is less than 255 - ensures no delimiter in between
        assert(shiftedBytes[i + 1] < 255);
    }

    out <== outInt.ints[0];
}


/// @title DOBExtractor 
/// @notice Extract date of birth from the Aadhaar QR data and returns as Unix timestamp
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after which the date of birth start
/// @input endDelimiterIndex - index of the delimiter up to which the date of birth is present
/// @output out - Unix timestamp representing the date of birth
template DOBExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;

    signal output out;
    
    var dobDelimiterIndex = dobPosition();
    var byteLength = 10 + 1; // DD-MM-YYYY + delimiter

    component shifter = VarShiftLeft(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.shift <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.len <== startDelimiterIndex + 10;

    signal shiftedBytes[byteLength] <== shifter.out;

    shiftedBytes[0] === dobPosition() * 255;

    // Convert DOB bytes to unix timestamp. 
    // DD-MM-YYYY to YYYYMMDD input
    component dobToUnixTime = DateStringToTimestamp(2030, 0, 0, 0);
    dobToUnixTime.in[0] <== shiftedBytes[6];
    dobToUnixTime.in[1] <== shiftedBytes[7];
    dobToUnixTime.in[2] <== shiftedBytes[8];
    dobToUnixTime.in[3] <== shiftedBytes[9];
    dobToUnixTime.in[4] <== shiftedBytes[3];
    dobToUnixTime.in[5] <== shiftedBytes[4];
    dobToUnixTime.in[6] <== shiftedBytes[0];
    dobToUnixTime.in[7] <== shiftedBytes[1];
    
    out <== dobToUnixTime.out;
}


/// @title GenderExtractor
/// @notice Extracts the DOB from the Aadhaar QR data and returns as Unix timestamp
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after
/// @output out Single byte number representing gender
template GenderExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;

    signal output out;

    component startDelimiterSelector = QuinSelector(maxDataLength, 16);
    startDelimiterSelector.in <== nDelimitedData;
    startDelimiterSelector.index <== startDelimiterIndex;

    // Assert delimiter value
    startDelimiterSelector.out === genderPosition() * 255;

    component genderSelector = QuinSelector(maxDataLength, 16);
    genderSelector.in <== nDelimitedData;
    genderSelector.index <== startDelimiterIndex + 1;
    out <== genderSelector.out;

    assert(out < 255);
}


/// @title PhotoExtractor
/// @notice Extracts the photo from the Aadhaar QR data
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after which the photo start
/// @input endIndex - index of the last byte of the photo
/// @output out - int[33] representing the photo in little endian order
template PhotoExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;
    signal input endIndex;

    signal output out[photoPackSize()];
    
    var photoMaxLength = photoMaxLength();
    var bytesLength = photoMaxLength() + 1;

    // Shift the data to the right to until the photo index
    component shifter = VarShiftLeft(maxDataLength, bytesLength);
    shifter.in <== nDelimitedData;
    shifter.shift <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.len <== endIndex - startDelimiterIndex + 1;
    
    signal shiftedBytes[bytesLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of name field)
    shiftedBytes[0] === photoPosition() * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    component outInt = Bytes2Ints(photoMaxLength);
    for (var i = 0; i < photoMaxLength; i ++) {
        outInt.bytes[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter
    }

    out <== outInt.ints;
}


/// @title QRDataExtractor
/// @notice Extracts the name, date, gender, photo from the Aadhaar QR data
/// @input data[maxDataLength] - QR data without the signature
/// @input dataLength - Length of the QR data
/// @input delimitterIndices[17] - Indices of the delimiters in the QR data
/// @output name - single field (int) element representing the name in little endian order
/// @output dateOfBirth - Unix timestamp representing the date of birth
/// @output gender - Single byte number representing gender
/// @output photo - Photo of the user
template QRDataExtractor(maxDataLength) {
    signal input data[maxDataLength];
    signal input dataLength;
    signal input delimitterIndices[18];

    signal output name;
    signal output dateOfBirth;
    signal output gender;
    signal output photo[photoPackSize()];

    // Create `nDelimitedData` - same as `data` but each delimiter is replaced with n * 255
    // where n means the nth occurance of 255
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
    component nameExtractor = NameExtractor(maxDataLength);
    nameExtractor.nDelimitedData <== nDelimitedData;
    nameExtractor.startDelimiterIndex <== delimitterIndices[namePosition() - 1];
    nameExtractor.endDelimiterIndex <== delimitterIndices[namePosition()];
    name <== nameExtractor.out;
   
    // Extract date of birth
    component dobExtractor = DOBExtractor(maxDataLength);
    dobExtractor.nDelimitedData <== nDelimitedData;
    dobExtractor.startDelimiterIndex <== delimitterIndices[dobPosition() - 1];
    dateOfBirth <== dobExtractor.out;

    // Extract gender
    component genderExtractor = GenderExtractor(maxDataLength);
    genderExtractor.nDelimitedData <== nDelimitedData;
    genderExtractor.startDelimiterIndex <== delimitterIndices[genderPosition() - 1];
    gender <== genderExtractor.out;

    // Extract photo
    component photoExtractor = PhotoExtractor(maxDataLength);
    photoExtractor.nDelimitedData <== nDelimitedData;
    photoExtractor.startDelimiterIndex <== delimitterIndices[photoPosition() - 1];
    photoExtractor.endIndex <== dataLength - 1;
    photo <== photoExtractor.out;
}
