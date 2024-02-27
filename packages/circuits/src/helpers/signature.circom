pragma circom 2.1.6;

include "./rsa/rsa.circom";
include "./rsa/sha.circom";


/// @title SignatureVerifier
/// @notice Verifies Aadhaar signature
/// @input appId The application id
/// @input last4Digits The last 4 digits of the Aadhaar number
/// @input name The name of the user
/// @input dateOfBirth The date of birth of the user
/// @input gender Gender of the user
/// @output userNullifier hash(photo)
template SignatureVerifier(n, k, maxDataLength) {
  signal input qrDataPadded[maxDataLength];
  signal input qrDataPaddedLength;
  signal input signature[k];
  signal input pubKey[k];

  // Hash the data and verify RSA signature - 917344 constraints
  component shaHasher = Sha256Bytes(maxDataLength);
  shaHasher.in_padded <== qrDataPadded;
  shaHasher.in_len_padded_bytes <== qrDataPaddedLength;
  signal sha[256];
  sha <== shaHasher.out;
  
  component rsa = RSAVerify65537(n, k);
  var rsaMsgLength = (256 + n) \ n;
  component rsaBaseMsg[rsaMsgLength];
  for (var i = 0; i < rsaMsgLength; i++) {
      rsaBaseMsg[i] = Bits2Num(n);
  }
  for (var i = 0; i < 256; i++) {
      rsaBaseMsg[i \ n].in[i % n] <== sha[255 - i];
  }
  for (var i = 256; i < n * rsaMsgLength; i++) {
      rsaBaseMsg[i \ n].in[i % n] <== 0;
  }

  for (var i = 0; i < rsaMsgLength; i++) {
      rsa.base_message[i] <== rsaBaseMsg[i].out;
  }
  for (var i = rsaMsgLength; i < k; i++) {
      rsa.base_message[i] <== 0;
  }

  for (var i = 0; i < k; i++) {
      rsa.modulus[i] <== pubKey[i];
      rsa.signature[i] <== signature[i];
  }
  
}
