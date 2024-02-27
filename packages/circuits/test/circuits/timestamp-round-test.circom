pragma circom 2.1.6; 

include "../../src/helpers/timestamp.circom";

component main = DigitBytesToTimestamp(2032, 1, 0, 0); // Doesn't include minutes or seconds
