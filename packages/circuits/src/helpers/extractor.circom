pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "../helpers/constants.circom";
include "../utils/array.circom";
include "../utils/pack.circom";



/// @title ExtractAndPackAsInt
/// @notice Helper function to exract data at a position to a single int (assumes data is less than 31 bytes)
/// @param maxDataLength - Maximum length of the data
/// @param extractPosition - Position of the data to extract (after which delimiter does the data start)
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input delimiterIndices - indices of the delimiters in the QR data
/// @output out - single field (int) element representing the data in little endian order (reverse string when decoded)
template ExtractAndPackAsInt(maxDataLength, extractPosition) {
    signal input nDelimitedData[maxDataLength];
    signal input delimiterIndices[18];

    signal output out;
    
    signal startDelimiterIndex <== delimiterIndices[extractPosition - 1];
    signal endDelimiterIndex <== delimiterIndices[extractPosition];

    var extractMaxLength = maxFieldByteSize(); // Packing data only a single int
    var byteLength = extractMaxLength + 1;
    
    // Shift the data to the right to until the the delimiter start
    component shifter = SubarraySelector(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== endDelimiterIndex - startDelimiterIndex;
    signal shiftedBytes[byteLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of the field)
    shiftedBytes[0] === extractPosition * 255;

    // Assert that last byte is the delimiter (255 * (position of the field + 1))
    component endDelimiterSelector = ArraySelector(maxDataLength, 16);
    endDelimiterSelector.in <== nDelimitedData;
    endDelimiterSelector.index <== endDelimiterIndex;
    endDelimiterSelector.out === (extractPosition + 1) * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    component outInt = BytesToIntChunks(extractMaxLength);
    for (var i = 0; i < extractMaxLength; i ++) {
        outInt.bytes[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter

        // Assert that each value is less than 255 - ensures no delimiter in between
        assert(shiftedBytes[i + 1] < 255);
    }

    out <== outInt.ints[0];
}


/// @title TimetampExtractor
/// @notice Extracts the timetamp when the QR was signed
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @output out - Unix timestamp on signature
template TimetampExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];

    signal output out;

    // Extract the out rounded to nearest hour
    component dateToUnixTime = DigitBytesToTimestamp(2030, 1, 0, 0);
    for (var i = 0; i < 10; i++) {
        dateToUnixTime.in[i] <== nDelimitedData[i + 9];
    }
    out <== dateToUnixTime.out - 19800; // 19800 is the offset for IST
}


/// @title DOBExtractor 
/// @notice Extract date of birth from the Aadhaar QR data and returns as Unix timestamp
/// @notice The timestamp will correspond to 00:00 of the date in IST timezone
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
    // DD-MM-YYYY to YYYYMMDD input
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
    
    out <== dobToUnixTime.out + 19800; // 19800 is the offset for IST
}


/// @title GenderExtractor
/// @notice Extracts the Gender from the Aadhaar QR data and returns as Unix timestamp
/// @dev Not reusing ExtractAndPackAsInt as the output is a single byte and its cheaper this way
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
/// @dev Not reusing ExtractAndPackAsInt as there is no endDelimiter (photo is last item)
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after which the photo start
/// @input endIndex - index of the last byte of the photo
/// @output out - int[33] representing the photo in little endian order
template PhotoExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;
    signal input endIndex;

    signal output out[photoPackSize()];
    
    var photoMaxLength = photoPackSize() * maxFieldByteSize();
    var bytesLength = photoMaxLength + 1;

    // Shift the data to the right to until the photo index
    component shifter = SubarraySelector(maxDataLength, bytesLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== endIndex - startDelimiterIndex + 1;
    
    signal shiftedBytes[bytesLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of name field)
    shiftedBytes[0] === photoPosition() * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    // When packing like this the trailing 0s in each chunk would be removed as they are LSB
    // This is ok for being used in nullifiers as the behaviour would be consistent
    component outInt = BytesToIntChunks(photoMaxLength);
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

    // signal output name;
    signal output timestamp;
    signal output dateOfBirth;
    signal output gender;
    signal output district;
    signal output state;
    signal output photo[photoPackSize()];

    // Create `nDelimitedData` - same as `data` but each delimiter is replaced with n * 255
    // where n means the nth occurance of 255
    // This is to verify `delimiterIndices` is correctly set for each extraction
    component is255[maxDataLength];
    component indexBeforePhoto[maxDataLength];
    signal is255AndIndexBeforePhoto[maxDataLength];
    signal nDelimitedData[maxDataLength];
    signal n255Filter[maxDataLength + 1];
    n255Filter[0] <== 0;
    for (var i = 0; i < maxDataLength; i++) {
        is255[i] = IsEqual();
        is255[i].in[0] <== 255;
        is255[i].in[1] <== data[i];

        indexBeforePhoto[i] = LessThan(12);
        indexBeforePhoto[i].in[0] <== i;
        indexBeforePhoto[i].in[1] <== delimiterIndices[photoPosition() - 1] + 1;

        is255AndIndexBeforePhoto[i] <== is255[i].out * indexBeforePhoto[i].out;

        // Each value is n * 255 where n the count of 255s before it
        n255Filter[i + 1] <== is255AndIndexBeforePhoto[i] * 255 + n255Filter[i];

        nDelimitedData[i] <== is255AndIndexBeforePhoto[i] * n255Filter[i] + data[i];
    }

    // Extract timestamp
    component timestampExtractor = TimetampExtractor(maxDataLength);
    timestampExtractor.nDelimitedData <== nDelimitedData;
    timestamp <== timestampExtractor.out;
   
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

    // Extract disctrict
    component districtExtractor = ExtractAndPackAsInt(maxDataLength, districtPosition());
    districtExtractor.nDelimitedData <== nDelimitedData;
    districtExtractor.delimiterIndices <== delimiterIndices;
    district <== districtExtractor.out;

    // Extract state
    component stateExtractor = ExtractAndPackAsInt(maxDataLength, statePosition());
    stateExtractor.nDelimitedData <== nDelimitedData;
    stateExtractor.delimiterIndices <== delimiterIndices;
    state <== stateExtractor.out;

    // Extract photo
    component photoExtractor = PhotoExtractor(maxDataLength);
    photoExtractor.nDelimitedData <== nDelimitedData;
    photoExtractor.startDelimiterIndex <== delimiterIndices[photoPosition() - 1];
    photoExtractor.endIndex <== nonPaddedDataLength - 1;
    photo <== photoExtractor.out;
}
