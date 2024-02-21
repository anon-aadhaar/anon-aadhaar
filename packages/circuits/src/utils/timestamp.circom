pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";

template DigitsToNumber(length) {
    signal input in[length];
    signal output out;

    signal sum[length + 1];
    sum[0] <== 0;

    for (var i = 1; i <= length; i++) {
        sum[i] <== sum[i - 1] * 10 + (in[i - 1] - 48);
    }

    out <== sum[length];
}

// Converts a date string of format YYYYMMDDHHMMSS to a unix time
// Assumes the input time is in UTC
// includeHours - 1 to include hours, 0 to round down to day
// includeMinutes - 1 to include minutes, 0 to round down to hour
// includeSeconds - 1 to include seconds, 0 to round down to minute
template DateStringToTimestamp(maxYears, includeHours, includeMinutes, includeSeconds) {
    var inputLength = 8;
    if (includeHours == 1) {
        inputLength += 2;
    }
    if (includeMinutes == 1) {
        inputLength += 2;
    }
    if (includeSeconds == 1) {
        inputLength += 2;
    }

    signal input in[inputLength];
    signal output out;

    signal daysTillPreviousMonth[12] <== [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    component yearNum = DigitsToNumber(4);
    yearNum.in <== [in[0], in[1], in[2], in[3]];
    signal year <== yearNum.out;

    component monthNum = DigitsToNumber(2);
    monthNum.in <== [in[4], in[5]];
    signal month <== monthNum.out;

    component dayNum = DigitsToNumber(2);
    dayNum.in <== [in[6], in[7]];
    signal day <== dayNum.out;

    assert(year >= 1970);
    assert(year <= maxYears);

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
        component hoursNum = DigitsToNumber(2);
        hoursNum.in <== [in[8], in[9]];
        secondsPassed[1] <== hoursNum.out * 3600;
    } else {
        secondsPassed[1] <== 0;
    }

    if (includeMinutes == 1) {
        component minutesNum = DigitsToNumber(2);
        minutesNum.in <== [in[10], in[11]];
        secondsPassed[2] <== minutesNum.out * 60;
    } else {
        secondsPassed[2] <== 0;
    }

    if (includeSeconds == 1) {
        component secondsNum = DigitsToNumber(2);
        secondsNum.in <== [in[12], in[13]];
        secondsPassed[3] <== secondsNum.out;
    } else {
        secondsPassed[3] <== 0;
    }

    out <== secondsPassed[0] + secondsPassed[1] + secondsPassed[2] + secondsPassed[3];
}
