pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "../helpers/constants.circom";
include "../utils/array.circom";
include "../utils/pack.circom";


/// @title ReferenceIDExtractor
/// @notice Extracts the last four digits of the Aadhaar number and timestamp from the QR data
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @output last4Digits - single field (int) element representing the name in little endian order
/// @output timestamp - Unix timestamp on signature
template ReferenceIDExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];

    signal output last4Digits;
    signal output timestamp;
    
    component BytesToInts = BytesToInts(4);
    for (var i = 0; i < 4; i++) {
        BytesToInts.bytes[i] <== nDelimitedData[i + 3];
    }

    last4Digits <== BytesToInts.ints[0];

    // Extract the timestamp rounded to nearest hour
    component dateToUnixTime = DigitBytesToTimestamp(2030, 1, 0, 0);
    for (var i = 0; i < 10; i++) {
        dateToUnixTime.in[i] <== nDelimitedData[i + 9];
    }
    timestamp <== dateToUnixTime.out - 19800; // 19800 is the offset for IST
}


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
    component shifter = SubarraySelector(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== endDelimiterIndex - startDelimiterIndex;
    signal shiftedBytes[byteLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of name field)
    shiftedBytes[0] === namePosition() * 255;

    // Check that the last byte is the delimiter (255 * (position of name field + 1))
    // Note: This isn't really necessary as we are checking this in DOBExtractor (4624 constraints)
    component endDelimiterSelector = ArraySelector(maxDataLength, 16);
    endDelimiterSelector.in <== nDelimitedData;
    endDelimiterSelector.index <== endDelimiterIndex;
    endDelimiterSelector.out === (namePosition() + 1) * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    component outInt = BytesToInts(nameMaxLength);
    for (var i = 0; i < nameMaxLength; i ++) {
        outInt.bytes[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter

        // Assert that each value is less than 255 - ensures no delimiter in between
        assert(shiftedBytes[i + 1] < 255);
    }

    out <== outInt.ints[0];
}


/// @title DOBExtractor 
/// @notice Extract date of birth from the Aadhaar QR data and returns as Unix timestamp
/// @notice The timestamp will correspond to 00:00 of the date in UTC timezone
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after which the date of birth start
/// @input endDelimiterIndex - index of the delimiter up to which the date of birth is present
/// @output out - Unix timestamp representing the date of birth
template DOBExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;

    signal output out;
    
    var dobDelimiterIndex = dobPosition();
    var byteLength = 10 + 2; // DD-MM-YYYY + 2 delimiter

    component shifter = SubarraySelector(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== startDelimiterIndex + 10;

    signal shiftedBytes[byteLength] <== shifter.out;

    // Assert delimiters around the data is correct
    shiftedBytes[0] === dobPosition() * 255;
    shiftedBytes[11] === (dobPosition() + 1) * 255;

    // Convert DOB bytes to unix timestamp. 
    // 255DD-MM-YYYY to YYYYMMDD input
    // DigitBytesToTimestamp ensures all inputs are numeric values 
    component dobToUnixTime = DigitBytesToTimestamp(2030, 0, 0, 0);
    dobToUnixTime.in[0] <== shiftedBytes[7];
    dobToUnixTime.in[1] <== shiftedBytes[8];
    dobToUnixTime.in[2] <== shiftedBytes[9];
    dobToUnixTime.in[3] <== shiftedBytes[10];
    dobToUnixTime.in[4] <== shiftedBytes[4];
    dobToUnixTime.in[5] <== shiftedBytes[5];
    dobToUnixTime.in[6] <== shiftedBytes[1];
    dobToUnixTime.in[7] <== shiftedBytes[2];
    
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

    // Assert start delimiter value
    component startDelimiterSelector = ArraySelector(maxDataLength, 16);
    startDelimiterSelector.in <== nDelimitedData;
    startDelimiterSelector.index <== startDelimiterIndex;
    startDelimiterSelector.out === genderPosition() * 255;

    // Assert end delimiter value
    component endDelimiterSelector = ArraySelector(maxDataLength, 16);
    endDelimiterSelector.in <== nDelimitedData;
    endDelimiterSelector.index <== startDelimiterIndex + 2;
    endDelimiterSelector.out === (genderPosition() + 1) * 255;

    // Get gender byte
    component genderSelector = ArraySelector(maxDataLength, 16);
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
    component shifter = SubarraySelector(maxDataLength, bytesLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== endIndex - startDelimiterIndex + 1;
    
    signal shiftedBytes[bytesLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of name field)
    shiftedBytes[0] === photoPosition() * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    component outInt = BytesToInts(photoMaxLength);
    for (var i = 0; i < photoMaxLength; i ++) {
        outInt.bytes[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter
    }

    out <== outInt.ints;
}


/// @title QRDataExtractor
/// @notice Extracts the name, date, gender, photo from the Aadhaar QR data
/// @input data[maxDataLength] - QR data without the signature padded
/// @input dataLength - Length of the padded QR data
/// @input nonPaddedDataLength - Length of the non-padded QR data
/// @input delimiterIndices[17] - Indices of the delimiters in the QR data
/// @output name - single field (int) element representing the name in little endian order
/// @output dateOfBirth - Unix timestamp representing the date of birth
/// @output gender - Single byte number representing gender
/// @output photo - Photo of the user
template QRDataExtractor(maxDataLength) {
    signal input data[maxDataLength];
    signal input nonPaddedDataLength;
    signal input delimiterIndices[18];

    signal output last4Digits;
    signal output timestamp;
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

    // Extract last 4 digits of Aadhaar number and timestamp
    component refIDExtractor = ReferenceIDExtractor(maxDataLength);
    refIDExtractor.nDelimitedData <== nDelimitedData;
    last4Digits <== refIDExtractor.last4Digits;
    timestamp <== refIDExtractor.timestamp;

    // Extract name
    component nameExtractor = NameExtractor(maxDataLength);
    nameExtractor.nDelimitedData <== nDelimitedData;
    nameExtractor.startDelimiterIndex <== delimiterIndices[namePosition() - 1];
    nameExtractor.endDelimiterIndex <== delimiterIndices[namePosition()];
    name <== nameExtractor.out;
   
    // Extract date of birth
    component dobExtractor = DOBExtractor(maxDataLength);
    dobExtractor.nDelimitedData <== nDelimitedData;
    dobExtractor.startDelimiterIndex <== delimiterIndices[dobPosition() - 1];
    dateOfBirth <== dobExtractor.out;

    // Extract gender
    component genderExtractor = GenderExtractor(maxDataLength);
    genderExtractor.nDelimitedData <== nDelimitedData;
    genderExtractor.startDelimiterIndex <== delimiterIndices[genderPosition() - 1];
    gender <== genderExtractor.out;

    // Extract photo
    component photoExtractor = PhotoExtractor(maxDataLength);
    photoExtractor.nDelimitedData <== nDelimitedData;
    photoExtractor.startDelimiterIndex <== delimiterIndices[photoPosition() - 1];
    photoExtractor.endIndex <== nonPaddedDataLength - 1;
    photo <== photoExtractor.out;
}
