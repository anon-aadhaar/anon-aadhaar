# Anon Aadhaar

![Anon Aadhaar card lite](https://github.com/privacy-scaling-explorations/anon-aadhaar/assets/67648863/b29d784b-610a-4222-8fa5-4a2972e492fd)

Anon Aadhaar is a protocol that let users anonymously prove their Aadhaar identity, in a very fast and simple way.
The core of the procotocol is the circuits, but we also provide a SDK to let any app use our protocol.

## 📦 Packages

- [@anon-aadhaar/core](packages/core/)
- [@anon-aadhaar/circuits](packages/circuits/)
- [@anon-aadhaar/react](packages/react/)
- [@anon-aadhaar/contracts](packages/contracts/)

## Documentation

- [Anon Aadhaar Documentation](https://anon-aadhaar-documentation.vercel.app/docs/intro)

## Examples

Explore our SDK in action by visiting our example website and repository, where you can see how it's implemented in a real-world scenario. Get inspired and learn how to integrate it into your own projects!

- [Example Website](https://anon-aadhaar-example.vercel.app/)
- [Example Repository](https://github.com/anon-aadhaar-private/anon-aadhaar-example)

## Contributing

Contributions are always welcome!

Please check the [PR template](.github/PULL_REQUEST_TEMPLATE.md)

#### Requirements

Install `rust` and `nodejs v18`, `openssl`(Usually installed in macOS and Linux) and [`qpdf`](https://qpdf.readthedocs.io/en/stable/download.html).

#### Installation

Install nodejs dependencies.

```bash
yarn
```

Install `circom` and download powers of tau file.

```bash
yarn dev-install:circuit
```

Generate verification key and proving key.

**NOTE:This action use for development only. Don't use it in product, please!**

```bash
yarn dev-setup:circuit
```

Run test

```bash
yarn test:libraries
```

Generate a proof. This action will create a proof and its public scheme in `proofs/` in `packages/circuits/build` folder.

```bash
yarn proof:circuit
```

## Our Community

- PSE Discord server: <a href="https://discord.com/invite/sF5CT5rzrR"><img src="https://img.shields.io/badge/discord-pse-blue"></a>
- Twitter account: <a href="https://twitter.com/AnonAadhaar"><img src="https://img.shields.io/twitter/follow/Anon_Aadhaar?style=flat-square&logo=twitter"></a>
- Telegram group: <a href="https://t.me/anon_aadhaar"><img src="https://img.shields.io/badge/telegram-@anon_aadhaar-blue.svg?style=flat-square&logo=telegram"></a>
