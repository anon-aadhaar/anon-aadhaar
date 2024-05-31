# @anon-aadhaar/core

## About

**Anon Aadhaar Core** is the cornerstone of the Anon Aadhaar protocol, encompassing all essential TypeScript components needed to interact with our cryptographic circuits. At its heart lies the innovative **PCD framework from [Zupass](https://github.com/proofcarryingdata/zupass)**, which we leverage for structure and typings.

### Key Features:

- **Interface of our Circuits:** Directly interfaces with the Anon Aadhaar Circom circuits.
- **Use of PCD Framework:** Utilizes the PCD framework from Zupass for robust data processing.

## AnonAadhaarCorePackage

The heart of this module is the `AnonAadhaarCorePackage`, exported from `src/core.ts`. This package provides a comprehensive suite of methods to interact with the Anon Aadhaar protocol:

### Methods

- **prove**
  - **Description:** Generates a SNARK proof for the given arguments.
  - **Usage:** `prove(args: AnonAadhaarArgs): Promise<AnonAadhaarCore>`
- **init**
  - **Description:** Initializes the Core package with necessary parameters.
  - **Usage:** `init(args: InitArgs): Promise<void>`
- **verify**
  - **Description:** Verifies the provided AnonAadhaarCore proof.
  - **Usage:** `verify(pcd: AnonAadhaarCore): Promise<boolean>`
- **serialize**
  - **Description:** Serializes the Anon Aadhaar core object for storage or transmission.
  - **Usage:** `serialize(pcd: AnonAadhaarCore): Promise<SerializedPCD<AnonAadhaarCore>>`
- **deserialize**
  - **Description:** Deserializes a string back into an Anon Aadhaar core object.
  - **Usage:** `deserialize(serialized: string): Promise<AnonAadhaarCore>`

The core package also provides helper methods such as:

- **generateArgs**
  - **Description:** Generates the arguments to generate a proof, from the scanned QR data and the corresponding certificate file.
  - **Usage:** `generateArgs(qrData: string,certificateFile: string,nullifierSeed: number,signal: string): Promise<AnonAadhaarCore>`
- **hash**
  - **Description:** Hash the signal and make sure that the output is compatible with the SNARK field.
  - **Usage:** `hash(message: BytesLike | Hexable | number | bigint): NumericString`

## 📜 Installation and Setup

```bash
yarn add @anon-aadhaar/core
```

To learn more about how to use the core package in your apps, you can check the [`@anon-aadhaar/react`](../react/) implementation.
