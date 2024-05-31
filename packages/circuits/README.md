# @anon-aadhaar/circuits

This package contains circom circuits for the Anon Aadhaar protocol.

## Structure

The main logic of the protocol is contained in:

- `src/aadhaar-verifier.circom`: `main` component that exports the AadhaarVerifier circuit.
- `src/aadhaar-qr-verifier.circom`: Primary circuit that handles inputs/outputs, and calls other components.
- `src/helpers/signature.circom`: Circuit that verifies the signature of the Aadhaar data.
- `src/helpers/extractor.circom`: Circuit that extracts the required information from the Aadhaar data.
- `src/helpers/nullifier.circom`: Circuit that generates the nullifier for the proof.


Main [README](../../README.md) contains more information on how to build and run the circuits locally.
