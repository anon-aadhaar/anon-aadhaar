pragma circom 2.1.6; 

include "../../helpers/timestamp.circom";

component main = DateStringToTimestamp(2032, 1, 0, 0); // Doesn't include minutes or seconds
