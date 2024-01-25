import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
require('dotenv').config({ path: '../.env.local' })

const config: HardhatUserConfig = {
  solidity: '0.8.19',
  // networks: {
  //   goerli: {
  //     url: 'https://ethereum-goerli.publicnode.com',
  //     accounts: [process.env.PRIVATE_KEY || ''],
  //   },
  // },
}

export default config
