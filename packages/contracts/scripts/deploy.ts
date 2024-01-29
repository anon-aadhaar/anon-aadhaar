import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'
import {
  productionPublicKeyHash,
  //   testPublicKeyHash,
} from '../test/const'

async function main() {
  const verifier = await ethers.deployContract('Verifier')
  await verifier.waitForDeployment()

  const _verifierAddress = await verifier.getAddress()

  console.log(`Verifier contract deployed to ${_verifierAddress}`)

  //   // To deploy contract with the test UIDAI public key, will verify only test Aadhaar
  //   const anonAadhaarVerifierTest = await ethers.deployContract('AnonAadhaar', [
  //     _verifierAddress,
  //     testPublicKeyHash,
  //   ])

  // To deploy contract with production UIDAI public key, will verify real Aadhaar
  const anonAadhaarVerifierTest = await ethers.deployContract('AnonAadhaar', [
    _verifierAddress,
    productionPublicKeyHash,
  ])

  await anonAadhaarVerifierTest.waitForDeployment()

  const _anonAadhaarVerifierTestAddress =
    await anonAadhaarVerifierTest.getAddress()

  console.log(
    `AnonAadhaar Test Verifier  contract deployed to ${_anonAadhaarVerifierTestAddress}`,
  )

  const anonAadhaarVote = await ethers.deployContract('AnonAadhaarVote', [
    'Do you like this app?',
    ['0', '1', '2', '3', '4', '5'],
    _anonAadhaarVerifierTestAddress,
  ])

  await anonAadhaarVote.waitForDeployment()

  console.log(
    `AnonAadhaarVote contract deployed to ${await anonAadhaarVote.getAddress()}`,
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
