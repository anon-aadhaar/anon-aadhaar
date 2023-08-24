import { ethers } from 'hardhat'

async function main() {
  const verifier = await ethers.deployContract('Verifier')

  await verifier.waitForDeployment()

  console.log(`Verifier deployed to ${verifier.getAddress()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
