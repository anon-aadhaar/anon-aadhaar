import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  // networks: {
  //   goerli: {
  //     url: 'https://ethereum-goerli.publicnode.com',
  //     accounts: [process.env.PRIVATE_KEY || ''],
  //   },
  //   mumbai: {
  //     url: 'https://rpc-mumbai.maticvigil.com',
  //     accounts: [process.env.PRIVATE_KEY || ''],
  //   },
  // },
}

export default config
