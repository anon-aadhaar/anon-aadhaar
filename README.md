# Country Identity

Country Identity is a protocol that let users anonymously prove their identity, in a very fast and simple way.
The core of the procotocol is the circuits, but we also provide a SDK to let any app use our protocol.

## 📦 Packages

- [pcd-country-identity](packages/pcd-country-identity/)
- [country-identity-kit](packages/country-identity-kit/)

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

Generate pdf file with pkcs#1 schema. This action will create pdf file name `signed.pdf` signed by `certificate.cer` in `packages/country-identity-pcd/build` folder.

```bash
yarn pdf:pcd
```
