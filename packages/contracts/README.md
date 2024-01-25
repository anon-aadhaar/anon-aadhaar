# @anon-aadhaar/contracts

This package contains the anon Aadhaar Verfier contract. You can import it directly in your Hardhat project, or use the alredy deployed contracts, to verify an Anon Aadhaar Proof.

## 🛠 Install

### npm

```bash
npm install @anon-aadhaar/contracts
```

### yarn

```bash
yarn add @anon-aadhaar/contracts
```

Update your `hardhat.config.ts`:

```typescript
import 'hardhat-dependency-compiler'

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  dependencyCompiler: {
    paths: ['anon-aadhaar-contracts/contracts/AnonAadhaar.sol'],
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

Test the contracts with gas report:

```bash
yarn test:gas
```

Deploy the contracts to goerli:

```bash
yarn deploy:goerli
```
