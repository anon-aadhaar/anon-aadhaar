# Anon Aadhaar

Anon Aadhaar is a protocol that let users anonymously prove their Aadhaar identity, in a very fast and simple way.
The core of the procotocol is the circuits, but we also provide a SDK to let any app use our protocol.

## 📦 Packages

- [anon-aadhaar-pcd](packages/anon-aadhaar-pcd/)
- [anon-aadhaar-react](packages/anon-aadhaar-react/)
- [anon-aadhaar-contracts](packages/anon-aadhaar-contracts/)

## Contributing

Contributions are always welcome!

Please check the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

#### Requirements

Install `rust` and `nodejs v18`, `openssl`(Usually installed in macOS and Linux).

#### Installation

Install nodejs dependencies.

```bash
yarn
```

Install `circom` and download powers of tau file.

```bash
yarn dev-install:pcd
```

Generate verification key and proving key.

**NOTE:This action use for development only. Don't use it in product, please!**

```bash
yarn dev-setup:pcd
```

Run test

```bash
yarn test:libraries
```

Generate pdf file with pkcs#1 schema. This action will create pdf file name `signed.pdf` signed by `certificate.cer` in `packages/anon-aadhaar-pcd/build` folder.

```bash
yarn gen-proof:pcd
```
