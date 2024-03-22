pragma circom 2.1.6;

/**
Aadhar QR code data schema (V2)

- Delimiter is 255.
- Before first delimiter, there are two bytes representing the version. This should be [86, 50] (V2)
- From then on, each field is separated by the delimiter. There are total of 16 fields.
  1 (data after first 255). Email_mobile_present_bit_indicator_value (can be 0 or 1 or 2 or 3): 
      0: indicates no mobile/email present in secure qr code. 
      1: indicates only email present in secure qr code. 
      2: indicates only mobile present in secure qr code 
      3: indicates both mobile and email present in secure qr code.
  2. Reference ID
  3. Name
  4. Date of Birth
  5. Gender
  6. Address > Care of
  7. Address > District
  8. Address > Landmark
  9. Address > House
  10. Address > Location
  11. Address > Pin code
  12. Address > Post office
  13. Address > State
  14. Address > Street
  15. Address > Sub district
  16. VTC
  17. Last 4 digits of mobile number
  18. The data after 18th 255 till end (-256 ofthe signature) it the photo.

- Last 256 bytes is the signature.

- TODO: Find out if there is any different for people who has not verified mobile number.
**/


function referenceIdPosition() {
  return 2;
}

// Position/order (not index) of name field in the data
// i.e, name bytes will appear after 3rd 255
function namePosition() {
  return 3;
}

function dobPosition() {
  return 4;
}

function genderPosition() {
  return 5;
}

function pinCodePosition() {
  return 11;
}

function statePosition() {
  return 13;
}

function photoPosition() {
  return 18;
}

function maxFieldByteSize() {
  return 31;
}

// Number of int chunks to pack the photo to
// Photo can only be of max 32  * 31 bytes (packSize * fieldByteSize)
function photoPackSize() {
  return 32;
}
