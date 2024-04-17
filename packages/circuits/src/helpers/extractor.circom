pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "../helpers/constants.circom";
include "../utils/pack.circom";



/// @title ExtractAndPackAsInt
/// @notice Helper function to exract data at a position to a single int (assumes data is less than 31 bytes)
/// @dev This is only used for state now; but can work for district, name, etc if needed
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

    var extractMaxLength = maxFieldByteSize(); // Packing data only as a single int
    var byteLength = extractMaxLength + 1;
    
    // Shift the data to the right till the the delimiter start
    component shifter = SelectSubArray(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== endDelimiterIndex - startDelimiterIndex;
    signal shiftedBytes[byteLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of the field)
    shiftedBytes[0] === extractPosition * 255;

    // Assert that last byte is the delimiter (255 * (position of the field + 1))
    component endDelimiterSelector = ItemAtIndex(maxDataLength);
    endDelimiterSelector.in <== nDelimitedData;
    endDelimiterSelector.index <== endDelimiterIndex;
    endDelimiterSelector.out === (extractPosition + 1) * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    component outInt = PackBytes(extractMaxLength);
    for (var i = 0; i < extractMaxLength; i ++) {
        outInt.in[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter

        // Assert that each value is less than 255 - ensures no delimiter in between
        assert(shiftedBytes[i + 1] < 255);
    }

    out <== outInt.out[0];
}


/// @title TimetampExtractor
/// @notice Extracts the timetamp when the QR was signed rounded to nearest hour
/// @dev We ignore minutes and seconds to avoid identifying the user based on the precise timestamp
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @output timestamp - Unix timestamp on signature
/// @output year - Year of the signature
/// @output month - Month of the signature
/// @output day - Day of the signature
template TimetampExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];

    signal output timestamp;
    signal output year <== DigitBytesToInt(4)([nDelimitedData[9], nDelimitedData[10], nDelimitedData[11], nDelimitedData[12]]);
    signal output month <== DigitBytesToInt(2)([nDelimitedData[13], nDelimitedData[14]]);
    signal output day <== DigitBytesToInt(2)([nDelimitedData[15], nDelimitedData[16]]);
    signal hour <== DigitBytesToInt(2)([nDelimitedData[17], nDelimitedData[18]]);

    component dateToUnixTime = DigitBytesToTimestamp(2032);
    dateToUnixTime.year <== year;
    dateToUnixTime.month <== month;
    dateToUnixTime.day <== day;
    dateToUnixTime.hour <== hour;
    dateToUnixTime.minute <== 0;
    dateToUnixTime.second <== 0;

    timestamp <== dateToUnixTime.out - 19800; // 19800 is the offset for IST
}


/// @title AgeExtractor 
/// @notice Extract date of birth from the Aadhaar QR data and returns as Unix timestamp
/// @notice The timestamp will correspond to 00:00 of the date in IST timezone
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after which the date of birth start
/// @input endDelimiterIndex - index of the delimiter up to which the date of birth is present
/// @output out - Unix timestamp representing the date of birth
template AgeExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;
    signal input currentYear;
    signal input currentMonth;
    signal input currentDay;

    signal output out;
    
    var dobDelimiterIndex = dobPosition();
    var byteLength = 10 + 2; // DD-MM-YYYY + 2 delimiter

    component shifter = SelectSubArray(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== startDelimiterIndex + 10;

    signal shiftedBytes[byteLength] <== shifter.out;

    // Assert delimiters around the data is correct
    shiftedBytes[0] === dobPosition() * 255;
    shiftedBytes[11] === (dobPosition() + 1) * 255;

    // Convert DOB bytes to unix timestamp. 
    // Get year, month, name as ints (DD-MM-YYYY format and starts from shiftedBytes[0])
    signal year <== DigitBytesToInt(4)([shiftedBytes[7], shiftedBytes[8], shiftedBytes[9], shiftedBytes[10]]);
    signal month <== DigitBytesToInt(2)([shiftedBytes[4], shiftedBytes[5]]);
    signal day <== DigitBytesToInt(2)([shiftedBytes[1], shiftedBytes[2]]);

    // Completed age based on year value
    signal ageByYear <== currentYear - year - 1;

    // +1 if month and day is greater than or equal to the current month and day
    component monthGt = GreaterThan(4);
    monthGt.in[0] <== currentMonth + 1;
    monthGt.in[1] <== month;

    component dayGt = GreaterThan(5);
    dayGt.in[0] <== currentDay + 1;
    dayGt.in[1] <== day;

    out <== ageByYear + monthGt.out + dayGt.out;
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
    component startDelimiterSelector = ItemAtIndex(maxDataLength);
    startDelimiterSelector.in <== nDelimitedData;
    startDelimiterSelector.index <== startDelimiterIndex;
    startDelimiterSelector.out === genderPosition() * 255;

    // Assert end delimiter value
    component endDelimiterSelector = ItemAtIndex(maxDataLength);
    endDelimiterSelector.in <== nDelimitedData;
    endDelimiterSelector.index <== startDelimiterIndex + 2;
    endDelimiterSelector.out === (genderPosition() + 1) * 255;

    // Get gender byte
    component genderSelector = ItemAtIndex(maxDataLength);
    genderSelector.in <== nDelimitedData;
    genderSelector.index <== startDelimiterIndex + 1;
    out <== genderSelector.out;

    assert(out < 255);
}

/// @title PinCodeExtractor
/// @notice Extracts the pin code from the Aadhaar QR data
/// @input nDelimitedData[maxDataLength] - QR data where each delimiter is 255 * n where n is order of the data
/// @input startDelimiterIndex - index of the delimiter after which the pin code start
/// @input endDelimiterIndex - index of the delimiter up to which the pin code is present
/// @output out - pincode as integer
template PinCodeExtractor(maxDataLength) {
    signal input nDelimitedData[maxDataLength];
    signal input startDelimiterIndex;
    signal input endDelimiterIndex;

    signal output out;

    var pinCodeMaxLength = 6;
    var byteLength = pinCodeMaxLength + 2; // 2 delimiters

    component shifter = SelectSubArray(maxDataLength, byteLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex;
    shifter.length <== endDelimiterIndex - startDelimiterIndex + 1;

    signal shiftedBytes[byteLength] <== shifter.out;

    // Assert delimiters around the data is correct
    shiftedBytes[0] === pinCodePosition() * 255;
    shiftedBytes[7] === (pinCodePosition() + 1) * 255;

    out <== DigitBytesToInt(6)([shiftedBytes[1], shiftedBytes[2], shiftedBytes[3], shiftedBytes[4], shiftedBytes[5], shiftedBytes[6]]);
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
    component shifter = SelectSubArray(maxDataLength, bytesLength);
    shifter.in <== nDelimitedData;
    shifter.startIndex <== startDelimiterIndex; // We want delimiter to be the first byte
    shifter.length <== endIndex - startDelimiterIndex + 1;
    
    signal shiftedBytes[bytesLength] <== shifter.out;
    
    // Assert that the first byte is the delimiter (255 * position of name field)
    shiftedBytes[0] === photoPosition() * 255;

    // Pack byte[] to int[] where int is field element which take up to 31 bytes
    // When packing like this the trailing 0s in each chunk would be removed as they are LSB
    // This is ok for being used in nullifiers as the behaviour would be consistent
    component outInt = PackBytes(photoMaxLength);
    for (var i = 0; i < photoMaxLength; i ++) {
        outInt.in[i] <== shiftedBytes[i + 1]; // +1 to skip the delimiter
    }

    out <== outInt.out;
}


/// @title QRDataExtractor
/// @notice Extracts the name, date, gender, photo from the Aadhaar QR data
/// @input data[maxDataLength] - QR data without the signature padded
/// @input dataLength - Length of the padded QR data
/// @input nonPaddedDataLength - Length of the non-padded QR data
/// @input delimiterIndices[17] - Indices of the delimiters in the QR data
/// @output name - single field (int) element representing the name in little endian order
/// @output age - Unix timestamp representing the date of birth
/// @output gender - Single byte number representing gender
/// @output photo - Photo of the user
template QRDataExtractor(maxDataLength) {
    signal input data[maxDataLength];
    signal input nonPaddedDataLength;
    signal input delimiterIndices[18];

    // signal output name;
    signal output timestamp;
    signal output ageAbove18;
    signal output gender;
    signal output state;
    signal output pinCode;
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
    timestamp <== timestampExtractor.timestamp;
   
    // Extract age - and calculate if above 18
    // We use the year, month, day from the timestamp to calculate the age
    // This wont be precise but avoid the need for additional `currentTime` input
    // User can generate fresh QR for accuracy if needed (on their 18th birthday)
    component ageExtractor = AgeExtractor(maxDataLength);
    ageExtractor.nDelimitedData <== nDelimitedData;
    ageExtractor.startDelimiterIndex <== delimiterIndices[dobPosition() - 1];
    ageExtractor.currentYear <== timestampExtractor.year;
    ageExtractor.currentMonth <== timestampExtractor.month;
    ageExtractor.currentDay <== timestampExtractor.day;
    
    component ageAbove18Checker = GreaterThan(8);
    ageAbove18Checker.in[0] <== ageExtractor.out;
    ageAbove18Checker.in[1] <== 18;
    ageAbove18 <== ageAbove18Checker.out;

    // Extract gender
    component genderExtractor = GenderExtractor(maxDataLength);
    genderExtractor.nDelimitedData <== nDelimitedData;
    genderExtractor.startDelimiterIndex <== delimiterIndices[genderPosition() - 1];
    gender <== genderExtractor.out;

    // Extract state
    component stateExtractor = ExtractAndPackAsInt(maxDataLength, statePosition());
    stateExtractor.nDelimitedData <== nDelimitedData;
    stateExtractor.delimiterIndices <== delimiterIndices;
    state <== stateExtractor.out;

    // Extract PIN code
    component pinCodeExtractor = PinCodeExtractor(maxDataLength);
    pinCodeExtractor.nDelimitedData <== nDelimitedData;
    pinCodeExtractor.startDelimiterIndex <== delimiterIndices[pinCodePosition() - 1];
    pinCodeExtractor.endDelimiterIndex <== delimiterIndices[pinCodePosition()];
    pinCode <== pinCodeExtractor.out;

    // Extract photo
    component photoExtractor = PhotoExtractor(maxDataLength);
    photoExtractor.nDelimitedData <== nDelimitedData;
    photoExtractor.startDelimiterIndex <== delimiterIndices[photoPosition() - 1];
    photoExtractor.endIndex <== nonPaddedDataLength - 1;
    photo <== photoExtractor.out;

    // TODO: We might be able to optimize the extraction by left shifting data to delimiter
    // before DOB (rotating data and not seting remamining to 0 like in VarShiftLeft), 
    // and then extracting DOB, gender simply by using indices
    // Pincode also only needs shift (without setting remaining to 0) as size is fixed
}
