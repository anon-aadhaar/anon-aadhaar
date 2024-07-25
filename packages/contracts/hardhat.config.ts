import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config('./.env')

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      // This is date at which the test Aadhaar data was signed
      initialDate: '2019-03-08T05:13:20.000Z',
    },
    // sepolia: {
    //   url: `https://ethereum-sepolia.blockpi.network/v1/rpc/public	`,
    //   accounts: [process.env.PRIVATE_KEY_SEPOLIA || ''],
    // },
    // scrollSepolia: {
    //   url: `https://sepolia-rpc.scroll.io/`,
    //   accounts: [process.env.PRIVATE_KEY_SCROLL_SEPOLIA || ''],
    // },
  },
  solidity: '0.8.19',
  paths: {
    sources: './src',
  },
}

export default config
