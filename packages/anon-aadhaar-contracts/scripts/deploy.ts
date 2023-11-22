import { ethers } from 'hardhat'

async function main() {
  const verifier = await ethers.deployContract('Verifier')

  await verifier.waitForDeployment()

  const _verifierAddress = await verifier.getAddress()

  console.log(`Verifier deployed to ${await verifier.getAddress()}`)

  const appIdBigInt = BigInt(
    '196700487049306364386084600156231018794323017728',
  ).toString()

  const anonAadhaarVerifier = await ethers.deployContract(
    'AnonAadhaarVerifier',
    [_verifierAddress, appIdBigInt],
  )

  console.log(`Verifier deployed to ${await anonAadhaarVerifier.getAddress()}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
