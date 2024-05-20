import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'
import { productionPublicKeyHash, testPublicKeyHash } from '../test/const'

let publicKeyHash = testPublicKeyHash
// To deploy contract with production UIDAI public key, will verify real Aadhaar
if (process.env.PRODUCTION_KEY === 'true') {
  console.log('Using production key...')
  publicKeyHash = productionPublicKeyHash
}

async function main() {
  const afkVerifier = await ethers.deployContract('AFKGroth16Verifier')
  await afkVerifier.waitForDeployment()

  const _afkVerifier = await afkVerifier.getAddress()

  console.log(`AFK Verifier contract deployed to ${_afkVerifier}`)

  const afk = await ethers.deployContract('AFK', [_afkVerifier])

  await afk.waitForDeployment()
  const _afkAddress = await afk.getAddress()

  console.log(`AFK contract deployed to ${_afkAddress}`)

  const aaVerifier = await ethers.deployContract('AnonAadhaarGroth16Verifier')
  await aaVerifier.waitForDeployment()

  const _aaVerifier = await aaVerifier.getAddress()

  console.log(`AFK Verifier contract deployed to ${_aaVerifier}`)

  const anonAadhaar = await ethers.deployContract('AnonAadhaarAFKVerifier', [
    _aaVerifier,
    publicKeyHash,
  ])

  await anonAadhaar.waitForDeployment()
  const _anonAadhaarAddress = await anonAadhaar.getAddress()

  console.log(`AnonAadhaar AFK contract deployed to ${_anonAadhaarAddress}`)

  afk.addIssuer(
    37977685,
    'Anon Aadhaar',
    _anonAadhaarAddress,
    100 * 24 * 60 * 60,
  )
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
