pragma circom 2.1.6;

include "circomlib/circuits/comparators.circom";

function numStringToNum(num) {
    return num - 48;
}

// Converts a date string of format YYYYMMDDHHMMSS to a unix time
// includeHours - 1 to include hours, 0 to round down to day
// includeMinutes - 1 to include minutes, 0 to round down to hour
// includeSeconds - 1 to include seconds, 0 to round down to minute
template DateStringToTimestamp(maxYears, includeHours, includeMinutes, includeSeconds) {
    signal input date[14];
    signal output timestamp;

    var daysTillPreviousMonth[12] =[0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    var year = numStringToNum(date[0]) * 1000 + numStringToNum(date[1]) * 100 + numStringToNum(date[2]) * 10 + numStringToNum(date[3]);
    var month = numStringToNum(date[4]) * 10 + numStringToNum(date[5]);
    var day = numStringToNum(date[6]) * 10 + numStringToNum(date[7]);

    assert(year >= 1970 && year <= maxYears);

    var daysPassed = (year - 1970) * 365 + day - 1;     // Add days till previous year + days since month start

    component isCurrentMonth[12];
    for (var i = 0; i < 12; i++) {
        isCurrentMonth[i] = IsEqual();
        isCurrentMonth[i].in[0] <== month - 1;
        isCurrentMonth[i].in[1] <== i;

        daysPassed += isCurrentMonth[i].out * daysTillPreviousMonth[i];     // Add days till previous month
    }

    var maxLeapYears = (maxYears - 1972) \ 4;   // 1972 is first leap year since epoch
    
    component isLeapYearCurrentYear[maxLeapYears];  // ith leap year is current year
    component isLeapYearLessThanCurrentYear[maxLeapYears];     // ith leap after 1970 is below current year
    var isCurrentYearLeap = 0;

    for (var i = 0; i < maxLeapYears; i++) {
        isLeapYearLessThanCurrentYear[i] = GreaterThan(8);
        isLeapYearLessThanCurrentYear[i].in[0] <== year - 1972;
        isLeapYearLessThanCurrentYear[i].in[1] <== i * 4;

        isLeapYearCurrentYear[i] = IsEqual();
        isLeapYearCurrentYear[i].in[0] <== year - 1972;
        isLeapYearCurrentYear[i].in[1] <== i * 4;

        daysPassed += isLeapYearLessThanCurrentYear[i].out;        // Add 1 day for each leap year
        isCurrentYearLeap += isLeapYearCurrentYear[i].out;      // Set to 1 (true) if current year is leap
    }

    component isCurrentMonthAfterFeb = GreaterThan(4);
    isCurrentMonthAfterFeb.in[0] <== month;
    isCurrentMonthAfterFeb.in[1] <== 2;

    daysPassed += isCurrentYearLeap * isCurrentMonthAfterFeb.out; // Add 1 days if current year is leap and date is after Feb

    var totalTime = daysPassed * 86400;

    if (includeHours == 1) {
        var hours = numStringToNum(date[8]) * 10 + numStringToNum(date[9]);
        totalTime += hours * 3600;
    }

    if (includeMinutes == 1) {
        var minutes = numStringToNum(date[10]) * 10 + numStringToNum(date[11]);
        totalTime += minutes * 60;
    }

    if (includeSeconds == 1) {
        var seconds = numStringToNum(date[12]) * 10 + numStringToNum(date[13]);
        totalTime += seconds;
    }

    timestamp <== totalTime;
}
