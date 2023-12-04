# Anon Aadhaar

![Anon Aadhaar card lite](https://github.com/privacy-scaling-explorations/anon-aadhaar/assets/67648863/b29d784b-610a-4222-8fa5-4a2972e492fd)

Anon Aadhaar is a protocol that lets users anonymously prove their Aadhaar identity, in a very fast and simple way.
The core of the protocol is the circuits, but we also provide a SDK to let any app use our protocol.

## 📦 Packages

- [anon-aadhaar-pcd](packages/anon-aadhaar-pcd/)
- [anon-aadhaar-react](packages/anon-aadhaar-react/)
- [anon-aadhaar-contracts](packages/anon-aadhaar-contracts/)

## Documentation

- [Anon Aadhaar Documentation](https://anon-aadhaar-documentation.vercel.app/docs/intro)
- [Anon Aadhaar Postblog](https://mirror.xyz/privacy-scaling-explorations.eth/6R8kACTYp9mF3eIpLZMXs8JAQmTyb6Uy8KnZqzmDFZI)

## Examples
Explore our SDK in action by visiting our example website and repository, where you can see how it's implemented in a real-world scenario. Get inspired and learn how to integrate it into your own projects!

- [Example Website](https://anon-aadhaar-example.vercel.app/)
- [Example Repository](https://github.com/anon-aadhaar-private/anon-aadhaar-example)

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

**NOTE: This action is used for development only. Don't use it in product, please!**

```bash
yarn dev-setup:pcd
```

Run test

```bash
yarn test:libraries
```

Generate pdf file with pkcs#1 schema. This action will create a pdf file name `signed.pdf` signed by `certificate.cer` in `packages/anon-aadhaar-pcd/build` folder.

```bash
yarn pdf:pcd
```

Generate a proof. This action will create a proof and its public scheme in `proofs/` in `packages/anon-aadhaar-pcd/build` folder.

```bash
yarn proof:pcd
```

## Our Community 


- PSE Discord server: <a href="https://discord.com/invite/sF5CT5rzrR"><img src="https://img.shields.io/badge/discord-pse-blue"></a>
- Twitter account: <a href="https://twitter.com/AnonAadhaar"><img src="https://img.shields.io/twitter/follow/Anon_Aadhaar?style=flat-square&logo=twitter"></a>
- Telegram group: <a href="https://t.me/anon_aadhaar"><img src="https://img.shields.io/badge/telegram-@anon_aadhaar-blue.svg?style=flat-square&logo=telegram"></a>
