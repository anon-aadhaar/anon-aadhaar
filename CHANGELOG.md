## 2.4.0

- fix publickey hash values
- added pubkeyHash check as default in SDK
- switched useTestAadhaar to context based var

## 2.3.1

- update nullifier type to support bigint
- remove async for init()
- fix versionning bug

## 2.3.0

- custom test photo
- update contract tests to use mock time
- decode Reveal to UTF-8 Utility

## 2.2.3

- fix UI bug

## 2.2.2

- fix error in generateArgs, leading to missing public key
- added public key retrieving from data
- fix error component display

## 2.2.1

- added PEM certificates for both test and prod

## 2.0.6

- removed test var from context provider

## 2.0.5

- add new ui design of the proving modal

## 2.0.4

- bump @zk-email/helpers to solve pnpm and npm installing error

## 2.0.3

- fix timestamp in QR code generator (UTC to IST based)
- fix returned type in useProver hook
- fix generateArgs outputs

## 2.0.2

- fix timestamp in QR code generator

## 2.0.1

- Export components to generate test QR codes

## 2.0.0

- Introduce optimised circuits with around 1M constraints
- Adds selective disclosure on Age>18, Gender, State & Pincode
- Updates all the packages accordingly (react, contracts, core)

## 1.0.2

- Fix QR code verification state bug
- Manages multiple AnonAadhaarProofs
- Adds LaunchProveModal component that abstracts login flow with button custom styles
- Adds prover hook, to check prover state and latest proof
- Custom artifacts links

## 1.0.1

- Adds chunked prover, which enables caching the zkey in the browser

## 1.0.0

Check our blog-post to see specifications of this new version.
https://anon-aadhaar-documentation.vercel.app/blog/anon-aadhaar-v1-release

## 0.1.15

- Fix subtle dependency issue

## 0.1.14

- Added localhost mode, to fetch artifacts from local.

## 0.1.13

- Fix scripts for npm CI

## 0.1.12

- Fix UI/UX from react lib
- Fix Solidity npm publishing

## 0.1.11

- Add staging mode, where user can choose to generate proof with the official modulus
- Fix react Error toaster component
- Fix dependencies with Buffer and axios
- Fix node-signpdf-gen don't have execute permission

## 0.1.10

- Fix bug in react lib
- Remove AnonAadhaarVerifier from contracts package
- Add new util function for on-chain verification

## 0.1.9

- Fix the contracts package
- Add AnonAadhaarVerifier contract
- Removed v1 components
- Add appId in Provider context

## 0.1.8

- Fix LoginV2 modal component responsivness
- Release of the new circuit with nullifier as output

## 0.1.7

- Fix dependencies issues in anon-aadhaar-pcd

## 0.1.6

- Adding snarkjs types
- Fix dependencies issues in anon-aadhaar-pcd

## 0.1.5

- Adding certificate extraction from the pdf
- Adding new V2 Login flow for proving with the Aadhaar pdf only
- New component {LogInWithAnonAadhaarV2}
- New error handler component

## 0.1.4

- Fix UI bug

## 0.1.3

- Fix UI
- Added exportCallDataGroth16 to utils function
- Renamed IdentityPCD to AnonAadhaarPCD

## 0.1.@

- Minor fixes

## 0.1.1

- Fix dependencies issues of anon-aadhaar-react
- Fix UI typo

## 0.1.0

- Release of the 3 packages:
  - anon-aadhaar-pcd
  - anon-aadhaar-react
  - anon-aadhaar-contracts

## 0.0.5

- Replace RSA verify circuits from [circom-rsa-verify](hhttps://github.com/zkp-application/circom-rsa-verify) to [zk-email-verify](https://github.com/zkemail/zk-email-verify) circuit.

## 0.0.4

### Patch Changes

- Web Prover working
- Fixed minor error

## 0.0.2

### Patch Changes

- Minor fixes (added npmignore, removed react import)

## 0.0.1

### Patch Changes

- Initial changeset.
- Anon Aadhaar circuit integration
- Package compliant with the PCD SDK
