# anon-aadhaar-pcd

## About project

## Requirements

Install `rust` and `nodejs v18`, `openssl`(Usually installed in macOS and Linux).

## Install and test

Install nodejs dependencies.

```bash
yarn
```

Install `circom` and download powers of tau file.

```bash
./script/setup-dev.sh install
```

Generate verification key and proving key.

**NOTE:This action use for development only. Don't use it in product, please!**

```bash
./script/setup-dev.sh setup
```

Run test

```bash
yarn test
```

Generate pdf file with pkcs#1 schema. This action will create pdf file name `signed.pdf` signed by `certificate.cer` in `build` folder.

```bash
./script/setup-dev.sh pdf_setup
```
