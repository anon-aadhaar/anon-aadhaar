pragma circom 2.1.9;


function referenceIdPosition() {
  return 2 - 1;
}

// Position/order (not index) of name field in the data
// i.e, name bytes will appear after 3rd 255
function namePosition() {
  return 3 - 1;
}

function dobPosition() {
  return 4 - 1;
}

function genderPosition() {
  return 5 - 1;
}

function pinCodePosition() {
  return 11 - 1;
}

function statePosition() {
  return 13 - 1;
}

function photoPosition() {
  return 18 - 1 - 1;
}

function maxFieldByteSize() {
  return 31;
}

// Number of int chunks to pack the photo to
// Photo can only be of max 32  * 31 bytes (packSize * fieldByteSize)
function photoPackSize() {
  return 32;
}
