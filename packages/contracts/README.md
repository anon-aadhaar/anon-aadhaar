# @anon-aadhaar/contracts

This package contains the anon Aadhaar Verfier contract. You can import it directly into your Hardhat project, or use the already deployed contracts, to verify an Anon Aadhaar Proof.

## 🛠 Install

### npm

```bash
npm install @anon-aadhaar/contracts
```

### yarn

```bash
yarn add @anon-aadhaar/contracts
```

Update your `hardhat.config.ts` in your project:

```typescript
import 'hardhat-dependency-compiler'

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  dependencyCompiler: {
    paths: ['@anon-aadhaar/contracts/src/AnonAadhaar.sol'],
  },
}
```

## 📜 Usage

Compile the contracts:

```bash
yarn build
```

Test the contracts:

```bash
yarn test
```

Test the contracts with the gas report:

```bash
yarn test:gas
```

Deploy the contracts with the test public key to Sepolia:

```bash
yarn deploy:sepolia-test
```

Deploy the contracts with the production public key to Sepolia:

```bash
yarn deploy:sepolia-prod
```
