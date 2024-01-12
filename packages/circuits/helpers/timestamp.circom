pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";

function numStringToNum(num) {
    return num - 48;
}

// Converts a date string of format YYYYMMDDHHMMSS to a unix time
// Assumes the input time is in UTC
// includeHours - 1 to include hours, 0 to round down to day
// includeMinutes - 1 to include minutes, 0 to round down to hour
// includeSeconds - 1 to include seconds, 0 to round down to minute
template DateStringToTimestamp(maxYears, includeHours, includeMinutes, includeSeconds) {
    signal input in[14];
    signal output out;

    signal daysTillPreviousMonth[12] <== [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    var year = numStringToNum(in[0]) * 1000 + numStringToNum(in[1]) * 100 + numStringToNum(in[2]) * 10 + numStringToNum(in[3]);
    var month = numStringToNum(in[4]) * 10 + numStringToNum(in[5]);
    var day = numStringToNum(in[6]) * 10 + numStringToNum(in[7]);

    assert(year >= 1970 && year <= maxYears);

    var maxLeapYears = (maxYears - 1972) \ 4;   // 1972 is first leap year since epoch
    var arrLength = 14 + maxLeapYears + maxLeapYears;

    signal daysPassed[arrLength];
    daysPassed[0] <== (year - 1970) * 365;
    daysPassed[1] <== day - 1;

    component isCurrentMonth[12];
    for (var i = 0; i < 12; i++) {
        isCurrentMonth[i] = IsEqual();
        isCurrentMonth[i].in[0] <== month - 1;
        isCurrentMonth[i].in[1] <== i;

        daysPassed[i + 2] <== isCurrentMonth[i].out * daysTillPreviousMonth[i];     // Add days till previous month
    }
    
    component isLeapYearCurrentYear[maxLeapYears];  // ith leap year is current year
    component isLeapYearLessThanCurrentYear[maxLeapYears];     // ith leap after 1970 is below current year
    component isCurrentMonthAfterFeb[maxLeapYears];

    for (var i = 0; i < maxLeapYears; i++) {
        isLeapYearLessThanCurrentYear[i] = GreaterThan(8);
        isLeapYearLessThanCurrentYear[i].in[0] <== year - 1972;
        isLeapYearLessThanCurrentYear[i].in[1] <== i * 4;

        isLeapYearCurrentYear[i] = IsEqual();
        isLeapYearCurrentYear[i].in[0] <== year - 1972;
        isLeapYearCurrentYear[i].in[1] <== i * 4;

        daysPassed[14 + i] <== isLeapYearLessThanCurrentYear[i].out;        // Add 1 day for each leap year

        isCurrentMonthAfterFeb[i] = GreaterThan(4);
        isCurrentMonthAfterFeb[i].in[0] <== month;
        isCurrentMonthAfterFeb[i].in[1] <== 2;
        daysPassed[14 + maxLeapYears + i] <== isLeapYearCurrentYear[i].out * isCurrentMonthAfterFeb[i].out; // Add 1 days if current year is leap and date is after Feb
    }

    signal totalDaysPassed[arrLength];
    totalDaysPassed[0] <== daysPassed[0];
    for (var i = 1; i < arrLength; i++) {
        totalDaysPassed[i]  <== totalDaysPassed[i - 1] + daysPassed[i];
    }

    signal secondsPassed[4];
    secondsPassed[0] <== totalDaysPassed[arrLength -1] * 86400;

    if (includeHours == 1) {
        var hours = numStringToNum(in[8]) * 10 + numStringToNum(in[9]);
        secondsPassed[1] <== hours * 3600;
    } else {
        in[8] === 0;
        in[9] === 0;
        secondsPassed[1] <== 0;
    }

    if (includeMinutes == 1) {
        var minutes = numStringToNum(in[10]) * 10 + numStringToNum(in[11]);
        secondsPassed[2] <== minutes * 60;
    } else {
        in[10] === 0;
        in[11] === 0;
        secondsPassed[2] <== 0;
    }

    if (includeSeconds == 1) {
        var seconds = numStringToNum(in[12]) * 10 + numStringToNum(in[13]);
        secondsPassed[3] <== seconds;
    } else {
        in[12] === 0;
        in[13] === 0;
        secondsPassed[3] <== 0;
    }

    out <== secondsPassed[0] + secondsPassed[1] + secondsPassed[2] + secondsPassed[3];
}

// component main = DateStringToTimestamp(2032, 1, 1, 1);
