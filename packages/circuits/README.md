# @anon-aadhaar/circuits

These package contains all the circuits and setup that are the core of the Anon Aadhaar protocol.

## Structure

The main logic of the protocol is contained in:

- `src/aadhaar-verifier.circom`: This is the main circuit that encapsulates the core logic of the Anon Aadhaar protocol. It handles the verification process and ensures the integrity and confidentiality of Aadhaar data.

- `src/extractor.circom`: This circuit is responsible for securely extracting and processing relevant information from Aadhaar data.

The circuits in charge of the Sha256 and RSA verification are adapted from the [zk-email](https://github.com/zkemail/zk-email-verify/tree/bd4e2412735c09499df93d17cf3180b65711483f) project. We extend our gratitude to zkemail for their exceptional work in this domain.

## 📜 Installation and Setup

### Installation

```bash
yarn dev-install
```

### Run the trusted setup for Aadhaar QR code V2

```bash
yarn dev-setup
```

### Run the development trusted setup for Aadhaar QR code V1

It's the one used inside of this repo to run the CI/CD with the test data provided by UIDAI

```bash
yarn dev-setup-test
```

### Generate a proof from snarkjs CLI

```bash
yarn gen-proof
```

### Verify a proof from snarkjs CLI

```bash
yarn verif-proof
```

### Generate a witness from snarkjs CLI

```bash
yarn gen-witness
```
