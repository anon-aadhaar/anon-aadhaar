import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      forking: {
        url: `https://mainnet.infura.io/v3/${process.env.PROVIDER_KEY}`,
        blockNumber: 7327025,
      },
    },
  },
  solidity: '0.8.19',
  paths: {
    sources: './src',
  },
  // networks: {
  //   sepolia: {
  //     url: `https://sepolia.infura.io/v3/${process.env.PROVIDER_KEY}`,
  //     accounts: [process.env.PRIVATE_KEY || ''],
  //   },
  // },
}

export default config
