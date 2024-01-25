import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'

async function main() {
  const verifier = await ethers.deployContract('Verifier')
  await verifier.waitForDeployment()

  const _verifierAddress = await verifier.getAddress()

  console.log(`Verifier contract deployed to ${_verifierAddress}`)

  // PublicKey that signed the test QR Data
  // The corresponding certificate can be found here: https://uidai.gov.in/en/ecosystem/authentication-devices-documents/qr-code-reader.html
  const pubkeyTestHashBigInt = BigInt(
    '14283653287016348311748048156110700109007577525298584963450140859470242476430',
  ).toString()

  const anonAadhaarVerifierTest = await ethers.deployContract(
    'AnonAadhaarVerifier',
    [_verifierAddress, pubkeyTestHashBigInt],
  )
  await anonAadhaarVerifierTest.waitForDeployment()

  const _anonAadhaarVerifierTestAddress =
    await anonAadhaarVerifierTest.getAddress()

  console.log(
    `AnonAadhaar Test Verifier  contract deployed to ${_anonAadhaarVerifierTestAddress}`,
  )

  const anonAadhaarVote = await ethers.deployContract('Vote', [
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
